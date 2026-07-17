import { z } from "zod";

const nullableText = z.string().trim().min(1).max(1000).nullable();

export const checkInRequestSchema = z
  .object({
    mood: z.enum(["GOOD", "OKAY", "UNWELL"]),
    conditionText: nullableText.optional().default(null),
    painLevel: z.number().int().min(0).max(10).nullable().optional().default(null),
    medicationTaken: z.boolean().nullable().optional().default(null),
    complaintText: nullableText.optional().default(null),
    needsFamilyHelp: z.boolean().optional().default(false),
  })
  .strict();

export const checkInLimitSchema = z.coerce.number().int().min(1).max(10).default(10);

export type CheckInRequest = z.infer<typeof checkInRequestSchema>;

const urgentPhrases = [
  "darurat",
  "tidak sadar",
  "pingsan",
  "sulit bernapas",
  "sesak napas",
  "nyeri dada",
  "perdarahan hebat",
] as const;

export function shouldEscalateCheckIn(input: {
  conditionText: string | null;
  complaintText: string | null;
}) {
  const text = `${input.conditionText ?? ""} ${input.complaintText ?? ""}`
    .toLocaleLowerCase("id-ID")
    .replace(/\s+/g, " ");
  return urgentPhrases.some((phrase) => text.includes(phrase));
}
