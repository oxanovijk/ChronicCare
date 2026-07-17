import "server-only";

import * as crypto from "node:crypto";

import { Prisma, type PrismaClient } from "@/generated/prisma/client";
import {
  type CaregiverAuthContext,
  requireOwner,
} from "@/lib/auth/caregiver";
import { verifyArgon2id } from "@/lib/auth/patient";
import { writeAuditEvent } from "@/lib/audit/write-audit-event";
import { PatientProfileError } from "@/lib/patient-profile/service";

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

export async function hashPatientAccessCode(
  code: string,
  dependencies: { salt?: Buffer } = {},
) {
  const memory = 65_536;
  const passes = 3;
  const parallelism = 1;
  const salt = dependencies.salt ?? crypto.randomBytes(16);
  const hash = await new Promise<Buffer>((resolve, reject) => {
    argon2(
      "argon2id",
      {
        message: Buffer.from(code),
        nonce: salt,
        parallelism,
        tagLength: 32,
        memory,
        passes,
      },
      (error, result) => {
        if (error || !result) reject(error ?? new Error("Argon2 failed"));
        else resolve(result);
      },
    );
  });

  return `$argon2id$v=19$m=${memory},t=${passes},p=${parallelism}$${salt.toString("base64")}$${hash.toString("base64")}`;
}

function generatePatientCode() {
  return crypto.randomInt(100_000, 1_000_000).toString();
}

export async function rotatePatientAccessCode(
  context: CaregiverAuthContext,
  patientProfileId: string,
  dependencies: {
    db?: PrismaClient;
    now?: Date;
    requestId?: string;
    generateCode?: () => string;
    hashCode?: (code: string) => Promise<string>;
    isCodeMatch?: (code: string, hash: string) => Promise<boolean>;
  } = {},
) {
  requireOwner(context);
  const db = dependencies.db ?? (await import("@/lib/db/client")).prisma;
  const now = dependencies.now ?? new Date();
  const generateCode = dependencies.generateCode ?? generatePatientCode;
  const isCodeMatch = dependencies.isCodeMatch ?? verifyArgon2id;
  const hashCode = dependencies.hashCode ?? hashPatientAccessCode;

  return db.$transaction(async (tx) => {
    await tx.$queryRaw(
      Prisma.sql`SELECT pg_advisory_xact_lock(hashtext('patient-access-code-issuance'))::text`,
    );
    await tx.$queryRaw(
      Prisma.sql`SELECT id FROM patient_profiles WHERE id = ${patientProfileId}::uuid FOR UPDATE`,
    );
    const profile = await tx.patientProfile.findFirst({
      where: {
        id: patientProfileId,
        careCircleId: context.membership.careCircleId,
        status: "ACTIVE",
        deletedAt: null,
      },
      select: { id: true },
    });
    if (!profile) throw new PatientProfileError("NOT_FOUND");

    const activeCodeHashes = await tx.patientAccessCode.findMany({
      where: {
        status: "ACTIVE",
        patientProfile: { status: "ACTIVE", deletedAt: null },
      },
      select: { codeHash: true },
    });
    let code: string | null = null;
    for (let attempt = 0; attempt < 10 && !code; attempt += 1) {
      const candidate = generateCode();
      let duplicate = false;
      for (const activeCode of activeCodeHashes) {
        if (await isCodeMatch(candidate, activeCode.codeHash)) {
          duplicate = true;
          break;
        }
      }
      if (!duplicate) code = candidate;
    }
    if (!code) throw new PatientProfileError("CONFLICT");
    const codeHash = await hashCode(code);

    await tx.patientAccessCode.updateMany({
      where: { patientProfileId, status: "ACTIVE" },
      data: { status: "REVOKED" },
    });
    await tx.patientSession.updateMany({
      where: { patientProfileId, revokedAt: null },
      data: { revokedAt: now },
    });
    await tx.patientAccessCode.create({
      data: {
        patientProfileId,
        codeHash,
        createdByUserId: context.user.id,
        expiresAt: null,
      },
      select: { id: true },
    });
    await writeAuditEvent(tx, {
      careCircleId: context.membership.careCircleId,
      patientProfileId,
      actor: {
        type: "CAREGIVER",
        userId: context.user.id,
        role: context.membership.role,
      },
      action: "PATIENT_ACCESS_CODE_ROTATED",
      targetType: "PATIENT_ACCESS_CODE",
      targetId: patientProfileId,
      requestId: dependencies.requestId,
    });

    return { code, expiresAt: null };
  });
}
