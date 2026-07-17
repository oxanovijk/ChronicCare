import { randomUUID } from "node:crypto";
import { apiErrorResponse, apiSuccess } from "@/lib/auth/api-response";
import { resolveCaregiverAuthContext } from "@/lib/auth/caregiver";
import { requireSameOrigin } from "@/lib/auth/origin";
import { reminderPatchSchema } from "@/lib/daily-care/daily-care-contract";
import { updateReminder } from "@/lib/daily-care/reminder-service";
import { patientProfileIdSchema } from "@/lib/patient-profile/schemas";

type RouteContext = { params: Promise<{ patientProfileId: string; reminderId: string }> };
export async function PATCH(request: Request, routeContext: RouteContext) {
  const requestId = `req_${randomUUID()}`;
  try {
    requireSameOrigin(request);
    const params = await routeContext.params;
    const patientProfileId = patientProfileIdSchema.parse(params.patientProfileId);
    const reminderId = patientProfileIdSchema.parse(params.reminderId);
    const input = reminderPatchSchema.parse(await request.json().catch(() => null));
    return apiSuccess(await updateReminder(await resolveCaregiverAuthContext(), patientProfileId, reminderId, input, { requestId }), requestId);
  } catch (error) { return apiErrorResponse(error, requestId); }
}
