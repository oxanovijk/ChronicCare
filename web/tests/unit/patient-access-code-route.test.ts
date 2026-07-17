import { beforeEach, describe, expect, it, vi } from "vitest";

const { resolveCaregiverAuthContext, rotatePatientAccessCode } = vi.hoisted(
  () => ({
    resolveCaregiverAuthContext: vi.fn(),
    rotatePatientAccessCode: vi.fn(),
  }),
);

vi.mock("@/lib/auth/caregiver", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@/lib/auth/caregiver")>()),
  resolveCaregiverAuthContext,
}));

vi.mock("@/lib/patient-access/service", () => ({
  rotatePatientAccessCode,
}));

import { POST } from "@/app/api/v1/patient-profiles/[patientProfileId]/access-code/route";
import { CaregiverAuthError } from "@/lib/auth/caregiver";

const patientProfileId = "10000000-0000-4000-8000-000000000004";
const routeContext = { params: Promise.resolve({ patientProfileId }) };
const owner = {
  actorType: "CAREGIVER" as const,
  user: { id: "owner-id", displayName: "Dimas Pratama" },
  membership: { careCircleId: "circle-id", role: "OWNER" as const },
};

function request(origin = "http://localhost") {
  return new Request(
    `http://localhost/api/v1/patient-profiles/${patientProfileId}/access-code`,
    { method: "POST", headers: { Origin: origin } },
  );
}

describe("POST /patient-profiles/:patientProfileId/access-code", () => {
  beforeEach(() => {
    resolveCaregiverAuthContext.mockReset();
    rotatePatientAccessCode.mockReset();
  });

  it("returns the one-time raw code only from an authorized rotation", async () => {
    resolveCaregiverAuthContext.mockResolvedValue(owner);
    rotatePatientAccessCode.mockResolvedValue({
      code: "482913",
      expiresAt: null,
    });

    const response = await POST(request(), routeContext);
    const body = await response.json();

    expect(response.status).toBe(201);
    expect(response.headers.get("Cache-Control")).toContain("no-store");
    expect(rotatePatientAccessCode).toHaveBeenCalledWith(
      owner,
      patientProfileId,
      expect.objectContaining({ requestId: expect.stringMatching(/^req_/) }),
    );
    expect(body.data).toEqual({ code: "482913", expiresAt: null });
  });

  it("returns generic authorization errors for Family Member and Patient", async () => {
    resolveCaregiverAuthContext.mockResolvedValue({
      ...owner,
      membership: { careCircleId: "circle-id", role: "FAMILY_MEMBER" },
    });
    rotatePatientAccessCode.mockRejectedValueOnce(
      new CaregiverAuthError("FORBIDDEN"),
    );
    expect((await POST(request(), routeContext)).status).toBe(403);

    resolveCaregiverAuthContext.mockRejectedValueOnce(
      new CaregiverAuthError("UNAUTHENTICATED"),
    );
    expect((await POST(request(), routeContext)).status).toBe(401);
  });

  it("rejects cross-origin mutations before rotating a code", async () => {
    resolveCaregiverAuthContext.mockResolvedValue(owner);
    const response = await POST(request("https://evil.example"), routeContext);

    expect(response.status).toBe(403);
    expect(rotatePatientAccessCode).not.toHaveBeenCalled();
  });
});
