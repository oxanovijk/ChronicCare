import { randomUUID } from "node:crypto";

import { NextResponse } from "next/server";

import { apiErrorResponse } from "@/lib/auth/api-response";
import { requireSameOrigin } from "@/lib/auth/origin";
import {
  PATIENT_SESSION_COOKIE,
  revokePatientSession,
} from "@/lib/auth/patient";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const requestId = `req_${randomUUID()}`;

  try {
    requireSameOrigin(request);
    await revokePatientSession();
    const response = new NextResponse(null, {
      status: 204,
      headers: { "Cache-Control": "private, no-store" },
    });
    response.cookies.set(PATIENT_SESSION_COOKIE, "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 0,
    });
    return response;
  } catch (error) {
    return apiErrorResponse(error, requestId);
  }
}
