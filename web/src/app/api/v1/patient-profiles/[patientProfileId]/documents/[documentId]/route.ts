import { randomUUID } from "node:crypto";

import { z } from "zod";

import { apiErrorResponse, apiSuccess } from "@/lib/auth/api-response";
import { resolveCaregiverAuthContext } from "@/lib/auth/caregiver";
import { requireSameOrigin } from "@/lib/auth/origin";
import { getDocument, softDeleteDocument } from "@/lib/documents/service";
import { patientProfileIdSchema } from "@/lib/patient-profile/schemas";

type RouteContext = {
  params: Promise<{ patientProfileId: string; documentId: string }>;
};

const documentIdSchema = z.uuid();

export async function GET(_request: Request, routeContext: RouteContext) {
  const requestId = `req_${randomUUID()}`;
  try {
    const params = await routeContext.params;
    const patientProfileId = patientProfileIdSchema.parse(
      params.patientProfileId,
    );
    const documentId = documentIdSchema.parse(params.documentId);
    const context = await resolveCaregiverAuthContext();
    return apiSuccess(
      await getDocument(context, patientProfileId, documentId, { requestId }),
      requestId,
    );
  } catch (error) {
    return apiErrorResponse(error, requestId);
  }
}

export async function DELETE(request: Request, routeContext: RouteContext) {
  const requestId = `req_${randomUUID()}`;
  try {
    requireSameOrigin(request);
    const params = await routeContext.params;
    const patientProfileId = patientProfileIdSchema.parse(
      params.patientProfileId,
    );
    const documentId = documentIdSchema.parse(params.documentId);
    const context = await resolveCaregiverAuthContext();
    return apiSuccess(
      await softDeleteDocument(context, patientProfileId, documentId, {
        requestId,
      }),
      requestId,
    );
  } catch (error) {
    return apiErrorResponse(error, requestId);
  }
}
