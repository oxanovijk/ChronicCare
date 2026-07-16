import { randomUUID } from "node:crypto";

import {
  CaregiverAuthError,
  resolveCaregiverAuthContext,
} from "@/lib/auth/caregiver";

export async function GET() {
  const requestId = `req_${randomUUID()}`;
  const headers = { "Cache-Control": "private, no-store" };

  try {
    return Response.json(
      { data: await resolveCaregiverAuthContext(), meta: { requestId } },
      { headers },
    );
  } catch (error) {
    const code =
      error instanceof CaregiverAuthError ? error.code : "INTERNAL_ERROR";
    const status =
      code === "UNAUTHENTICATED" ? 401 : code === "FORBIDDEN" ? 403 : 500;
    const message =
      code === "UNAUTHENTICATED"
        ? "Silakan masuk untuk melanjutkan."
        : code === "FORBIDDEN"
          ? "Anda tidak memiliki akses."
          : "Terjadi kesalahan. Coba lagi.";

    return Response.json(
      { error: { code, message, requestId } },
      { status, headers },
    );
  }
}
