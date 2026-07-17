import { describe, expect, it } from "vitest";

import { facilities } from "@/lib/facilities/data";
import {
  deriveFacilityFilterOptions,
  facilityQuerySchema,
  filterFacilities,
} from "@/lib/facilities/filter";

describe("Packet 10 deterministic facility filtering", () => {
  it("keeps source order for the stable BPJS and Penyakit Dalam demo filter", () => {
    const results = filterFacilities(facilities, {
      supportsBpjs: true,
      service: "penyakit dalam",
    });

    expect(results.map((facility) => facility.sourceKey)).toEqual([
      "rsud-kota-tangerang",
      "rsu-kota-tangerang-selatan",
      "rsud-serpong-utara",
      "rs-sari-asih-cipondoh",
      "rsu-kabupaten-tangerang",
      "rs-sari-asih-ciputat",
    ]);
  });

  it("matches text filters case-insensitively and combines every supported dimension", () => {
    const results = filterFacilities(facilities, {
      city: "Kota Tangerang",
      area: "cipondoh",
      facilityType: "RUMAH_SAKIT",
      supportsBpjs: true,
      hasEmergencyUnit: true,
      service: "PENYAKIT DALAM",
      specialty: "radiologi",
    });

    expect(results.map((facility) => facility.sourceKey)).toEqual([
      "rs-sari-asih-cipondoh",
    ]);
  });

  it("does not treat null as false evidence", () => {
    const falseBpjs = filterFacilities(facilities, { supportsBpjs: false });
    const falseEmergency = filterFacilities(facilities, { hasEmergencyUnit: false });

    expect(falseBpjs).toEqual([]);
    expect(falseEmergency).toEqual([]);
  });

  it("derives sorted filter options and narrows area to the selected city", () => {
    const allOptions = deriveFacilityFilterOptions(facilities);
    const southOptions = deriveFacilityFilterOptions(facilities, "Tangerang Selatan");

    expect(allOptions.cities).toEqual([
      "Kabupaten Tangerang",
      "Kota Tangerang",
      "Tangerang Selatan",
    ]);
    expect(southOptions.areas).toEqual([
      "Ciputat",
      "Pamulang",
      "Pondok Aren",
      "Serpong",
      "Serpong Utara",
    ]);
    expect(allOptions.services).toContain("Penyakit Dalam");
    expect(allOptions.specialties).toContain("Patologi Klinik");
  });

  it("returns no result for a deliberate unsupported combination", () => {
    expect(
      filterFacilities(facilities, {
        city: "Kabupaten Tangerang",
        supportsBpjs: true,
        service: "Dokter Umum",
      }),
    ).toEqual([]);
  });

  it("parses strict URL query booleans and rejects unsupported values", () => {
    expect(
      facilityQuerySchema.parse({
        city: "Kota Tangerang",
        supportsBpjs: "true",
        hasEmergencyUnit: "false",
      }),
    ).toMatchObject({ supportsBpjs: true, hasEmergencyUnit: false });

    expect(() => facilityQuerySchema.parse({ supportsBpjs: "yes" })).toThrow();
    expect(() => facilityQuerySchema.parse({ ranking: "best" })).toThrow();
  });
});
