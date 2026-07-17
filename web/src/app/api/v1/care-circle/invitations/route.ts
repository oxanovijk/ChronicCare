import { randomUUID } from "node:crypto";

import { apiErrorResponse, apiSuccess } from "@/lib/auth/api-response";
import { resolveCaregiverAuthContext } from "@/lib/auth/caregiver";
import { requireSameOrigin } from "@/lib/auth/origin";
import { createInvitationSchema } from "@/lib/invitations/schemas";
import { createInvitation } from "@/lib/invitations/service";

export async function POST(request: Request) {
  const requestId = `req_${randomUUID()}`;
  try {
    requireSameOrigin(request);
    const context = await resolveCaregiverAuthContext();
    const input = createInvitationSchema.parse(
      await request.json().catch(() => null),
    );
    return apiSuccess(
      await createInvitation(context, input, { requestId }),
      requestId,
      201,
    );
  } catch (error) {
    return apiErrorResponse(error, requestId);
  }
}
