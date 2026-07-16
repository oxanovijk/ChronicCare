import { z } from "zod";

const factStatus = z.enum(["UNKNOWN", "NONE_REPORTED", "REPORTED"]);
const bpjsStatus = z.enum(["UNKNOWN", "NOT_REGISTERED", "REGISTERED"]);

export const minimumPatientProfileFacts = {
  primaryConditions: [],
  primaryConditionsStatus: "UNKNOWN",
  allergies: [],
  allergiesStatus: "UNKNOWN",
  currentMedicationsStatus: "UNKNOWN",
  emergencyContactName: null,
  emergencyContactPhone: null,
  emergencyContactStatus: "UNKNOWN",
  bpjsNumberLast4: null,
  bpjsMembershipStatus: "UNKNOWN",
} as const;

export const patientProfileFactsSchema = z
  .object({
    primaryConditions: z.array(z.string().trim().min(1)),
    primaryConditionsStatus: factStatus,
    allergies: z.array(z.string().trim().min(1)),
    allergiesStatus: factStatus,
    currentMedicationsStatus: z.enum(["UNKNOWN", "NONE_REPORTED"]),
    emergencyContactName: z.string().trim().min(1).nullable(),
    emergencyContactPhone: z.string().trim().min(1).nullable(),
    emergencyContactStatus: factStatus,
    bpjsNumberLast4: z.string().regex(/^\d{4}$/).nullable(),
    bpjsMembershipStatus: bpjsStatus,
  })
  .superRefine((facts, context) => {
    for (const [statusKey, valueKey] of [
      ["primaryConditionsStatus", "primaryConditions"],
      ["allergiesStatus", "allergies"],
    ] as const) {
      const hasValues = facts[valueKey].length > 0;
      if ((facts[statusKey] === "REPORTED") !== hasValues) {
        context.addIssue({
          code: "custom",
          message: `${statusKey} contradicts ${valueKey}`,
          path: [statusKey],
        });
      }
    }

    const hasEmergencyContact = Boolean(
      facts.emergencyContactName || facts.emergencyContactPhone,
    );
    if ((facts.emergencyContactStatus === "REPORTED") !== hasEmergencyContact) {
      context.addIssue({
        code: "custom",
        message: "emergencyContactStatus contradicts the contact value",
        path: ["emergencyContactStatus"],
      });
    }

    if (
      facts.bpjsMembershipStatus !== "REGISTERED" &&
      facts.bpjsNumberLast4 !== null
    ) {
      context.addIssue({
        code: "custom",
        message: "BPJS suffix requires REGISTERED status",
        path: ["bpjsNumberLast4"],
      });
    }
  });
