import { describe, expect, it, vi } from "vitest";

import type { CaregiverAuthContext } from "@/lib/auth/caregiver";
import { verifyArgon2id } from "@/lib/auth/patient";
import {
  hashPatientAccessCode,
  rotatePatientAccessCode,
} from "@/lib/patient-access/service";
import { PatientProfileError } from "@/lib/patient-profile/service";

const owner: CaregiverAuthContext = {
  actorType: "CAREGIVER",
  user: { id: "owner-id", displayName: "Dimas Pratama" },
  membership: { careCircleId: "circle-id", role: "OWNER" },
};

const family: CaregiverAuthContext = {
  ...owner,
  user: { id: "family-id", displayName: "Rina Pratama" },
  membership: { careCircleId: "circle-id", role: "FAMILY_MEMBER" },
};

function database(profile: { id: string } | null = { id: "profile-id" }) {
  const tx = {
    $queryRaw: vi.fn().mockResolvedValue([{ id: profile?.id }]),
    patientProfile: { findFirst: vi.fn().mockResolvedValue(profile) },
    patientAccessCode: {
      findMany: vi.fn().mockResolvedValue([]),
      updateMany: vi.fn().mockResolvedValue({ count: 1 }),
      create: vi.fn().mockResolvedValue({ id: "new-code-id" }),
    },
    patientSession: {
      updateMany: vi.fn().mockResolvedValue({ count: 2 }),
    },
    auditEvent: { create: vi.fn().mockResolvedValue({}) },
  };
  return {
    tx,
    db: {
      $transaction: vi.fn(
        async (operation: (transaction: typeof tx) => Promise<unknown>) =>
          operation(tx),
      ),
    },
  };
}

describe("Patient access-code rotation", () => {
  it("stores only a hash and atomically revokes the previous code and sessions", async () => {
    const { db, tx } = database();
    const now = new Date("2026-07-17T08:00:00.000Z");

    const result = await rotatePatientAccessCode(owner, "profile-id", {
      db: db as never,
      now,
      requestId: "req-access-code",
      generateCode: () => "482913",
      hashCode: vi.fn().mockResolvedValue("argon2id-hash-only"),
    });

    expect(tx.patientProfile.findFirst).toHaveBeenCalledWith({
      where: {
        id: "profile-id",
        careCircleId: "circle-id",
        status: "ACTIVE",
        deletedAt: null,
      },
      select: { id: true },
    });
    expect(tx.$queryRaw).toHaveBeenCalledTimes(2);
    expect(tx.patientAccessCode.updateMany).toHaveBeenCalledWith({
      where: { patientProfileId: "profile-id", status: "ACTIVE" },
      data: { status: "REVOKED" },
    });
    expect(tx.patientSession.updateMany).toHaveBeenCalledWith({
      where: { patientProfileId: "profile-id", revokedAt: null },
      data: { revokedAt: now },
    });
    expect(tx.patientAccessCode.create).toHaveBeenCalledWith({
      data: {
        patientProfileId: "profile-id",
        codeHash: "argon2id-hash-only",
        createdByUserId: "owner-id",
        expiresAt: null,
      },
      select: { id: true },
    });
    expect(result).toEqual({ code: "482913", expiresAt: null });
    expect(JSON.stringify(tx.patientAccessCode.create.mock.calls)).not.toContain(
      "482913",
    );
    expect(JSON.stringify(tx.auditEvent.create.mock.calls)).not.toContain(
      "482913",
    );
    expect(tx.auditEvent.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        action: "PATIENT_ACCESS_CODE_ROTATED",
        targetType: "PATIENT_ACCESS_CODE",
        targetId: "profile-id",
        requestId: "req-access-code",
      }),
    });
  });

  it("denies Family Member before starting a transaction", async () => {
    const { db } = database();

    await expect(
      rotatePatientAccessCode(family, "profile-id", { db: db as never }),
    ).rejects.toMatchObject({ code: "FORBIDDEN" });
    expect(db.$transaction).not.toHaveBeenCalled();
  });

  it("does not revoke access for an inactive or outside-circle profile", async () => {
    const { db, tx } = database(null);

    await expect(
      rotatePatientAccessCode(owner, "outside-profile", {
        db: db as never,
        generateCode: () => "482913",
        hashCode: vi.fn().mockResolvedValue("hash"),
      }),
    ).rejects.toEqual(new PatientProfileError("NOT_FOUND"));
    expect(tx.patientAccessCode.updateMany).not.toHaveBeenCalled();
    expect(tx.patientSession.updateMany).not.toHaveBeenCalled();
    expect(tx.auditEvent.create).not.toHaveBeenCalled();
  });

  it("retries when a generated raw code already belongs to another active profile", async () => {
    const { db, tx } = database();
    tx.patientAccessCode.findMany.mockResolvedValue([
      { codeHash: "other-profile-active-hash" },
    ]);
    const generateCode = vi
      .fn()
      .mockReturnValueOnce("111111")
      .mockReturnValueOnce("482913");
    const isCodeMatch = vi.fn(async (code: string) => code === "111111");

    const result = await rotatePatientAccessCode(owner, "profile-id", {
      db: db as never,
      generateCode,
      isCodeMatch,
      hashCode: vi.fn().mockResolvedValue("unique-code-hash"),
    });

    expect(generateCode).toHaveBeenCalledTimes(2);
    expect(isCodeMatch).toHaveBeenCalledWith(
      "111111",
      "other-profile-active-hash",
    );
    expect(result.code).toBe("482913");
    expect(tx.patientAccessCode.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ codeHash: "unique-code-hash" }),
      }),
    );
  });

  it("generates an Argon2id hash compatible with Patient login verification", async () => {
    const hash = await hashPatientAccessCode("482913", {
      salt: Buffer.alloc(16, 7),
    });

    expect(hash).toMatch(/^\$argon2id\$v=19\$m=65536,t=3,p=1\$/);
    await expect(verifyArgon2id("482913", hash)).resolves.toBe(true);
    await expect(verifyArgon2id("482914", hash)).resolves.toBe(false);
  });
});
