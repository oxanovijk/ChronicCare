import { describe, expect, it } from "vitest";

import {
  DEMO_FALLBACK_LABEL,
  ProviderConfigurationError,
  requireProviderConfig,
  resolveOcrProviderConfig,
} from "@/lib/config/provider-policy";

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
});
