import { describe, expect, it } from "vitest";

import {
  minimumPatientProfileFacts,
  patientProfileFactsSchema,
} from "@/lib/db/profile-facts";

describe("Patient Profile fact states", () => {
  it("keeps every optional fact unknown for a minimum profile", () => {
    expect(patientProfileFactsSchema.parse(minimumPatientProfileFacts)).toEqual(
      minimumPatientProfileFacts,
    );
  });

  it.each([
    {
      ...minimumPatientProfileFacts,
      primaryConditionsStatus: "REPORTED",
    },
    {
      ...minimumPatientProfileFacts,
      allergies: ["Synthetic allergy"],
    },
    {
      ...minimumPatientProfileFacts,
      emergencyContactName: "Synthetic contact",
    },
    {
      ...minimumPatientProfileFacts,
      bpjsNumberLast4: "1234",
    },
    {
      ...minimumPatientProfileFacts,
      bpjsMembershipStatus: "REGISTERED",
      bpjsNumberLast4: "12AB",
    },
    {
      ...minimumPatientProfileFacts,
      currentMedicationsStatus: "REPORTED",
    },
  ])("rejects a contradictory fact/value combination", (facts) => {
    expect(patientProfileFactsSchema.safeParse(facts).success).toBe(false);
  });

  it("accepts reported facts and a registered BPJS suffix", () => {
    expect(
      patientProfileFactsSchema.safeParse({
        ...minimumPatientProfileFacts,
        primaryConditions: ["Diabetes tipe 2"],
        primaryConditionsStatus: "REPORTED",
        emergencyContactName: "Synthetic contact",
        emergencyContactStatus: "REPORTED",
        bpjsMembershipStatus: "REGISTERED",
        bpjsNumberLast4: "2468",
      }).success,
    ).toBe(true);
  });
});
