import { beforeEach, describe, expect, it, vi } from "vitest";

const { deactivatePatientProfile, resolveCaregiverAuthContext } = vi.hoisted(
  () => ({
    deactivatePatientProfile: vi.fn(),
    resolveCaregiverAuthContext: vi.fn(),
  }),
);

vi.mock("@/lib/auth/caregiver", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@/lib/auth/caregiver")>()),
  resolveCaregiverAuthContext,
}));

vi.mock("@/lib/patient-profile/service", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@/lib/patient-profile/service")>()),
  deactivatePatientProfile,
}));

import { POST } from "@/app/api/v1/patient-profiles/[patientProfileId]/deactivate/route";
import { CaregiverAuthError } from "@/lib/auth/caregiver";

const patientProfileId = "10000000-0000-4000-8000-000000000004";
const routeContext = {
  params: Promise.resolve({ patientProfileId }),
};
const owner = {
  actorType: "CAREGIVER" as const,
  user: { id: "owner-id", displayName: "Dimas Pratama" },
  membership: { careCircleId: "circle-id", role: "OWNER" as const },
};

function request(body: unknown) {
  return new Request(
    `http://localhost/api/v1/patient-profiles/${patientProfileId}/deactivate`,
    {
      method: "POST",
      headers: {
        Origin: "http://localhost",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    },
  );
}

describe("POST /patient-profiles/:patientProfileId/deactivate", () => {
  beforeEach(() => {
    deactivatePatientProfile.mockReset();
    resolveCaregiverAuthContext.mockReset();
  });

  it("passes validated Owner input to the lifecycle service", async () => {
    resolveCaregiverAuthContext.mockResolvedValue(owner);
    deactivatePatientProfile.mockResolvedValue({
      id: patientProfileId,
      status: "END_OF_CARE",
      reason: "NO_LONGER_CARED",
      deactivatedAt: "2026-07-17T04:00:00.000Z",
    });

    const response = await POST(
      request({ reason: "NO_LONGER_CARED", note: null }),
      routeContext,
    );
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(response.headers.get("Cache-Control")).toContain("no-store");
    expect(deactivatePatientProfile).toHaveBeenCalledWith(
      owner,
      patientProfileId,
      { reason: "NO_LONGER_CARED", note: null },
      expect.objectContaining({ requestId: expect.stringMatching(/^req_/) }),
    );
    expect(body.data.status).toBe("END_OF_CARE");
  });

  it("returns generic denials for Family Member and Patient requests", async () => {
    resolveCaregiverAuthContext.mockResolvedValue({
      ...owner,
      membership: { careCircleId: "circle-id", role: "FAMILY_MEMBER" },
    });
    deactivatePatientProfile.mockRejectedValueOnce(
      new CaregiverAuthError("FORBIDDEN"),
    );
    expect(
      (
        await POST(request({ reason: "OTHER" }), routeContext)
      ).status,
    ).toBe(403);

    resolveCaregiverAuthContext.mockRejectedValueOnce(
      new CaregiverAuthError("UNAUTHENTICATED"),
    );
    const patientResponse = await POST(
      request({ reason: "OTHER" }),
      routeContext,
    );
    expect(patientResponse.status).toBe(401);
    expect(await patientResponse.json()).toEqual(
      expect.objectContaining({
        error: expect.objectContaining({ code: "UNAUTHENTICATED" }),
      }),
    );
  });

  it("rejects client authorization fields", async () => {
    resolveCaregiverAuthContext.mockResolvedValue(owner);
    const response = await POST(
      request({ reason: "OTHER", role: "OWNER" }),
      routeContext,
    );
    expect(response.status).toBe(400);
    expect(deactivatePatientProfile).not.toHaveBeenCalled();
  });
});
