import { randomUUID } from "node:crypto";

import { apiErrorResponse, apiSuccess } from "@/lib/auth/api-response";
import { resolveAuthContext } from "@/lib/auth/patient";

export async function GET() {
  const requestId = `req_${randomUUID()}`;

  try {
    return apiSuccess(await resolveAuthContext(), requestId);
  } catch (error) {
    return apiErrorResponse(error, requestId);
  }
}
