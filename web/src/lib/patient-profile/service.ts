import "server-only";

import type {
  BpjsMembershipStatus,
  ProfileFactStatus,
} from "@/generated/prisma/enums";
import { Prisma, type PrismaClient } from "@/generated/prisma/client";
import {
  type CaregiverAuthContext,
  requireOwner,
} from "@/lib/auth/caregiver";
import {
  type AuthContext,
  requireBoundPatientProfile,
} from "@/lib/auth/patient";
import {
  minimumPatientProfileFacts,
  patientProfileFactsSchema,
} from "@/lib/db/profile-facts";
import type {
  CreatePatientProfileInput,
  DeactivatePatientProfileInput,
  PatchPatientProfileInput,
} from "@/lib/patient-profile/schemas";

export class PatientProfileError extends Error {
  constructor(
    public readonly code:
      | "NOT_FOUND"
      | "CONFLICT"
      | "PATIENT_PROFILE_LIMIT_REACHED",
  ) {
    super(code);
    this.name = "PatientProfileError";
  }
}

const profileSelect = {
  id: true,
  displayName: true,
  relationshipLabel: true,
  dateOfBirth: true,
  city: true,
  locationLabel: true,
  primaryConditions: true,
  primaryConditionsStatus: true,
  allergies: true,
  allergiesStatus: true,
  currentMedicationsStatus: true,
  emergencyContactName: true,
  emergencyContactPhone: true,
  emergencyContactStatus: true,
  bpjsMembershipStatus: true,
  bpjsNumberLast4: true,
  usualFacilityName: true,
} as const;

type ProfileRecord = {
  id: string;
  displayName: string;
  relationshipLabel: string;
  dateOfBirth: Date | null;
  city: string | null;
  locationLabel: string | null;
  primaryConditions: string[];
  primaryConditionsStatus: ProfileFactStatus;
  allergies: string[];
  allergiesStatus: ProfileFactStatus;
  currentMedicationsStatus: ProfileFactStatus;
  emergencyContactName: string | null;
  emergencyContactPhone: string | null;
  emergencyContactStatus: ProfileFactStatus;
  bpjsMembershipStatus: BpjsMembershipStatus;
  bpjsNumberLast4: string | null;
  usualFacilityName: string | null;
};

export type PatientProfileSetupAction =
  | "ADD_DATE_OF_BIRTH"
  | "ADD_LOCATION"
  | "REVIEW_PRIMARY_CONDITIONS"
  | "REVIEW_ALLERGIES"
  | "REVIEW_CURRENT_MEDICATIONS"
  | "REVIEW_EMERGENCY_CONTACT"
  | "REVIEW_BPJS_STATUS"
  | "ADD_USUAL_FACILITY";

export function deriveSetupChecklist(profile: ProfileRecord) {
  const recommendedActions: PatientProfileSetupAction[] = [];
  if (profile.allergiesStatus === "UNKNOWN")
    recommendedActions.push("REVIEW_ALLERGIES");
  if (profile.currentMedicationsStatus === "UNKNOWN")
    recommendedActions.push("REVIEW_CURRENT_MEDICATIONS");
  if (profile.emergencyContactStatus === "UNKNOWN")
    recommendedActions.push("REVIEW_EMERGENCY_CONTACT");
  if (profile.primaryConditionsStatus === "UNKNOWN")
    recommendedActions.push("REVIEW_PRIMARY_CONDITIONS");
  if (profile.bpjsMembershipStatus === "UNKNOWN")
    recommendedActions.push("REVIEW_BPJS_STATUS");
  if (!profile.dateOfBirth) recommendedActions.push("ADD_DATE_OF_BIRTH");
  if (!profile.locationLabel && !profile.city)
    recommendedActions.push("ADD_LOCATION");
  if (!profile.usualFacilityName)
    recommendedActions.push("ADD_USUAL_FACILITY");

  return {
    minimumIdentityComplete: true as const,
    primaryConditionsStatus: profile.primaryConditionsStatus,
    allergiesStatus: profile.allergiesStatus,
    currentMedicationsStatus: profile.currentMedicationsStatus,
    emergencyContactStatus: profile.emergencyContactStatus,
    bpjsMembershipStatus: profile.bpjsMembershipStatus,
    dateOfBirthRecorded: profile.dateOfBirth !== null,
    broadLocationRecorded: Boolean(profile.locationLabel || profile.city),
    usualFacilityRecorded: profile.usualFacilityName !== null,
    recommendedActions,
  };
}

