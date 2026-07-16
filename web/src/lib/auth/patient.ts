import "server-only";

import * as crypto from "node:crypto";

import type { PrismaClient } from "@/generated/prisma/client";
import {
  CaregiverAuthError,
  type CaregiverAuthContext,
  resolveCaregiverAuthContext,
} from "@/lib/auth/caregiver";
import { getCoreServerEnv } from "@/lib/env/server";

export const PATIENT_SESSION_COOKIE = "chronicare_patient_session";
export const PATIENT_SESSION_MAX_AGE_SECONDS = 8 * 60 * 60;

export type PatientAuthContext = {
  actorType: "PATIENT";
  patientProfile: {
    id: string;
    displayName: string;
    relationshipLabel: string;
  };
};

export type AuthContext = CaregiverAuthContext | PatientAuthContext;

export class PatientAuthError extends Error {
  constructor(
    public readonly code: "UNAUTHENTICATED" | "FORBIDDEN" | "RATE_LIMITED",
  ) {
    super(code);
    this.name = "PatientAuthError";
  }
}

type NativeArgon2 = (
  algorithm: "argon2id",
  parameters: {
    message: Buffer;
    nonce: Buffer;
    parallelism: number;
    tagLength: number;
    memory: number;
    passes: number;
  },
  callback: (error: Error | null | undefined, result?: Buffer) => void,
) => void;

const argon2 = (crypto as unknown as { argon2: NativeArgon2 }).argon2;

export async function verifyArgon2id(
  value: string,
  encodedHash: string,
): Promise<boolean> {
  const match = encodedHash.match(
    /^\$argon2id\$v=19\$m=(\d+),t=(\d+),p=(\d+)\$([A-Za-z0-9+/]+={0,2})\$([A-Za-z0-9+/]+={0,2})$/,
  );
  if (!match) return false;

  const [, memoryText, passesText, parallelismText, saltText, hashText] =
    match;
  const memory = Number(memoryText);
  const passes = Number(passesText);
  const parallelism = Number(parallelismText);
  const nonce = Buffer.from(saltText, "base64");
  const expected = Buffer.from(hashText, "base64");

  if (
    !Number.isInteger(memory) ||
    !Number.isInteger(passes) ||
    !Number.isInteger(parallelism) ||
    memory < 8 ||
    memory > 262_144 ||
    passes < 1 ||
    passes > 10 ||
    parallelism < 1 ||
    parallelism > 16 ||
    nonce.length < 8 ||
    expected.length < 16 ||
    expected.length > 64
  ) {
    return false;
  }

  try {
    const actual = await new Promise<Buffer>((resolve, reject) => {
      argon2(
        "argon2id",
        {
          message: Buffer.from(value),
          nonce,
          parallelism,
          tagLength: expected.length,
          memory,
          passes,
        },
        (error, result) => {
          if (error || !result) reject(error ?? new Error("Argon2 failed"));
          else resolve(result);
        },
      );
    });

    return crypto.timingSafeEqual(actual, expected);
  } catch {
    return false;
  }
}

function sessionTokenHash(token: string, secret: string) {
  return crypto.createHmac("sha256", secret).update(token).digest("hex");
}

async function readPatientSessionCookie() {
  const { cookies } = await import("next/headers");
  return (await cookies()).get(PATIENT_SESSION_COOKIE)?.value ?? null;
}

type LoginAttempt = { count: number; windowStartedAt: number; lockedUntil: number };
const loginAttempts = new Map<string, LoginAttempt>();
const LOGIN_WINDOW_MS = 15 * 60 * 1_000;

// ponytail: process-local limiter fits the single demo server; use a shared store before multi-instance deploy.
function loginAttemptKey(fingerprint: string, secret: string) {
  return crypto.createHmac("sha256", secret).update(fingerprint).digest("hex");
}

function requireLoginAttemptAllowed(key: string, now: number) {
  const attempt = loginAttempts.get(key);
  if (attempt && attempt.lockedUntil > now) {
    throw new PatientAuthError("RATE_LIMITED");
  }
  if (attempt && now - attempt.windowStartedAt >= LOGIN_WINDOW_MS) {
    loginAttempts.delete(key);
  }
}

function recordFailedLogin(key: string, now: number) {
  const current = loginAttempts.get(key);
  const count = current ? current.count + 1 : 1;
  const windowStartedAt = current?.windowStartedAt ?? now;
  const lockedUntil = count >= 5 ? now + LOGIN_WINDOW_MS : 0;
  loginAttempts.set(key, { count, windowStartedAt, lockedUntil });
  if (lockedUntil) throw new PatientAuthError("RATE_LIMITED");
}

