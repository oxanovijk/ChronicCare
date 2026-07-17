import "server-only";

import type { PrismaClient } from "@/generated/prisma/client";
import type { AuthContext } from "@/lib/auth/patient";
import { requireBoundPatientProfile } from "@/lib/auth/patient";
import { writeAuditEvent } from "@/lib/audit/write-audit-event";
import { requireActiveCaregiverProfile } from "@/lib/daily-care/daily-care-authorization";
import type { ReminderCreateInput, ReminderPatchInput } from "@/lib/daily-care/daily-care-contract";
import { PatientProfileError } from "@/lib/patient-profile/service";

const select = { id: true, patientProfileId: true, type: true, title: true, description: true, scheduledAt: true, scheduleText: true, status: true, relatedMedicationId: true, createdAt: true, updatedAt: true } as const;
const dto = (row: Record<string, unknown>) => ({ ...row, scheduledAt: row.scheduledAt instanceof Date ? row.scheduledAt.toISOString() : null, createdAt: (row.createdAt as Date).toISOString(), updatedAt: (row.updatedAt as Date).toISOString() });

export async function listReminders(context: AuthContext, patientProfileId: string, dependencies: { db?: PrismaClient } = {}) {
  const db = dependencies.db ?? (await import("@/lib/db/client")).prisma;
  if (context.actorType === "PATIENT") requireBoundPatientProfile(context, patientProfileId);
  const profile = await db.patientProfile.findFirst({ where: { id: patientProfileId, ...(context.actorType === "CAREGIVER" ? { careCircleId: context.membership.careCircleId } : {}), status: "ACTIVE", deletedAt: null }, select: { id: true } });
  if (!profile) throw new PatientProfileError("NOT_FOUND");
  return (await db.reminder.findMany({ where: { patientProfileId }, select, orderBy: [{ status: "asc" }, { scheduledAt: "asc" }] })).map(dto);
}

async function requireRelatedMedication(tx: PrismaClient, patientProfileId: string, medicationId: string | null | undefined) {
  if (!medicationId) return;
  const medication = await tx.medication.findFirst({ where: { id: medicationId, patientProfileId }, select: { id: true } });
  if (!medication) throw new PatientProfileError("NOT_FOUND");
}

export async function createReminder(context: Extract<AuthContext, { actorType: "CAREGIVER" }>, patientProfileId: string, input: ReminderCreateInput, dependencies: { db?: PrismaClient; requestId?: string } = {}) {
  const db = dependencies.db ?? (await import("@/lib/db/client")).prisma;
  return db.$transaction(async (tx) => {
    const profile = await requireActiveCaregiverProfile(context, patientProfileId, tx);
    await requireRelatedMedication(tx as never, patientProfileId, input.relatedMedicationId);
    const row = await tx.reminder.create({ data: { patientProfileId, type: input.type, title: input.title, description: input.description, scheduledAt: input.scheduledAt ? new Date(input.scheduledAt) : null, scheduleText: input.scheduleText, relatedMedicationId: input.relatedMedicationId, createdByUserId: context.user.id }, select });
    await writeAuditEvent(tx, { careCircleId: profile.careCircleId, patientProfileId, actor: { type: "CAREGIVER", userId: context.user.id, role: context.membership.role }, action: "REMINDER_CREATED", targetType: "REMINDER", targetId: row.id, requestId: dependencies.requestId });
    return dto(row);
  });
}

export async function updateReminder(context: Extract<AuthContext, { actorType: "CAREGIVER" }>, patientProfileId: string, reminderId: string, input: ReminderPatchInput, dependencies: { db?: PrismaClient; requestId?: string } = {}) {
  const db = dependencies.db ?? (await import("@/lib/db/client")).prisma;
  return db.$transaction(async (tx) => {
    const profile = await requireActiveCaregiverProfile(context, patientProfileId, tx);
    const existing = await tx.reminder.findFirst({ where: { id: reminderId, patientProfileId }, select: { id: true } });
    if (!existing) throw new PatientProfileError("NOT_FOUND");
    await requireRelatedMedication(tx as never, patientProfileId, input.relatedMedicationId);
    const { updatedAt, ...changes } = input;
    const result = await tx.reminder.updateMany({ where: { id: reminderId, patientProfileId, updatedAt: new Date(updatedAt) }, data: { ...changes, scheduledAt: changes.scheduledAt === undefined ? undefined : changes.scheduledAt ? new Date(changes.scheduledAt) : null } });
    if (result.count !== 1) throw new PatientProfileError("CONFLICT");
    const row = await tx.reminder.findFirstOrThrow({ where: { id: reminderId, patientProfileId }, select });
    await writeAuditEvent(tx, { careCircleId: profile.careCircleId, patientProfileId, actor: { type: "CAREGIVER", userId: context.user.id, role: context.membership.role }, action: "REMINDER_UPDATED", targetType: "REMINDER", targetId: row.id, requestId: dependencies.requestId });
    return dto(row);
  });
}
