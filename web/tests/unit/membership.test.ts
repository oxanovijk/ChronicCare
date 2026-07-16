import { describe, expect, it } from "vitest";

import {
  type CaregiverAuthContext,
  CaregiverAuthError,
  requireOwner,
} from "@/lib/auth/caregiver";

function context(role: "OWNER" | "FAMILY_MEMBER"): CaregiverAuthContext {
  return {
    actorType: "CAREGIVER",
    user: { id: "user-id", displayName: "Caregiver" },
    membership: { careCircleId: "circle-id", role },
  };
}

describe("caregiver membership guards", () => {
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
