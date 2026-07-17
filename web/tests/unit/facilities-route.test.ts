import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({ resolveCaregiverAuthContext: vi.fn() }));

vi.mock("@/lib/auth/caregiver", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@/lib/auth/caregiver")>()),
  resolveCaregiverAuthContext: mocks.resolveCaregiverAuthContext,
}));

import { GET as getBpjsGuides } from "@/app/api/v1/bpjs-guides/route";
import { GET as getFacilities } from "@/app/api/v1/facilities/route";
import { CaregiverAuthError } from "@/lib/auth/caregiver";

const ownerContext = {
  actorType: "CAREGIVER" as const,
  user: { id: "owner-id", displayName: "Dimas Pratama" },
  membership: { careCircleId: "circle-id", role: "OWNER" as const },
};

describe("Packet 10 facility and BPJS routes", () => {
  beforeEach(() => {
    mocks.resolveCaregiverAuthContext.mockReset();
    mocks.resolveCaregiverAuthContext.mockResolvedValue(ownerContext);
  });

  it("returns deterministic filtered facilities to an authenticated caregiver", async () => {
    const response = await getFacilities(
      new Request("http://localhost/api/v1/facilities?city=Kota%20Tangerang&supportsBpjs=true&service=penyakit%20dalam"),
    );
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(response.headers.get("Cache-Control")).toBe("private, no-store");
    expect(body.data.total).toBe(3);
    expect(body.data.items.map((item: { sourceKey: string }) => item.sourceKey)).toEqual([
      "rsud-kota-tangerang",
      "rs-sari-asih-cipondoh",
      "rsu-kabupaten-tangerang",
    ]);
    expect(body.data.items[0]).toEqual(expect.objectContaining({ sourceLabel: expect.any(String), lastReviewedAt: "2026-07-17" }));
    expect(body.data.filterOptions.areas).toContain("Cipondoh");
  });

  it("returns all versioned BPJS guides without research-only fields", async () => {
    const response = await getBpjsGuides();
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(response.headers.get("Cache-Control")).toBe("private, no-store");
    expect(body.data).toMatchObject({ total: 7, version: "packet10.v1" });
    expect(body.data.items[0]).not.toHaveProperty("requiredItems");
    expect(JSON.stringify(body)).not.toContain("imageLookup");
  });

  it("allows a Family Member through the same caregiver boundary", async () => {
    mocks.resolveCaregiverAuthContext.mockResolvedValue({
      ...ownerContext,
      membership: { ...ownerContext.membership, role: "FAMILY_MEMBER" },
    });

    expect((await getFacilities(new Request("http://localhost/api/v1/facilities"))).status).toBe(200);
    expect((await getBpjsGuides()).status).toBe(200);
  });

  it("rejects unsupported or malformed query parameters", async () => {
    const malformed = await getFacilities(new Request("http://localhost/api/v1/facilities?supportsBpjs=yes"));
    const ranking = await getFacilities(new Request("http://localhost/api/v1/facilities?ranking=best"));

    expect(malformed.status).toBe(400);
    expect(ranking.status).toBe(400);
    expect((await ranking.json()).error).toEqual(expect.objectContaining({ code: "VALIDATION_ERROR" }));
  });

  it("returns a generic denial before exposing static data", async () => {
    mocks.resolveCaregiverAuthContext.mockRejectedValue(new CaregiverAuthError("UNAUTHENTICATED"));

    const response = await getFacilities(new Request("http://localhost/api/v1/facilities"));
    const body = await response.json();

    expect(response.status).toBe(401);
    expect(body.error.code).toBe("UNAUTHENTICATED");
    expect(body).not.toHaveProperty("data");
  });
});
