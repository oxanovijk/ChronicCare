import { describe, expect, it, vi } from "vitest";

import { getCaregiverDashboard } from "@/lib/daily-care/dashboard-service";
import {
  createMedication,
  createMedicationLog,
  updateMedication,
} from "@/lib/daily-care/medication-service";
import { createReminder } from "@/lib/daily-care/reminder-service";
import { PatientProfileError } from "@/lib/patient-profile/service";

const mayaId = "10000000-0000-4000-8000-000000000004";
const medicationId = "10000000-0000-4000-8000-000000000008";
const now = new Date("2026-07-17T08:00:00.000Z");
const owner = {
  actorType: "CAREGIVER" as const,
  user: { id: "owner-id", displayName: "Dimas Pratama" },
  membership: { careCircleId: "circle-id", role: "OWNER" as const },
};
const family = {
  ...owner,
  user: { id: "family-id", displayName: "Rina Pratama" },
  membership: { careCircleId: "circle-id", role: "FAMILY_MEMBER" as const },
};
const profile = {
  id: mayaId,
  careCircleId: "circle-id",
  displayName: "Maya Pratama",
  relationshipLabel: "Maya",
  dateOfBirth: null,
  city: null,
  locationLabel: null,
  primaryConditions: [],
  primaryConditionsStatus: "UNKNOWN" as const,
  allergies: [],
  allergiesStatus: "UNKNOWN" as const,
  currentMedicationsStatus: "UNKNOWN" as const,
  emergencyContactName: null,
  emergencyContactPhone: null,
  emergencyContactStatus: "UNKNOWN" as const,
  bpjsMembershipStatus: "UNKNOWN" as const,
  bpjsNumberLast4: null,
  usualFacilityName: null,
};
const medicationRecord = {
  id: medicationId,
  patientProfileId: mayaId,
  name: "Metformin",
  doseText: "500 mg sesuai catatan caregiver",
  scheduleText: "Dua kali sehari",
  instructions: null,
  startDate: null,
  endDate: null,
  status: "ACTIVE" as const,
  createdAt: now,
  updatedAt: now,
};

function dashboardDb(activeProfile: typeof profile | null = profile) {
  return {
    patientProfile: { findFirst: vi.fn().mockResolvedValue(activeProfile) },
    checkIn: { findFirst: vi.fn().mockResolvedValue(null) },
    medication: { findMany: vi.fn().mockResolvedValue([]) },
    reminder: { findMany: vi.fn().mockResolvedValue([]) },
    healthNote: { findMany: vi.fn().mockResolvedValue([]) },
  };
}

