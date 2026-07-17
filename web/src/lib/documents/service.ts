import "server-only";

import { randomUUID } from "node:crypto";

import type { Prisma, PrismaClient } from "@/generated/prisma/client";
import { demoFallbackExtraction } from "@/lib/ai/extraction/fallback";
import {
  ExtractionMappingError,
  mapOcrTextToExtraction,
} from "@/lib/ai/extraction/mapper";
import {
  EXTRACTION_SCHEMA_VERSION,
  type DocumentExtractionV1,
  documentExtractionV1Schema,
} from "@/lib/ai/extraction/schema";
import { writeAuditEvent } from "@/lib/audit/write-audit-event";
import type { CaregiverAuthContext } from "@/lib/auth/caregiver";
import { requireActiveCaregiverProfile } from "@/lib/daily-care/daily-care-authorization";
import type { DocumentUploadIntentInput } from "@/lib/documents/contract";
import {
  HEALTH_DOCUMENTS_BUCKET,
  buildStoragePath,
  createSignedDownloadUrl,
  createSignedUpload,
  downloadObject,
  removeObject,
  statObject,
} from "@/lib/documents/storage";
import { getProviderFlags } from "@/lib/env/server";
import {
  OcrError,
  analyzeDocumentBytes,
  countPdfPages,
} from "@/lib/ocr/analyze";
import { PatientProfileError } from "@/lib/patient-profile/service";

export class DocumentError extends Error {
  constructor(
    public readonly code:
      | "NOT_FOUND"
      | "CONFLICT"
      | "FILE_TOO_LARGE"
      | "PAGE_LIMIT_EXCEEDED"
      | "UPLOAD_INCOMPLETE"
      | "EXTRACTION_FAILED"
      | "OWNER_REQUIRED",
  ) {
    super(code);
    this.name = "DocumentError";
  }
}

type Tx = Prisma.TransactionClient;
type Deps = { db?: PrismaClient; requestId?: string };

async function resolveDb(deps: Deps) {
  return deps.db ?? (await import("@/lib/db/client")).prisma;
}

const documentSelect = {
  id: true,
  patientProfileId: true,
  category: true,
  title: true,
  originalFileName: true,
  mimeType: true,
  fileSizeBytes: true,
  pageCount: true,
  status: true,
  confirmedExtractionId: true,
  createdAt: true,
  updatedAt: true,
} as const;

/** Raw OCR text stays out of every DTO (docs/technical/api.md §8). */
const extractionSelect = {
  id: true,
  healthDocumentId: true,
  patientProfileId: true,
  ocrProvider: true,
  extractorProvider: true,
  schemaVersion: true,
  structuredData: true,
  status: true,
  failureCode: true,
  reviewedAt: true,
  createdAt: true,
  updatedAt: true,
} as const;

type DocumentRow = Prisma.HealthDocumentGetPayload<{
  select: typeof documentSelect;
}>;
type ExtractionRow = Prisma.DocumentExtractionGetPayload<{
  select: typeof extractionSelect;
}>;

