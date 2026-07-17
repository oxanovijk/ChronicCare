import { randomUUID } from "node:crypto";

import { z } from "zod";

import { apiErrorResponse, apiSuccess } from "@/lib/auth/api-response";
import { resolveCaregiverAuthContext } from "@/lib/auth/caregiver";
import { requireSameOrigin } from "@/lib/auth/origin";
import { rotatePatientAccessCode } from "@/lib/patient-access/service";
import { patientProfileIdSchema } from "@/lib/patient-profile/schemas";

export const runtime = "nodejs";

export async function POST(
  request: Request,
  context: { params: Promise<{ patientProfileId: string }> },
) {
  const requestId = `req_${randomUUID()}`;

  try {
    requireSameOrigin(request);
    const authContext = await resolveCaregiverAuthContext();
    const { patientProfileId } = z
      .object({ patientProfileId: patientProfileIdSchema })
      .parse(await context.params);
    return apiSuccess(
      await rotatePatientAccessCode(authContext, patientProfileId, {
        requestId,
      }),
      requestId,
      201,
    );
  } catch (error) {
    return apiErrorResponse(error, requestId);
  }
}
