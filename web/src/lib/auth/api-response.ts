import { ZodError } from "zod";

import { CaregiverAuthError } from "@/lib/auth/caregiver";
import { PatientAuthError } from "@/lib/auth/patient";
import { PatientProfileError } from "@/lib/patient-profile/service";
import { InvitationError } from "@/lib/invitations/service";

const headers = { "Cache-Control": "private, no-store" };

const caregiverAuthCodes = new Set([
  "UNAUTHENTICATED",
  "FORBIDDEN",
  "ONBOARDING_REQUIRED",
] as const);

type CaregiverAuthErrorLike = Error & {
  code: "UNAUTHENTICATED" | "FORBIDDEN" | "ONBOARDING_REQUIRED";
  onboardingDefaults?: unknown;
};

function isCaregiverAuthErrorLike(
  error: unknown,
): error is CaregiverAuthErrorLike {
  if (error instanceof CaregiverAuthError) return true;
  if (!(error instanceof Error) || error.name !== "CaregiverAuthError") {
    return false;
  }

  const code = (error as { code?: unknown }).code;
  return (
    typeof code === "string" &&
    caregiverAuthCodes.has(code as CaregiverAuthErrorLike["code"])
  );
}

function safeOnboardingDefaults(value: unknown) {
  if (typeof value !== "object" || value === null) return undefined;
  const source = value as Record<string, unknown>;
  const defaults: Record<string, string> = {};

  for (const key of ["displayName", "careCircleName"] as const) {
    const field = source[key];
    if (typeof field === "string" && field.length >= 2 && field.length <= 120) {
      defaults[key] = field;
    }
  }

  return Object.keys(defaults).length > 0 ? defaults : undefined;
}

function safeInternalErrorClassification(error: unknown) {
  const rawName = error instanceof Error ? error.name : "UnknownError";
  const rawCode =
    typeof error === "object" &&
    error !== null &&
    typeof (error as { code?: unknown }).code === "string"
      ? (error as { code: string }).code
      : undefined;

  return {
    errorName: /^[A-Za-z][A-Za-z0-9_]{0,63}$/.test(rawName)
      ? rawName
      : "UnknownError",
    ...(rawCode && /^[A-Z0-9_-]{1,32}$/.test(rawCode)
      ? { errorCode: rawCode }
      : {}),
  };
}

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
  } else if (isCaregiverAuthErrorLike(error) || error instanceof PatientAuthError) {
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
      const onboardingDefaults = safeOnboardingDefaults(
        "onboardingDefaults" in error ? error.onboardingDefaults : undefined,
      );
      if (onboardingDefaults) {
        details = { onboardingDefaults };
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
  } else if (error instanceof InvitationError) {
    status = error.code === "NOT_FOUND" ? 404 : 409;
    code = error.code;
    message =
      error.code === "NOT_FOUND"
        ? "Undangan tidak tersedia atau sudah tidak berlaku."
        : "Undangan sudah digunakan atau berubah.";
  }

  if (status === 500) {
    console.error("API_INTERNAL_ERROR", {
      requestId,
      ...safeInternalErrorClassification(error),
    });
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
