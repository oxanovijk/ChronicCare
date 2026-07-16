import { readFileSync } from "node:fs";

import { parse } from "dotenv";
import { describe, expect, it } from "vitest";

import { EnvironmentConfigurationError } from "@/lib/env/errors";
import {
  parsePublicEnv,
  PUBLIC_ENV_KEYS,
} from "@/lib/env/public-schema";
import {
  inspectAzureDocumentIntelligenceEnv,
  inspectAzureOpenAIEnv,
  inspectSupabaseAdminEnv,
  parseCoreServerEnv,
  parseProviderFlags,
  SERVER_ONLY_ENV_KEYS,
} from "@/lib/env/server-schema";

describe("environment validation", () => {
  it("returns only the three browser-safe public values", () => {
    const parsed = parsePublicEnv({
      NODE_ENV: "development",
      NEXT_PUBLIC_APP_URL: "http://localhost:3000",
      NEXT_PUBLIC_SUPABASE_URL: "http://localhost:54321",
      NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: "publishable-test-value",
      SUPABASE_SERVICE_ROLE_KEY: "must-not-be-returned",
      AZURE_OPENAI_API_KEY: "must-not-be-returned",
    });

    expect(Object.keys(parsed).sort()).toEqual([...PUBLIC_ENV_KEYS].sort());
    for (const key of SERVER_ONLY_ENV_KEYS) {
      expect(parsed).not.toHaveProperty(key);
    }
  });

  it("rejects insecure public URLs in production", () => {
    expect(() =>
      parsePublicEnv({
        NODE_ENV: "production",
        NEXT_PUBLIC_APP_URL: "http://example.test",
        NEXT_PUBLIC_SUPABASE_URL: "https://example.supabase.co",
        NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: "publishable-test-value",
      }),
    ).toThrow(EnvironmentConfigurationError);
  });

  it("reports invalid key names without leaking their values", () => {
    const secret = "do-not-include-this-secret-in-the-error";

    try {
      parseCoreServerEnv({
        DATABASE_URL: secret,
        DIRECT_URL: "",
        PATIENT_SESSION_SECRET: "short",
      });
      expect.fail("Expected core server env parsing to fail");
    } catch (error) {
      expect(error).toBeInstanceOf(EnvironmentConfigurationError);
      expect(String(error)).toContain("DATABASE_URL");
      expect(String(error)).toContain("DIRECT_URL");
      expect(String(error)).toContain("PATIENT_SESSION_SECRET");
      expect(String(error)).not.toContain(secret);
    }
  });

  it("keeps optional provider credential validation feature-scoped", () => {
    const supabase = inspectSupabaseAdminEnv({});
    const openAi = inspectAzureOpenAIEnv({});
    const documentIntelligence = inspectAzureDocumentIntelligenceEnv({});

    expect(supabase.configured).toBe(false);
    expect(openAi.configured).toBe(false);
    expect(documentIntelligence.configured).toBe(false);
  });

  it("applies locked safe defaults and parses false as false", () => {
    expect(parseProviderFlags({})).toEqual({
      OCR_FALLBACK_MODE: "disabled",
      OCR_MAX_FILE_BYTES: 5_242_880,
      OCR_MAX_PAGES: 3,
      SOS_AUDIO_ENABLED_BY_DEFAULT: false,
    });
  });

  it("ships an .env.example whose locked defaults parse as written", () => {
    const example = parse(readFileSync(".env.example", "utf8"));

    expect(parseProviderFlags(example)).toEqual({
      OCR_FALLBACK_MODE: "disabled",
      OCR_MAX_FILE_BYTES: 5_242_880,
      OCR_MAX_PAGES: 3,
      SOS_AUDIO_ENABLED_BY_DEFAULT: false,
    });
  });

  it("enforces the OCR byte and page limits", () => {
    expect(() =>
      parseProviderFlags({
        OCR_MAX_FILE_BYTES: "5242881",
        OCR_MAX_PAGES: "4",
      }),
    ).toThrow(EnvironmentConfigurationError);
  });
});
