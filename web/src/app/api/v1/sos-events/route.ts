import { randomUUID } from "node:crypto";

import { apiErrorResponse, apiSuccess } from "@/lib/auth/api-response";
import { resolveCaregiverAuthContext } from "@/lib/auth/caregiver";
import { sosStatusQuerySchema } from "@/lib/sos/contracts";
import { listNewSosEvents } from "@/lib/sos/service";

export async function GET(request: Request) {
  const requestId = `req_${randomUUID()}`;
  try {
    sosStatusQuerySchema.parse(
      new URL(request.url).searchParams.get("status") ?? undefined,
    );
    const context = await resolveCaregiverAuthContext();
    return apiSuccess(await listNewSosEvents(context), requestId);
  } catch (error) {
    return apiErrorResponse(error, requestId);
  }
}
