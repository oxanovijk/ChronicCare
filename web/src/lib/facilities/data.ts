import "server-only";

import facilityData from "@/data/facilities/facilities.packet10.json";
import guideData from "@/data/facilities/bpjs-guides.packet10.json";
import {
  bpjsGuideDatasetSchema,
  facilityDatasetSchema,
  type BpjsGuide,
  type BpjsGuideRecord,
  type Facility,
  type FacilityRecord,
} from "@/lib/facilities/schemas";

function freezeFacility(item: Facility): FacilityRecord {
  return Object.freeze({
    ...item,
    services: Object.freeze([...item.services]),
    specialties: Object.freeze([...item.specialties]),
  });
}

function freezeGuide(item: BpjsGuide): BpjsGuideRecord {
  return Object.freeze({ ...item, steps: Object.freeze([...item.steps]) });
}

export const facilities = Object.freeze(
  facilityDatasetSchema.parse(facilityData).map(freezeFacility),
);

export const bpjsGuides = Object.freeze(
  bpjsGuideDatasetSchema.parse(guideData).map(freezeGuide),
);