describe("Packet 08 daily-care services", () => {
  it.each([owner, family])("allows $membership.role dashboard access", async (context) => {
    const db = dashboardDb();
    const result = await getCaregiverDashboard(context, mayaId, { db: db as never });
    expect(db.patientProfile.findFirst).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: mayaId, careCircleId: "circle-id", status: "ACTIVE", deletedAt: null },
      }),
    );
    expect(result.latestCheckIn).toBeNull();
    expect(result.setupChecklist.recommendedActions).toContain("REVIEW_CURRENT_MEDICATIONS");
  });

  it("denies a wrong Care Circle or deactivated profile before aggregate reads", async () => {
    const db = dashboardDb(null);
    await expect(getCaregiverDashboard(owner, mayaId, { db: db as never })).rejects.toEqual(
      new PatientProfileError("NOT_FOUND"),
    );
    expect(db.checkIn.findFirst).not.toHaveBeenCalled();
  });

  it("creates active Medication and sets REPORTED in the same transaction", async () => {
    const tx = {
      patientProfile: {
        findFirst: vi.fn().mockResolvedValue(profile),
        update: vi.fn().mockResolvedValue({}),
      },
      medication: { create: vi.fn().mockResolvedValue(medicationRecord) },
      auditEvent: { create: vi.fn().mockResolvedValue({}) },
    };
    const db = { $transaction: vi.fn((callback) => callback(tx)) };
    await createMedication(owner, mayaId, {
      name: medicationRecord.name,
      doseText: medicationRecord.doseText,
      scheduleText: medicationRecord.scheduleText,
      instructions: null,
      startDate: null,
      endDate: null,
    }, { db: db as never });
    expect(tx.patientProfile.update).toHaveBeenCalledWith({
      where: { id: mayaId },
      data: { currentMedicationsStatus: "REPORTED", updatedByUserId: "owner-id" },
    });
  });

  it("pauses the last active Medication and sets UNKNOWN, never NONE_REPORTED", async () => {
    const tx = {
      patientProfile: { findFirst: vi.fn().mockResolvedValue(profile), update: vi.fn() },
      medication: {
        findFirst: vi.fn().mockResolvedValue(medicationRecord),
        updateMany: vi.fn().mockResolvedValue({ count: 1 }),
        findFirstOrThrow: vi.fn().mockResolvedValue({ ...medicationRecord, status: "PAUSED", updatedAt: now }),
        count: vi.fn().mockResolvedValue(0),
      },
      auditEvent: { create: vi.fn().mockResolvedValue({}) },
    };
    const db = { $transaction: vi.fn((callback) => callback(tx)) };
    await updateMedication(owner, mayaId, medicationId, {
      status: "PAUSED",
      updatedAt: now.toISOString(),
    }, { db: db as never });
    expect(tx.patientProfile.update).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ currentMedicationsStatus: "UNKNOWN" }) }),
    );
    expect(JSON.stringify(tx.patientProfile.update.mock.calls)).not.toContain("NONE_REPORTED");
  });

  it("reactivates Medication and restores REPORTED atomically", async () => {
    const pausedMedication = { ...medicationRecord, status: "PAUSED" as const };
    const tx = {
      patientProfile: { findFirst: vi.fn().mockResolvedValue(profile), update: vi.fn() },
      medication: {
        findFirst: vi.fn().mockResolvedValue(pausedMedication),
        updateMany: vi.fn().mockResolvedValue({ count: 1 }),
        findFirstOrThrow: vi.fn().mockResolvedValue(medicationRecord),
      },
      auditEvent: { create: vi.fn().mockResolvedValue({}) },
    };
    const db = { $transaction: vi.fn((callback) => callback(tx)) };
    await updateMedication(owner, mayaId, medicationId, {
      status: "ACTIVE",
      updatedAt: now.toISOString(),
    }, { db: db as never });
    expect(tx.patientProfile.update).toHaveBeenCalledWith({
      where: { id: mayaId },
      data: { currentMedicationsStatus: "REPORTED", updatedByUserId: "owner-id" },
    });
  });

  it("rejects cross-profile Medication logs and reminder relations", async () => {
    const tx = {
      patientProfile: { findFirst: vi.fn().mockResolvedValue(profile) },
      medication: { findFirst: vi.fn().mockResolvedValue(null) },
      medicationLog: { create: vi.fn() },
      reminder: { create: vi.fn() },
      auditEvent: { create: vi.fn() },
    };
    const db = { $transaction: vi.fn((callback) => callback(tx)) };
    await expect(
      createMedicationLog(owner, mayaId, medicationId, { status: "TAKEN", scheduledFor: null }, { db: db as never }),
    ).rejects.toEqual(new PatientProfileError("NOT_FOUND"));
    await expect(
      createReminder(owner, mayaId, {
        type: "MEDICATION",
        title: "Obat malam",
        description: null,
        scheduledAt: null,
        scheduleText: "19.00",
        relatedMedicationId: medicationId,
      }, { db: db as never }),
    ).rejects.toEqual(new PatientProfileError("NOT_FOUND"));
    expect(tx.medicationLog.create).not.toHaveBeenCalled();
    expect(tx.reminder.create).not.toHaveBeenCalled();
  });
});
