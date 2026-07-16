import { z } from "zod";

import {
  type EnvironmentSource,
  inspect,
  normalizeRuntimeEnvironment,
  nonEmpty,
  parseOrThrow,
  webUrl,
} from "./validation";

const postgresUrl = nonEmpty.refine((value) => {
  try {
    const protocol = new URL(value).protocol;
    return protocol === "postgres:" || protocol === "postgresql:";
  } catch {
    return false;
  }
}, "Must be a PostgreSQL connection URL");

const fallbackMode = z.enum(["disabled", "synthetic-demo"]);

const booleanString = z
  .enum(["true", "false"])
  .transform((value) => value === "true");

export const SERVER_ONLY_ENV_KEYS = [
  "SUPABASE_SERVICE_ROLE_KEY",
  "DATABASE_URL",
  "DIRECT_URL",
  "PATIENT_SESSION_SECRET",
  "AZURE_OPENAI_ENDPOINT",
  "AZURE_OPENAI_API_KEY",
  "AZURE_OPENAI_API_VERSION",
  "AZURE_OPENAI_DEPLOYMENT",
  "AZURE_DOCUMENT_INTELLIGENCE_ENDPOINT",
  "AZURE_DOCUMENT_INTELLIGENCE_KEY",
  "AZURE_DOCUMENT_INTELLIGENCE_MODEL",
] as const;

export function parseCoreServerEnv(source: EnvironmentSource) {
  const schema = z.object({
    DATABASE_URL: postgresUrl,
    DIRECT_URL: postgresUrl,
    PATIENT_SESSION_SECRET: z.string().min(32),
  });

  return parseOrThrow(schema, source, "core server env");
}

export function inspectSupabaseAdminEnv(
  source: EnvironmentSource,
  runtime = normalizeRuntimeEnvironment(source.NODE_ENV),
) {
  const schema = z.object({
    NEXT_PUBLIC_SUPABASE_URL: webUrl(runtime),
    SUPABASE_SERVICE_ROLE_KEY: nonEmpty,
  });

  return inspect(schema, source);
}

export function inspectAzureOpenAIEnv(
  source: EnvironmentSource,
  runtime = normalizeRuntimeEnvironment(source.NODE_ENV),
) {
  const schema = z.object({
    AZURE_OPENAI_ENDPOINT: webUrl(runtime),
    AZURE_OPENAI_API_KEY: nonEmpty,
    AZURE_OPENAI_API_VERSION: nonEmpty,
    AZURE_OPENAI_DEPLOYMENT: nonEmpty,
  });

  return inspect(schema, source);
}

export function inspectAzureDocumentIntelligenceEnv(
  source: EnvironmentSource,
  runtime = normalizeRuntimeEnvironment(source.NODE_ENV),
) {
  const schema = z.object({
    AZURE_DOCUMENT_INTELLIGENCE_ENDPOINT: webUrl(runtime),
    AZURE_DOCUMENT_INTELLIGENCE_KEY: nonEmpty,
    AZURE_DOCUMENT_INTELLIGENCE_MODEL: nonEmpty,
  });

  return inspect(schema, source);
}

export function parseProviderFlags(source: EnvironmentSource) {
  const schema = z.object({
    OCR_FALLBACK_MODE: fallbackMode.default("disabled"),
    OCR_MAX_FILE_BYTES: z.coerce
      .number()
      .int()
      .min(1_048_576)
      .max(5_242_880)
      .default(5_242_880),
    OCR_MAX_PAGES: z.coerce.number().int().min(1).max(3).default(3),
    SOS_AUDIO_ENABLED_BY_DEFAULT: booleanString.default(false),
  });

  return parseOrThrow(schema, source, "provider flags");
}
