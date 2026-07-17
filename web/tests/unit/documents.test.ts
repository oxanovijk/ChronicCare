import { describe, expect, it, vi } from "vitest";

import type { CaregiverAuthContext } from "@/lib/auth/caregiver";
import {
  documentUploadIntentSchema,
  extractionRejectSchema,
} from "@/lib/documents/contract";
import {
  DocumentError,
  confirmExtraction,
  createUploadIntent,
  getConfirmedExtractionSummaries,
  rejectExtraction,
} from "@/lib/documents/service";
import { PatientProfileError } from "@/lib/patient-profile/service";

vi.mock("@/lib/documents/storage", async (importOriginal) => ({
  ...(await importOriginal<object>()),
  createSignedUpload: vi.fn().mockResolvedValue({
    token: "signed-token",
    path: "circle-id/profile-id/doc-id/file.pdf",
    expiresAt: "2026-07-17T12:00:00.000Z",
  }),
}));

const caregiver: CaregiverAuthContext = {
  actorType: "CAREGIVER",
  user: { id: "user-id", displayName: "Dinda Pratama" },
  membership: { careCircleId: "circle-id", role: "OWNER" },
};

const validIntent = {
  title: "Hasil Lab Juli 2026",
  category: "LAB_RESULT" as const,
  fileName: "hasil-lab.pdf",
  mimeType: "application/pdf" as const,
  fileSizeBytes: 418_220,
  sha256: "a".repeat(64),
};

const extractionRow = {
  id: "extraction-id",
  healthDocumentId: "doc-id",
  patientProfileId: "profile-id",
  ocrProvider: "AZURE_DOCUMENT_INTELLIGENCE",
  extractorProvider: "AZURE_OPENAI",
  schemaVersion: "document-extraction.v1",
  structuredData: {},
  status: "CONFIRMED",
  failureCode: null,
  reviewedAt: null,
  createdAt: new Date(),
  updatedAt: new Date(),
};

function database({
  profile = { id: "profile-id", careCircleId: "circle-id" } as
    | { id: string; careCircleId: string }
    | null,
  updateCount = 1,
} = {}) {
  const tx = {
    healthDocument: {
      create: vi.fn(async ({ data }: { data: Record<string, unknown> }) => ({
        ...data,
        createdAt: new Date(),
        updatedAt: new Date(),
        confirmedExtractionId: null,
        pageCount: null,
      })),
      update: vi.fn().mockResolvedValue({}),
      findFirst: vi.fn().mockResolvedValue({
        id: "doc-id",
        patientProfileId: "profile-id",
        status: "REVIEW_REQUIRED",
        storagePath: "circle-id/profile-id/doc-id/file.pdf",
        createdAt: new Date(),
        updatedAt: new Date(),
      }),
    },
    documentExtraction: {
      updateMany: vi.fn().mockResolvedValue({ count: updateCount }),
      findFirstOrThrow: vi.fn().mockResolvedValue(extractionRow),
    },
    auditEvent: { create: vi.fn().mockResolvedValue({}) },
  };
  const db = {
    ...tx,
    patientProfile: { findFirst: vi.fn().mockResolvedValue(profile) },
    $transaction: vi.fn(
      async (operation: (transaction: typeof tx) => Promise<unknown>) =>
        operation(tx),
    ),
  };
  return { db, tx };
}

type AnyDb = ReturnType<typeof database>["db"];
const asDb = (db: AnyDb) => ({ db: db as never });

describe("document upload validation", () => {
  it("accepts only PDF, JPEG, and PNG", () => {
    expect(documentUploadIntentSchema.safeParse(validIntent).success).toBe(
      true,
    );
    expect(
      documentUploadIntentSchema.safeParse({
        ...validIntent,
        mimeType: "image/gif",
      }).success,
    ).toBe(false);
  });

  it("requires a 64-character hex sha256 and normalizes case", () => {
    expect(
      documentUploadIntentSchema.parse({
        ...validIntent,
        sha256: "A".repeat(64),
      }).sha256,
    ).toBe("a".repeat(64));
    expect(
      documentUploadIntentSchema.safeParse({ ...validIntent, sha256: "abc" })
        .success,
    ).toBe(false);
  });

  it("rejects files over the size limit before any storage work", async () => {
    const { db } = database();
    await expect(
      createUploadIntent(
        caregiver,
        "profile-id",
        { ...validIntent, fileSizeBytes: 6 * 1024 * 1024 },
        asDb(db),
      ),
    ).rejects.toThrow(DocumentError);
    expect(db.patientProfile.findFirst).not.toHaveBeenCalled();
  });

  it("rejects a deactivated or foreign profile before storage work", async () => {
    const { db } = database({ profile: null });
    await expect(
      createUploadIntent(caregiver, "profile-id", validIntent, asDb(db)),
    ).rejects.toThrow(PatientProfileError);
    expect(db.$transaction).not.toHaveBeenCalled();
  });

  it("creates the document row in UPLOADING status with the audit trail", async () => {
    const { db, tx } = database();
    const result = await createUploadIntent(
      caregiver,
      "profile-id",
      validIntent,
      asDb(db),
    );
    expect(result.upload.token).toBe("signed-token");
    expect(tx.healthDocument.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ status: "UPLOADING" }),
      }),
    );
    expect(tx.auditEvent.create).toHaveBeenCalled();
  });
});

describe("extraction review states", () => {
  it("confirms atomically; the losing concurrent reviewer gets CONFLICT", async () => {
    const { db } = database({ updateCount: 0 });
    await expect(
      confirmExtraction(
        caregiver,
        "profile-id",
        "doc-id",
        "extraction-id",
        asDb(db),
      ),
    ).rejects.toThrow(DocumentError);
  });

  it("confirm updates document status and confirmed extraction id together", async () => {
    const { db, tx } = database();
    await confirmExtraction(
      caregiver,
      "profile-id",
      "doc-id",
      "extraction-id",
      asDb(db),
    );
    expect(tx.healthDocument.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: { status: "CONFIRMED", confirmedExtractionId: "extraction-id" },
      }),
    );
  });

  it("requires a rejection reason and records it in the audit note", async () => {
    expect(extractionRejectSchema.safeParse({ reason: "" }).success).toBe(
      false,
    );
    const { db, tx } = database();
    await rejectExtraction(
      caregiver,
      "profile-id",
      "doc-id",
      "extraction-id",
      "Teks tidak sesuai dokumen",
      asDb(db),
    );
    expect(tx.auditEvent.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          summary: expect.stringContaining("Teks tidak sesuai dokumen"),
        }),
      }),
    );
  });
});

describe("confirmed-summary selector (Packet 11 gate)", () => {
  it("only ever queries CONFIRMED documents with a confirmed extraction", async () => {
    const { db } = database();
    const findMany = vi.fn().mockResolvedValue([]);
    (db as { healthDocument: { findMany?: unknown } }).healthDocument.findMany =
      findMany;
    await getConfirmedExtractionSummaries(caregiver, "profile-id", asDb(db));
    expect(findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          status: "CONFIRMED",
          confirmedExtraction: { status: "CONFIRMED" },
          deletedAt: null,
        }),
      }),
    );
  });

  it("denies the selector for a deactivated or foreign profile", async () => {
    const { db } = database({ profile: null });
    await expect(
      getConfirmedExtractionSummaries(caregiver, "profile-id", asDb(db)),
    ).rejects.toThrow(PatientProfileError);
  });
});
