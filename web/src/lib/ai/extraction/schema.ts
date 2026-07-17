import { z } from "zod";

/**
 * Locked wire schema `document-extraction.v1` transcribed from
 * docs/technical/api.md. Strict objects on purpose: provider output with
 * invented fields must fail validation instead of being silently stripped.
 */
export const EXTRACTION_SCHEMA_VERSION = "document-extraction.v1" as const;

const asWritten = z.string().nullable();

export const documentCategorySchema = z.enum([
  "BPJS_CARD",
  "REFERRAL_LETTER",
  "PRESCRIPTION",
  "LAB_RESULT",
  "MEDICAL_RESUME",
  "CONTROL_CARD",
  "OTHER",
]);

export const documentExtractionV1Schema = z.strictObject({
  schemaVersion: z.literal(EXTRACTION_SCHEMA_VERSION),
  documentType: documentCategorySchema,
  sourceLanguage: z.enum(["id", "en", "mixed", "unknown"]),
  patientNameAsWritten: asWritten,
  documentDateAsWritten: asWritten,
  facilityNameAsWritten: asWritten,
  clinicianNameAsWritten: asWritten,
  documentNumberAsWritten: asWritten,
  summaryAsWritten: z.array(z.string()),
  medications: z.array(
    z.strictObject({
      nameAsWritten: z.string(),
      doseAsWritten: asWritten,
      frequencyAsWritten: asWritten,
      instructionAsWritten: asWritten,
    }),
  ),
  labResults: z.array(
    z.strictObject({
      testNameAsWritten: z.string(),
      valueAsWritten: asWritten,
      unitAsWritten: asWritten,
      referenceRangeAsWritten: asWritten,
      flagAsWritten: asWritten,
    }),
  ),
  referral: z
    .strictObject({
      originFacilityAsWritten: asWritten,
      destinationFacilityAsWritten: asWritten,
      validUntilAsWritten: asWritten,
      reasonAsWritten: asWritten,
    })
    .nullable(),
  bpjs: z
    .strictObject({
      memberNumberMasked: asWritten,
      participantNameAsWritten: asWritten,
    })
    .nullable(),
  warnings: z.array(z.string()),
});

export type DocumentExtractionV1 = z.infer<typeof documentExtractionV1Schema>;
