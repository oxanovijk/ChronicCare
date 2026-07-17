import { describe, expect, it, vi } from "vitest";

import type { CaregiverAuthContext } from "@/lib/auth/caregiver";
import {
  createPatientProfileSchema,
  patchPatientProfileSchema,
} from "@/lib/patient-profile/schemas";
import {
  createPatientProfile,
  deriveSetupChecklist,
  patientProfileDto,
  PatientProfileError,
  updatePatientProfile,
} from "@/lib/patient-profile/service";

const owner: CaregiverAuthContext = {
  actorType: "CAREGIVER",
  user: { id: "owner-id", displayName: "Dimas Pratama" },
  membership: { careCircleId: "circle-id", role: "OWNER" },
};

const family: CaregiverAuthContext = {
  ...owner,
  user: { id: "family-id", displayName: "Rina Pratama" },
  membership: { careCircleId: "circle-id", role: "FAMILY_MEMBER" },
};

type ProfileRecord = Parameters<typeof deriveSetupChecklist>[0];

function profile(overrides: Partial<ProfileRecord> = {}): ProfileRecord {
  return {
    id: "profile-id",
    displayName: "Maya Pratama",
    relationshipLabel: "Maya",
    dateOfBirth: null,
    city: null,
    locationLabel: null,
    primaryConditions: [],
    primaryConditionsStatus: "UNKNOWN",
    allergies: [],
    allergiesStatus: "UNKNOWN",
    currentMedicationsStatus: "UNKNOWN",
    emergencyContactName: null,
    emergencyContactPhone: null,
    emergencyContactStatus: "UNKNOWN",
    bpjsMembershipStatus: "UNKNOWN",
    bpjsNumberLast4: null,
    usualFacilityName: null,
    ...overrides,
  };
}

