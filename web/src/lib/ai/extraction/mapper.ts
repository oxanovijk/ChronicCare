import "server-only";

import { createAzureOpenAIClient } from "@/lib/ai/provider";
import {
  type DocumentExtractionV1,
  documentExtractionV1Schema,
} from "@/lib/ai/extraction/schema";
import { requireProviderConfig } from "@/lib/config/provider-policy";
import { getAzureOpenAIEnv } from "@/lib/env/server";

export class ExtractionMappingError extends Error {
  constructor(
    public readonly code:
      | "PROVIDER_UNAVAILABLE"
      | "PROVIDER_FAILED"
      | "INVALID_OUTPUT",
  ) {
    super(code);
    this.name = "ExtractionMappingError";
  }
}

/**
 * Transcription instruction for the locked `document-extraction.v1` wire
 * schema (docs/technical/api.md). Masking applies EVERYWHERE, including
 * summaryAsWritten — a probe run leaked a full member number through the
 * summary while only the bpjs field was masked. NIK/KTP numbers are never
 * transcribed at all (identity documents are out of MVP scope).
 */
const INSTRUCTION = `
You transcribe medical document text into JSON. You do not interpret it.

Return one JSON object with exactly this shape and no extra keys:
{
  "schemaVersion": "document-extraction.v1",
  "documentType": "BPJS_CARD" | "REFERRAL_LETTER" | "PRESCRIPTION" | "LAB_RESULT" | "MEDICAL_RESUME" | "CONTROL_CARD" | "OTHER",
  "sourceLanguage": "id" | "en" | "mixed" | "unknown",
  "patientNameAsWritten": string | null,
  "documentDateAsWritten": string | null,
  "facilityNameAsWritten": string | null,
  "clinicianNameAsWritten": string | null,
  "documentNumberAsWritten": string | null,
  "summaryAsWritten": string[],
  "medications": [{ "nameAsWritten": string, "doseAsWritten": string | null, "frequencyAsWritten": string | null, "instructionAsWritten": string | null }],
  "labResults": [{ "testNameAsWritten": string, "valueAsWritten": string | null, "unitAsWritten": string | null, "referenceRangeAsWritten": string | null, "flagAsWritten": string | null }],
  "referral": { "originFacilityAsWritten": string | null, "destinationFacilityAsWritten": string | null, "validUntilAsWritten": string | null, "reasonAsWritten": string | null } | null,
  "bpjs": { "memberNumberMasked": string | null, "participantNameAsWritten": string | null } | null,
  "warnings": string[]
}

Rules:
- Preserve the source wording exactly in every AsWritten field.
- Use null or an empty array when text is absent or unreadable.
- Mask any BPJS member or insurance card number EVERYWHERE it appears,
  including summaryAsWritten and documentNumberAsWritten: replace every
  character except the last four with "*".
- Never transcribe an NIK, KTP number, or other government identity number
  anywhere in the output. Omit it and add a warning that identity data was
  skipped.
- Add a warning string when text is blurry, cut off, or ambiguous.
- summaryAsWritten may condense headings but must not add facts.
- Never diagnose, never judge whether a lab value is normal, safe, or
  dangerous, never compute or change a dose, never invent data that is not in
  the text.
`.trim();

export async function mapOcrTextToExtraction(
  ocrText: string,
): Promise<{ data: DocumentExtractionV1; model: string }> {
  let client;
  let model: string;
  try {
    client = createAzureOpenAIClient();
    model = requireProviderConfig(
      "Azure OpenAI",
      getAzureOpenAIEnv(),
    ).AZURE_OPENAI_DEPLOYMENT;
  } catch {
    throw new ExtractionMappingError("PROVIDER_UNAVAILABLE");
  }

  let reply: string;
  try {
    const response = await client.chat.completions.create({
      // gpt-5.1 rejects max_tokens and spends budget on reasoning before
      // emitting output; a tight limit truncates the JSON.
      max_completion_tokens: 4000,
      messages: [
        { content: INSTRUCTION, role: "system" },
        { content: ocrText, role: "user" },
      ],
      model,
      response_format: { type: "json_object" },
    });
    reply = response.choices[0]?.message?.content ?? "";
  } catch {
    // Provider errors can embed endpoint details; never rethrow raw.
    throw new ExtractionMappingError("PROVIDER_FAILED");
  }

  let candidate: unknown;
  try {
    candidate = JSON.parse(reply);
  } catch {
    throw new ExtractionMappingError("INVALID_OUTPUT");
  }

  const parsed = documentExtractionV1Schema.safeParse(candidate);
  if (!parsed.success) throw new ExtractionMappingError("INVALID_OUTPUT");
  return { data: parsed.data, model };
}
