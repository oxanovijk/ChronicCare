import { describe, expect, it, vi } from "vitest";

import type { AuthContext } from "@/lib/auth/patient";
import {
  getAuthorizedPatientProfile,
  PatientProfileError,
} from "@/lib/patient-profile/service";

describe("Maya/Raka Patient Profile isolation", () => {
  it("denies a Patient session before querying another profile", async () => {
    const findFirst = vi.fn();
    const context: AuthContext = {
      actorType: "PATIENT",
      patientProfile: {
        id: "maya-id",
        displayName: "Maya Pratama",
        relationshipLabel: "Maya",
      },
    };

    await expect(
      getAuthorizedPatientProfile(context, "raka-id", {
        db: { patientProfile: { findFirst } } as never,
      }),
    ).rejects.toMatchObject({ code: "FORBIDDEN" });
    expect(findFirst).not.toHaveBeenCalled();
  });

  it("scopes caregiver lookup to the server-resolved Care Circle", async () => {
    const findFirst = vi.fn().mockResolvedValue(null);
    const context: AuthContext = {
      actorType: "CAREGIVER",
      user: { id: "owner-id", displayName: "Dimas Pratama" },
      membership: { careCircleId: "server-circle", role: "OWNER" },
    };

    await expect(
      getAuthorizedPatientProfile(context, "outside-profile", {
        db: { patientProfile: { findFirst } } as never,
      }),
    ).rejects.toEqual(new PatientProfileError("NOT_FOUND"));
    expect(findFirst).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          id: "outside-profile",
          careCircleId: "server-circle",
        }),
      }),
    );
  });
});
