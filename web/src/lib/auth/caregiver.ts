import "server-only";

import type { PrismaClient } from "@/generated/prisma/client";
import type { MemberRole } from "@/generated/prisma/enums";
import { createSupabaseServerClient } from "@/lib/supabase/server";

type SupabaseServerClient = Awaited<
  ReturnType<typeof createSupabaseServerClient>
>;
type MembershipReader = Pick<PrismaClient, "careCircleMember">;

export type CaregiverAuthContext = {
  actorType: "CAREGIVER";
  user: { id: string; displayName: string };
  membership: { careCircleId: string; role: MemberRole };
};

export class CaregiverAuthError extends Error {
  constructor(public readonly code: "UNAUTHENTICATED" | "FORBIDDEN") {
    super(code);
    this.name = "CaregiverAuthError";
  }
}

export async function resolveCaregiverAuthContext(
  dependencies: {
    supabase?: SupabaseServerClient;
    db?: MembershipReader;
  } = {},
): Promise<CaregiverAuthContext> {
  const supabase =
    dependencies.supabase ?? (await createSupabaseServerClient());
  const { data, error } = await supabase.auth.getUser();

  if (error || !data.user) throw new CaregiverAuthError("UNAUTHENTICATED");

  const db = dependencies.db ?? (await import("@/lib/db/client")).prisma;
  const membership = await db.careCircleMember.findFirst({
    where: {
      userId: data.user.id,
      status: "ACTIVE",
      careCircle: { isActive: true },
    },
    select: {
      careCircleId: true,
      role: true,
      user: { select: { displayName: true } },
    },
  });

  if (!membership) throw new CaregiverAuthError("FORBIDDEN");

  return {
    actorType: "CAREGIVER",
    user: { id: data.user.id, displayName: membership.user.displayName },
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
