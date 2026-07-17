import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { describe, expect, it } from "vitest";

const schema = readFileSync(resolve(process.cwd(), "prisma/schema.prisma"), "utf8");

describe("Packet 08 daily-care Prisma schema", () => {
  it.each([
    ["MedicationStatus", ["ACTIVE", "PAUSED", "ENDED"]],
    ["MedicationLogStatus", ["TAKEN", "MISSED", "SKIPPED"]],
    ["ReminderType", ["MEDICATION", "CHECK_IN", "DOCTOR_VISIT", "BPJS", "OTHER"]],
    ["ReminderStatus", ["UPCOMING", "DONE", "MISSED", "SKIPPED"]],
  ])("defines locked enum %s", (name, values) => {
    const block = schema.match(new RegExp(`enum ${name} \\{([\\s\\S]*?)\\n\\}`))?.[1] ?? "";
    for (const value of values) expect(block).toContain(value);
  });

  it.each(["Medication", "MedicationLog", "Reminder", "HealthNote"])(
    "defines profile-bound model %s",
    (name) => {
      const block = schema.match(new RegExp(`model ${name} \\{([\\s\\S]*?)\\n\\}`))?.[1] ?? "";
      expect(block).toContain("patientProfileId");
      expect(block).toContain("patientProfile");
    },
  );

  it("defines the documented profile indexes", () => {
    expect(schema).toContain("@@index([patientProfileId, status])");
    expect(schema).toContain("@@index([patientProfileId, status, scheduledAt])");
  });
});
