import { randomUUID } from "node:crypto";

import { apiErrorResponse, apiSuccess } from "@/lib/auth/api-response";
import { resolveCaregiverAuthContext } from "@/lib/auth/caregiver";
import { requireSameOrigin } from "@/lib/auth/origin";
import { sosEventIdSchema } from "@/lib/sos/contracts";
import {
  handleSosEvent,
  SosAlreadyHandledError,
} from "@/lib/sos/service";

type RouteContext = {
  params: Promise<{ sosEventId: string }>;
};

export async function POST(request: Request, routeContext: RouteContext) {
  const requestId = `req_${randomUUID()}`;
  try {
    requireSameOrigin(request);
    const sosEventId = sosEventIdSchema.parse(
      (await routeContext.params).sosEventId,
    );
    const context = await resolveCaregiverAuthContext();
    return apiSuccess(await handleSosEvent(context, sosEventId, { requestId }), requestId);
  } catch (error) {
    if (error instanceof SosAlreadyHandledError) {
      return Response.json(
        {
          error: {
            code: "SOS_ALREADY_HANDLED",
            message: "SOS sudah ditangani caregiver lain.",
            requestId,
            details: { current: error.current },
          },
        },
        { status: 409, headers: { "Cache-Control": "private, no-store" } },
      );
    }
    return apiErrorResponse(error, requestId);
  }
}
