import { randomUUID } from "node:crypto";

import { NextResponse } from "next/server";
import { z } from "zod";

import { apiErrorResponse } from "@/lib/auth/api-response";
import { requireSameOrigin } from "@/lib/auth/origin";
import {
  authenticatePatientCode,
  PATIENT_SESSION_COOKIE,
  PATIENT_SESSION_MAX_AGE_SECONDS,
} from "@/lib/auth/patient";

export const runtime = "nodejs";

const loginSchema = z
  .object({
    code: z
      .string()
      .max(64)
      .transform((value) => value.replace(/\s/g, ""))
      .pipe(z.string().min(1).max(32)),
  })
  .strict();

export async function POST(request: Request) {
  const requestId = `req_${randomUUID()}`;

  try {
    requireSameOrigin(request);
    const input = loginSchema.parse(await request.json().catch(() => null));
    const forwardedFor = request.headers.get("x-forwarded-for")?.split(",")[0];
    const result = await authenticatePatientCode({
      ...input,
      fingerprint: `${forwardedFor?.trim() || "local"}:${request.headers.get("user-agent") ?? "unknown"}`,
      requestId,
    });
    const response = NextResponse.json(
      { data: result.context, meta: { requestId } },
      { headers: { "Cache-Control": "private, no-store" } },
    );
    response.cookies.set(PATIENT_SESSION_COOKIE, result.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: PATIENT_SESSION_MAX_AGE_SECONDS,
      expires: result.expiresAt,
    });
    return response;
  } catch (error) {
    return apiErrorResponse(error, requestId, {
      unauthenticatedMessage: "Kode tidak valid atau sudah tidak berlaku.",
    });
  }
}
