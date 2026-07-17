import { randomUUID } from "node:crypto";
import { apiErrorResponse, apiSuccess } from "@/lib/auth/api-response";
import { resolveCaregiverAuthContext } from "@/lib/auth/caregiver";
import { requireSameOrigin } from "@/lib/auth/origin";
import { medicationPatchSchema } from "@/lib/daily-care/daily-care-contract";
import { updateMedication } from "@/lib/daily-care/medication-service";
import { patientProfileIdSchema } from "@/lib/patient-profile/schemas";

type RouteContext = { params: Promise<{ patientProfileId: string; medicationId: string }> };
export async function PATCH(request: Request, routeContext: RouteContext) {
  const requestId = `req_${randomUUID()}`;
  try {
    requireSameOrigin(request);
    const params = await routeContext.params;
    const patientProfileId = patientProfileIdSchema.parse(params.patientProfileId);
    const medicationId = patientProfileIdSchema.parse(params.medicationId);
    const input = medicationPatchSchema.parse(await request.json().catch(() => null));
    return apiSuccess(await updateMedication(await resolveCaregiverAuthContext(), patientProfileId, medicationId, input, { requestId }), requestId);
  } catch (error) { return apiErrorResponse(error, requestId); }
}
