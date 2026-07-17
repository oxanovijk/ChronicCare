import { describe, expect, it } from "vitest";

import {
  type CaregiverAuthContext,
  CaregiverAuthError,
  requireOwner,
  resolveCaregiverAuthContext,
} from "@/lib/auth/caregiver";

function context(role: "OWNER" | "FAMILY_MEMBER"): CaregiverAuthContext {
  return {
    actorType: "CAREGIVER",
    user: { id: "user-id", displayName: "Caregiver" },
    membership: { careCircleId: "circle-id", role },
  };
}

describe("caregiver membership guards", () => {
  it("distinguishes a new Auth user from a removed application user", async () => {
    const supabase = {
      auth: {
        getUser: async () => ({
          data: { user: { id: "new-auth-user" } },
          error: null,
        }),
      },
    };
    const careCircleMember = { findFirst: async () => null };

    await expect(
      resolveCaregiverAuthContext({
        supabase: supabase as never,
        db: {
          careCircleMember,
          user: { findUnique: async () => null },
        } as never,
      }),
    ).rejects.toEqual(new CaregiverAuthError("ONBOARDING_REQUIRED"));

    await expect(
      resolveCaregiverAuthContext({
        supabase: supabase as never,
        db: {
          careCircleMember,
          user: { findUnique: async () => ({ id: "new-auth-user" }) },
        } as never,
      }),
    ).rejects.toEqual(new CaregiverAuthError("FORBIDDEN"));
  });

  it("rejects unauthenticated callers from Owner-only actions", () => {
    expect(() => requireOwner(null)).toThrow(
      new CaregiverAuthError("UNAUTHENTICATED"),
    );
  });

  it("allows Owner and keeps the server-resolved context", () => {
    const owner = context("OWNER");
    expect(requireOwner(owner)).toBe(owner);
  });

  it("rejects Family Member from Owner-only actions", () => {
    expect(() => requireOwner(context("FAMILY_MEMBER"))).toThrow(
      new CaregiverAuthError("FORBIDDEN"),
    );
  });
});
