import { randomUUID } from "node:crypto";

import { z } from "zod";

import { apiErrorResponse, apiSuccess } from "@/lib/auth/api-response";
import { resolveCaregiverAuthContext } from "@/lib/auth/caregiver";
import { requireSameOrigin } from "@/lib/auth/origin";
import { extractionPatchSchema } from "@/lib/documents/contract";
import { editExtraction } from "@/lib/documents/service";
import { patientProfileIdSchema } from "@/lib/patient-profile/schemas";

type RouteContext = {
  params: Promise<{
    patientProfileId: string;
    documentId: string;
    extractionId: string;
  }>;
};

export async function PATCH(request: Request, routeContext: RouteContext) {
  const requestId = `req_${randomUUID()}`;
  try {
    requireSameOrigin(request);
    const params = await routeContext.params;
    const patientProfileId = patientProfileIdSchema.parse(
      params.patientProfileId,
    );
    const documentId = z.uuid().parse(params.documentId);
    const extractionId = z.uuid().parse(params.extractionId);
    const input = extractionPatchSchema.parse(
      await request.json().catch(() => null),
    );
    const context = await resolveCaregiverAuthContext();
    return apiSuccess(
      await editExtraction(
        context,
        patientProfileId,
        documentId,
        extractionId,
        input.structuredData,
        { requestId },
      ),
      requestId,
    );
  } catch (error) {
    return apiErrorResponse(error, requestId);
  }
}
