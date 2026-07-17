import "server-only";

import type { PrismaClient } from "@/generated/prisma/client";
import type { AuthContext } from "@/lib/auth/patient";
import { requireBoundPatientProfile } from "@/lib/auth/patient";
import { writeAuditEvent } from "@/lib/audit/write-audit-event";
import { dateOnly, requireActiveCaregiverProfile } from "@/lib/daily-care/daily-care-authorization";
import type { MedicationCreateInput, MedicationLogCreateInput, MedicationPatchInput } from "@/lib/daily-care/daily-care-contract";
import { PatientProfileError } from "@/lib/patient-profile/service";

const medicationSelect = { id: true, patientProfileId: true, name: true, doseText: true, scheduleText: true, instructions: true, startDate: true, endDate: true, status: true, createdAt: true, updatedAt: true } as const;
const medicationDto = (item: Record<string, unknown>) => ({
  ...item,
  createdAt: (item.createdAt as Date).toISOString(),
  updatedAt: (item.updatedAt as Date).toISOString(),
  startDate: item.startDate instanceof Date ? item.startDate.toISOString().slice(0, 10) : null,
  endDate: item.endDate instanceof Date ? item.endDate.toISOString().slice(0, 10) : null,
});

export async function listMedications(context: AuthContext, patientProfileId: string, dependencies: { db?: PrismaClient } = {}) {
  const db = dependencies.db ?? (await import("@/lib/db/client")).prisma;
  if (context.actorType === "PATIENT") requireBoundPatientProfile(context, patientProfileId);
  const where = { id: patientProfileId, ...(context.actorType === "CAREGIVER" ? { careCircleId: context.membership.careCircleId } : {}), status: "ACTIVE" as const, deletedAt: null };
  const profile = await db.patientProfile.findFirst({ where, select: { id: true } });
  if (!profile) throw new PatientProfileError("NOT_FOUND");
  const rows = await db.medication.findMany({ where: { patientProfileId }, select: medicationSelect, orderBy: { createdAt: "asc" } });
  return rows.map((row) => medicationDto(row));
}

export async function createMedication(context: Extract<AuthContext, { actorType: "CAREGIVER" }>, patientProfileId: string, input: MedicationCreateInput, dependencies: { db?: PrismaClient; requestId?: string } = {}) {
  const db = dependencies.db ?? (await import("@/lib/db/client")).prisma;
  return db.$transaction(async (tx) => {
    const profile = await requireActiveCaregiverProfile(context, patientProfileId, tx);
    const row = await tx.medication.create({ data: { patientProfileId, name: input.name, doseText: input.doseText, scheduleText: input.scheduleText, instructions: input.instructions, startDate: dateOnly(input.startDate), endDate: dateOnly(input.endDate), createdByUserId: context.user.id, updatedByUserId: context.user.id }, select: medicationSelect });
    await tx.patientProfile.update({ where: { id: patientProfileId }, data: { currentMedicationsStatus: "REPORTED", updatedByUserId: context.user.id } });
    await writeAuditEvent(tx, { careCircleId: profile.careCircleId, patientProfileId, actor: { type: "CAREGIVER", userId: context.user.id, role: context.membership.role }, action: "MEDICATION_CREATED", targetType: "MEDICATION", targetId: row.id, requestId: dependencies.requestId });
    return medicationDto(row);
  });
}

export async function updateMedication(context: Extract<AuthContext, { actorType: "CAREGIVER" }>, patientProfileId: string, medicationId: string, input: MedicationPatchInput, dependencies: { db?: PrismaClient; requestId?: string } = {}) {
  const db = dependencies.db ?? (await import("@/lib/db/client")).prisma;
  return db.$transaction(async (tx) => {
    const profile = await requireActiveCaregiverProfile(context, patientProfileId, tx);
    const existing = await tx.medication.findFirst({ where: { id: medicationId, patientProfileId }, select: medicationSelect });
    if (!existing) throw new PatientProfileError("NOT_FOUND");
    const { updatedAt, ...changes } = input;
    const result = await tx.medication.updateMany({ where: { id: medicationId, patientProfileId, updatedAt: new Date(updatedAt) }, data: { ...changes, startDate: changes.startDate === undefined ? undefined : dateOnly(changes.startDate), endDate: changes.endDate === undefined ? undefined : dateOnly(changes.endDate), updatedByUserId: context.user.id } });
    if (result.count !== 1) throw new PatientProfileError("CONFLICT");
    const row = await tx.medication.findFirstOrThrow({ where: { id: medicationId, patientProfileId }, select: medicationSelect });
    if (row.status === "ACTIVE") {
      await tx.patientProfile.update({ where: { id: patientProfileId }, data: { currentMedicationsStatus: "REPORTED", updatedByUserId: context.user.id } });
    } else if (existing.status === "ACTIVE") {
      const activeCount = await tx.medication.count({ where: { patientProfileId, status: "ACTIVE" } });
      if (activeCount === 0) await tx.patientProfile.update({ where: { id: patientProfileId }, data: { currentMedicationsStatus: "UNKNOWN", updatedByUserId: context.user.id } });
    }
    await writeAuditEvent(tx, { careCircleId: profile.careCircleId, patientProfileId, actor: { type: "CAREGIVER", userId: context.user.id, role: context.membership.role }, action: "MEDICATION_UPDATED", targetType: "MEDICATION", targetId: row.id, requestId: dependencies.requestId });
    return medicationDto(row);
  });
}

export async function createMedicationLog(context: AuthContext, patientProfileId: string, medicationId: string, input: MedicationLogCreateInput, dependencies: { db?: PrismaClient; requestId?: string } = {}) {
  const db = dependencies.db ?? (await import("@/lib/db/client")).prisma;
  if (context.actorType === "PATIENT") requireBoundPatientProfile(context, patientProfileId);
  return db.$transaction(async (tx) => {
    const profile = context.actorType === "CAREGIVER"
      ? await requireActiveCaregiverProfile(context, patientProfileId, tx)
      : await tx.patientProfile.findFirst({ where: { id: patientProfileId, status: "ACTIVE", deletedAt: null }, select: { id: true, careCircleId: true } });
    if (!profile) throw new PatientProfileError("NOT_FOUND");
    const medication = await tx.medication.findFirst({ where: { id: medicationId, patientProfileId, status: "ACTIVE" }, select: { id: true } });
    if (!medication) throw new PatientProfileError("NOT_FOUND");
    const row = await tx.medicationLog.create({ data: { patientProfileId, medicationId, status: input.status, scheduledFor: input.scheduledFor ? new Date(input.scheduledFor) : null, recordedByPatient: context.actorType === "PATIENT", recordedByUserId: context.actorType === "CAREGIVER" ? context.user.id : null }, select: { id: true, patientProfileId: true, medicationId: true, status: true, scheduledFor: true, recordedByPatient: true, recordedAt: true } });
    await writeAuditEvent(tx, { careCircleId: profile.careCircleId, patientProfileId, actor: context.actorType === "PATIENT" ? { type: "PATIENT", patientProfileId } : { type: "CAREGIVER", userId: context.user.id, role: context.membership.role }, action: "MEDICATION_LOG_CREATED", targetType: "MEDICATION_LOG", targetId: row.id, requestId: dependencies.requestId });
    return { ...row, scheduledFor: row.scheduledFor?.toISOString() ?? null, recordedAt: row.recordedAt.toISOString() };
  });
}
