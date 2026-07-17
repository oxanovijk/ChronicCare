import { beforeEach, describe, expect, it, vi } from "vitest";

const { completeOwnerOnboarding, resolveAuthenticatedCaregiverUser } = vi.hoisted(
  () => ({
    completeOwnerOnboarding: vi.fn(),
    resolveAuthenticatedCaregiverUser: vi.fn(),
  }),
);

vi.mock("@/lib/auth/caregiver", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@/lib/auth/caregiver")>()),
  resolveAuthenticatedCaregiverUser,
}));
vi.mock("@/lib/onboarding/owner-service", () => ({ completeOwnerOnboarding }));

import { POST } from "@/app/api/v1/onboarding/owner/route";

function request(body: unknown, origin = "http://localhost") {
  return new Request("http://localhost/api/v1/onboarding/owner", {
    method: "POST",
    headers: { Origin: origin, "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

describe("POST /onboarding/owner", () => {
  beforeEach(() => {
    completeOwnerOnboarding.mockReset();
    resolveAuthenticatedCaregiverUser.mockReset();
  });

  it("uses the authenticated Supabase user and returns 201", async () => {
    const authUser = { id: "auth-owner" };
    const input = { displayName: "Nadia", careCircleName: "Keluarga Nadia" };
    resolveAuthenticatedCaregiverUser.mockResolvedValue(authUser);
    completeOwnerOnboarding.mockResolvedValue({
      actorType: "CAREGIVER",
      user: { id: authUser.id, displayName: "Nadia" },
      membership: { careCircleId: "circle-id", role: "OWNER" },
    });

    const response = await POST(request(input));

    expect(response.status).toBe(201);
    expect(completeOwnerOnboarding).toHaveBeenCalledWith(
      authUser,
      input,
      expect.objectContaining({ requestId: expect.stringMatching(/^req_/) }),
    );
  });

  it("rejects cross-origin and client-selected role fields", async () => {
    expect((await POST(request({ displayName: "N", careCircleName: "K" }, "https://evil.example"))).status).toBe(403);
    resolveAuthenticatedCaregiverUser.mockResolvedValue({ id: "auth-owner" });
    expect(
      (
        await POST(
          request({
            displayName: "Nadia",
            careCircleName: "Keluarga Nadia",
            role: "OWNER",
          }),
        )
      ).status,
    ).toBe(400);
    expect(completeOwnerOnboarding).not.toHaveBeenCalled();
  });
});
