import { describe, expect, it, vi } from "vitest";

import {
  CaregiverAuthError,
  resolveCaregiverAuthContext,
} from "@/lib/auth/caregiver";

describe("caregiver auth context", () => {
  it("rejects an invalid Supabase session", async () => {
    const supabase = {
      auth: {
        getUser: vi.fn().mockResolvedValue({
          data: { user: null },
          error: new Error("invalid session"),
        }),
      },
    };

    await expect(
      resolveCaregiverAuthContext({ supabase: supabase as never }),
    ).rejects.toEqual(new CaregiverAuthError("UNAUTHENTICATED"));
  });

  it("returns only verified caregiver and server-side membership fields", async () => {
    const supabase = {
      auth: {
        getUser: vi.fn().mockResolvedValue({
          data: {
            user: {
              id: "verified-user",
              user_metadata: {
                role: "OWNER",
                careCircleId: "client-circle",
              },
            },
          },
          error: null,
        }),
      },
    };
    const findFirst = vi.fn().mockResolvedValue({
      careCircleId: "server-circle",
      role: "FAMILY_MEMBER",
      user: { displayName: "Rina Pratama" },
    });

    const context = await resolveCaregiverAuthContext({
      supabase: supabase as never,
      db: { careCircleMember: { findFirst } } as never,
    });

    expect(findFirst).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          userId: "verified-user",
          status: "ACTIVE",
        }),
      }),
    );
    expect(context).toEqual({
      actorType: "CAREGIVER",
      user: { id: "verified-user", displayName: "Rina Pratama" },
      membership: {
        careCircleId: "server-circle",
        role: "FAMILY_MEMBER",
      },
    });
    expect(context).not.toHaveProperty("token");
    expect(context).not.toHaveProperty("session");
    expect(context.membership.careCircleId).not.toBe("client-circle");
  });
});
