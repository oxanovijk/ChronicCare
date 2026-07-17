import { describe, expect, it } from "vitest";

import {
  checkInRequestSchema,
  shouldEscalateCheckIn,
} from "@/lib/daily-care/check-in-contract";

describe("check-in contract", () => {
  it("accepts the locked nullable daily-care fields", () => {
    expect(
      checkInRequestSchema.parse({
        mood: "GOOD",
        conditionText: null,
        painLevel: null,
        medicationTaken: null,
        complaintText: null,
        needsFamilyHelp: false,
      }),
    ).toEqual({
      mood: "GOOD",
      conditionText: null,
      painLevel: null,
      medicationTaken: null,
      complaintText: null,
      needsFamilyHelp: false,
    });
  });

  it("rejects extra authorization fields and out-of-range health input", () => {
    expect(() =>
      checkInRequestSchema.parse({
        mood: "UNWELL",
        painLevel: 11,
        role: "OWNER",
        patientProfileId: "another-profile",
      }),
    ).toThrow();
  });

  it("routes explicit urgent phrases to help without classifying routine notes", () => {
    expect(
      shouldEscalateCheckIn({
        conditionText: "Saya sulit bernapas dan nyeri dada",
        complaintText: null,
      }),
    ).toBe(true);
    expect(
      shouldEscalateCheckIn({
        conditionText: "Sedikit lemas setelah bangun tidur",
        complaintText: null,
      }),
    ).toBe(false);
  });
});
