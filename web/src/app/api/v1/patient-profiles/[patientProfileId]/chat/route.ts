import { randomUUID } from "node:crypto";

import { chatRequestSchema } from "@/lib/ai/chat/contract";
import { ChatError, sendChatMessage } from "@/lib/ai/chat/service";
import { apiErrorResponse, apiSuccess } from "@/lib/auth/api-response";
import { requireSameOrigin } from "@/lib/auth/origin";
import { resolveAuthContext } from "@/lib/auth/patient";
import { patientProfileIdSchema } from "@/lib/patient-profile/schemas";

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
    const actor = await resolveAuthContext();
    const input = chatRequestSchema.parse(
      await request.json().catch(() => null),
    );
    return apiSuccess(
      await sendChatMessage(actor, patientProfileId, input, { requestId }),
      requestId,
    );
  } catch (error) {
    if (error instanceof ChatError) {
      return Response.json(
        {
          error: {
            code: error.code,
            message: "Terlalu banyak permintaan chat. Coba lagi nanti.",
            requestId,
          },
        },
        { status: 429, headers: { "Cache-Control": "private, no-store" } },
      );
    }
    return apiErrorResponse(error, requestId);
  }
}