export function patientProfileDto(profile: ProfileRecord) {
  return {
    id: profile.id,
    displayName: profile.displayName,
    relationshipLabel: profile.relationshipLabel,
    dateOfBirth: profile.dateOfBirth?.toISOString().slice(0, 10) ?? null,
    city: profile.city,
    locationLabel: profile.locationLabel,
    primaryConditions: profile.primaryConditions,
    primaryConditionsStatus: profile.primaryConditionsStatus,
    allergies: profile.allergies,
    allergiesStatus: profile.allergiesStatus,
    currentMedicationsStatus: profile.currentMedicationsStatus,
    emergencyContactName: profile.emergencyContactName,
    emergencyContactPhone: profile.emergencyContactPhone,
    emergencyContactStatus: profile.emergencyContactStatus,
    bpjsMembershipStatus: profile.bpjsMembershipStatus,
    bpjsNumberLast4: profile.bpjsNumberLast4,
    usualFacilityName: profile.usualFacilityName,
    setupChecklist: deriveSetupChecklist(profile),
  };
}

export async function listPatientProfiles(
  context: CaregiverAuthContext,
  dependencies: { db?: PrismaClient } = {},
) {
  const db =
    dependencies.db ?? (await import("@/lib/db/client")).prisma;
  const profiles = await db.patientProfile.findMany({
    where: {
      careCircleId: context.membership.careCircleId,
      status: "ACTIVE",
      deletedAt: null,
    },
    select: profileSelect,
    orderBy: { createdAt: "asc" },
    take: 2,
  });
  return profiles.map(patientProfileDto);
}

export async function getAuthorizedPatientProfile(
  context: AuthContext,
  patientProfileId: string,
  dependencies: { db?: PrismaClient } = {},
) {
  if (context.actorType === "PATIENT") {
    requireBoundPatientProfile(context, patientProfileId);
  }

  const db =
    dependencies.db ?? (await import("@/lib/db/client")).prisma;
  const profile = await db.patientProfile.findFirst({
    where: {
      id: patientProfileId,
      ...(context.actorType === "CAREGIVER"
        ? { careCircleId: context.membership.careCircleId }
        : {}),
      status: "ACTIVE",
      deletedAt: null,
    },
    select: profileSelect,
  });
  if (!profile) throw new PatientProfileError("NOT_FOUND");
  return patientProfileDto(profile);
}

export async function createPatientProfile(
  context: CaregiverAuthContext,
  input: CreatePatientProfileInput,
  dependencies: { db?: PrismaClient; requestId?: string } = {},
) {
  requireOwner(context);
  const db =
    dependencies.db ?? (await import("@/lib/db/client")).prisma;

  try {
    return await db.$transaction(async (tx) => {
      await tx.$queryRaw(
        Prisma.sql`SELECT id FROM care_circles WHERE id = ${context.membership.careCircleId}::uuid FOR UPDATE`,
      );
      const profileCount = await tx.patientProfile.count({
        where: {
          careCircleId: context.membership.careCircleId,
          deletedAt: null,
        },
      });
      if (profileCount >= 2) {
        throw new PatientProfileError("PATIENT_PROFILE_LIMIT_REACHED");
      }

      const profile = await tx.patientProfile.create({
        data: {
          careCircleId: context.membership.careCircleId,
          createdByUserId: context.user.id,
          ...input,
          ...minimumPatientProfileFacts,
          primaryConditions: [],
          allergies: [],
        },
        select: profileSelect,
      });
      await tx.auditEvent.create({
        data: {
          careCircleId: context.membership.careCircleId,
          patientProfileId: profile.id,
          actorType: "CAREGIVER",
          actorUserId: context.user.id,
          actorRole: context.membership.role,
          action: "PATIENT_PROFILE_CREATED",
          targetType: "PATIENT_PROFILE",
          targetId: profile.id,
          summary: "PATIENT_PROFILE_CREATED PATIENT_PROFILE",
          requestId: dependencies.requestId,
        },
      });
      return patientProfileDto(profile);
    });
  } catch (error) {
    if (error instanceof PatientProfileError) throw error;
    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      error.code === "P2002"
    ) {
      throw new PatientProfileError("CONFLICT");
    }
    throw error;
  }
}

