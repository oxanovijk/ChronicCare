import type { DocumentExtractionV1 } from "@/lib/ai/extraction/schema";

/**
 * Hand-written synthetic DEMO_FALLBACK extraction for the diabetes tipe 2 demo
 * scenario. Every value is invented; it must never be replaced with output
 * captured from a real document (AGENTS.md §13).
 */
export const demoFallbackExtraction: DocumentExtractionV1 = {
  schemaVersion: "document-extraction.v1",
  documentType: "LAB_RESULT",
  sourceLanguage: "id",
  patientNameAsWritten: "Maya Puspita",
  documentDateAsWritten: "14 Juli 2026",
  facilityNameAsWritten: "Laboratorium Klinik Sehat Bersama",
  clinicianNameAsWritten: "dr. Andi Wijaya",
  documentNumberAsWritten: "LB-2026-0714-018",
  summaryAsWritten: [
    "Hasil pemeriksaan laboratorium",
    "Pasien disarankan kontrol ulang sesuai jadwal",
  ],
  medications: [],
  labResults: [
    {
      testNameAsWritten: "Glukosa Darah Puasa",
      valueAsWritten: "142",
      unitAsWritten: "mg/dL",
      referenceRangeAsWritten: "70-100",
      flagAsWritten: "TINGGI",
    },
    {
      testNameAsWritten: "HbA1c",
      valueAsWritten: "7.8",
      unitAsWritten: "%",
      referenceRangeAsWritten: "4.0-5.6",
      flagAsWritten: "TINGGI",
    },
    {
      testNameAsWritten: "Kolesterol Total",
      valueAsWritten: "196",
      unitAsWritten: "mg/dL",
      referenceRangeAsWritten: "<200",
      flagAsWritten: "NORMAL",
    },
  ],
  referral: null,
  bpjs: null,
  warnings: ["Contoh data demo. Bukan hasil pembacaan dokumen sungguhan."],
};
