import { ZodError } from "zod";

import { CaregiverAuthError } from "@/lib/auth/caregiver";
import { PatientAuthError } from "@/lib/auth/patient";
import { DocumentError } from "@/lib/documents/service";
import { PatientProfileError } from "@/lib/patient-profile/service";
import { InvitationError } from "@/lib/invitations/service";

const headers = { "Cache-Control": "private, no-store" };

export function apiErrorResponse(
  error: unknown,
  requestId: string,
  options: { unauthenticatedMessage?: string } = {},
) {
  let status = 500;
  let code = "INTERNAL_ERROR";
  let message = "Terjadi kesalahan. Coba lagi.";
  let details: { onboardingDefaults: Record<string, string> } | undefined;

  if (error instanceof ZodError) {
    status = 400;
    code = "VALIDATION_ERROR";
    message = "Data yang dikirim belum sesuai.";
  } else if (
    error instanceof CaregiverAuthError ||
    error instanceof PatientAuthError
  ) {
    if (error.code === "UNAUTHENTICATED") {
      status = 401;
      code = error.code;
      message =
        options.unauthenticatedMessage ?? "Silakan masuk untuk melanjutkan.";
    } else if (error.code === "FORBIDDEN") {
      status = 403;
      code = error.code;
      message = "Anda tidak memiliki akses.";
    } else if (error.code === "ONBOARDING_REQUIRED") {
      status = 409;
      code = error.code;
      message = "Selesaikan pendaftaran caregiver untuk melanjutkan.";
      if (
        error.onboardingDefaults &&
        Object.keys(error.onboardingDefaults).length > 0
      ) {
        details = { onboardingDefaults: error.onboardingDefaults } as {
          onboardingDefaults: Record<string, string>;
        };
      }
    } else {
      status = 429;
      code = error.code;
      message = "Terlalu banyak percobaan. Coba lagi nanti.";
    }
  } else if (error instanceof PatientProfileError) {
    if (error.code === "NOT_FOUND") {
      status = 404;
      code = error.code;
      message = "Patient Profile tidak ditemukan.";
    } else {
      status = 409;
      code = error.code;
      message =
        error.code === "PATIENT_PROFILE_LIMIT_REACHED"
          ? "Maksimal dua Patient Profile dapat dibuat."
          : "Perubahan bertabrakan dengan data yang sudah ada.";
    }
  } else if (error instanceof DocumentError) {
    code = error.code;
    if (error.code === "NOT_FOUND") {
      status = 404;
      message = "Dokumen tidak ditemukan.";
    } else if (error.code === "FILE_TOO_LARGE") {
      status = 413;
      message = "Ukuran file melebihi batas 5 MB.";
    } else if (error.code === "PAGE_LIMIT_EXCEEDED") {
      status = 422;
      message = "Dokumen melebihi batas tiga halaman.";
    } else if (error.code === "OWNER_REQUIRED") {
      status = 403;
      message = "Hanya Owner yang dapat melakukan tindakan ini.";
    } else if (error.code === "EXTRACTION_FAILED") {
      status = 502;
      message = "Pembacaan dokumen gagal. Coba lagi.";
    } else {
      status = 409;
      message =
        error.code === "UPLOAD_INCOMPLETE"
          ? "File belum terunggah dengan benar. Ulangi unggahan."
          : "Status dokumen sudah berubah. Muat ulang halaman.";
    }
  } else if (error instanceof InvitationError) {
    status = error.code === "NOT_FOUND" ? 404 : 409;
    code = error.code;
    message =
      error.code === "NOT_FOUND"
        ? "Undangan tidak tersedia atau sudah tidak berlaku."
        : "Undangan sudah digunakan atau berubah.";
  }

  return Response.json(
    { error: { code, message, requestId, ...(details ? { details } : {}) } },
    { status, headers },
  );
}

export function apiSuccess(data: unknown, requestId: string, status = 200) {
  return Response.json(
    { data, meta: { requestId } },
    { status, headers },
  );
}
