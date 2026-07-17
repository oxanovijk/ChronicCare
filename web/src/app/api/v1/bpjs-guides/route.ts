import { randomUUID } from "node:crypto";

import { apiErrorResponse, apiSuccess } from "@/lib/auth/api-response";
import { resolveCaregiverAuthContext } from "@/lib/auth/caregiver";
import { bpjsGuides } from "@/lib/facilities/data";

export async function GET() {
  const requestId = `req_${randomUUID()}`;
  try {
    await resolveCaregiverAuthContext();
    return apiSuccess(
      { items: bpjsGuides, total: bpjsGuides.length, version: "packet10.v1" },
      requestId,
    );
  } catch (error) {
    return apiErrorResponse(error, requestId);
  }
}
