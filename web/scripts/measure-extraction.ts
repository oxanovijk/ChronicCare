/**
 * Latency probe for the P09 extraction call.
 *
 * Run:  npx tsx scripts/measure-extraction.ts        (from /web)
 *
 * Answers one question: is the gpt-5.1 deployment fast enough to sit in the
 * two-minute demo path, and does reasoning_effort buy enough to keep it?
 *
 * Sends synthetic OCR text only. Not part of any packet; delete freely.
 */
import { config } from "dotenv";

config({ path: ".env" });

import { AzureOpenAI } from "openai";

import { requireProviderConfig } from "../src/lib/config/provider-policy";
import { inspectAzureOpenAIEnv } from "../src/lib/env/server-schema";

/** Synthetic. Shaped like Document Intelligence layout output for a lab sheet. */
const SYNTHETIC_OCR_TEXT = `
LABORATORIUM KLINIK SEHAT BERSAMA
Jl. Merdeka No. 12, Tangerang
Nama Pasien: Maya Puspita
Tanggal: 14 Juli 2026
Dokter Pengirim: dr. Andi Wijaya
No. Lab: LB-2026-0714-established

HASIL PEMERIKSAAN
Glukosa Darah Puasa    142    mg/dL    70-100    TINGGI
HbA1c                  7.8    %        4.0-5.6   TINGGI
Kolesterol Total       196    mg/dL    <200      NORMAL

Catatan: Pasien disarankan kontrol ulang.
`.trim();

const INSTRUCTION = `
You transcribe medical document text into JSON. You do not interpret it.

Return a JSON object with exactly these keys:
  documentDateAsWritten: string|null
  patientNameAsWritten: string|null
  facilityNameAsWritten: string|null
  clinicianNameAsWritten: string|null
  labResults: array of { testNameAsWritten, valueAsWritten, unitAsWritten, referenceRangeAsWritten, flagAsWritten }
  warnings: array of strings

Rules: preserve the source wording exactly. Use null when absent or unreadable.
Never diagnose, never judge a lab value as safe or dangerous, never compute a
dose, never invent a field that is not in the text.
`.trim();

type Effort = "none" | "minimal" | "low" | "medium" | "high";

async function measure(
  client: AzureOpenAI,
  deployment: string,
  effort: Effort | null,
) {
  const startedAt = Date.now();

  const response = await client.chat.completions.create({
    max_completion_tokens: 4000,
    messages: [
      { content: INSTRUCTION, role: "system" },
      { content: SYNTHETIC_OCR_TEXT, role: "user" },
    ],
    model: deployment,
    response_format: { type: "json_object" },
    // reasoning_effort is rejected outright by deployments that lack it, which
    // is exactly how we discover which levels this one supports.
    ...(effort ? ({ reasoning_effort: effort } as Record<string, string>) : {}),
  });

  const ms = Date.now() - startedAt;
  const usage = response.usage;
  const content = response.choices[0]?.message?.content ?? "";

  let parsed = "invalid JSON";
  try {
    const json = JSON.parse(content) as { labResults?: unknown[] };
    parsed = `ok, ${json.labResults?.length ?? 0} labResults`;
  } catch {
    /* keep the failure label */
  }

  return {
    ms,
    parsed,
    reasoning: usage?.completion_tokens_details?.reasoning_tokens ?? 0,
    total: usage?.total_tokens ?? 0,
  };
}

async function main() {
  const env = requireProviderConfig(
    "Azure OpenAI",
    inspectAzureOpenAIEnv(process.env),
  );

  const client = new AzureOpenAI({
    apiKey: env.AZURE_OPENAI_API_KEY,
    apiVersion: env.AZURE_OPENAI_API_VERSION,
    deployment: env.AZURE_OPENAI_DEPLOYMENT,
    endpoint: env.AZURE_OPENAI_ENDPOINT,
    logLevel: "error",
  });

  console.log(
    `deployment ${env.AZURE_OPENAI_DEPLOYMENT} @ ${env.AZURE_OPENAI_API_VERSION}\n`,
  );
  console.log("effort     latency   reasoning   total   json");

  const levels: (Effort | null)[] = [null, "none", "minimal", "low", "medium"];

  for (const effort of levels) {
    const label = (effort ?? "default").padEnd(10);
    try {
      const r = await measure(client, env.AZURE_OPENAI_DEPLOYMENT, effort);
      console.log(
        `${label} ${`${r.ms}ms`.padEnd(9)} ${String(r.reasoning).padEnd(11)} ${String(r.total).padEnd(7)} ${r.parsed}`,
      );
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      console.log(`${label} unsupported (${message.split("\n")[0]?.slice(0, 90)})`);
    }
  }

  console.log("");
}

void main();