describe("Patient Profile progressive API", () => {
  it("accepts minimum identity and rejects client authorization fields", () => {
    expect(
      createPatientProfileSchema.parse({
        displayName: "Maya Pratama",
        relationshipLabel: "Maya",
      }),
    ).toEqual({ displayName: "Maya Pratama", relationshipLabel: "Maya" });
    expect(
      createPatientProfileSchema.safeParse({
        displayName: "Maya Pratama",
        relationshipLabel: "Maya",
        role: "OWNER",
        careCircleId: "other-circle",
      }).success,
    ).toBe(false);
  });

  it("rejects full BPJS values and client-made medication REPORTED state", () => {
    expect(
      patchPatientProfileSchema.safeParse({ bpjsNumberLast4: "12345678901" })
        .success,
    ).toBe(false);
    expect(
      patchPatientProfileSchema.safeParse({
        currentMedicationsStatus: "REPORTED",
      }).success,
    ).toBe(false);
  });

  it("derives the deterministic setup checklist without a percentage", () => {
    const checklist = deriveSetupChecklist(profile());
    expect(checklist.recommendedActions).toEqual([
      "REVIEW_ALLERGIES",
      "REVIEW_CURRENT_MEDICATIONS",
      "REVIEW_EMERGENCY_CONTACT",
      "REVIEW_PRIMARY_CONDITIONS",
      "REVIEW_BPJS_STATUS",
      "ADD_DATE_OF_BIRTH",
      "ADD_LOCATION",
      "ADD_USUAL_FACILITY",
    ]);
    expect(checklist).not.toHaveProperty("completionPercentage");
  });

  it("whitelists the profile DTO and excludes internal or future context", () => {
    const dto = patientProfileDto({
      ...profile(),
      careCircleId: "must-not-leak",
      codeHash: "must-not-leak",
      sessionToken: "must-not-leak",
      unconfirmedExtraction: { summary: "must-not-leak" },
    } as ProfileRecord);

    expect(dto).not.toHaveProperty("careCircleId");
    expect(dto).not.toHaveProperty("codeHash");
    expect(dto).not.toHaveProperty("sessionToken");
    expect(dto).not.toHaveProperty("unconfirmedExtraction");
  });

  it("creates a minimum profile with all optional facts UNKNOWN", async () => {
    const tx = {
      $queryRaw: vi.fn().mockResolvedValue([]),
      patientProfile: {
        count: vi.fn().mockResolvedValue(0),
        create: vi.fn().mockResolvedValue(profile()),
      },
      auditEvent: { create: vi.fn().mockResolvedValue({}) },
    };
    const db = {
      $transaction: vi.fn(
        async (operation: (transaction: typeof tx) => Promise<unknown>) =>
          operation(tx),
      ),
    };

    const result = await createPatientProfile(
      owner,
      { displayName: "Maya Pratama", relationshipLabel: "Maya" },
      { db: db as never, requestId: "req-create" },
    );

    const data = tx.patientProfile.create.mock.calls[0][0].data;
    expect(data).toEqual(
      expect.objectContaining({
        careCircleId: "circle-id",
        primaryConditionsStatus: "UNKNOWN",
        allergiesStatus: "UNKNOWN",
        currentMedicationsStatus: "UNKNOWN",
        emergencyContactStatus: "UNKNOWN",
        bpjsMembershipStatus: "UNKNOWN",
      }),
    );
    expect(result.setupChecklist.minimumIdentityComplete).toBe(true);
  });

  it("keeps profile creation Owner-only and enforces the two-profile limit", async () => {
    await expect(
      createPatientProfile(family, {
        displayName: "Raka Pratama",
        relationshipLabel: "Raka",
      }),
    ).rejects.toMatchObject({ code: "FORBIDDEN" });

    const tx = {
      $queryRaw: vi.fn().mockResolvedValue([]),
      patientProfile: { count: vi.fn().mockResolvedValue(2) },
    };
    const db = {
      $transaction: vi.fn(
        async (operation: (transaction: typeof tx) => Promise<unknown>) =>
          operation(tx),
      ),
    };
    await expect(
      createPatientProfile(
        owner,
        { displayName: "Third", relationshipLabel: "Third" },
        { db: db as never },
      ),
    ).rejects.toEqual(
      new PatientProfileError("PATIENT_PROFILE_LIMIT_REACHED"),
    );
  });

  it("allows Family Member progressive updates and clears BPJS suffix", async () => {
    const existing = profile({
      bpjsMembershipStatus: "REGISTERED",
      bpjsNumberLast4: "2468",
    });
    const update = vi.fn().mockResolvedValue(
      profile({ bpjsMembershipStatus: "UNKNOWN", bpjsNumberLast4: null }),
    );
    const tx = {
      patientProfile: {
        findFirst: vi.fn().mockResolvedValue(existing),
        update,
      },
      auditEvent: { create: vi.fn().mockResolvedValue({}) },
    };
    const db = {
      $transaction: vi.fn(
        async (operation: (transaction: typeof tx) => Promise<unknown>) =>
          operation(tx),
      ),
    };

    await updatePatientProfile(
      family,
      "profile-id",
      { bpjsMembershipStatus: "UNKNOWN" },
      { db: db as never },
    );

    expect(update.mock.calls[0][0].data.bpjsNumberLast4).toBeNull();
    expect(update.mock.calls[0][0].data.updatedByUserId).toBe("family-id");
  });

  it("keeps an explicit empty array UNKNOWN instead of inventing NONE_REPORTED", async () => {
    const update = vi.fn().mockResolvedValue(profile());
    const tx = {
      patientProfile: {
        findFirst: vi.fn().mockResolvedValue(profile()),
        update,
      },
      auditEvent: { create: vi.fn().mockResolvedValue({}) },
    };
    const db = {
      $transaction: vi.fn(
        async (operation: (transaction: typeof tx) => Promise<unknown>) =>
          operation(tx),
      ),
    };

    await updatePatientProfile(
      family,
      "profile-id",
      { allergies: [] },
      { db: db as never },
    );

    expect(update.mock.calls[0][0].data.allergiesStatus).toBe("UNKNOWN");
  });
});
