import { ZodError } from "zod";

import { CaregiverAuthError } from "@/lib/auth/caregiver";
import { PatientAuthError } from "@/lib/auth/patient";
import { PatientProfileError } from "@/lib/patient-profile/service";

const headers = { "Cache-Control": "private, no-store" };

export function apiErrorResponse(
  error: unknown,
  requestId: string,
  options: { unauthenticatedMessage?: string } = {},
) {
  let status = 500;
  let code = "INTERNAL_ERROR";
  let message = "Terjadi kesalahan. Coba lagi.";

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
  }

  return Response.json(
    { error: { code, message, requestId } },
    { status, headers },
  );
}

export function apiSuccess(data: unknown, requestId: string, status = 200) {
  return Response.json(
    { data, meta: { requestId } },
    { status, headers },
  );
}
