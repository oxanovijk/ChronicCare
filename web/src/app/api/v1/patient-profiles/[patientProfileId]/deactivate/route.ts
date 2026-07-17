import { randomUUID } from "node:crypto";

import { apiErrorResponse, apiSuccess } from "@/lib/auth/api-response";
import { resolveCaregiverAuthContext } from "@/lib/auth/caregiver";
import { requireSameOrigin } from "@/lib/auth/origin";
import {
  deactivatePatientProfileSchema,
  patientProfileIdSchema,
} from "@/lib/patient-profile/schemas";
import { deactivatePatientProfile } from "@/lib/patient-profile/service";

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
    const context = await resolveCaregiverAuthContext();
    const input = deactivatePatientProfileSchema.parse(
      await request.json().catch(() => null),
    );
    return apiSuccess(
      await deactivatePatientProfile(context, patientProfileId, input, {
        requestId,
      }),
      requestId,
    );
  } catch (error) {
    return apiErrorResponse(error, requestId);
  }
}
