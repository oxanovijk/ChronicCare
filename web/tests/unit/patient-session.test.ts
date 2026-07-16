import { describe, expect, it, vi } from "vitest";

import {
  authenticatePatientCode,
  PatientAuthError,
  requireBoundPatientProfile,
  resolvePatientAuthContext,
  verifyArgon2id,
} from "@/lib/auth/patient";

const syntheticCode = "482913";
const syntheticHash =
  "$argon2id$v=19$m=65536,t=3,p=1$AQEBAQEBAQEBAQEBAQEBAQ==$3KEaC83m4cZ4N81NSHdleZd/A8Cfg8m955pXe6nWqsg=";
const now = new Date("2026-07-17T00:00:00.000Z");

function candidate(overrides: Record<string, unknown> = {}) {
  return {
    id: "code-id",
    codeHash: syntheticHash,
    status: "ACTIVE",
    lockedUntil: null,
    expiresAt: null,
    patientProfile: {
      id: "10000000-0000-4000-8000-000000000004",
      careCircleId: "10000000-0000-4000-8000-000000000001",
      displayName: "Maya Pratama",
      relationshipLabel: "Maya",
      status: "ACTIVE",
    },
    ...overrides,
  };
}

describe("Patient access code and session", () => {
  it("verifies an Argon2id hash with the native Node boundary", async () => {
    await expect(verifyArgon2id(syntheticCode, syntheticHash)).resolves.toBe(
      true,
    );
    await expect(verifyArgon2id("wrong-code", syntheticHash)).resolves.toBe(
      false,
    );
  });

  it("creates an opaque profile-bound session without persisting the code", async () => {
    const tx = {
      patientAccessCode: { update: vi.fn().mockResolvedValue({}) },
      patientSession: { create: vi.fn().mockResolvedValue({}) },
      auditEvent: { create: vi.fn().mockResolvedValue({}) },
    };
    const db = {
      patientAccessCode: {
        findMany: vi.fn().mockResolvedValue([candidate()]),
      },
      $transaction: vi.fn(
        async (operation: (transaction: typeof tx) => Promise<unknown>) =>
          operation(tx),
      ),
    };

    const result = await authenticatePatientCode(
      {
        code: syntheticCode,
        fingerprint: "successful-test",
        requestId: "req-test",
        now,
      },
      { db: db as never, secret: "s".repeat(32) },
    );

    expect(result.context.patientProfile).toEqual(
      expect.objectContaining({ displayName: "Maya Pratama" }),
    );
    expect(result.token).not.toBe(syntheticCode);
    const sessionData = tx.patientSession.create.mock.calls[0][0].data;
    expect(sessionData.patientProfileId).toBe(
      "10000000-0000-4000-8000-000000000004",
    );
    expect(sessionData.tokenHash).toMatch(/^[a-f0-9]{64}$/);
    expect(JSON.stringify(sessionData)).not.toContain(syntheticCode);
    expect(JSON.stringify(tx.auditEvent.create.mock.calls)).not.toContain(
      syntheticCode,
    );
  });

  it("returns the same generic auth failure for wrong, expired, and revoked codes", async () => {
    const wrongDb = {
      patientAccessCode: { findMany: vi.fn().mockResolvedValue([]) },
    };
    const expiredDb = {
      patientAccessCode: {
        findMany: vi.fn().mockResolvedValue([
          candidate({ expiresAt: new Date("2026-07-16T00:00:00.000Z") }),
        ]),
      },
    };
    const revokedDb = {
      patientAccessCode: {
        findMany: vi.fn().mockResolvedValue([
          candidate({ status: "REVOKED" }),
        ]),
      },
    };

    await expect(
      authenticatePatientCode(
        { code: "wrong", fingerprint: "wrong-test", now },
        { db: wrongDb as never, secret: "s".repeat(32) },
      ),
    ).rejects.toEqual(new PatientAuthError("UNAUTHENTICATED"));
    await expect(
      authenticatePatientCode(
        { code: syntheticCode, fingerprint: "expired-test", now },
        { db: expiredDb as never, secret: "s".repeat(32) },
      ),
    ).rejects.toEqual(new PatientAuthError("UNAUTHENTICATED"));
    await expect(
      authenticatePatientCode(
        { code: syntheticCode, fingerprint: "revoked-test", now },
        { db: revokedDb as never, secret: "s".repeat(32) },
      ),
    ).rejects.toEqual(new PatientAuthError("UNAUTHENTICATED"));
  });

  it("locks a login fingerprint after five failures", async () => {
    const db = {
      patientAccessCode: { findMany: vi.fn().mockResolvedValue([]) },
    };
    const attempt = () =>
      authenticatePatientCode(
        { code: "wrong", fingerprint: "rate-limit-test", now },
        { db: db as never, secret: "s".repeat(32) },
      );

    for (let index = 0; index < 4; index += 1) {
      await expect(attempt()).rejects.toEqual(
        new PatientAuthError("UNAUTHENTICATED"),
      );
    }
    await expect(attempt()).rejects.toEqual(
      new PatientAuthError("RATE_LIMITED"),
    );
  });

  it("resolves only the Patient Profile stored in the opaque session", async () => {
    const findUnique = vi.fn().mockResolvedValue({
      id: "session-id",
      expiresAt: new Date("2026-07-17T08:00:00.000Z"),
      revokedAt: null,
      patientProfile: {
        id: "maya-id",
        displayName: "Maya Pratama",
        relationshipLabel: "Maya",
        status: "ACTIVE",
        deletedAt: null,
      },
    });
    const updateMany = vi.fn().mockResolvedValue({ count: 1 });
    const context = await resolvePatientAuthContext({
      token: "opaque-session-token",
      secret: "s".repeat(32),
      now,
      db: { patientSession: { findUnique, updateMany } } as never,
    });

    expect(context.patientProfile.id).toBe("maya-id");
    expect(findUnique.mock.calls[0][0].where.tokenHash).toMatch(/^[a-f0-9]{64}$/);
    expect(findUnique.mock.calls[0][0].where.tokenHash).not.toContain(
      "opaque-session-token",
    );
    expect(() => requireBoundPatientProfile(context, "raka-id")).toThrow(
      new PatientAuthError("FORBIDDEN"),
    );
  });

  it("rejects a revoked Patient session", async () => {
    await expect(
      resolvePatientAuthContext({
        token: "revoked-token",
        secret: "s".repeat(32),
        now,
        db: {
          patientSession: {
            findUnique: vi.fn().mockResolvedValue({
              id: "session-id",
              expiresAt: new Date("2026-07-17T08:00:00.000Z"),
              revokedAt: new Date("2026-07-16T23:00:00.000Z"),
              patientProfile: {
                id: "maya-id",
                displayName: "Maya Pratama",
                relationshipLabel: "Maya",
                status: "ACTIVE",
                deletedAt: null,
              },
            }),
          },
        } as never,
      }),
    ).rejects.toEqual(new PatientAuthError("UNAUTHENTICATED"));
  });
});
