import { randomUUID } from "node:crypto";

import { apiErrorResponse, apiSuccess } from "@/lib/auth/api-response";
import { invitationTokenSchema } from "@/lib/invitations/schemas";
import { getInvitationPreview } from "@/lib/invitations/service";

type RouteContext = { params: Promise<{ token: string }> };

export async function GET(_request: Request, routeContext: RouteContext) {
  const requestId = `req_${randomUUID()}`;
  try {
    const token = invitationTokenSchema.parse((await routeContext.params).token);
    return apiSuccess(await getInvitationPreview(token), requestId);
  } catch (error) {
    return apiErrorResponse(error, requestId);
  }
}
