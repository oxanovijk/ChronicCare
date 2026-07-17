import { describe, expect, it, vi } from "vitest";

import type { CaregiverAuthContext } from "@/lib/auth/caregiver";
import { deactivatePatientProfileSchema } from "@/lib/patient-profile/schemas";
import {
  deactivatePatientProfile,
  listPatientProfiles,
  PatientProfileError,
} from "@/lib/patient-profile/service";

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

function database(updatedCount = 1) {
  const tx = {
    patientProfile: {
      updateMany: vi.fn().mockResolvedValue({ count: updatedCount }),
    },
    patientAccessCode: {
      updateMany: vi.fn().mockResolvedValue({ count: 1 }),
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

describe("Patient Profile lifecycle deactivation", () => {
  it("validates only the locked reason and optional note", () => {
    expect(
      deactivatePatientProfileSchema.parse({
        reason: "NO_LONGER_CARED",
        note: null,
      }),
    ).toEqual({ reason: "NO_LONGER_CARED", note: null });
    expect(
      deactivatePatientProfileSchema.safeParse({
        reason: "NO_LONGER_CARED",
        role: "OWNER",
      }).success,
    ).toBe(false);
  });

  it("deactivates atomically, revokes Patient access, and audits no note", async () => {
    const { db, tx } = database();
    const now = new Date("2026-07-17T04:00:00.000Z");

    const result = await deactivatePatientProfile(
      owner,
      "profile-id",
      {
        reason: "PATIENT_DECEASED",
        note: "Private lifecycle note",
      },
      { db: db as never, now, requestId: "req-lifecycle" },
    );

    expect(tx.patientProfile.updateMany).toHaveBeenCalledWith({
      where: {
        id: "profile-id",
        careCircleId: "circle-id",
        status: "ACTIVE",
        deletedAt: null,
      },
      data: expect.objectContaining({
        status: "DECEASED",
        deactivationReason: "PATIENT_DECEASED",
        deactivatedByUserId: "owner-id",
        deactivatedAt: now,
      }),
    });
    expect(tx.patientAccessCode.updateMany).toHaveBeenCalledWith({
      where: { patientProfileId: "profile-id", status: "ACTIVE" },
      data: { status: "REVOKED" },
    });
    expect(tx.patientSession.updateMany).toHaveBeenCalledWith({
      where: { patientProfileId: "profile-id", revokedAt: null },
      data: { revokedAt: now },
    });
    expect(tx.auditEvent.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        action: "PATIENT_PROFILE_DEACTIVATED",
        targetId: "profile-id",
        summary: "PATIENT_PROFILE_DEACTIVATED PATIENT_DECEASED",
      }),
    });
    expect(JSON.stringify(tx.auditEvent.create.mock.calls)).not.toContain(
      "Private lifecycle note",
    );
    expect(result).toEqual({
      id: "profile-id",
      status: "DECEASED",
      reason: "PATIENT_DECEASED",
      deactivatedAt: now.toISOString(),
    });
  });

  it("denies Family Member before starting a transaction", async () => {
    const { db } = database();
    await expect(
      deactivatePatientProfile(
        family,
        "profile-id",
        { reason: "NO_LONGER_CARED" },
        { db: db as never },
      ),
    ).rejects.toMatchObject({ code: "FORBIDDEN" });
    expect(db.$transaction).not.toHaveBeenCalled();
  });

  it("maps non-death lifecycle reasons to END_OF_CARE", async () => {
    const { db, tx } = database();
    const result = await deactivatePatientProfile(
      owner,
      "profile-id",
      { reason: "NO_LONGER_CARED" },
      { db: db as never },
    );
    expect(tx.patientProfile.updateMany).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ status: "END_OF_CARE" }),
      }),
    );
    expect(result.status).toBe("END_OF_CARE");
  });

  it("does not revoke or audit an inactive or outside-Care-Circle profile", async () => {
    const { db, tx } = database(0);
    await expect(
      deactivatePatientProfile(
        owner,
        "outside-profile",
        { reason: "OTHER" },
        { db: db as never },
      ),
    ).rejects.toEqual(new PatientProfileError("NOT_FOUND"));
    expect(tx.patientAccessCode.updateMany).not.toHaveBeenCalled();
    expect(tx.patientSession.updateMany).not.toHaveBeenCalled();
    expect(tx.auditEvent.create).not.toHaveBeenCalled();
  });

  it("keeps deactivated profiles out of the active list", async () => {
    const findMany = vi.fn().mockResolvedValue([]);
    await listPatientProfiles(owner, {
      db: { patientProfile: { findMany } } as never,
    });
    expect(findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          careCircleId: "circle-id",
          status: "ACTIVE",
          deletedAt: null,
        },
      }),
    );
  });
});
