import "server-only";

import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export const HEALTH_DOCUMENTS_BUCKET = "health-documents";

/** Supabase signed upload URLs are valid for two hours. */
const UPLOAD_TOKEN_TTL_MS = 2 * 60 * 60 * 1000;
const DOWNLOAD_URL_TTL_SECONDS = 60;

export class DocumentStorageError extends Error {
  constructor(
    public readonly code:
      | "UPLOAD_URL_FAILED"
      | "OBJECT_NOT_FOUND"
      | "DOWNLOAD_FAILED"
      | "REMOVE_FAILED",
  ) {
    super(code);
    this.name = "DocumentStorageError";
  }
}

export function sanitizeFileName(fileName: string) {
  const cleaned = fileName
    .toLowerCase()
    .replaceAll(/[^a-z0-9._-]+/g, "-")
    .replaceAll(/-{2,}/g, "-")
    .replaceAll(/^[-.]+|[-.]+$/g, "");
  return cleaned || "document";
}

export function buildStoragePath(input: {
  careCircleId: string;
  patientProfileId: string;
  documentId: string;
  fileName: string;
}) {
  return `${input.careCircleId}/${input.patientProfileId}/${input.documentId}/${sanitizeFileName(input.fileName)}`;
}

export async function createSignedUpload(storagePath: string) {
  const { data, error } = await createSupabaseAdminClient()
    .storage.from(HEALTH_DOCUMENTS_BUCKET)
    .createSignedUploadUrl(storagePath);
  if (error || !data) throw new DocumentStorageError("UPLOAD_URL_FAILED");
  return {
    token: data.token,
    path: data.path,
    expiresAt: new Date(Date.now() + UPLOAD_TOKEN_TTL_MS).toISOString(),
  };
}

/** Returns object size/mime as stored, or throws when the object is absent. */
export async function statObject(storagePath: string) {
  const separator = storagePath.lastIndexOf("/");
  const folder = storagePath.slice(0, separator);
  const name = storagePath.slice(separator + 1);

  const { data, error } = await createSupabaseAdminClient()
    .storage.from(HEALTH_DOCUMENTS_BUCKET)
    .list(folder, { limit: 100 });
  if (error) throw new DocumentStorageError("OBJECT_NOT_FOUND");

  const entry = data?.find((item) => item.name === name);
  if (!entry) throw new DocumentStorageError("OBJECT_NOT_FOUND");
  const metadata = entry.metadata as
    | { size?: number; mimetype?: string }
    | null
    | undefined;
  return {
    sizeBytes: metadata?.size ?? null,
    mimeType: metadata?.mimetype ?? null,
  };
}

export async function downloadObject(storagePath: string) {
  const { data, error } = await createSupabaseAdminClient()
    .storage.from(HEALTH_DOCUMENTS_BUCKET)
    .download(storagePath);
  if (error || !data) throw new DocumentStorageError("DOWNLOAD_FAILED");
  return Buffer.from(await data.arrayBuffer());
}

export async function createSignedDownloadUrl(storagePath: string) {
  const { data, error } = await createSupabaseAdminClient()
    .storage.from(HEALTH_DOCUMENTS_BUCKET)
    .createSignedUrl(storagePath, DOWNLOAD_URL_TTL_SECONDS);
  if (error || !data) throw new DocumentStorageError("DOWNLOAD_FAILED");
  return {
    url: data.signedUrl,
    expiresAt: new Date(
      Date.now() + DOWNLOAD_URL_TTL_SECONDS * 1000,
    ).toISOString(),
  };
}

export async function removeObject(storagePath: string) {
  const { error } = await createSupabaseAdminClient()
    .storage.from(HEALTH_DOCUMENTS_BUCKET)
    .remove([storagePath]);
  if (error) throw new DocumentStorageError("REMOVE_FAILED");
}
