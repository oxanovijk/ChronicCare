import { beforeEach, describe, expect, it, vi } from "vitest";

import { PatientAuthError } from "@/lib/auth/patient";
import {
  createCheckIn,
  listCheckIns,
} from "@/lib/daily-care/check-in-service";
import { PatientProfileError } from "@/lib/patient-profile/service";

const mayaId = "10000000-0000-4000-8000-000000000004";
const rakaId = "10000000-0000-4000-8000-000000000005";
const createdAt = new Date("2026-07-17T05:00:00.000Z");
const patient = {
  actorType: "PATIENT" as const,
  patientProfile: {
    id: mayaId,
    displayName: "Maya Pratama",
    relationshipLabel: "Ibu",
  },
};
const caregiver = {
  actorType: "CAREGIVER" as const,
  user: { id: "owner-id", displayName: "Dimas Pratama" },
  membership: { careCircleId: "circle-id", role: "OWNER" as const },
};
const input = {
  mood: "OKAY" as const,
  conditionText: "Sedikit lemas setelah bangun tidur.",
  painLevel: 2,
  medicationTaken: true,
  complaintText: null,
  needsFamilyHelp: false,
};

function database(activeProfile = { id: mayaId, careCircleId: "circle-id" }) {
  const tx = {
    patientProfile: { findFirst: vi.fn().mockResolvedValue(activeProfile) },
    checkIn: {
      create: vi.fn().mockResolvedValue({
        id: "check-in-id",
        patientProfileId: mayaId,
        submittedByUserId: null,
        submittedByPatient: true,
        ...input,
        createdAt,
      }),
      findMany: vi.fn().mockResolvedValue([]),
    },
    auditEvent: { create: vi.fn().mockResolvedValue({ id: "audit-id" }) },
  };
  const db = {
    $transaction: vi.fn(async (callback: (client: typeof tx) => unknown) =>
      callback(tx),
    ),
    patientProfile: tx.patientProfile,
    checkIn: tx.checkIn,
  };
  return { db, tx };
}

describe("check-in service", () => {
  beforeEach(() => vi.clearAllMocks());

  it("writes a Patient check-in only to the bound active profile", async () => {
    const { db, tx } = database();

    const result = await createCheckIn(patient, mayaId, input, {
      db: db as never,
      requestId: "req-check-in",
    });

    expect(tx.patientProfile.findFirst).toHaveBeenCalledWith({
      where: { id: mayaId, status: "ACTIVE", deletedAt: null },
      select: { id: true, careCircleId: true },
    });
    expect(tx.checkIn.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          patientProfileId: mayaId,
          submittedByPatient: true,
          submittedByUserId: null,
        }),
      }),
    );
    expect(result).not.toHaveProperty("submittedByUserId");
  });

  it("denies a Patient write to another profile before opening a transaction", async () => {
    const { db } = database();

    await expect(
      createCheckIn(patient, rakaId, input, { db: db as never }),
    ).rejects.toEqual(new PatientAuthError("FORBIDDEN"));
    expect(db.$transaction).not.toHaveBeenCalled();
  });

  it("denies a stale session write when the bound profile is inactive", async () => {
    const { db, tx } = database(null as never);

    await expect(
      createCheckIn(patient, mayaId, input, { db: db as never }),
    ).rejects.toEqual(new PatientProfileError("NOT_FOUND"));
    expect(tx.checkIn.create).not.toHaveBeenCalled();
    expect(tx.auditEvent.create).not.toHaveBeenCalled();
  });

  it("records a minimal audit event without check-in health text", async () => {
    const { db, tx } = database();

    await createCheckIn(patient, mayaId, input, {
      db: db as never,
      requestId: "req-check-in",
    });

    const auditCall = tx.auditEvent.create.mock.calls[0][0];
    expect(auditCall).toEqual({
      data: expect.objectContaining({
        careCircleId: "circle-id",
        patientProfileId: mayaId,
        actorType: "PATIENT",
        actorPatientProfileId: mayaId,
        action: "CHECK_IN_CREATED",
        targetType: "CHECK_IN",
        targetId: "check-in-id",
        summary: "CHECK_IN_CREATED CHECK_IN",
        requestId: "req-check-in",
      }),
    });
    expect(JSON.stringify(auditCall)).not.toContain(input.conditionText);
  });

  it("scopes caregiver reads to the active profile in their Care Circle", async () => {
    const { db, tx } = database();
    tx.checkIn.findMany.mockResolvedValue([
      {
        id: "check-in-id",
        patientProfileId: mayaId,
        submittedByUserId: "owner-id",
        submittedByPatient: false,
        ...input,
        createdAt,
      },
    ]);

    const result = await listCheckIns(caregiver, mayaId, 10, {
      db: db as never,
    });

    expect(tx.patientProfile.findFirst).toHaveBeenCalledWith({
      where: {
        id: mayaId,
        careCircleId: "circle-id",
        status: "ACTIVE",
        deletedAt: null,
      },
      select: { id: true, careCircleId: true },
    });
    expect(tx.checkIn.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { patientProfileId: mayaId },
        orderBy: { createdAt: "desc" },
        take: 10,
      }),
    );
    expect(result[0]).not.toHaveProperty("submittedByUserId");
  });
});
