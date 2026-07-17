import { randomUUID } from "node:crypto";

import { apiErrorResponse, apiSuccess } from "@/lib/auth/api-response";
import { resolveCaregiverAuthContext } from "@/lib/auth/caregiver";
import { facilities } from "@/lib/facilities/data";
import {
  deriveFacilityFilterOptions,
  facilityQuerySchema,
  filterFacilities,
} from "@/lib/facilities/filter";

export async function GET(request: Request) {
  const requestId = `req_${randomUUID()}`;
  try {
    await resolveCaregiverAuthContext();
    const url = new URL(request.url);
    const query = facilityQuerySchema.parse(Object.fromEntries(url.searchParams));
    const items = filterFacilities(facilities, query);
    return apiSuccess(
      {
        items,
        total: items.length,
        appliedFilters: query,
        filterOptions: deriveFacilityFilterOptions(facilities, query.city),
      },
      requestId,
    );
  } catch (error) {
    return apiErrorResponse(error, requestId);
  }
}

