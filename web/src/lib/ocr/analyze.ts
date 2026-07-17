import "server-only";

import { createDocumentIntelligenceProvider } from "@/lib/ocr/provider";

export class OcrError extends Error {
  constructor(
    public readonly code: "PROVIDER_UNAVAILABLE" | "PROVIDER_FAILED",
  ) {
    super(code);
    this.name = "OcrError";
  }
}

export type OcrResult =
  | { mode: "live"; text: string; pageCount: number; model: string }
  | { mode: "demo-fallback" };

export async function analyzeDocumentBytes(bytes: Buffer): Promise<OcrResult> {
  let provider: ReturnType<typeof createDocumentIntelligenceProvider>;
  try {
    provider = createDocumentIntelligenceProvider();
  } catch {
    throw new OcrError("PROVIDER_UNAVAILABLE");
  }

  if (provider.mode === "demo-fallback") return { mode: "demo-fallback" };

  try {
    const poller = await provider.client.beginAnalyzeDocument(
      provider.model,
      bytes,
    );
    const result = await poller.pollUntilDone();
    return {
      mode: "live",
      model: provider.model,
      pageCount: result.pages?.length ?? 0,
      text: result.content ?? "",
    };
  } catch {
    // Provider errors can embed endpoint details; never rethrow raw.
    throw new OcrError("PROVIDER_FAILED");
  }
}
