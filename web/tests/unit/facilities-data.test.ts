import { describe, expect, it } from "vitest";

import { bpjsGuides, facilities } from "@/lib/facilities/data";
import { bpjsGuideSchema, facilitySchema } from "@/lib/facilities/schemas";

describe("Packet 10 static facility data", () => {
  it("loads exactly 20 uniquely keyed facilities", () => {
    expect(facilities).toHaveLength(20);
    expect(new Set(facilities.map((facility) => facility.sourceKey)).size).toBe(20);
  });

  it("loads seven uniquely identified packet10.v1 BPJS guides", () => {
    expect(bpjsGuides).toHaveLength(7);
    expect(new Set(bpjsGuides.map((guide) => guide.id)).size).toBe(7);
    expect(bpjsGuides.every((guide) => guide.version === "packet10.v1")).toBe(true);
  });

  it("keeps null as unknown while requiring source-backed searchable data", () => {
    expect(facilities.some((facility) => facility.supportsBpjs === null)).toBe(true);
    expect(facilities.some((facility) => facility.hasEmergencyUnit === null)).toBe(true);
    expect(facilities.every((facility) => facility.services.length > 0)).toBe(true);
    expect(facilities.every((facility) => facility.sourceUrl.startsWith("https://"))).toBe(true);
    expect(facilities.every((facility) => /^2026-\d{2}-\d{2}$/.test(facility.lastReviewedAt))).toBe(true);
  });

  it("rejects raw research fields and malformed guide copy", () => {
    expect(() =>
      facilitySchema.parse({
        ...facilities[0],
        imageLookup: { provider: "GOOGLE_PLACES" },
      }),
    ).toThrow();
    expect(() =>
      bpjsGuideSchema.parse({
        ...bpjsGuides[0],
        sourceUrl: "https://example.com/not-official",
      }),
    ).toThrow();
  });
});
