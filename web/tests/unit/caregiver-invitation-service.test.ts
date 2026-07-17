import { createHash } from "node:crypto";

import { describe, expect, it, vi } from "vitest";

import { CaregiverAuthError } from "@/lib/auth/caregiver";
import {
  acceptInvitation,
  createInvitation,
  getInvitationPreview,
  InvitationError,
} from "@/lib/invitations/service";
import { acceptInvitationSchema } from "@/lib/invitations/schemas";

const token = "A".repeat(43);
const tokenHash = createHash("sha256").update(token).digest("hex");
const owner = {
  actorType: "CAREGIVER" as const,
  user: { id: "owner-id", displayName: "Dimas" },
  membership: { careCircleId: "circle-id", role: "OWNER" as const },
};
const authFamily = { id: "family-auth-id" };
const now = new Date("2026-07-17T08:00:00.000Z");
const expiresAt = new Date("2026-07-18T08:00:00.000Z");

function invitationDatabase() {
  const invitation = {
    id: "invite-id",
    careCircleId: "circle-id",
    expiresAt,
    acceptedAt: null,
    acceptedByUserId: null,
    revokedAt: null,
    careCircle: { name: "Keluarga Dimas" },
  };
  const tx = {
    $queryRaw: vi.fn().mockResolvedValue([]),
    careCircleInvitation: {
      create: vi.fn().mockResolvedValue({ id: "invite-id", expiresAt }),
      findUnique: vi.fn().mockResolvedValue(invitation),
      updateMany: vi.fn().mockResolvedValue({ count: 1 }),
    },
    careCircleMember: {
      findFirst: vi.fn().mockResolvedValue(null),
      upsert: vi.fn().mockResolvedValue({
        careCircleId: "circle-id",
        role: "FAMILY_MEMBER",
        user: { displayName: "Rina" },
      }),
    },
    user: {
      findUnique: vi.fn().mockResolvedValue(null),
      create: vi.fn().mockResolvedValue({ id: authFamily.id }),
    },
    auditEvent: { create: vi.fn().mockResolvedValue({ id: "audit-id" }) },
  };
  const db = {
    $transaction: vi.fn(async (callback: (client: typeof tx) => unknown) =>
      callback(tx),
    ),
    careCircleInvitation: tx.careCircleInvitation,
  };
  return { db, tx, invitation };
}

describe("Family invitation service", () => {
  it("stores only a hash and returns the high-entropy token once", async () => {
    const { db, tx } = invitationDatabase();

    const result = await createInvitation(
      owner,
      { expiresInHours: 24 },
      {
        db: db as never,
        now,
        requestId: "req-invite",
        generateToken: () => token,
      },
    );

    expect(tx.careCircleInvitation.create).toHaveBeenCalledWith({
      data: {
        careCircleId: "circle-id",
        codeHash: tokenHash,
        expiresAt,
        createdByUserId: "owner-id",
      },
      select: { id: true, expiresAt: true },
    });
    expect(result).toEqual({
      id: "invite-id",
      invitePath: `/caregiver/invite/${token}`,
      expiresAt: expiresAt.toISOString(),
    });
    expect(JSON.stringify(tx.careCircleInvitation.create.mock.calls)).not.toContain(token);
  });

  it("returns a minimal preview only for an available invitation", async () => {
    const { db, tx } = invitationDatabase();
    const preview = await getInvitationPreview(token, { db: db as never, now });

    expect(tx.careCircleInvitation.findUnique).toHaveBeenCalledWith(
      expect.objectContaining({ where: { codeHash: tokenHash } }),
    );
    expect(preview).toEqual({
      careCircleName: "Keluarga Dimas",
      expiresAt: expiresAt.toISOString(),
    });
    expect(preview).not.toHaveProperty("careCircleId");

    tx.careCircleInvitation.findUnique.mockResolvedValueOnce({
      ...tx.careCircleInvitation.findUnique.mock.results,
      id: "invite-id",
      careCircleId: "circle-id",
      expiresAt: new Date("2026-07-16T08:00:00.000Z"),
      acceptedAt: null,
      acceptedByUserId: null,
      revokedAt: null,
      careCircle: { name: "Keluarga Dimas" },
    });
    await expect(
      getInvitationPreview(token, { db: db as never, now }),
    ).rejects.toEqual(new InvitationError("NOT_FOUND"));
  });

  it("assigns Family role from the invitation and consumes it atomically", async () => {
    const { db, tx } = invitationDatabase();

    const result = await acceptInvitation(
      authFamily,
      token,
      { displayName: "Rina" },
      { db: db as never, now, requestId: "req-accept" },
    );

    expect(tx.user.create).toHaveBeenCalledWith({
      data: { id: authFamily.id, displayName: "Rina" },
      select: { id: true },
    });
    expect(tx.careCircleMember.upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        create: expect.objectContaining({
          careCircleId: "circle-id",
          userId: authFamily.id,
          role: "FAMILY_MEMBER",
          status: "ACTIVE",
        }),
        update: expect.objectContaining({ role: "FAMILY_MEMBER", status: "ACTIVE" }),
      }),
    );
    expect(tx.careCircleInvitation.updateMany).toHaveBeenCalledWith({
      where: {
        id: "invite-id",
        acceptedAt: null,
        revokedAt: null,
        expiresAt: { gt: now },
      },
      data: { acceptedAt: now, acceptedByUserId: authFamily.id },
    });
    expect(result.membership.role).toBe("FAMILY_MEMBER");
    expect(acceptInvitationSchema.safeParse({ displayName: "Rina", role: "OWNER" }).success).toBe(false);
  });

  it("denies an authenticated user who already belongs to another Care Circle", async () => {
    const { db, tx } = invitationDatabase();
    tx.careCircleMember.findFirst.mockResolvedValueOnce({
      careCircleId: "other-circle",
      role: "FAMILY_MEMBER",
      user: { displayName: "Rina" },
    });

    await expect(
      acceptInvitation(authFamily, token, { displayName: "Rina" }, { db: db as never, now }),
    ).rejects.toEqual(new CaregiverAuthError("FORBIDDEN"));
    expect(tx.careCircleInvitation.updateMany).not.toHaveBeenCalled();
  });

  it("rejects a concurrent second consumer", async () => {
    const { db, tx } = invitationDatabase();
    tx.careCircleInvitation.updateMany.mockResolvedValueOnce({ count: 0 });

    await expect(
      acceptInvitation(authFamily, token, { displayName: "Rina" }, { db: db as never, now }),
    ).rejects.toEqual(new InvitationError("CONFLICT"));
    expect(tx.auditEvent.create).not.toHaveBeenCalled();
  });
});
