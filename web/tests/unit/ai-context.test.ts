import { describe, expect, it, vi } from "vitest";

import { demoFallbackExtraction } from "@/lib/ai/extraction/fallback";
import { buildChatContext } from "@/lib/ai/context/build-chat-context";
import { PatientAuthError } from "@/lib/auth/patient";
import { PatientProfileError } from "@/lib/patient-profile/service";

const mayaId = "10000000-0000-4000-8000-000000000004";
const caregiver = {
  actorType: "CAREGIVER" as const,
  user: { id: "owner-id", displayName: "Dimas Pratama" },
  membership: { careCircleId: "circle-id", role: "OWNER" as const },
};
const family = {
  ...caregiver,
  user: { id: "family-id", displayName: "Rina Pratama" },
  membership: { careCircleId: "circle-id", role: "FAMILY_MEMBER" as const },
};
const patient = {
  actorType: "PATIENT" as const,
  patientProfile: {
    id: mayaId,
    displayName: "Maya Pratama",
    relationshipLabel: "Maya",
  },
};
const profile = {
  id: mayaId,
  careCircleId: "circle-id",
  displayName: "Maya Pratama",
  relationshipLabel: "Maya",
  primaryConditions: ["Diabetes tipe 2"],
  primaryConditionsStatus: "REPORTED" as const,
  allergies: [] as string[],
  allergiesStatus: "UNKNOWN" as const,
  currentMedicationsStatus: "REPORTED" as const,
  bpjsMembershipStatus: "REGISTERED" as const,
};

function contextDb(activeProfile: Record<string, unknown> | null = profile) {
  return {
    patientProfile: { findFirst: vi.fn().mockResolvedValue(activeProfile) },
    checkIn: {
      findFirst: vi.fn().mockResolvedValue({
        mood: "OKAY",
        conditionText: "Sedikit lemas.",
        complaintText: null,
        medicationTaken: true,
        needsFamilyHelp: false,
        createdAt: new Date("2026-07-17T08:00:00.000Z"),
      }),
    },
    medication: {
      findMany: vi.fn().mockResolvedValue([
        {
          name: "Metformin",
          doseText: "500 mg sesuai catatan caregiver",
          scheduleText: "Dua kali sehari",
          instructions: "Ikuti resep dokter.",
        },
      ]),
    },
    reminder: { findMany: vi.fn().mockResolvedValue([]) },
  };
}

describe("profile-bound AI context", () => {
  it("uses the confirmed Packet 09 selector and reduces it to safe summaries", async () => {
    const db = contextDb();
    const selector = vi.fn().mockResolvedValue([
      {
        documentId: "document-id",
        title: "Hasil kontrol sintetis",
        category: "LAB_RESULT",
        schemaVersion: "document-extraction.v1",
        structuredData: demoFallbackExtraction,
        rawText: "must never be consumed",
      },
    ]);

    const result = await buildChatContext(caregiver, mayaId, {
      db: db as never,
      confirmedSummarySelector: selector,
    });

    expect(db.patientProfile.findFirst).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          id: mayaId,
          careCircleId: "circle-id",
          status: "ACTIVE",
          deletedAt: null,
        },
      }),
    );
    expect(selector).toHaveBeenCalledWith(caregiver, mayaId, { db });
    expect(result.providerContext.confirmedDocumentSummaries).toEqual([
      expect.objectContaining({
        title: "Hasil kontrol sintetis",
        summaryAsWritten: demoFallbackExtraction.summaryAsWritten,
      }),
    ]);
    const serialized = JSON.stringify(result.providerContext);
    expect(serialized).not.toContain("must never be consumed");
    expect(serialized).not.toContain("rawText");
    expect(serialized).not.toContain("UNKNOWN");
    expect(serialized).not.toContain("bpjsNumber");
  });

  it("allows an active Family Member through the same server-side Care Circle check", async () => {
    const result = await buildChatContext(family, mayaId, {
      db: contextDb() as never,
      confirmedSummarySelector: vi.fn().mockResolvedValue([]),
    });
    expect(result.persona).toBe("CAREGIVER");
    expect(result.actorKey).toBe("CAREGIVER:family-id");
  });

  it("omits UNKNOWN and preserves the caregiver qualifier for NONE_REPORTED", async () => {
    const unknown = await buildChatContext(caregiver, mayaId, {
      db: contextDb() as never,
      confirmedSummarySelector: vi.fn().mockResolvedValue([]),
    });
    expect(unknown.providerContext.profileFacts).not.toHaveProperty("allergies");

    const noneProfile = {
      ...profile,
      primaryConditions: [] as string[],
      primaryConditionsStatus: "NONE_REPORTED" as const,
      allergiesStatus: "NONE_REPORTED" as const,
      currentMedicationsStatus: "NONE_REPORTED" as const,
      bpjsMembershipStatus: "NOT_REGISTERED" as const,
    };
    const none = await buildChatContext(caregiver, mayaId, {
      db: contextDb(noneProfile) as never,
      confirmedSummarySelector: vi.fn().mockResolvedValue([]),
    });
    const serialized = JSON.stringify(none.providerContext.profileFacts);
    expect(serialized).toMatch(/Caregiver melaporkan/i);
    expect(serialized).not.toContain("NONE_REPORTED");
  });

  it("denies deactivated/foreign profiles before any related context query", async () => {
    const db = contextDb(null);
    const selector = vi.fn();
    await expect(
      buildChatContext(caregiver, mayaId, {
        db: db as never,
        confirmedSummarySelector: selector,
      }),
    ).rejects.toEqual(new PatientProfileError("NOT_FOUND"));
    expect(db.checkIn.findFirst).not.toHaveBeenCalled();
    expect(db.medication.findMany).not.toHaveBeenCalled();
    expect(selector).not.toHaveBeenCalled();
  });

  it("binds Patient persona to its session profile and excludes document admin context", async () => {
    const selector = vi.fn();
    const result = await buildChatContext(patient, mayaId, {
      db: contextDb() as never,
      confirmedSummarySelector: selector,
    });
    expect(result.persona).toBe("PATIENT");
    expect(result.providerContext.confirmedDocumentSummaries).toEqual([]);
    expect(selector).not.toHaveBeenCalled();

    await expect(
      buildChatContext(patient, "20000000-0000-4000-8000-000000000004", {
        db: contextDb() as never,
      }),
    ).rejects.toEqual(new PatientAuthError("FORBIDDEN"));
  });
});
