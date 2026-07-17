import { randomUUID } from "node:crypto";

import { apiErrorResponse, apiSuccess } from "@/lib/auth/api-response";
import { resolveCaregiverAuthContext } from "@/lib/auth/caregiver";
import { requireSameOrigin } from "@/lib/auth/origin";
import { documentUploadIntentSchema } from "@/lib/documents/contract";
import { createUploadIntent } from "@/lib/documents/service";
import { patientProfileIdSchema } from "@/lib/patient-profile/schemas";

type RouteContext = { params: Promise<{ patientProfileId: string }> };

export async function POST(request: Request, routeContext: RouteContext) {
  const requestId = `req_${randomUUID()}`;
  try {
    requireSameOrigin(request);
    const patientProfileId = patientProfileIdSchema.parse(
      (await routeContext.params).patientProfileId,
    );
    const input = documentUploadIntentSchema.parse(
      await request.json().catch(() => null),
    );
    const context = await resolveCaregiverAuthContext();
    return apiSuccess(
      await createUploadIntent(context, patientProfileId, input, { requestId }),
      requestId,
      201,
    );
  } catch (error) {
    return apiErrorResponse(error, requestId);
  }
}
