import "server-only";

import type { PrismaClient } from "@/generated/prisma/client";
import type { CaregiverAuthContext } from "@/lib/auth/caregiver";
import { deriveSetupChecklist, PatientProfileError } from "@/lib/patient-profile/service";

const profileSelect = {
  id: true, careCircleId: true, displayName: true, relationshipLabel: true,
  dateOfBirth: true, city: true, locationLabel: true,
  primaryConditions: true, primaryConditionsStatus: true,
  allergies: true, allergiesStatus: true, currentMedicationsStatus: true,
  emergencyContactName: true, emergencyContactPhone: true, emergencyContactStatus: true,
  bpjsMembershipStatus: true, bpjsNumberLast4: true, usualFacilityName: true,
} as const;

export async function getCaregiverDashboard(
  context: CaregiverAuthContext,
  patientProfileId: string,
  dependencies: { db?: PrismaClient } = {},
) {
  const db = dependencies.db ?? (await import("@/lib/db/client")).prisma;
  const profile = await db.patientProfile.findFirst({
    where: { id: patientProfileId, careCircleId: context.membership.careCircleId, status: "ACTIVE", deletedAt: null },
    select: profileSelect,
  });
  if (!profile) throw new PatientProfileError("NOT_FOUND");

  const [latestCheckIn, activeMedications, upcomingReminders, recentHealthNotes] = await Promise.all([
    db.checkIn.findFirst({
      where: { patientProfileId: profile.id },
      select: { id: true, mood: true, conditionText: true, painLevel: true, medicationTaken: true, complaintText: true, needsFamilyHelp: true, createdAt: true },
      orderBy: { createdAt: "desc" },
    }),
    db.medication.findMany({
      where: { patientProfileId: profile.id, status: "ACTIVE" },
      select: { id: true, name: true, doseText: true, scheduleText: true, instructions: true, startDate: true, endDate: true, status: true, createdAt: true, updatedAt: true },
      orderBy: { createdAt: "asc" },
    }),
    db.reminder.findMany({
      where: { patientProfileId: profile.id, status: "UPCOMING" },
      select: { id: true, type: true, title: true, description: true, scheduledAt: true, scheduleText: true, status: true, relatedMedicationId: true, createdAt: true, updatedAt: true },
      orderBy: [{ scheduledAt: "asc" }, { createdAt: "desc" }],
      take: 5,
    }),
    db.healthNote.findMany({
      where: { patientProfileId: profile.id },
      select: { id: true, title: true, noteText: true, category: true, createdAt: true, updatedAt: true },
      orderBy: { createdAt: "desc" },
      take: 3,
    }),
  ]);

  const iso = <T extends Record<string, unknown>>(item: T) => ({
    ...item,
    ...("createdAt" in item && item.createdAt instanceof Date ? { createdAt: item.createdAt.toISOString() } : {}),
    ...("updatedAt" in item && item.updatedAt instanceof Date ? { updatedAt: item.updatedAt.toISOString() } : {}),
    ...("scheduledAt" in item && item.scheduledAt instanceof Date ? { scheduledAt: item.scheduledAt.toISOString() } : {}),
    ...("startDate" in item && item.startDate instanceof Date ? { startDate: item.startDate.toISOString().slice(0, 10) } : {}),
    ...("endDate" in item && item.endDate instanceof Date ? { endDate: item.endDate.toISOString().slice(0, 10) } : {}),
  });

  return {
    patientProfile: {
      id: profile.id, displayName: profile.displayName, relationshipLabel: profile.relationshipLabel,
      primaryConditionsStatus: profile.primaryConditionsStatus, allergiesStatus: profile.allergiesStatus,
      currentMedicationsStatus: profile.currentMedicationsStatus, emergencyContactStatus: profile.emergencyContactStatus,
      bpjsMembershipStatus: profile.bpjsMembershipStatus,
    },
    setupChecklist: deriveSetupChecklist(profile),
    latestCheckIn: latestCheckIn ? iso(latestCheckIn) : null,
    activeMedications: activeMedications.map(iso),
    upcomingReminders: upcomingReminders.map(iso),
    recentHealthNotes: recentHealthNotes.map(iso),
  };
}
