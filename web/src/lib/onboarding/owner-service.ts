import "server-only";

import { Prisma, type PrismaClient } from "@/generated/prisma/client";
import {
  type AuthenticatedCaregiverUser,
  type CaregiverAuthContext,
  CaregiverAuthError,
} from "@/lib/auth/caregiver";
import { writeAuditEvent } from "@/lib/audit/write-audit-event";
import type { OwnerOnboardingInput } from "@/lib/onboarding/schemas";

const membershipSelect = {
  careCircleId: true,
  role: true,
  user: { select: { displayName: true } },
} as const;

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

export async function completeOwnerOnboarding(
  authUser: AuthenticatedCaregiverUser,
  input: OwnerOnboardingInput,
  dependencies: { db?: PrismaClient; requestId?: string; now?: Date } = {},
) {
  const db = dependencies.db ?? (await import("@/lib/db/client")).prisma;
  const now = dependencies.now ?? new Date();

  return db.$transaction(async (tx) => {
    await tx.$queryRaw(
      Prisma.sql`SELECT pg_advisory_xact_lock(hashtext(${authUser.id}))::text`,
    );

    const existingMembership = await tx.careCircleMember.findFirst({
      where: {
        userId: authUser.id,
        status: "ACTIVE",
        careCircle: { isActive: true },
      },
      select: membershipSelect,
    });
    if (existingMembership) {
      return contextFromMembership(authUser, existingMembership);
    }

    const existingUser = await tx.user.findUnique({
      where: { id: authUser.id },
      select: { id: true },
    });
    if (existingUser) throw new CaregiverAuthError("FORBIDDEN");

    await tx.user.create({
      data: { id: authUser.id, displayName: input.displayName },
      select: { id: true },
    });
    const careCircle = await tx.careCircle.create({
      data: {
        name: input.careCircleName,
        createdByUserId: authUser.id,
      },
      select: { id: true },
    });
    const membership = await tx.careCircleMember.create({
      data: {
        careCircleId: careCircle.id,
        userId: authUser.id,
        role: "OWNER",
        status: "ACTIVE",
        joinedAt: now,
      },
      select: membershipSelect,
    });
    await writeAuditEvent(tx, {
      careCircleId: careCircle.id,
      actor: { type: "CAREGIVER", userId: authUser.id, role: "OWNER" },
      action: "OWNER_ONBOARDING_COMPLETED",
      targetType: "CARE_CIRCLE",
      targetId: careCircle.id,
      requestId: dependencies.requestId,
    });
    return contextFromMembership(authUser, membership);
  });
}
