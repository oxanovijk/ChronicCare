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
