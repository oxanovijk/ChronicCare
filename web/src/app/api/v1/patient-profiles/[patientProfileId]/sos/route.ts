import { randomUUID } from "node:crypto";

import { apiErrorResponse, apiSuccess } from "@/lib/auth/api-response";
import { requireSameOrigin } from "@/lib/auth/origin";
import { resolveAuthContext } from "@/lib/auth/patient";
import { patientProfileIdSchema } from "@/lib/patient-profile/schemas";
import { createSosSchema, idempotencyKeySchema } from "@/lib/sos/contracts";
import { createSosEvent } from "@/lib/sos/service";

type RouteContext = {
  params: Promise<{ patientProfileId: string }>;
};

export async function POST(request: Request, routeContext: RouteContext) {
  const requestId = `req_${randomUUID()}`;
  try {
    requireSameOrigin(request);
    const patientProfileId = patientProfileIdSchema.parse(
      (await routeContext.params).patientProfileId,
    );
    const idempotencyKey = idempotencyKeySchema.parse(
      request.headers.get("Idempotency-Key"),
    );
    const context = await resolveAuthContext();
    const input = createSosSchema.parse(await request.json().catch(() => null));
    return apiSuccess(
      await createSosEvent(context, patientProfileId, input, idempotencyKey, {
        requestId,
      }),
      requestId,
      201,
    );
  } catch (error) {
    return apiErrorResponse(error, requestId);
  }
}
