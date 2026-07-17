import { describe, expect, it } from "vitest";

import { demoFallbackExtraction } from "@/lib/ai/extraction/fallback";
import {
  EXTRACTION_SCHEMA_VERSION,
  documentExtractionV1Schema,
} from "@/lib/ai/extraction/schema";
import { countPdfPages } from "@/lib/ocr/analyze";

describe("pre-provider page counting", () => {
  const pdfWithPages = (count: number) =>
    Buffer.from(
      `%PDF-1.4\n1 0 obj << /Type /Pages /Count ${count} >> endobj\n${Array.from(
        { length: count },
        (_, i) => `${i + 2} 0 obj << /Type /Page /Parent 1 0 R >> endobj`,
      ).join("\n")}\n%%EOF`,
    );

  it("counts /Type /Page objects without counting the /Pages root", () => {
    expect(countPdfPages(pdfWithPages(1), "application/pdf")).toBe(1);
    expect(countPdfPages(pdfWithPages(4), "application/pdf")).toBe(4);
  });

  it("returns 0 (unknown) for object-stream PDFs instead of guessing", () => {
    expect(
      countPdfPages(Buffer.from("%PDF-1.6 compressed"), "application/pdf"),
    ).toBe(0);
  });

  it("treats images as a single page", () => {
    expect(countPdfPages(Buffer.from("png-bytes"), "image/png")).toBe(1);
  });
});

describe("document-extraction.v1 schema", () => {
  it("accepts the demo fallback fixture unchanged", () => {
    expect(
      documentExtractionV1Schema.parse(demoFallbackExtraction),
    ).toEqual(demoFallbackExtraction);
  });

  it("rejects invented fields instead of silently stripping them", () => {
    expect(
      documentExtractionV1Schema.safeParse({
        ...demoFallbackExtraction,
        diagnosisSuggestion: "diabetes",
      }).success,
    ).toBe(false);
    expect(
      documentExtractionV1Schema.safeParse({
        ...demoFallbackExtraction,
        labResults: [
          { ...demoFallbackExtraction.labResults[0], isDangerous: true },
        ],
      }).success,
    ).toBe(false);
  });

  it("locks the schema version literal", () => {
    expect(EXTRACTION_SCHEMA_VERSION).toBe("document-extraction.v1");
    expect(
      documentExtractionV1Schema.safeParse({
        ...demoFallbackExtraction,
        schemaVersion: "document-extraction.v2",
      }).success,
    ).toBe(false);
  });

  it("requires explicit null rather than missing optional fields", () => {
    const { patientNameAsWritten: _omitted, ...withoutName } =
      demoFallbackExtraction;
    void _omitted;
    expect(documentExtractionV1Schema.safeParse(withoutName).success).toBe(
      false,
    );
  });
});

describe("demo fallback fixture safety", () => {
  it("is synthetic: no NIK-like 16-digit number anywhere", () => {
    expect(JSON.stringify(demoFallbackExtraction)).not.toMatch(/\d{16}/);
  });

  it("labels itself as demo data in warnings", () => {
    expect(demoFallbackExtraction.warnings.join(" ")).toContain("demo");
  });

  it("never carries an unmasked long number in the summary", () => {
    for (const line of demoFallbackExtraction.summaryAsWritten) {
      expect(line).not.toMatch(/\d{9,}/);
    }
  });
});