export async function authenticatePatientCode(
  input: {
    code: string;
    fingerprint: string;
    requestId?: string;
    now?: Date;
  },
  dependencies: { db?: PrismaClient; secret?: string } = {},
) {
  const db =
    dependencies.db ?? (await import("@/lib/db/client")).prisma;
  const secret = dependencies.secret ?? getCoreServerEnv().PATIENT_SESSION_SECRET;
  const now = input.now ?? new Date();
  const attemptKey = loginAttemptKey(input.fingerprint, secret);
  requireLoginAttemptAllowed(attemptKey, now.getTime());

  // ponytail: at most two demo profiles make a hash scan smaller than a lookup-prefix schema change.
  const candidates = await db.patientAccessCode.findMany({
    where: { patientProfile: { deletedAt: null } },
    select: {
      id: true,
      codeHash: true,
      status: true,
      lockedUntil: true,
      expiresAt: true,
      patientProfile: {
        select: {
          id: true,
          careCircleId: true,
          displayName: true,
          relationshipLabel: true,
          status: true,
        },
      },
    },
  });

  let matched: (typeof candidates)[number] | undefined;
  for (const candidate of candidates) {
    if (await verifyArgon2id(input.code, candidate.codeHash)) matched = candidate;
  }

  if (!matched) {
    recordFailedLogin(attemptKey, now.getTime());
    throw new PatientAuthError("UNAUTHENTICATED");
  }

  const unavailable =
    matched.status !== "ACTIVE" ||
    matched.patientProfile.status !== "ACTIVE" ||
    (matched.expiresAt !== null && matched.expiresAt <= now) ||
    (matched.lockedUntil !== null && matched.lockedUntil > now);

  if (unavailable) {
    recordFailedLogin(attemptKey, now.getTime());
    throw new PatientAuthError("UNAUTHENTICATED");
  }

  loginAttempts.delete(attemptKey);
  const token = crypto.randomBytes(32).toString("base64url");
  const expiresAt = new Date(
    now.getTime() + PATIENT_SESSION_MAX_AGE_SECONDS * 1_000,
  );

  await db.$transaction(async (tx) => {
    await tx.patientAccessCode.update({
      where: { id: matched.id },
      data: { failedAttemptCount: 0, lockedUntil: null, lastUsedAt: now },
    });
    await tx.patientSession.create({
      data: {
        patientProfileId: matched.patientProfile.id,
        tokenHash: sessionTokenHash(token, secret),
        expiresAt,
        lastSeenAt: now,
      },
    });
    await tx.auditEvent.create({
      data: {
        careCircleId: matched.patientProfile.careCircleId,
        patientProfileId: matched.patientProfile.id,
        actorType: "PATIENT",
        actorPatientProfileId: matched.patientProfile.id,
        action: "PATIENT_LOGIN_SUCCEEDED",
        targetType: "PATIENT_SESSION",
        summary: "PATIENT_LOGIN_SUCCEEDED PATIENT_SESSION",
        requestId: input.requestId,
      },
    });
  });

  return {
    token,
    expiresAt,
    context: {
      actorType: "PATIENT",
      patientProfile: {
        id: matched.patientProfile.id,
        displayName: matched.patientProfile.displayName,
        relationshipLabel: matched.patientProfile.relationshipLabel,
      },
    } satisfies PatientAuthContext,
  };
}

export async function resolvePatientAuthContext(
  dependencies: {
    db?: PrismaClient;
    secret?: string;
    token?: string | null;
    now?: Date;
  } = {},
): Promise<PatientAuthContext> {
  const token =
    "token" in dependencies
      ? dependencies.token
      : await readPatientSessionCookie();
  if (!token) throw new PatientAuthError("UNAUTHENTICATED");

  const db =
    dependencies.db ?? (await import("@/lib/db/client")).prisma;
  const secret = dependencies.secret ?? getCoreServerEnv().PATIENT_SESSION_SECRET;
  const now = dependencies.now ?? new Date();
  const session = await db.patientSession.findUnique({
    where: { tokenHash: sessionTokenHash(token, secret) },
    select: {
      id: true,
      expiresAt: true,
      revokedAt: true,
      patientProfile: {
        select: {
          id: true,
          displayName: true,
          relationshipLabel: true,
          status: true,
          deletedAt: true,
        },
      },
    },
  });

  if (
    !session ||
    session.revokedAt !== null ||
    session.expiresAt <= now ||
    session.patientProfile.status !== "ACTIVE" ||
    session.patientProfile.deletedAt !== null
  ) {
    throw new PatientAuthError("UNAUTHENTICATED");
  }

  await db.patientSession.updateMany({
    where: { id: session.id, revokedAt: null, expiresAt: { gt: now } },
    data: { lastSeenAt: now },
  });

  return {
    actorType: "PATIENT",
    patientProfile: {
      id: session.patientProfile.id,
      displayName: session.patientProfile.displayName,
      relationshipLabel: session.patientProfile.relationshipLabel,
    },
  };
}

export function requireBoundPatientProfile(
  context: PatientAuthContext,
  patientProfileId: string,
) {
  if (context.patientProfile.id !== patientProfileId) {
    throw new PatientAuthError("FORBIDDEN");
  }
  return context;
}

export async function revokePatientSession(
  dependencies: {
    db?: PrismaClient;
    secret?: string;
    token?: string | null;
    now?: Date;
  } = {},
) {
  const token =
    "token" in dependencies
      ? dependencies.token
      : await readPatientSessionCookie();
  if (!token) return;

  const db =
    dependencies.db ?? (await import("@/lib/db/client")).prisma;
  const secret = dependencies.secret ?? getCoreServerEnv().PATIENT_SESSION_SECRET;
  await db.patientSession.updateMany({
    where: {
      tokenHash: sessionTokenHash(token, secret),
      revokedAt: null,
    },
    data: { revokedAt: dependencies.now ?? new Date() },
  });
}

export async function resolveAuthContext(): Promise<AuthContext> {
  try {
    return await resolveCaregiverAuthContext();
  } catch (error) {
    if (
      !(error instanceof CaregiverAuthError) ||
      error.code !== "UNAUTHENTICATED"
    ) {
      throw error;
    }
  }

  return resolvePatientAuthContext();
}