function documentDto(row: DocumentRow) {
  return {
    ...row,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

function extractionDto(row: ExtractionRow) {
  return {
    ...row,
    providerMode:
      row.ocrProvider === "DEMO_FALLBACK" ||
      row.extractorProvider === "DEMO_FALLBACK"
        ? ("DEMO_FALLBACK" as const)
        : ("LIVE" as const),
    reviewedAt: row.reviewedAt ? row.reviewedAt.toISOString() : null,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

async function requireDocument(
  tx: Pick<PrismaClient, "healthDocument">,
  patientProfileId: string,
  documentId: string,
) {
  const row = await tx.healthDocument.findFirst({
    where: { id: documentId, patientProfileId, deletedAt: null },
    select: { ...documentSelect, storagePath: true },
  });
  if (!row) throw new DocumentError("NOT_FOUND");
  return row;
}

export async function createUploadIntent(
  context: CaregiverAuthContext,
  patientProfileId: string,
  input: DocumentUploadIntentInput,
  deps: Deps = {},
) {
  const db = await resolveDb(deps);
  const flags = getProviderFlags();
  if (input.fileSizeBytes > flags.OCR_MAX_FILE_BYTES) {
    throw new DocumentError("FILE_TOO_LARGE");
  }

  const profile = await requireActiveCaregiverProfile(
    context,
    patientProfileId,
    db,
  );

  const documentId = randomUUID();
  const storagePath = buildStoragePath({
    careCircleId: profile.careCircleId,
    patientProfileId,
    documentId,
    fileName: input.fileName,
  });

  const upload = await createSignedUpload(storagePath);

  const row = await db.$transaction(async (tx) => {
    const created = await tx.healthDocument.create({
      data: {
        id: documentId,
        patientProfileId,
        category: input.category,
        title: input.title,
        bucketName: HEALTH_DOCUMENTS_BUCKET,
        storagePath,
        originalFileName: input.fileName,
        mimeType: input.mimeType,
        fileSizeBytes: input.fileSizeBytes,
        sha256: input.sha256,
        status: "UPLOADING",
        uploadedByUserId: context.user.id,
      },
      select: documentSelect,
    });
    await writeAuditEvent(tx, {
      careCircleId: profile.careCircleId,
      patientProfileId,
      actor: {
        type: "CAREGIVER",
        userId: context.user.id,
        role: context.membership.role,
      },
      action: "DOCUMENT_UPLOAD_INTENT",
      targetType: "HEALTH_DOCUMENT",
      targetId: created.id,
      requestId: deps.requestId,
    });
    return created;
  });

  return { document: documentDto(row), upload };
}

export async function completeUpload(
  context: CaregiverAuthContext,
  patientProfileId: string,
  documentId: string,
  deps: Deps = {},
) {
  const db = await resolveDb(deps);
  const profile = await requireActiveCaregiverProfile(
    context,
    patientProfileId,
    db,
  );
  const document = await requireDocument(db, patientProfileId, documentId);
  if (document.status !== "UPLOADING") throw new DocumentError("CONFLICT");

  const stat = await statObject(document.storagePath).catch(() => null);
  if (!stat) throw new DocumentError("UPLOAD_INCOMPLETE");
  if (
    (stat.sizeBytes !== null && stat.sizeBytes !== document.fileSizeBytes) ||
    (stat.mimeType !== null && stat.mimeType !== document.mimeType)
  ) {
    throw new DocumentError("UPLOAD_INCOMPLETE");
  }

  const row = await db.$transaction(async (tx) => {
    const updated = await tx.healthDocument.update({
      where: { id: documentId },
      data: { status: "UPLOADED" },
      select: documentSelect,
    });
    await writeAuditEvent(tx, {
      careCircleId: profile.careCircleId,
      patientProfileId,
      actor: {
        type: "CAREGIVER",
        userId: context.user.id,
        role: context.membership.role,
      },
      action: "DOCUMENT_UPLOADED",
      targetType: "HEALTH_DOCUMENT",
      targetId: documentId,
      requestId: deps.requestId,
    });
    return updated;
  });
  return documentDto(row);
}

async function insertExtraction(
  tx: Tx,
  input: {
    patientProfileId: string;
    documentId: string;
    ocrProvider: string;
    ocrModel: string;
    extractorProvider: string;
    extractorModel: string;
    rawText: string;
    structuredData: DocumentExtractionV1;
    pageCount: number | null;
  },
) {
  const extraction = await tx.documentExtraction.create({
    data: {
      patientProfileId: input.patientProfileId,
      healthDocumentId: input.documentId,
      ocrProvider: input.ocrProvider,
      ocrModel: input.ocrModel,
      extractorProvider: input.extractorProvider,
      extractorModel: input.extractorModel,
      schemaVersion: EXTRACTION_SCHEMA_VERSION,
      rawText: input.rawText,
      structuredData: input.structuredData,
      status: "PENDING_REVIEW",
    },
    select: extractionSelect,
  });
  await tx.healthDocument.update({
    where: { id: input.documentId },
    data: { status: "REVIEW_REQUIRED", pageCount: input.pageCount },
  });
  return extraction;
}

async function markFailed(
  db: PrismaClient,
  documentId: string,
  failureCode: string,
) {
  await db.healthDocument.update({
    where: { id: documentId },
    data: { status: "FAILED" },
  });
  return failureCode;
}

export async function extractDocument(
  context: CaregiverAuthContext,
  patientProfileId: string,
  documentId: string,
  deps: Deps = {},
) {
  const db = await resolveDb(deps);
  const flags = getProviderFlags();
  const profile = await requireActiveCaregiverProfile(
    context,
    patientProfileId,
    db,
  );
  const document = await requireDocument(db, patientProfileId, documentId);
  if (document.status !== "UPLOADED" && document.status !== "FAILED") {
    throw new DocumentError("CONFLICT");
  }

  await db.healthDocument.update({
    where: { id: documentId },
    data: { status: "PROCESSING" },
  });

  const audit = (tx: Tx, action: string, targetId: string) =>
    writeAuditEvent(tx, {
      careCircleId: profile.careCircleId,
      patientProfileId,
      actor: {
        type: "CAREGIVER",
        userId: context.user.id,
        role: context.membership.role,
      },
      action,
      targetType: "DOCUMENT_EXTRACTION",
      targetId,
      requestId: deps.requestId,
    });

  const fallback = async () => {
    const row = await db.$transaction(async (tx) => {
      const extraction = await insertExtraction(tx, {
        patientProfileId,
        documentId,
        ocrProvider: "DEMO_FALLBACK",
        ocrModel: "DEMO_FALLBACK",
        extractorProvider: "DEMO_FALLBACK",
        extractorModel: "DEMO_FALLBACK",
        rawText: "",
        structuredData: demoFallbackExtraction,
        pageCount: null,
      });
      await audit(tx, "EXTRACTION_CREATED_FALLBACK", extraction.id);
      return extraction;
    });
    return extractionDto(row);
  };

  let ocr;
  try {
    const bytes = await downloadObject(document.storagePath);

    // Pre-provider page gate: Document Intelligence F0 only analyzes the
    // first two pages, so its reported count cannot enforce the limit.
    // Counting locally also rejects oversized documents before any spend.
    const localPageCount = countPdfPages(bytes, document.mimeType);
    if (localPageCount > flags.OCR_MAX_PAGES) {
      await markFailed(db, documentId, "PAGE_LIMIT_EXCEEDED");
      throw new DocumentError("PAGE_LIMIT_EXCEEDED");
    }

    ocr = await analyzeDocumentBytes(bytes);
  } catch (error) {
    if (error instanceof DocumentError) throw error;
    if (flags.OCR_FALLBACK_MODE === "synthetic-demo") return fallback();
    await markFailed(
      db,
      documentId,
      error instanceof OcrError ? error.code : "OCR_FAILED",
    );
    throw new DocumentError("EXTRACTION_FAILED");
  }

  if (ocr.mode === "demo-fallback") {
    if (flags.OCR_FALLBACK_MODE === "synthetic-demo") return fallback();
    await markFailed(db, documentId, "PROVIDER_UNAVAILABLE");
    throw new DocumentError("EXTRACTION_FAILED");
  }

  if (ocr.pageCount > flags.OCR_MAX_PAGES) {
    await markFailed(db, documentId, "PAGE_LIMIT_EXCEEDED");
    throw new DocumentError("PAGE_LIMIT_EXCEEDED");
  }

  let mapped;
  try {
    mapped = await mapOcrTextToExtraction(ocr.text);
  } catch (error) {
    if (flags.OCR_FALLBACK_MODE === "synthetic-demo") return fallback();
    await markFailed(
      db,
      documentId,
      error instanceof ExtractionMappingError ? error.code : "MAPPING_FAILED",
    );
    throw new DocumentError("EXTRACTION_FAILED");
  }

  const row = await db.$transaction(async (tx) => {
    const extraction = await insertExtraction(tx, {
      patientProfileId,
      documentId,
      ocrProvider: "AZURE_DOCUMENT_INTELLIGENCE",
      ocrModel: ocr.model,
      extractorProvider: "AZURE_OPENAI",
      extractorModel: mapped.model,
      rawText: ocr.text,
      structuredData: mapped.data,
      pageCount: ocr.pageCount,
    });
    await audit(tx, "EXTRACTION_CREATED", extraction.id);
    return extraction;
  });
  return extractionDto(row);
}

export async function listDocuments(
  context: CaregiverAuthContext,
  patientProfileId: string,
  deps: Deps = {},
) {
  const db = await resolveDb(deps);
  await requireActiveCaregiverProfile(context, patientProfileId, db);
  const rows = await db.healthDocument.findMany({
    where: { patientProfileId, deletedAt: null },
    select: documentSelect,
    orderBy: { createdAt: "desc" },
  });
  return rows.map((row) => documentDto(row));
}

export async function getDocument(
  context: CaregiverAuthContext,
  patientProfileId: string,
  documentId: string,
  deps: Deps = {},
) {
  const db = await resolveDb(deps);
  await requireActiveCaregiverProfile(context, patientProfileId, db);
  const document = await requireDocument(db, patientProfileId, documentId);
  const extraction = await db.documentExtraction.findFirst({
    where: { healthDocumentId: documentId },
    select: extractionSelect,
    orderBy: { createdAt: "desc" },
  });
  const { storagePath, ...rest } = document;
  void storagePath;
  return {
    document: documentDto(rest),
    extraction: extraction ? extractionDto(extraction) : null,
  };
}

export async function editExtraction(
  context: CaregiverAuthContext,
  patientProfileId: string,
  documentId: string,
  extractionId: string,
  structuredData: DocumentExtractionV1,
  deps: Deps = {},
) {
  const db = await resolveDb(deps);
  const profile = await requireActiveCaregiverProfile(
    context,
    patientProfileId,
    db,
  );
  await requireDocument(db, patientProfileId, documentId);
  const data = documentExtractionV1Schema.parse(structuredData);

  const row = await db.$transaction(async (tx) => {
    const result = await tx.documentExtraction.updateMany({
      where: {
        id: extractionId,
        healthDocumentId: documentId,
        patientProfileId,
        status: "PENDING_REVIEW",
      },
      data: { structuredData: data },
    });
    if (result.count !== 1) throw new DocumentError("CONFLICT");
    const updated = await tx.documentExtraction.findFirstOrThrow({
      where: { id: extractionId },
      select: extractionSelect,
    });
    await writeAuditEvent(tx, {
      careCircleId: profile.careCircleId,
      patientProfileId,
      actor: {
        type: "CAREGIVER",
        userId: context.user.id,
        role: context.membership.role,
      },
      action: "EXTRACTION_EDITED",
      targetType: "DOCUMENT_EXTRACTION",
      targetId: extractionId,
      requestId: deps.requestId,
    });
    return updated;
  });
  return extractionDto(row);
}

export async function confirmExtraction(
  context: CaregiverAuthContext,
  patientProfileId: string,
  documentId: string,
  extractionId: string,
  deps: Deps = {},
) {
  const db = await resolveDb(deps);
  const profile = await requireActiveCaregiverProfile(
    context,
    patientProfileId,
    db,
  );
  await requireDocument(db, patientProfileId, documentId);

  const row = await db.$transaction(async (tx) => {
    // updateMany + count guard keeps confirmation atomic; first reviewer wins.
    const result = await tx.documentExtraction.updateMany({
      where: {
        id: extractionId,
        healthDocumentId: documentId,
        patientProfileId,
        status: "PENDING_REVIEW",
      },
      data: {
        status: "CONFIRMED",
        reviewedByUserId: context.user.id,
        reviewedAt: new Date(),
      },
    });
    if (result.count !== 1) throw new DocumentError("CONFLICT");
    await tx.healthDocument.update({
      where: { id: documentId },
      data: { status: "CONFIRMED", confirmedExtractionId: extractionId },
    });
    const updated = await tx.documentExtraction.findFirstOrThrow({
      where: { id: extractionId },
      select: extractionSelect,
    });
    await writeAuditEvent(tx, {
      careCircleId: profile.careCircleId,
      patientProfileId,
      actor: {
        type: "CAREGIVER",
        userId: context.user.id,
        role: context.membership.role,
      },
      action: "EXTRACTION_CONFIRMED",
      targetType: "DOCUMENT_EXTRACTION",
      targetId: extractionId,
      requestId: deps.requestId,
    });
    return updated;
  });
  return extractionDto(row);
}

export async function rejectExtraction(
  context: CaregiverAuthContext,
  patientProfileId: string,
  documentId: string,
  extractionId: string,
  reason: string,
  deps: Deps = {},
) {
  const db = await resolveDb(deps);
  const profile = await requireActiveCaregiverProfile(
    context,
    patientProfileId,
    db,
  );
  await requireDocument(db, patientProfileId, documentId);

  const row = await db.$transaction(async (tx) => {
    const result = await tx.documentExtraction.updateMany({
      where: {
        id: extractionId,
        healthDocumentId: documentId,
        patientProfileId,
        status: "PENDING_REVIEW",
      },
      data: {
        status: "REJECTED",
        reviewedByUserId: context.user.id,
        reviewedAt: new Date(),
      },
    });
    if (result.count !== 1) throw new DocumentError("CONFLICT");
    await tx.healthDocument.update({
      where: { id: documentId },
      data: { status: "REJECTED" },
    });
    const updated = await tx.documentExtraction.findFirstOrThrow({
      where: { id: extractionId },
      select: extractionSelect,
    });
    await writeAuditEvent(tx, {
      careCircleId: profile.careCircleId,
      patientProfileId,
      actor: {
        type: "CAREGIVER",
        userId: context.user.id,
        role: context.membership.role,
      },
      action: "EXTRACTION_REJECTED",
      targetType: "DOCUMENT_EXTRACTION",
      targetId: extractionId,
      requestId: deps.requestId,
      note: reason,
    });
    return updated;
  });
  return extractionDto(row);
}

export async function createDownloadUrl(
  context: CaregiverAuthContext,
  patientProfileId: string,
  documentId: string,
  deps: Deps = {},
) {
  const db = await resolveDb(deps);
  const profile = await requireActiveCaregiverProfile(
    context,
    patientProfileId,
    db,
  );
  const document = await requireDocument(db, patientProfileId, documentId);
  const signed = await createSignedDownloadUrl(document.storagePath);
  await writeAuditEvent(db, {
    careCircleId: profile.careCircleId,
    patientProfileId,
    actor: {
      type: "CAREGIVER",
      userId: context.user.id,
      role: context.membership.role,
    },
    action: "DOCUMENT_DOWNLOAD_URL_CREATED",
    targetType: "HEALTH_DOCUMENT",
    targetId: documentId,
    requestId: deps.requestId,
  });
  return signed;
}

export async function softDeleteDocument(
  context: CaregiverAuthContext,
  patientProfileId: string,
  documentId: string,
  deps: Deps = {},
) {
  if (context.membership.role !== "OWNER") {
    throw new DocumentError("OWNER_REQUIRED");
  }
  const db = await resolveDb(deps);
  const profile = await requireActiveCaregiverProfile(
    context,
    patientProfileId,
    db,
  );
  const document = await requireDocument(db, patientProfileId, documentId);

  await db.$transaction(async (tx) => {
    await tx.healthDocument.update({
      where: { id: documentId },
      data: { deletedAt: new Date() },
    });
    await writeAuditEvent(tx, {
      careCircleId: profile.careCircleId,
      patientProfileId,
      actor: {
        type: "CAREGIVER",
        userId: context.user.id,
        role: context.membership.role,
      },
      action: "DOCUMENT_DELETED",
      targetType: "HEALTH_DOCUMENT",
      targetId: documentId,
      requestId: deps.requestId,
    });
  });
  await removeObject(document.storagePath).catch(() => {
    // Row is already soft-deleted; a stranded private object is acceptable
    // and cleaned up manually. Never fail the API for it.
  });
  return { id: documentId };
}

/**
 * Packet 11 selector: confirmed extractions only, one authorized profile.
 * Pending, rejected, and failed extractions must never reach chatbot context.
 */
export async function getConfirmedExtractionSummaries(
  context: CaregiverAuthContext,
  patientProfileId: string,
  deps: Deps = {},
) {
  const db = await resolveDb(deps);
  await requireActiveCaregiverProfile(context, patientProfileId, db);
  const rows = await db.healthDocument.findMany({
    where: {
      patientProfileId,
      deletedAt: null,
      status: "CONFIRMED",
      confirmedExtractionId: { not: null },
      confirmedExtraction: { status: "CONFIRMED" },
    },
    select: {
      id: true,
      title: true,
      category: true,
      confirmedExtraction: {
        select: { structuredData: true, schemaVersion: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });
  return rows.map((row) => ({
    documentId: row.id,
    title: row.title,
    category: row.category,
    schemaVersion: row.confirmedExtraction?.schemaVersion ?? null,
    structuredData: row.confirmedExtraction?.structuredData ?? null,
  }));
}

export { PatientProfileError };
