import { describe, expect, it } from "vitest";

import {
  healthNoteCreateSchema,
  medicationCreateSchema,
  medicationLogCreateSchema,
  medicationPatchSchema,
  reminderCreateSchema,
  reminderPatchSchema,
} from "@/lib/daily-care/daily-care-contract";

describe("Packet 08 daily-care contracts", () => {
  it("accepts caregiver-recorded medication text and locked statuses", () => {
    expect(
      medicationCreateSchema.parse({
        name: "Metformin",
        doseText: "500 mg sesuai catatan caregiver",
        scheduleText: "Dua kali sehari",
        instructions: null,
        startDate: null,
        endDate: null,
      }),
    ).toMatchObject({ name: "Metformin" });
    expect(
      medicationPatchSchema.parse({ status: "PAUSED", updatedAt: "2026-07-17T08:00:00.000Z" }),
    ).toMatchObject({ status: "PAUSED" });
  });

  it("rejects unknown medication input and invalid log status", () => {
    expect(() =>
      medicationCreateSchema.parse({
        name: "A",
        doseText: "B",
        scheduleText: "C",
        recommendation: "naikkan dosis",
      }),
    ).toThrow();
    expect(() => medicationLogCreateSchema.parse({ status: "LATE" })).toThrow();
  });

  it("keeps reminder and health-note text within the locked bounds", () => {
    expect(
      reminderCreateSchema.parse({
        type: "DOCTOR_VISIT",
        title: "Kontrol berikutnya",
        description: null,
        scheduledAt: null,
        scheduleText: "Sesuai jadwal yang dicatat",
        relatedMedicationId: null,
      }),
    ).toMatchObject({ type: "DOCTOR_VISIT" });
    expect(
      reminderPatchSchema.parse({ status: "DONE", updatedAt: "2026-07-17T08:00:00.000Z" }),
    ).toMatchObject({ status: "DONE" });
    expect(() =>
      healthNoteCreateSchema.parse({ title: "Catatan", noteText: "x".repeat(4001), category: "CARE" }),
    ).toThrow();
  });
});
