import { describe, expect, it, vi } from "vitest";

import { PatientAuthError } from "@/lib/auth/patient";
import { PatientProfileError } from "@/lib/patient-profile/service";
import {
  createSosEvent,
  handleSosEvent,
  listNewSosEvents,
  SosAlreadyHandledError,
} from "@/lib/sos/service";

const mayaId = "10000000-0000-4000-8000-000000000004";
const rakaId = "10000000-0000-4000-8000-000000000005";
const eventId = "20000000-0000-5000-8000-000000000001";
const idempotencyKey = "30000000-0000-4000-8000-000000000001";
const now = new Date("2026-07-17T09:30:00.000Z");
const patient = {
  actorType: "PATIENT" as const,
  patientProfile: {
    id: mayaId,
    displayName: "Maya Pratama",
    relationshipLabel: "Maya",
  },
};
const owner = {
  actorType: "CAREGIVER" as const,
  user: { id: "10000000-0000-4000-8000-000000000001", displayName: "Dimas Pratama" },
  membership: { careCircleId: "10000000-0000-4000-8000-000000000001", role: "OWNER" as const },
};
const family = {
  actorType: "CAREGIVER" as const,
  user: { id: "10000000-0000-4000-8000-000000000002", displayName: "Rina Pratama" },
  membership: { ...owner.membership, role: "FAMILY_MEMBER" as const },
};

function record(overrides: Record<string, unknown> = {}) {
  return {
    id: eventId,
    patientProfileId: mayaId,
    status: "NEW" as const,
    message: "Saya butuh bantuan caregiver sekarang.",
    locationLabel: "Karawaci, Tangerang",
    createdAt: now,
    handledAt: null,
    patientProfile: { displayName: "Maya Pratama" },
    handledBy: null,
    ...overrides,
  };
}

describe("Packet 12 SOS service", () => {
  it("creates a minimum SOS for the bound Patient and returns an idempotent result", async () => {
    const created = record();
    const tx = {
      patientProfile: {
        findFirst: vi.fn().mockResolvedValue({
          id: mayaId,
          careCircleId: owner.membership.careCircleId,
          locationLabel: "Karawaci, Tangerang",
          city: "Tangerang",
        }),
      },
      sosEvent: { create: vi.fn().mockResolvedValue(created) },
      auditEvent: { create: vi.fn().mockResolvedValue({}) },
    };
    const db = {
      sosEvent: { findFirst: vi.fn().mockResolvedValueOnce(null).mockResolvedValueOnce(created) },
      $transaction: vi.fn((callback) => callback(tx)),
    };

    const first = await createSosEvent(
      patient,
      mayaId,
      { message: created.message },
      idempotencyKey,
      { db: db as never, requestId: "req-sos" },
    );
    const repeated = await createSosEvent(
      patient,
      mayaId,
      { message: "Pesan berbeda tidak membuat event kedua." },
      idempotencyKey,
      { db: db as never },
    );

    expect(tx.patientProfile.findFirst).toHaveBeenCalledWith({
      where: { id: mayaId, status: "ACTIVE", deletedAt: null },
      select: { id: true, careCircleId: true, locationLabel: true, city: true },
    });
    expect(tx.sosEvent.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          patientProfileId: mayaId,
          createdByPatient: true,
          createdByUserId: null,
          contactPhone: null,
          locationLabel: "Karawaci, Tangerang",
        }),
      }),
    );
    expect(first.id).toBe(repeated.id);
    expect(db.$transaction).toHaveBeenCalledTimes(1);
    expect(JSON.stringify(tx.auditEvent.create.mock.calls)).not.toContain(created.message);
    expect(first).not.toHaveProperty("contactPhone");
    expect(first).not.toHaveProperty("createdByUserId");
  });

  it("denies a Patient SOS for another Patient Profile before database access", async () => {
    const db = { sosEvent: { findFirst: vi.fn() }, $transaction: vi.fn() };

    await expect(
      createSosEvent(patient, rakaId, { message: null }, idempotencyKey, {
        db: db as never,
      }),
    ).rejects.toEqual(new PatientAuthError("FORBIDDEN"));
    expect(db.sosEvent.findFirst).not.toHaveBeenCalled();
    expect(db.$transaction).not.toHaveBeenCalled();
  });

  it("scopes list reads to active profiles in the caregiver Care Circle", async () => {
    const db = { sosEvent: { findMany: vi.fn().mockResolvedValue([record()]) } };

    const result = await listNewSosEvents(family, { db: db as never });

    expect(db.sosEvent.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          status: "NEW",
          patientProfile: {
            careCircleId: owner.membership.careCircleId,
            status: "ACTIVE",
            deletedAt: null,
          },
        },
      }),
    );
    expect(result[0]?.patientDisplayName).toBe("Maya Pratama");
  });

  it("lets only the first simultaneous caregiver handle the SOS", async () => {
    let current = record();
    const names = new Map([
      [owner.user.id, owner.user],
      [family.user.id, family.user],
    ]);
    const tx = {
      sosEvent: {
        updateMany: vi.fn(async ({ data }: { data: { handledByUserId: string; handledAt: Date } }) => {
          if (current.status !== "NEW") return { count: 0 };
          current = record({
            status: "HANDLED",
            handledAt: data.handledAt,
            handledBy: names.get(data.handledByUserId),
          });
          return { count: 1 };
        }),
        findFirst: vi.fn(async () => current),
      },
      auditEvent: { create: vi.fn().mockResolvedValue({}) },
    };
    const db = { $transaction: vi.fn((callback) => callback(tx)) };

    const [first, second] = await Promise.allSettled([
      handleSosEvent(owner, eventId, { db: db as never, now }),
      handleSosEvent(family, eventId, { db: db as never, now }),
    ]);

    expect(first.status).toBe("fulfilled");
    expect(second.status).toBe("rejected");
    expect((second as PromiseRejectedResult).reason).toBeInstanceOf(
      SosAlreadyHandledError,
    );
    expect((second as PromiseRejectedResult).reason.current.handledBy).toEqual(
      owner.user,
    );
    expect(tx.auditEvent.create).toHaveBeenCalledTimes(1);
  });

  it("does not reveal an SOS from another Care Circle", async () => {
    const tx = {
      sosEvent: {
        updateMany: vi.fn().mockResolvedValue({ count: 0 }),
        findFirst: vi.fn().mockResolvedValue(null),
      },
      auditEvent: { create: vi.fn() },
    };
    const db = { $transaction: vi.fn((callback) => callback(tx)) };

    await expect(
      handleSosEvent(owner, eventId, { db: db as never }),
    ).rejects.toEqual(new PatientProfileError("NOT_FOUND"));
    expect(tx.auditEvent.create).not.toHaveBeenCalled();
  });
});
