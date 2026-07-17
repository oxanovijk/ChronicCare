import { randomUUID } from "node:crypto";

import { apiErrorResponse, apiSuccess } from "@/lib/auth/api-response";
import { resolveAuthenticatedCaregiverUser } from "@/lib/auth/caregiver";
import { requireSameOrigin } from "@/lib/auth/origin";
import { completeOwnerOnboarding } from "@/lib/onboarding/owner-service";
import { ownerOnboardingSchema } from "@/lib/onboarding/schemas";

export async function POST(request: Request) {
  const requestId = `req_${randomUUID()}`;
  try {
    requireSameOrigin(request);
    const authUser = await resolveAuthenticatedCaregiverUser();
    const input = ownerOnboardingSchema.parse(
      await request.json().catch(() => null),
    );
    return apiSuccess(
      await completeOwnerOnboarding(authUser, input, { requestId }),
      requestId,
      201,
    );
  } catch (error) {
    return apiErrorResponse(error, requestId);
  }
}
