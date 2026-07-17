import "server-only";

import { createHash, randomBytes } from "node:crypto";

import { Prisma, type PrismaClient } from "@/generated/prisma/client";
import {
  type AuthenticatedCaregiverUser,
  type CaregiverAuthContext,
  CaregiverAuthError,
  requireOwner,
} from "@/lib/auth/caregiver";
import { writeAuditEvent } from "@/lib/audit/write-audit-event";
import type {
  AcceptInvitationInput,
  CreateInvitationInput,
} from "@/lib/invitations/schemas";

export class InvitationError extends Error {
  constructor(public readonly code: "NOT_FOUND" | "CONFLICT") {
    super(code);
    this.name = "InvitationError";
  }
}

const membershipSelect = {
  careCircleId: true,
  role: true,
  user: { select: { displayName: true } },
} as const;

function tokenHash(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

function contextFromMembership(
  authUser: AuthenticatedCaregiverUser,
  membership: {
    careCircleId: string;
    role: "OWNER" | "FAMILY_MEMBER";
    user: { displayName: string };
  },
): CaregiverAuthContext {
  return {
    actorType: "CAREGIVER",
    user: { id: authUser.id, displayName: membership.user.displayName },
    membership: {
      careCircleId: membership.careCircleId,
      role: membership.role,
    },
  };
}

export async function createInvitation(
  context: CaregiverAuthContext,
  input: CreateInvitationInput,
  dependencies: {
    db?: PrismaClient;
    now?: Date;
    requestId?: string;
    generateToken?: () => string;
  } = {},
) {
  requireOwner(context);
  const db = dependencies.db ?? (await import("@/lib/db/client")).prisma;
  const now = dependencies.now ?? new Date();
  const token =
    dependencies.generateToken?.() ?? randomBytes(32).toString("base64url");
  const expiresAt = new Date(
    now.getTime() + input.expiresInHours * 60 * 60 * 1_000,
  );

  return db.$transaction(async (tx) => {
    const invitation = await tx.careCircleInvitation.create({
      data: {
        careCircleId: context.membership.careCircleId,
        codeHash: tokenHash(token),
        expiresAt,
        createdByUserId: context.user.id,
      },
      select: { id: true, expiresAt: true },
    });
    await writeAuditEvent(tx, {
      careCircleId: context.membership.careCircleId,
      actor: {
        type: "CAREGIVER",
        userId: context.user.id,
        role: context.membership.role,
      },
      action: "CARE_CIRCLE_INVITATION_CREATED",
      targetType: "CARE_CIRCLE_INVITATION",
      targetId: invitation.id,
      requestId: dependencies.requestId,
    });
    return {
      id: invitation.id,
      invitePath: `/caregiver/invite/${token}`,
      expiresAt: invitation.expiresAt.toISOString(),
    };
  });
}

export async function getInvitationPreview(
  token: string,
  dependencies: { db?: PrismaClient; now?: Date } = {},
) {
  const db = dependencies.db ?? (await import("@/lib/db/client")).prisma;
  const now = dependencies.now ?? new Date();
  const invitation = await db.careCircleInvitation.findUnique({
    where: { codeHash: tokenHash(token) },
    select: {
      expiresAt: true,
      acceptedAt: true,
      revokedAt: true,
      careCircle: { select: { name: true } },
    },
  });
  if (
    !invitation ||
    invitation.acceptedAt !== null ||
    invitation.revokedAt !== null ||
    invitation.expiresAt <= now
  ) {
    throw new InvitationError("NOT_FOUND");
  }
  return {
    careCircleName: invitation.careCircle.name,
    expiresAt: invitation.expiresAt.toISOString(),
  };
}

export async function acceptInvitation(
  authUser: AuthenticatedCaregiverUser,
  token: string,
  input: AcceptInvitationInput,
  dependencies: { db?: PrismaClient; now?: Date; requestId?: string } = {},
) {
  const db = dependencies.db ?? (await import("@/lib/db/client")).prisma;
  const now = dependencies.now ?? new Date();
  const codeHash = tokenHash(token);

  return db.$transaction(async (tx) => {
    await tx.$queryRaw(
      Prisma.sql`SELECT pg_advisory_xact_lock(hashtext(${codeHash}))::text`,
    );
    const invitation = await tx.careCircleInvitation.findUnique({
      where: { codeHash },
      select: {
        id: true,
        careCircleId: true,
        createdByUserId: true,
        expiresAt: true,
        acceptedAt: true,
        acceptedByUserId: true,
        revokedAt: true,
        careCircle: { select: { name: true } },
      },
    });
    if (!invitation) throw new InvitationError("NOT_FOUND");

    const activeMembership = await tx.careCircleMember.findFirst({
      where: {
        userId: authUser.id,
        status: "ACTIVE",
        careCircle: { isActive: true },
      },
      select: membershipSelect,
    });

    if (invitation.acceptedAt !== null) {
      if (
        invitation.acceptedByUserId === authUser.id &&
        activeMembership?.careCircleId === invitation.careCircleId &&
        activeMembership.role === "FAMILY_MEMBER"
      ) {
        return contextFromMembership(authUser, activeMembership);
      }
      throw new InvitationError("CONFLICT");
    }
    if (invitation.revokedAt !== null || invitation.expiresAt <= now) {
      throw new InvitationError("NOT_FOUND");
    }
    if (
      activeMembership &&
      (activeMembership.careCircleId !== invitation.careCircleId ||
        activeMembership.role !== "FAMILY_MEMBER")
    ) {
      throw new CaregiverAuthError("FORBIDDEN");
    }

    const applicationUser = await tx.user.findUnique({
      where: { id: authUser.id },
      select: { id: true },
    });
    if (!applicationUser) {
      await tx.user.create({
        data: { id: authUser.id, displayName: input.displayName },
        select: { id: true },
      });
    }

    const consumed = await tx.careCircleInvitation.updateMany({
      where: {
        id: invitation.id,
        acceptedAt: null,
        revokedAt: null,
        expiresAt: { gt: now },
      },
      data: { acceptedAt: now, acceptedByUserId: authUser.id },
    });
    if (consumed.count !== 1) throw new InvitationError("CONFLICT");

    const membership =
      activeMembership ??
      (await tx.careCircleMember.upsert({
        where: {
          careCircleId_userId: {
            careCircleId: invitation.careCircleId,
            userId: authUser.id,
          },
        },
        create: {
          careCircleId: invitation.careCircleId,
          userId: authUser.id,
          role: "FAMILY_MEMBER",
          status: "ACTIVE",
          invitedByUserId: invitation.createdByUserId,
          joinedAt: now,
        },
        update: {
          role: "FAMILY_MEMBER",
          status: "ACTIVE",
          invitedByUserId: invitation.createdByUserId,
          joinedAt: now,
        },
        select: membershipSelect,
      }));
    await writeAuditEvent(tx, {
      careCircleId: invitation.careCircleId,
      actor: { type: "CAREGIVER", userId: authUser.id, role: "FAMILY_MEMBER" },
      action: "CARE_CIRCLE_INVITATION_ACCEPTED",
      targetType: "CARE_CIRCLE_INVITATION",
      targetId: invitation.id,
      requestId: dependencies.requestId,
    });
    return contextFromMembership(authUser, membership);
  });
}
