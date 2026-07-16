import "server-only";

import {
  AzureKeyCredential,
  DocumentAnalysisClient,
} from "@azure/ai-form-recognizer";

import { resolveOcrProviderConfig } from "@/lib/config/provider-policy";
import {
  getAzureDocumentIntelligenceEnv,
  getProviderFlags,
} from "@/lib/env/server";

export function createDocumentIntelligenceProvider() {
  const flags = getProviderFlags();
  const resolved = resolveOcrProviderConfig(
    getAzureDocumentIntelligenceEnv(),
    flags.OCR_FALLBACK_MODE,
  );

  if (resolved.mode === "demo-fallback") {
    return resolved;
  }

  return {
    mode: "live" as const,
    client: new DocumentAnalysisClient(
      resolved.config.AZURE_DOCUMENT_INTELLIGENCE_ENDPOINT,
      new AzureKeyCredential(
        resolved.config.AZURE_DOCUMENT_INTELLIGENCE_KEY,
      ),
    ),
    model: resolved.config.AZURE_DOCUMENT_INTELLIGENCE_MODEL,
  };
}
