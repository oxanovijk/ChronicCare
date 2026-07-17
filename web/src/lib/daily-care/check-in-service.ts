import "server-only";

import type { PrismaClient } from "@/generated/prisma/client";
import type { AuthContext } from "@/lib/auth/patient";
import { requireBoundPatientProfile } from "@/lib/auth/patient";
import { writeAuditEvent } from "@/lib/audit/write-audit-event";
import type { CheckInRequest } from "@/lib/daily-care/check-in-contract";
import { PatientProfileError } from "@/lib/patient-profile/service";

const checkInSelect = {
  id: true,
  patientProfileId: true,
  submittedByPatient: true,
  mood: true,
  conditionText: true,
  painLevel: true,
  medicationTaken: true,
  complaintText: true,
  needsFamilyHelp: true,
  createdAt: true,
} as const;

type CheckInRecord = {
  id: string;
  patientProfileId: string;
  submittedByPatient: boolean;
  mood: "GOOD" | "OKAY" | "UNWELL";
  conditionText: string | null;
  painLevel: number | null;
  medicationTaken: boolean | null;
  complaintText: string | null;
  needsFamilyHelp: boolean;
  createdAt: Date;
};

function checkInDto(record: CheckInRecord) {
  return {
    id: record.id,
    patientProfileId: record.patientProfileId,
    submittedByPatient: record.submittedByPatient,
    mood: record.mood,
    conditionText: record.conditionText,
    painLevel: record.painLevel,
    medicationTaken: record.medicationTaken,
    complaintText: record.complaintText,
    needsFamilyHelp: record.needsFamilyHelp,
    createdAt: record.createdAt.toISOString(),
  };
}

function activeProfileWhere(context: AuthContext, patientProfileId: string) {
  return {
    id: patientProfileId,
    ...(context.actorType === "CAREGIVER"
      ? { careCircleId: context.membership.careCircleId }
      : {}),
    status: "ACTIVE" as const,
    deletedAt: null,
  };
}

function requirePatientBinding(context: AuthContext, patientProfileId: string) {
  if (context.actorType === "PATIENT") {
    requireBoundPatientProfile(context, patientProfileId);
  }
}

export async function listCheckIns(
  context: AuthContext,
  patientProfileId: string,
  limit: number,
  dependencies: { db?: PrismaClient } = {},
) {
  requirePatientBinding(context, patientProfileId);
  const db = dependencies.db ?? (await import("@/lib/db/client")).prisma;
  const profile = await db.patientProfile.findFirst({
    where: activeProfileWhere(context, patientProfileId),
    select: { id: true, careCircleId: true },
  });
  if (!profile) throw new PatientProfileError("NOT_FOUND");

  const records = await db.checkIn.findMany({
    where: { patientProfileId: profile.id },
    select: checkInSelect,
    orderBy: { createdAt: "desc" },
    take: limit,
  });
  return records.map(checkInDto);
}

export async function createCheckIn(
  context: AuthContext,
  patientProfileId: string,
  input: CheckInRequest,
  dependencies: { db?: PrismaClient; requestId?: string } = {},
) {
  requirePatientBinding(context, patientProfileId);
  const db = dependencies.db ?? (await import("@/lib/db/client")).prisma;

  return db.$transaction(async (tx) => {
    const profile = await tx.patientProfile.findFirst({
      where: activeProfileWhere(context, patientProfileId),
      select: { id: true, careCircleId: true },
    });
    if (!profile) throw new PatientProfileError("NOT_FOUND");

    const record = await tx.checkIn.create({
      data: {
        patientProfileId: profile.id,
        submittedByPatient: context.actorType === "PATIENT",
        submittedByUserId:
          context.actorType === "CAREGIVER" ? context.user.id : null,
        ...input,
      },
      select: checkInSelect,
    });
    await writeAuditEvent(tx, {
      careCircleId: profile.careCircleId,
      patientProfileId: profile.id,
      actor:
        context.actorType === "PATIENT"
          ? { type: "PATIENT", patientProfileId: profile.id }
          : {
              type: "CAREGIVER",
              userId: context.user.id,
              role: context.membership.role,
            },
      action: "CHECK_IN_CREATED",
      targetType: "CHECK_IN",
      targetId: record.id,
      requestId: dependencies.requestId,
    });
    return checkInDto(record);
  });
}
