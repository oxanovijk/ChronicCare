import { beforeEach, describe, expect, it, vi } from "vitest";

const { exchangeCodeForSession, getUser, completeOwnerOnboarding } = vi.hoisted(
  () => ({
    exchangeCodeForSession: vi.fn(),
    getUser: vi.fn(),
    completeOwnerOnboarding: vi.fn(),
  }),
);
vi.mock("@/lib/supabase/server", () => ({
  createSupabaseServerClient: async () => ({
    auth: { exchangeCodeForSession, getUser },
  }),
}));
vi.mock("@/lib/onboarding/owner-service", () => ({
  completeOwnerOnboarding,
}));

import { GET } from "@/app/auth/callback/route";

describe("caregiver Auth callback", () => {
  beforeEach(() => {
    exchangeCodeForSession.mockReset();
    getUser.mockReset();
    completeOwnerOnboarding.mockReset();
    getUser.mockResolvedValue({
      data: { user: { id: "auth-user", user_metadata: {} } },
      error: null,
    });
  });

  it("exchanges the code and redirects only to a local caregiver path", async () => {
    exchangeCodeForSession.mockResolvedValue({ error: null });
    const response = await GET(
      new Request(
        "http://localhost/auth/callback?code=pkce-code&next=%2Fcaregiver%2Finvite%2Ftoken",
      ),
    );
    expect(exchangeCodeForSession).toHaveBeenCalledWith("pkce-code");
    expect(response.headers.get("location")).toBe(
      "http://localhost/caregiver/invite/token",
    );
  });

  it("blocks open redirects and handles an invalid exchange generically", async () => {
    exchangeCodeForSession.mockResolvedValue({ error: null });
    const unsafe = await GET(
      new Request(
        "http://localhost/auth/callback?code=pkce-code&next=https://evil.example",
      ),
    );
    expect(unsafe.headers.get("location")).toBe("http://localhost/caregiver");

    exchangeCodeForSession.mockResolvedValueOnce({ error: { message: "private" } });
    const failed = await GET(
      new Request("http://localhost/auth/callback?code=bad-code"),
    );
    expect(failed.headers.get("location")).toBe(
      "http://localhost/caregiver?auth=callback-error",
    );
  });

  it("completes Owner onboarding from validated signup metadata", async () => {
    exchangeCodeForSession.mockResolvedValue({ error: null });
    getUser.mockResolvedValue({
      data: {
        user: {
          id: "new-owner",
          user_metadata: {
            display_name: "Nadia Santoso",
            care_circle_name: "Keluarga Nadia",
            role: "FAMILY_MEMBER",
            careCircleId: "untrusted-circle",
          },
        },
      },
      error: null,
    });
    completeOwnerOnboarding.mockResolvedValue({ membership: { role: "OWNER" } });

    const response = await GET(
      new Request("http://localhost/auth/callback?code=pkce-code&next=%2Fcaregiver"),
    );

    expect(completeOwnerOnboarding).toHaveBeenCalledWith(
      { id: "new-owner" },
      {
        displayName: "Nadia Santoso",
        careCircleName: "Keluarga Nadia",
      },
      expect.objectContaining({ requestId: expect.stringMatching(/^req_/) }),
    );
    expect(response.headers.get("location")).toBe("http://localhost/caregiver");
    expect(JSON.stringify(completeOwnerOnboarding.mock.calls)).not.toContain(
      "untrusted-circle",
    );
  });

  it("keeps incomplete metadata in the resumable onboarding path", async () => {
    exchangeCodeForSession.mockResolvedValue({ error: null });
    getUser.mockResolvedValue({
      data: {
        user: {
          id: "new-owner",
          user_metadata: { display_name: "Nadia Santoso" },
        },
      },
      error: null,
    });

    const response = await GET(
      new Request("http://localhost/auth/callback?code=pkce-code&next=%2Fcaregiver"),
    );

    expect(completeOwnerOnboarding).not.toHaveBeenCalled();
    expect(response.headers.get("location")).toBe("http://localhost/caregiver");
  });
});