export async function updatePatientProfile(
  context: CaregiverAuthContext,
  patientProfileId: string,
  input: PatchPatientProfileInput,
  dependencies: { db?: PrismaClient; requestId?: string } = {},
) {
  const db =
    dependencies.db ?? (await import("@/lib/db/client")).prisma;

  return db.$transaction(async (tx) => {
    const existing = await tx.patientProfile.findFirst({
      where: {
        id: patientProfileId,
        careCircleId: context.membership.careCircleId,
        status: "ACTIVE",
        deletedAt: null,
      },
      select: profileSelect,
    });
    if (!existing) throw new PatientProfileError("NOT_FOUND");

    if (input.currentMedicationsStatus) {
      const activeMedicationCount = await tx.medication.count({
        where: { patientProfileId: existing.id, status: "ACTIVE" },
      });
      if (activeMedicationCount > 0) throw new PatientProfileError("CONFLICT");
    }

    const facts = patientProfileFactsSchema.parse({
      primaryConditions:
        input.primaryConditions ?? existing.primaryConditions,
      primaryConditionsStatus:
        input.primaryConditionsStatus ?? existing.primaryConditionsStatus,
      allergies: input.allergies ?? existing.allergies,
      allergiesStatus: input.allergiesStatus ?? existing.allergiesStatus,
      currentMedicationsStatus:
        input.currentMedicationsStatus ??
        (existing.currentMedicationsStatus === "REPORTED"
          ? "UNKNOWN"
          : existing.currentMedicationsStatus),
      emergencyContactName:
        input.emergencyContactName === undefined
          ? existing.emergencyContactName
          : input.emergencyContactName,
      emergencyContactPhone:
        input.emergencyContactPhone === undefined
          ? existing.emergencyContactPhone
          : input.emergencyContactPhone,
      emergencyContactStatus:
        input.emergencyContactStatus ?? existing.emergencyContactStatus,
      bpjsNumberLast4:
        input.bpjsMembershipStatus &&
        input.bpjsMembershipStatus !== "REGISTERED"
          ? null
          : input.bpjsNumberLast4 === undefined
            ? existing.bpjsNumberLast4
            : input.bpjsNumberLast4,
      bpjsMembershipStatus:
        input.bpjsMembershipStatus ?? existing.bpjsMembershipStatus,
    });

    const profile = await tx.patientProfile.update({
      where: { id: existing.id },
      data: {
        ...input,
        ...facts,
        currentMedicationsStatus:
          input.currentMedicationsStatus ?? existing.currentMedicationsStatus,
        dateOfBirth:
          input.dateOfBirth === undefined
            ? undefined
            : input.dateOfBirth === null
              ? null
              : new Date(`${input.dateOfBirth}T00:00:00.000Z`),
        updatedByUserId: context.user.id,
      },
      select: profileSelect,
    });
    await tx.auditEvent.create({
      data: {
        careCircleId: context.membership.careCircleId,
        patientProfileId: profile.id,
        actorType: "CAREGIVER",
        actorUserId: context.user.id,
        actorRole: context.membership.role,
        action: "PATIENT_PROFILE_UPDATED",
        targetType: "PATIENT_PROFILE",
        targetId: profile.id,
        summary: "PATIENT_PROFILE_UPDATED PATIENT_PROFILE",
        requestId: dependencies.requestId,
      },
    });
    return patientProfileDto(profile);
  });
}

export async function deactivatePatientProfile(
  context: CaregiverAuthContext,
  patientProfileId: string,
  input: DeactivatePatientProfileInput,
  dependencies: { db?: PrismaClient; requestId?: string; now?: Date } = {},
) {
  requireOwner(context);
  const db =
    dependencies.db ?? (await import("@/lib/db/client")).prisma;
  const deactivatedAt = dependencies.now ?? new Date();
  const status =
    input.reason === "PATIENT_DECEASED" ? "DECEASED" : "END_OF_CARE";

  return db.$transaction(async (tx) => {
    const updated = await tx.patientProfile.updateMany({
      where: {
        id: patientProfileId,
        careCircleId: context.membership.careCircleId,
        status: "ACTIVE",
        deletedAt: null,
      },
      data: {
        status,
        deactivationReason: input.reason,
        deactivationNote: input.note ?? null,
        deactivatedByUserId: context.user.id,
        deactivatedAt,
        updatedByUserId: context.user.id,
      },
    });
    if (updated.count !== 1) throw new PatientProfileError("NOT_FOUND");

    await tx.patientAccessCode.updateMany({
      where: { patientProfileId, status: "ACTIVE" },
      data: { status: "REVOKED" },
    });
    await tx.patientSession.updateMany({
      where: { patientProfileId, revokedAt: null },
      data: { revokedAt: deactivatedAt },
    });
    await tx.auditEvent.create({
      data: {
        careCircleId: context.membership.careCircleId,
        patientProfileId,
        actorType: "CAREGIVER",
        actorUserId: context.user.id,
        actorRole: context.membership.role,
        action: "PATIENT_PROFILE_DEACTIVATED",
        targetType: "PATIENT_PROFILE",
        targetId: patientProfileId,
        summary: `PATIENT_PROFILE_DEACTIVATED ${input.reason}`,
        requestId: dependencies.requestId,
      },
    });

    return {
      id: patientProfileId,
      status,
      reason: input.reason,
      deactivatedAt: deactivatedAt.toISOString(),
    };
  });
}
