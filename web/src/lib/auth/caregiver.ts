import "server-only";

import type { PrismaClient } from "@/generated/prisma/client";
import type { MemberRole } from "@/generated/prisma/enums";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import {
  type OwnerOnboardingDefaults,
  ownerOnboardingDefaultsFromMetadata,
} from "@/lib/onboarding/schemas";

type SupabaseServerClient = Awaited<
  ReturnType<typeof createSupabaseServerClient>
>;
type MembershipReader = Pick<PrismaClient, "careCircleMember" | "user">;

export type AuthenticatedCaregiverUser = {
  id: string;
  onboardingDefaults?: OwnerOnboardingDefaults;
};

export type CaregiverAuthContext = {
  actorType: "CAREGIVER";
  user: { id: string; displayName: string };
  membership: { careCircleId: string; role: MemberRole };
};

export class CaregiverAuthError extends Error {
  constructor(
    public readonly code:
      | "UNAUTHENTICATED"
      | "FORBIDDEN"
      | "ONBOARDING_REQUIRED",
    public readonly onboardingDefaults?: OwnerOnboardingDefaults,
  ) {
    super(code);
    this.name = "CaregiverAuthError";
  }
}

export async function resolveAuthenticatedCaregiverUser(
  dependencies: { supabase?: SupabaseServerClient } = {},
): Promise<AuthenticatedCaregiverUser> {
  const supabase =
    dependencies.supabase ?? (await createSupabaseServerClient());
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) throw new CaregiverAuthError("UNAUTHENTICATED");
  const onboardingDefaults = ownerOnboardingDefaultsFromMetadata(
    data.user.user_metadata,
  );
  return {
    id: data.user.id,
    ...(Object.keys(onboardingDefaults).length > 0
      ? { onboardingDefaults }
      : {}),
  };
}

export async function resolveCaregiverAuthContext(
  dependencies: {
    supabase?: SupabaseServerClient;
    db?: MembershipReader;
  } = {},
): Promise<CaregiverAuthContext> {
  const authUser = await resolveAuthenticatedCaregiverUser({
    supabase: dependencies.supabase,
  });

  const db = dependencies.db ?? (await import("@/lib/db/client")).prisma;
  const membership = await db.careCircleMember.findFirst({
    where: {
      userId: authUser.id,
      status: "ACTIVE",
      careCircle: { isActive: true },
    },
    select: {
      careCircleId: true,
      role: true,
      user: { select: { displayName: true } },
    },
  });

  if (!membership) {
    const applicationUser = await db.user.findUnique({
      where: { id: authUser.id },
      select: { id: true },
    });
    throw new CaregiverAuthError(
      applicationUser ? "FORBIDDEN" : "ONBOARDING_REQUIRED",
      applicationUser ? undefined : authUser.onboardingDefaults,
    );
  }

  return {
    actorType: "CAREGIVER",
    user: { id: authUser.id, displayName: membership.user.displayName },
    membership: {
      careCircleId: membership.careCircleId,
      role: membership.role,
    },
  };
}

export function requireOwner(context: CaregiverAuthContext | null | undefined) {
  if (!context) {
    throw new CaregiverAuthError("UNAUTHENTICATED");
  }

  if (context.membership.role !== "OWNER") {
    throw new CaregiverAuthError("FORBIDDEN");
  }

  return context;
}
