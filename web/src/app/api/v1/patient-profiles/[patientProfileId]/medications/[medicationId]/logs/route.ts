import { randomUUID } from "node:crypto";
import { apiErrorResponse, apiSuccess } from "@/lib/auth/api-response";
import { requireSameOrigin } from "@/lib/auth/origin";
import { resolveAuthContext } from "@/lib/auth/patient";
import { medicationLogCreateSchema } from "@/lib/daily-care/daily-care-contract";
import { createMedicationLog } from "@/lib/daily-care/medication-service";
import { patientProfileIdSchema } from "@/lib/patient-profile/schemas";

type RouteContext = { params: Promise<{ patientProfileId: string; medicationId: string }> };
export async function POST(request: Request, routeContext: RouteContext) {
  const requestId = `req_${randomUUID()}`;
  try {
    requireSameOrigin(request);
    const params = await routeContext.params;
    const patientProfileId = patientProfileIdSchema.parse(params.patientProfileId);
    const medicationId = patientProfileIdSchema.parse(params.medicationId);
    const input = medicationLogCreateSchema.parse(await request.json().catch(() => null));
    return apiSuccess(await createMedicationLog(await resolveAuthContext(), patientProfileId, medicationId, input, { requestId }), requestId, 201);
  } catch (error) { return apiErrorResponse(error, requestId); }
}
