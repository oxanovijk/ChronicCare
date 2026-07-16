import { afterEach, describe, expect, it, vi } from "vitest";

import { createAzureOpenAIClient } from "@/lib/azure/openai";
import { createDocumentIntelligenceProvider } from "@/lib/azure/document-intelligence";
import {
  DEMO_FALLBACK_LABEL,
  ProviderConfigurationError,
  requireProviderConfig,
  resolveOcrProviderConfig,
} from "@/lib/config/provider-policy";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

afterEach(() => {
  vi.unstubAllEnvs();
});

describe("provider boundary policy", () => {
  it("returns live configuration when credentials are valid", () => {
    expect(
      requireProviderConfig("Example", {
        configured: true,
        value: { endpoint: "https://provider.example" },
      }),
    ).toEqual({ endpoint: "https://provider.example" });
  });

  it("fails only the requested provider with a sanitized error", () => {
    expect(() =>
      requireProviderConfig("Azure OpenAI", {
        configured: false,
        invalidKeys: ["AZURE_OPENAI_API_KEY"],
      }),
    ).toThrow(ProviderConfigurationError);

    expect(() =>
      requireProviderConfig("Azure OpenAI", {
        configured: false,
        invalidKeys: ["AZURE_OPENAI_API_KEY"],
      }),
    ).toThrow(/AZURE_OPENAI_API_KEY/);
  });

  it("permits only the labeled OCR demo fallback", () => {
    expect(
      resolveOcrProviderConfig(
        {
          configured: false,
          invalidKeys: ["AZURE_DOCUMENT_INTELLIGENCE_KEY"],
        },
        "synthetic-demo",
      ),
    ).toEqual({
      mode: "demo-fallback",
      label: DEMO_FALLBACK_LABEL,
    });
  });

  it("rejects missing OCR credentials when fallback is disabled", () => {
    expect(() =>
      resolveOcrProviderConfig(
        {
          configured: false,
          invalidKeys: ["AZURE_DOCUMENT_INTELLIGENCE_KEY"],
        },
        "disabled",
      ),
    ).toThrow(ProviderConfigurationError);
  });

  it("keeps real provider factories credential-free until explicitly called", () => {
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "");
    vi.stubEnv("SUPABASE_SERVICE_ROLE_KEY", "");
    vi.stubEnv("AZURE_OPENAI_ENDPOINT", "");
    vi.stubEnv("AZURE_OPENAI_API_KEY", "");
    vi.stubEnv("AZURE_OPENAI_API_VERSION", "");
    vi.stubEnv("AZURE_OPENAI_DEPLOYMENT", "");

    expect(() => createSupabaseAdminClient()).toThrow(
      ProviderConfigurationError,
    );
    expect(() => createAzureOpenAIClient()).toThrow(
      ProviderConfigurationError,
    );
  });

  it("returns the labeled fallback from the real OCR provider boundary", () => {
    vi.stubEnv("OCR_FALLBACK_MODE", "synthetic-demo");
    vi.stubEnv("AZURE_DOCUMENT_INTELLIGENCE_ENDPOINT", "");
    vi.stubEnv("AZURE_DOCUMENT_INTELLIGENCE_KEY", "");
    vi.stubEnv("AZURE_DOCUMENT_INTELLIGENCE_MODEL", "");

    expect(createDocumentIntelligenceProvider()).toEqual({
      mode: "demo-fallback",
      label: DEMO_FALLBACK_LABEL,
    });
  });
});
