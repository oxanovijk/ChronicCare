import "server-only";

import type { PrismaClient } from "@/generated/prisma/client";
import type { CaregiverAuthContext } from "@/lib/auth/caregiver";
import { writeAuditEvent } from "@/lib/audit/write-audit-event";
import { requireActiveCaregiverProfile } from "@/lib/daily-care/daily-care-authorization";
import type { HealthNoteCreateInput } from "@/lib/daily-care/daily-care-contract";

const select = { id: true, patientProfileId: true, title: true, noteText: true, category: true, createdAt: true, updatedAt: true } as const;
const dto = (row: Record<string, unknown>) => ({ ...row, createdAt: (row.createdAt as Date).toISOString(), updatedAt: (row.updatedAt as Date).toISOString() });

export async function listHealthNotes(context: CaregiverAuthContext, patientProfileId: string, dependencies: { db?: PrismaClient } = {}) {
  const db = dependencies.db ?? (await import("@/lib/db/client")).prisma;
  await requireActiveCaregiverProfile(context, patientProfileId, db);
  return (await db.healthNote.findMany({ where: { patientProfileId }, select, orderBy: { createdAt: "desc" }, take: 20 })).map(dto);
}

export async function createHealthNote(context: CaregiverAuthContext, patientProfileId: string, input: HealthNoteCreateInput, dependencies: { db?: PrismaClient; requestId?: string } = {}) {
  const db = dependencies.db ?? (await import("@/lib/db/client")).prisma;
  return db.$transaction(async (tx) => {
    const profile = await requireActiveCaregiverProfile(context, patientProfileId, tx);
    const row = await tx.healthNote.create({ data: { patientProfileId, ...input, createdByUserId: context.user.id, updatedByUserId: context.user.id }, select });
    await writeAuditEvent(tx, { careCircleId: profile.careCircleId, patientProfileId, actor: { type: "CAREGIVER", userId: context.user.id, role: context.membership.role }, action: "HEALTH_NOTE_CREATED", targetType: "HEALTH_NOTE", targetId: row.id, requestId: dependencies.requestId });
    return dto(row);
  });
}
