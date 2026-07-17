import { randomUUID } from "node:crypto";

import { apiErrorResponse, apiSuccess } from "@/lib/auth/api-response";
import { requireSameOrigin } from "@/lib/auth/origin";
import { resolveAuthContext } from "@/lib/auth/patient";
import {
  checkInLimitSchema,
  checkInRequestSchema,
} from "@/lib/daily-care/check-in-contract";
import {
  createCheckIn,
  listCheckIns,
} from "@/lib/daily-care/check-in-service";
import { patientProfileIdSchema } from "@/lib/patient-profile/schemas";

type RouteContext = {
  params: Promise<{ patientProfileId: string }>;
};

export async function GET(request: Request, routeContext: RouteContext) {
  const requestId = `req_${randomUUID()}`;
  try {
    const patientProfileId = patientProfileIdSchema.parse(
      (await routeContext.params).patientProfileId,
    );
    const limit = checkInLimitSchema.parse(
      new URL(request.url).searchParams.get("limit") ?? undefined,
    );
    const context = await resolveAuthContext();
    return apiSuccess(
      await listCheckIns(context, patientProfileId, limit),
      requestId,
    );
  } catch (error) {
    return apiErrorResponse(error, requestId);
  }
}

export async function POST(request: Request, routeContext: RouteContext) {
  const requestId = `req_${randomUUID()}`;
  try {
    requireSameOrigin(request);
    const patientProfileId = patientProfileIdSchema.parse(
      (await routeContext.params).patientProfileId,
    );
    const context = await resolveAuthContext();
    const input = checkInRequestSchema.parse(
      await request.json().catch(() => null),
    );
    return apiSuccess(
      await createCheckIn(context, patientProfileId, input, { requestId }),
      requestId,
      201,
    );
  } catch (error) {
    return apiErrorResponse(error, requestId);
  }
}
