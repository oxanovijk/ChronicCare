import { randomUUID } from "node:crypto";

import { apiErrorResponse, apiSuccess } from "@/lib/auth/api-response";
import { resolveAuthenticatedCaregiverUser } from "@/lib/auth/caregiver";
import { requireSameOrigin } from "@/lib/auth/origin";
import {
  acceptInvitationSchema,
  invitationTokenSchema,
} from "@/lib/invitations/schemas";
import { acceptInvitation } from "@/lib/invitations/service";

type RouteContext = { params: Promise<{ token: string }> };

export async function POST(request: Request, routeContext: RouteContext) {
  const requestId = `req_${randomUUID()}`;
  try {
    requireSameOrigin(request);
    const token = invitationTokenSchema.parse((await routeContext.params).token);
    const authUser = await resolveAuthenticatedCaregiverUser();
    const input = acceptInvitationSchema.parse(
      await request.json().catch(() => null),
    );
    return apiSuccess(
      await acceptInvitation(authUser, token, input, { requestId }),
      requestId,
    );
  } catch (error) {
    return apiErrorResponse(error, requestId);
  }
}
