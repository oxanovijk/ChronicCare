import { z } from "zod";

import {
  facilityCitySchema,
  facilityTypeSchema,
  type FacilityCity,
  type FacilityRecord,
} from "@/lib/facilities/schemas";

const queryBooleanSchema = z.enum(["true", "false"]).transform((value) => value === "true");
const queryTextSchema = z.string().trim().min(1).max(100);

export const facilityQuerySchema = z.object({
  city: facilityCitySchema.optional(),
  area: queryTextSchema.optional(),
  facilityType: facilityTypeSchema.optional(),
  supportsBpjs: queryBooleanSchema.optional(),
  hasEmergencyUnit: queryBooleanSchema.optional(),
  service: queryTextSchema.optional(),
  specialty: queryTextSchema.optional(),
}).strict();

export type FacilityFilters = z.infer<typeof facilityQuerySchema>;

const collator = new Intl.Collator("id-ID", { sensitivity: "base" });

function normalized(value: string) {
  return value.trim().toLocaleLowerCase("id-ID");
}

function includesNormalized(values: readonly string[], expected: string) {
  const target = normalized(expected);
  return values.some((value) => normalized(value) === target);
}

export function filterFacilities(
  items: readonly FacilityRecord[],
  filters: FacilityFilters,
) {
  return items.filter((facility) => {
    if (filters.city && facility.city !== filters.city) return false;
    if (filters.area && normalized(facility.area) !== normalized(filters.area)) return false;
    if (filters.facilityType && facility.facilityType !== filters.facilityType) return false;
    if (filters.supportsBpjs !== undefined && facility.supportsBpjs !== filters.supportsBpjs) return false;
    if (filters.hasEmergencyUnit !== undefined && facility.hasEmergencyUnit !== filters.hasEmergencyUnit) return false;
    if (filters.service && !includesNormalized(facility.services, filters.service)) return false;
    if (filters.specialty && !includesNormalized(facility.specialties, filters.specialty)) return false;
    return true;
  });
}

function uniqueSorted(values: readonly string[]) {
  return [...new Set(values)].sort(collator.compare);
}

export function deriveFacilityFilterOptions(
  items: readonly FacilityRecord[],
  city?: FacilityCity,
) {
  const scoped = city ? items.filter((facility) => facility.city === city) : items;
  return {
    cities: uniqueSorted(items.map((facility) => facility.city)),
    areas: uniqueSorted(scoped.map((facility) => facility.area)),
    facilityTypes: uniqueSorted(scoped.map((facility) => facility.facilityType)),
    services: uniqueSorted(scoped.flatMap((facility) => facility.services)),
    specialties: uniqueSorted(scoped.flatMap((facility) => facility.specialties)),
  };
}
