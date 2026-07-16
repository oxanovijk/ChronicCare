import { randomUUID } from "node:crypto";

import { apiErrorResponse, apiSuccess } from "@/lib/auth/api-response";
import { resolveCaregiverAuthContext } from "@/lib/auth/caregiver";
import { requireSameOrigin } from "@/lib/auth/origin";
import {
  createPatientProfileSchema,
} from "@/lib/patient-profile/schemas";
import {
  createPatientProfile,
  listPatientProfiles,
} from "@/lib/patient-profile/service";

export async function GET() {
  const requestId = `req_${randomUUID()}`;
  try {
    const context = await resolveCaregiverAuthContext();
    return apiSuccess(await listPatientProfiles(context), requestId);
  } catch (error) {
    return apiErrorResponse(error, requestId);
  }
}

export async function POST(request: Request) {
  const requestId = `req_${randomUUID()}`;
  try {
    requireSameOrigin(request);
    const context = await resolveCaregiverAuthContext();
    const input = createPatientProfileSchema.parse(
      await request.json().catch(() => null),
    );
    return apiSuccess(
      await createPatientProfile(context, input, { requestId }),
      requestId,
      201,
    );
  } catch (error) {
    return apiErrorResponse(error, requestId);
  }
}
