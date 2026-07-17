import { beforeEach, describe, expect, it, vi } from "vitest";

const { resolveAuthContext } = vi.hoisted(() => ({
  resolveAuthContext: vi.fn(),
}));

vi.mock("@/lib/auth/patient", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/auth/patient")>();

  return {
    ...actual,
    resolveAuthContext,
  };
});

import { GET } from "@/app/api/v1/auth/me/route";
import { PatientAuthError } from "@/lib/auth/patient";

describe("GET /api/v1/auth/me", () => {
  beforeEach(() => {
    resolveAuthContext.mockReset();
  });

  it("returns verified context with no-store caching", async () => {
    resolveAuthContext.mockResolvedValue({
      actorType: "CAREGIVER",
      user: { id: "owner-id", displayName: "Dimas Pratama" },
      membership: { careCircleId: "circle-id", role: "OWNER" },
    });

    const response = await GET();
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(response.headers.get("Cache-Control")).toContain("no-store");
    expect(body.data.membership.role).toBe("OWNER");
    expect(body.data).not.toHaveProperty("token");
    expect(body.data).not.toHaveProperty("session");
  });

  it("returns a generic unauthenticated error", async () => {
    resolveAuthContext.mockRejectedValue(
      new PatientAuthError("UNAUTHENTICATED"),
    );

    const response = await GET();
    const body = await response.json();

    expect(response.status).toBe(401);
    expect(body.error).toEqual(
      expect.objectContaining({
        code: "UNAUTHENTICATED",
        message: "Silakan masuk untuk melanjutkan.",
      }),
    );
    expect(JSON.stringify(body)).not.toContain("token");
    expect(JSON.stringify(body)).not.toContain("session");
  });

  it("preserves onboarding recovery across a server module boundary", async () => {
    const boundaryError = Object.assign(new Error("ONBOARDING_REQUIRED"), {
      name: "CaregiverAuthError",
      code: "ONBOARDING_REQUIRED",
      onboardingDefaults: {
        displayName: "Nadia Santoso",
        careCircleName: "Keluarga Nadia",
      },
      providerDetail: "private-provider-detail",
      token: "private-token",
    });
    resolveAuthContext.mockRejectedValue(boundaryError);

    const response = await GET();
    const body = await response.json();

    expect(response.status).toBe(409);
    expect(body.error).toEqual(
      expect.objectContaining({
        code: "ONBOARDING_REQUIRED",
        message: "Selesaikan pendaftaran caregiver untuk melanjutkan.",
        details: {
          onboardingDefaults: {
            displayName: "Nadia Santoso",
            careCircleName: "Keluarga Nadia",
          },
        },
      }),
    );
    expect(JSON.stringify(body)).not.toContain("private-provider-detail");
    expect(JSON.stringify(body)).not.toContain("private-token");
  });

  it("logs only safe classification for an unexpected internal error", async () => {
    const consoleError = vi.spyOn(console, "error").mockImplementation(() => {});
    const internalError = Object.assign(
      new Error("private database host and user detail"),
      { code: "P2022", token: "private-token" },
    );
    resolveAuthContext.mockRejectedValue(internalError);

    const response = await GET();

    expect(response.status).toBe(500);
    expect(consoleError).toHaveBeenCalledWith(
      "API_INTERNAL_ERROR",
      expect.objectContaining({
        requestId: expect.stringMatching(/^req_/),
        errorName: "Error",
        errorCode: "P2022",
      }),
    );
    expect(JSON.stringify(consoleError.mock.calls)).not.toContain(
      "private database host",
    );
    expect(JSON.stringify(consoleError.mock.calls)).not.toContain(
      "private-token",
    );
  });

  it("returns Patient identity without caregiver membership", async () => {
    resolveAuthContext.mockResolvedValue({
      actorType: "PATIENT",
      patientProfile: {
        id: "maya-id",
        displayName: "Maya Pratama",
        relationshipLabel: "Maya",
      },
    });

    const response = await GET();
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.data.actorType).toBe("PATIENT");
    expect(body.data.patientProfile.displayName).toBe("Maya Pratama");
    expect(body.data).not.toHaveProperty("membership");
    expect(body.data).not.toHaveProperty("session");
  });
});
