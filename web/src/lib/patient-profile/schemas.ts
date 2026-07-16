import { z } from "zod";

const nullableText = (max: number) =>
  z.string().trim().min(1).max(max).nullable();

export const patientProfileIdSchema = z.uuid();

export const createPatientProfileSchema = z
  .object({
    displayName: z.string().trim().min(1).max(120),
    relationshipLabel: z.string().trim().min(1).max(32),
  })
  .strict();

export const patchPatientProfileSchema = z
  .object({
    dateOfBirth: z.iso.date().nullable().optional(),
    city: nullableText(80).optional(),
    locationLabel: nullableText(160).optional(),
    primaryConditions: z.array(z.string().trim().min(1).max(160)).optional(),
    primaryConditionsStatus: z
      .enum(["UNKNOWN", "NONE_REPORTED", "REPORTED"])
      .optional(),
    allergies: z.array(z.string().trim().min(1).max(160)).optional(),
    allergiesStatus: z
      .enum(["UNKNOWN", "NONE_REPORTED", "REPORTED"])
      .optional(),
    currentMedicationsStatus: z
      .enum(["UNKNOWN", "NONE_REPORTED"])
      .optional(),
    emergencyContactName: nullableText(120).optional(),
    emergencyContactPhone: nullableText(32).optional(),
    emergencyContactStatus: z
      .enum(["UNKNOWN", "NONE_REPORTED", "REPORTED"])
      .optional(),
    bpjsMembershipStatus: z
      .enum(["UNKNOWN", "NOT_REGISTERED", "REGISTERED"])
      .optional(),
    bpjsNumberLast4: z.string().regex(/^\d{4}$/).nullable().optional(),
    usualFacilityName: nullableText(160).optional(),
  })
  .strict()
  .refine((value) => Object.keys(value).length > 0, {
    message: "At least one profile field is required",
  });

export type CreatePatientProfileInput = z.infer<
  typeof createPatientProfileSchema
>;
export type PatchPatientProfileInput = z.infer<
  typeof patchPatientProfileSchema
>;
