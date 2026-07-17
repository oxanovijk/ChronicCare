import { z } from "zod";

const nullableText = (max: number) => z.string().trim().min(1).max(max).nullable();
const optionalDate = z.iso.date().nullable().optional().default(null);
const optionalDateTime = z.iso.datetime({ offset: true }).nullable().optional().default(null);

export const medicationCreateSchema = z.object({
  name: z.string().trim().min(1).max(160),
  doseText: z.string().trim().min(1).max(160),
  scheduleText: z.string().trim().min(1).max(240),
  instructions: nullableText(2000).optional().default(null),
  startDate: optionalDate,
  endDate: optionalDate,
}).strict();

export const medicationPatchSchema = z.object({
  name: z.string().trim().min(1).max(160).optional(),
  doseText: z.string().trim().min(1).max(160).optional(),
  scheduleText: z.string().trim().min(1).max(240).optional(),
  instructions: nullableText(2000).optional(),
  startDate: z.iso.date().nullable().optional(),
  endDate: z.iso.date().nullable().optional(),
  status: z.enum(["ACTIVE", "PAUSED", "ENDED"]).optional(),
  updatedAt: z.iso.datetime({ offset: true }),
}).strict().refine((value) => Object.keys(value).some((key) => key !== "updatedAt"), {
  message: "At least one medication change is required",
});

export const medicationLogCreateSchema = z.object({
  status: z.enum(["TAKEN", "MISSED", "SKIPPED"]),
  scheduledFor: optionalDateTime,
}).strict();

export const reminderCreateSchema = z.object({
  type: z.enum(["MEDICATION", "CHECK_IN", "DOCTOR_VISIT", "BPJS", "OTHER"]),
  title: z.string().trim().min(1).max(160),
  description: nullableText(1000).optional().default(null),
  scheduledAt: optionalDateTime,
  scheduleText: nullableText(240).optional().default(null),
  relatedMedicationId: z.uuid().nullable().optional().default(null),
}).strict();

export const reminderPatchSchema = z.object({
  type: z.enum(["MEDICATION", "CHECK_IN", "DOCTOR_VISIT", "BPJS", "OTHER"]).optional(),
  title: z.string().trim().min(1).max(160).optional(),
  description: nullableText(1000).optional(),
  scheduledAt: z.iso.datetime({ offset: true }).nullable().optional(),
  scheduleText: nullableText(240).optional(),
  status: z.enum(["UPCOMING", "DONE", "MISSED", "SKIPPED"]).optional(),
  relatedMedicationId: z.uuid().nullable().optional(),
  updatedAt: z.iso.datetime({ offset: true }),
}).strict().refine((value) => Object.keys(value).some((key) => key !== "updatedAt"), {
  message: "At least one reminder change is required",
});

export const healthNoteCreateSchema = z.object({
  title: z.string().trim().min(1).max(160),
  noteText: z.string().trim().min(1).max(4000),
  category: z.string().trim().min(1).max(48),
}).strict();

export type MedicationCreateInput = z.infer<typeof medicationCreateSchema>;
export type MedicationPatchInput = z.infer<typeof medicationPatchSchema>;
export type MedicationLogCreateInput = z.infer<typeof medicationLogCreateSchema>;
export type ReminderCreateInput = z.infer<typeof reminderCreateSchema>;
export type ReminderPatchInput = z.infer<typeof reminderPatchSchema>;
export type HealthNoteCreateInput = z.infer<typeof healthNoteCreateSchema>;
