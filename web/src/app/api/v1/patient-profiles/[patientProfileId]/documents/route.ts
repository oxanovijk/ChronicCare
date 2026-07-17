import { randomUUID } from "node:crypto";

import { apiErrorResponse, apiSuccess } from "@/lib/auth/api-response";
import { resolveCaregiverAuthContext } from "@/lib/auth/caregiver";
import { listDocuments } from "@/lib/documents/service";
import { patientProfileIdSchema } from "@/lib/patient-profile/schemas";

type RouteContext = { params: Promise<{ patientProfileId: string }> };

export async function GET(_request: Request, routeContext: RouteContext) {
  const requestId = `req_${randomUUID()}`;
  try {
    const patientProfileId = patientProfileIdSchema.parse(
      (await routeContext.params).patientProfileId,
    );
    const context = await resolveCaregiverAuthContext();
    return apiSuccess(
      await listDocuments(context, patientProfileId, { requestId }),
      requestId,
    );
  } catch (error) {
    return apiErrorResponse(error, requestId);
  }
}
