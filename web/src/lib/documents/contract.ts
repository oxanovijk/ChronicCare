import { z } from "zod";

import {
  documentCategorySchema,
  documentExtractionV1Schema,
} from "@/lib/ai/extraction/schema";

export const DOCUMENT_ALLOWED_MIME_TYPES = [
  "application/pdf",
  "image/jpeg",
  "image/png",
] as const;

export const documentUploadIntentSchema = z.object({
  title: z.string().min(1).max(180),
  category: documentCategorySchema,
  fileName: z.string().min(1).max(255),
  mimeType: z.enum(DOCUMENT_ALLOWED_MIME_TYPES),
  fileSizeBytes: z.number().int().min(1),
  sha256: z
    .string()
    .regex(/^[0-9a-f]{64}$/i)
    .transform((value) => value.toLowerCase()),
});

export const extractionPatchSchema = z.object({
  structuredData: documentExtractionV1Schema,
});

export const extractionRejectSchema = z.object({
  reason: z.string().min(1).max(500),
});

export type DocumentUploadIntentInput = z.infer<
  typeof documentUploadIntentSchema
>;
