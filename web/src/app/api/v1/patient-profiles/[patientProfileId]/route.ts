import { randomUUID } from "node:crypto";

import { apiErrorResponse, apiSuccess } from "@/lib/auth/api-response";
import { resolveCaregiverAuthContext } from "@/lib/auth/caregiver";
import { requireSameOrigin } from "@/lib/auth/origin";
import { resolveAuthContext } from "@/lib/auth/patient";
import {
  patchPatientProfileSchema,
  patientProfileIdSchema,
} from "@/lib/patient-profile/schemas";
import {
  getAuthorizedPatientProfile,
  updatePatientProfile,
} from "@/lib/patient-profile/service";

type RouteContext = {
  params: Promise<{ patientProfileId: string }>;
};

export async function GET(_request: Request, routeContext: RouteContext) {
  const requestId = `req_${randomUUID()}`;
  try {
    const patientProfileId = patientProfileIdSchema.parse(
      (await routeContext.params).patientProfileId,
    );
    const context = await resolveAuthContext();
    return apiSuccess(
      await getAuthorizedPatientProfile(context, patientProfileId),
      requestId,
    );
  } catch (error) {
    return apiErrorResponse(error, requestId);
  }
}

export async function PATCH(request: Request, routeContext: RouteContext) {
  const requestId = `req_${randomUUID()}`;
  try {
    requireSameOrigin(request);
    const patientProfileId = patientProfileIdSchema.parse(
      (await routeContext.params).patientProfileId,
    );
    const context = await resolveCaregiverAuthContext();
    const input = patchPatientProfileSchema.parse(
      await request.json().catch(() => null),
    );
    return apiSuccess(
      await updatePatientProfile(context, patientProfileId, input, {
        requestId,
      }),
      requestId,
    );
  } catch (error) {
    return apiErrorResponse(error, requestId);
  }
}
