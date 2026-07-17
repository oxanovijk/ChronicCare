import { randomUUID } from "node:crypto";
import { apiErrorResponse, apiSuccess } from "@/lib/auth/api-response";
import { resolveCaregiverAuthContext } from "@/lib/auth/caregiver";
import { requireSameOrigin } from "@/lib/auth/origin";
import { resolveAuthContext } from "@/lib/auth/patient";
import { reminderCreateSchema } from "@/lib/daily-care/daily-care-contract";
import { createReminder, listReminders } from "@/lib/daily-care/reminder-service";
import { patientProfileIdSchema } from "@/lib/patient-profile/schemas";

type RouteContext = { params: Promise<{ patientProfileId: string }> };
export async function GET(_request: Request, routeContext: RouteContext) {
  const requestId = `req_${randomUUID()}`;
  try {
    const patientProfileId = patientProfileIdSchema.parse((await routeContext.params).patientProfileId);
    return apiSuccess(await listReminders(await resolveAuthContext(), patientProfileId), requestId);
  } catch (error) { return apiErrorResponse(error, requestId); }
}
export async function POST(request: Request, routeContext: RouteContext) {
  const requestId = `req_${randomUUID()}`;
  try {
    requireSameOrigin(request);
    const patientProfileId = patientProfileIdSchema.parse((await routeContext.params).patientProfileId);
    const input = reminderCreateSchema.parse(await request.json().catch(() => null));
    return apiSuccess(await createReminder(await resolveCaregiverAuthContext(), patientProfileId, input, { requestId }), requestId, 201);
  } catch (error) { return apiErrorResponse(error, requestId); }
}
