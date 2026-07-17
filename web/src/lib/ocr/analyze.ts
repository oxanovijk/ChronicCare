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

/**
 * Counts PDF pages from the raw bytes, before any provider call. Needed
 * because Document Intelligence F0 analyzes only the first two pages and
 * reports that as the page count, which silently defeats an after-the-fact
 * limit check (observed live: a 4-page PDF came back as "2 pages").
 * Images are always a single page.
 *
 * ponytail: regex over raw bytes misses PDFs that keep page objects inside
 * compressed object streams (returns 0 = unknown); the provider-count check
 * in the caller stays as the second layer for those.
 */
export function countPdfPages(bytes: Buffer, mimeType: string) {
  if (mimeType !== "application/pdf") return 1;
  const raw = bytes.toString("latin1");
  const matches = raw.match(/\/Type\s*\/Page(?![a-zA-Z])/g);
  return matches?.length ?? 0;
}

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
