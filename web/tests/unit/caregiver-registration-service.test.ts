import { describe, expect, it, vi } from "vitest";

import { CaregiverAuthError } from "@/lib/auth/caregiver";
import { completeOwnerOnboarding } from "@/lib/onboarding/owner-service";
import { ownerOnboardingSchema } from "@/lib/onboarding/schemas";

const authUser = { id: "10000000-0000-4000-8000-000000000099" };
const input = {
  displayName: "Nadia Santoso",
  careCircleName: "Keluarga Nadia",
};

function database(existingMembership: unknown = null, existingUser: unknown = null) {
  const tx = {
    $queryRaw: vi.fn().mockResolvedValue([{ pg_advisory_xact_lock: null }]),
    careCircleMember: {
      findFirst: vi.fn().mockResolvedValue(existingMembership),
      create: vi.fn().mockResolvedValue({
        careCircleId: "circle-new",
        role: "OWNER",
        user: { displayName: input.displayName },
      }),
    },
    user: {
      findUnique: vi.fn().mockResolvedValue(existingUser),
      create: vi.fn().mockResolvedValue({ id: authUser.id }),
    },
    careCircle: {
      create: vi.fn().mockResolvedValue({ id: "circle-new" }),
    },
    auditEvent: { create: vi.fn().mockResolvedValue({ id: "audit-new" }) },
  };
  const db = {
    $transaction: vi.fn(async (callback: (client: typeof tx) => unknown) =>
      callback(tx),
    ),
  };
  return { db, tx };
}

describe("Owner onboarding service", () => {
  it("rejects client fields that could choose authorization", () => {
    expect(() =>
      ownerOnboardingSchema.parse({
        ...input,
        role: "FAMILY_MEMBER",
        careCircleId: "hostile-circle",
      }),
    ).toThrow();
  });

  it("creates one Owner boundary and a minimal audit event", async () => {
    const { db, tx } = database();

    const result = await completeOwnerOnboarding(authUser, input, {
      db: db as never,
      requestId: "req-owner",
      now: new Date("2026-07-17T07:00:00.000Z"),
    });

    expect(tx.user.create).toHaveBeenCalledWith({
      data: { id: authUser.id, displayName: input.displayName },
      select: { id: true },
    });
    expect(tx.careCircle.create).toHaveBeenCalledWith({
      data: { name: input.careCircleName, createdByUserId: authUser.id },
      select: { id: true },
    });
    expect(tx.careCircleMember.create).toHaveBeenCalledWith({
      data: {
        careCircleId: "circle-new",
        userId: authUser.id,
        role: "OWNER",
        status: "ACTIVE",
        joinedAt: new Date("2026-07-17T07:00:00.000Z"),
      },
      select: {
        careCircleId: true,
        role: true,
        user: { select: { displayName: true } },
      },
    });
    expect(tx.auditEvent.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        action: "OWNER_ONBOARDING_COMPLETED",
        targetType: "CARE_CIRCLE",
        summary: "OWNER_ONBOARDING_COMPLETED CARE_CIRCLE",
        requestId: "req-owner",
      }),
    });
    expect(JSON.stringify(tx.auditEvent.create.mock.calls[0])).not.toContain(
      input.careCircleName,
    );
    expect(result.membership.role).toBe("OWNER");
  });

  it("returns an existing active Owner context on retry", async () => {
    const existing = {
      careCircleId: "circle-existing",
      role: "OWNER",
      user: { displayName: "Nadia Santoso" },
    };
    const { db, tx } = database(existing);

    const result = await completeOwnerOnboarding(authUser, input, {
      db: db as never,
    });

    expect(result.membership.careCircleId).toBe("circle-existing");
    expect(tx.user.create).not.toHaveBeenCalled();
    expect(tx.careCircle.create).not.toHaveBeenCalled();
  });

  it("does not let a removed application user create a new Owner circle", async () => {
    const { db, tx } = database(null, { id: authUser.id });

    await expect(
      completeOwnerOnboarding(authUser, input, { db: db as never }),
    ).rejects.toEqual(new CaregiverAuthError("FORBIDDEN"));
    expect(tx.careCircle.create).not.toHaveBeenCalled();
  });
});
