/**
 * Standalone OCR + extraction probe: local file → Document Intelligence →
 * gpt-5.1 → `document-extraction.v1` JSON validated with Zod.
 *
 * Run:  npx tsx scripts/probe-ocr.ts <path-to-synthetic-pdf-jpeg-png>   (from /web)
 *
 * Pre-Packet-09 reconnaissance. Synthetic documents only. Artifacts land in
 * scripts/out/ (git-ignored) and later seed the DEMO_FALLBACK fixture. Each
 * run costs one Document Intelligence analyze call plus one gpt-5.1 call.
 * Not part of any packet; delete freely.
 */
import { config } from "dotenv";

config({ path: ".env" });

import { mkdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { extname, join } from "node:path";

import {
  AzureKeyCredential,
  DocumentAnalysisClient,
} from "@azure/ai-form-recognizer";
import { AzureOpenAI } from "openai";
import { z } from "zod";

import { requireProviderConfig } from "../src/lib/config/provider-policy";
import {
  inspectAzureDocumentIntelligenceEnv,
  inspectAzureOpenAIEnv,
  parseProviderFlags,
} from "../src/lib/env/server-schema";

const secrets: string[] = [];

/** Keep endpoints and keys out of stdout even when an SDK embeds them in errors. */
function scrub(text: string) {
  return secrets.reduce(
    (acc, secret) => (secret ? acc.replaceAll(secret, "[redacted]") : acc),
    text,
  );
}

const ALLOWED_EXTENSIONS = new Set([".pdf", ".jpeg", ".jpg", ".png"]);
const OUT_DIR = join(__dirname, "out");

/**
 * Transcription of the locked `document-extraction.v1` shape from
 * docs/technical/api.md. Strict objects on purpose: the probe should surface
 * invented fields as Zod issues instead of silently stripping them.
 */
const asWritten = z.string().nullable();

const extractionSchema = z.strictObject({
  schemaVersion: z.literal("document-extraction.v1"),
  documentType: z.enum([
    "BPJS_CARD",
    "REFERRAL_LETTER",
    "PRESCRIPTION",
    "LAB_RESULT",
    "MEDICAL_RESUME",
    "CONTROL_CARD",
    "OTHER",
  ]),
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
- Mask any BPJS member number: replace every character except the last four with "*".
- Add a warning string when text is blurry, cut off, or ambiguous.
- summaryAsWritten may condense headings but must not add facts.
- Never diagnose, never judge whether a lab value is normal, safe, or dangerous,
  never compute or change a dose, never invent data that is not in the text.
`.trim();

async function runOcr(filePath: string) {
  const env = requireProviderConfig(
    "Azure AI Document Intelligence",
    inspectAzureDocumentIntelligenceEnv(process.env),
  );
  secrets.push(
    env.AZURE_DOCUMENT_INTELLIGENCE_KEY,
    env.AZURE_DOCUMENT_INTELLIGENCE_ENDPOINT,
  );

  const client = new DocumentAnalysisClient(
    env.AZURE_DOCUMENT_INTELLIGENCE_ENDPOINT,
    new AzureKeyCredential(env.AZURE_DOCUMENT_INTELLIGENCE_KEY),
  );

  const startedAt = Date.now();
  const poller = await client.beginAnalyzeDocument(
    env.AZURE_DOCUMENT_INTELLIGENCE_MODEL,
    readFileSync(filePath),
  );
  const result = await poller.pollUntilDone();

  return {
    ms: Date.now() - startedAt,
    pages: result.pages?.length ?? 0,
    text: result.content ?? "",
  };
}

async function runExtraction(ocrText: string) {
  const env = requireProviderConfig(
    "Azure OpenAI",
    inspectAzureOpenAIEnv(process.env),
  );
  secrets.push(env.AZURE_OPENAI_API_KEY, env.AZURE_OPENAI_ENDPOINT);

  const client = new AzureOpenAI({
    apiKey: env.AZURE_OPENAI_API_KEY,
    apiVersion: env.AZURE_OPENAI_API_VERSION,
    deployment: env.AZURE_OPENAI_DEPLOYMENT,
    endpoint: env.AZURE_OPENAI_ENDPOINT,
    logLevel: "error",
  });

  const startedAt = Date.now();
  const response = await client.chat.completions.create({
    max_completion_tokens: 4000,
    messages: [
      { content: INSTRUCTION, role: "system" },
      { content: ocrText, role: "user" },
    ],
    model: env.AZURE_OPENAI_DEPLOYMENT,
    response_format: { type: "json_object" },
  });

  return {
    ms: Date.now() - startedAt,
    reply: response.choices[0]?.message?.content ?? "",
    usage: response.usage,
  };
}

async function main() {
  const filePath = process.argv[2];
  if (!filePath) {
    console.log(
      "Usage: npx tsx scripts/probe-ocr.ts <synthetic .pdf/.jpeg/.png>",
    );
    process.exitCode = 1;
    return;
  }

  const flags = parseProviderFlags(process.env);

  const ext = extname(filePath).toLowerCase();
  if (!ALLOWED_EXTENSIONS.has(ext)) {
    console.log(`Rejected: "${ext}" is not PDF/JPEG/PNG.`);
    process.exitCode = 1;
    return;
  }

  const bytes = statSync(filePath).size;
  if (bytes > flags.OCR_MAX_FILE_BYTES) {
    console.log(
      `Rejected: ${bytes} bytes exceeds OCR_MAX_FILE_BYTES (${flags.OCR_MAX_FILE_BYTES}).`,
    );
    process.exitCode = 1;
    return;
  }

  const ocr = await runOcr(filePath);
  mkdirSync(OUT_DIR, { recursive: true });
  writeFileSync(join(OUT_DIR, "raw-ocr.txt"), ocr.text);

  if (ocr.pages > flags.OCR_MAX_PAGES) {
    console.log(
      `WARNING: ${ocr.pages} pages exceeds OCR_MAX_PAGES (${flags.OCR_MAX_PAGES}).`,
    );
  }
  if (!ocr.text.trim()) {
    console.log("OCR returned no text; skipping extraction.");
    process.exitCode = 1;
    return;
  }

  const llm = await runExtraction(ocr.text);

  let candidate: unknown;
  let zodLabel = "FAIL";
  let parsed: ReturnType<typeof extractionSchema.safeParse> | null = null;
  try {
    candidate = JSON.parse(llm.reply);
    parsed = extractionSchema.safeParse(candidate);
    if (parsed.success) zodLabel = "PASS";
  } catch {
    zodLabel = "FAIL (reply is not JSON)";
  }

  const usage = llm.usage;
  console.log("\nleg   result");
  console.log(`OCR   ${ocr.ms}ms, ${ocr.pages} page(s)`);
  console.log(
    `LLM   ${llm.ms}ms, tokens prompt=${usage?.prompt_tokens ?? "?"} completion=${usage?.completion_tokens ?? "?"} reasoning=${usage?.completion_tokens_details?.reasoning_tokens ?? 0} total=${usage?.total_tokens ?? "?"}`,
  );
  console.log(`Zod   ${zodLabel}`);
  console.log(`sum   ${ocr.ms + llm.ms}ms (OCR + LLM)\n`);

  if (!parsed) {
    console.log(`Raw reply:\n${scrub(llm.reply)}`);
    process.exitCode = 1;
    return;
  }

  if (!parsed.success) {
    console.log("Zod issues:");
    console.log(scrub(JSON.stringify(parsed.error.issues, null, 2)));
    console.log(`\nRaw reply:\n${scrub(llm.reply)}`);
    process.exitCode = 1;
    return;
  }

  const json = JSON.stringify(parsed.data, null, 2);
  writeFileSync(join(OUT_DIR, "extraction.json"), json);
  console.log(`Validated extraction (saved to scripts/out/):\n${scrub(json)}`);
}

// Wrapped rather than top-level await: tsx transforms .ts as CJS here because
// package.json declares no "type": "module".
void main().catch((error: unknown) => {
  const raw =
    error instanceof Error ? (error.stack ?? error.message) : String(error);
  console.error(scrub(raw));
  // exitCode, not exit(): exit() while sockets are open crashes libuv on Windows.
  process.exitCode = 1;
});
