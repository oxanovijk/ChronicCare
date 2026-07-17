import "server-only";

import type { PrismaClient } from "@/generated/prisma/client";
import type { CaregiverAuthContext } from "@/lib/auth/caregiver";
import { PatientProfileError } from "@/lib/patient-profile/service";

export async function requireActiveCaregiverProfile(
  context: CaregiverAuthContext,
  patientProfileId: string,
  db: Pick<PrismaClient, "patientProfile">,
) {
  const profile = await db.patientProfile.findFirst({
    where: {
      id: patientProfileId,
      careCircleId: context.membership.careCircleId,
      status: "ACTIVE",
      deletedAt: null,
    },
    select: { id: true, careCircleId: true },
  });
  if (!profile) throw new PatientProfileError("NOT_FOUND");
  return profile;
}

export function dateOnly(value: string | null | undefined) {
  return value ? new Date(`${value}T00:00:00.000Z`) : value;
}
