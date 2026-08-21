import "server-only";

import type { PrismaClient } from "@/generated/prisma/client";
import { documentExtractionV1Schema } from "@/lib/ai/extraction/schema";
import type { AuthContext } from "@/lib/auth/patient";
import { requireBoundPatientProfile } from "@/lib/auth/patient";
import { getConfirmedExtractionSummaries } from "@/lib/documents/service";
import { PatientProfileError } from "@/lib/patient-profile/service";

type FactStatus = "UNKNOWN" | "NONE_REPORTED" | "REPORTED";

type ProviderChatContext = {
  patient: {
    displayName: string;
    relationshipLabel: string;
  };
  profileFacts: {
    primaryConditions?: string[] | string;
    allergies?: string[] | string;
    currentMedications?: string;
    bpjsMembership?: string;
  };
  latestCheckIn: null | {
    mood: string;
    conditionText: string | null;
    complaintText: string | null;
    medicationTaken: boolean | null;
    needsFamilyHelp: boolean;
    createdAt: string;
  };
  activeMedications: Array<{
    name: string;
    doseText: string;
    scheduleText: string;
    instructions: string | null;
  }>;
  upcomingReminders: Array<{
    type: string;
    title: string;
    description: string | null;
    scheduledAt: string | null;
    scheduleText: string | null;
  }>;
  confirmedDocumentSummaries: Array<{
    title: string;
    category: string;
    summaryAsWritten: string[];
  }>;
};

export type BuiltChatContext = {
  persona: "PATIENT" | "CAREGIVER";
  actorKey: string;
  careCircleId: string;
  factStatuses: {
    allergies: FactStatus;
    currentMedications: FactStatus;
  };
  providerContext: ProviderChatContext;
};

type Dependencies = {
  db?: PrismaClient;
  confirmedSummarySelector?: typeof getConfirmedExtractionSummaries;
};

function reportedFact(
  status: FactStatus,
  values: string[],
  noneStatement: string,
) {
  if (status === "REPORTED") return values;
  if (status === "NONE_REPORTED") return noneStatement;
  return undefined;
}

export async function buildChatContext(
  actor: AuthContext,
  patientProfileId: string,
  dependencies: Dependencies = {},
): Promise<BuiltChatContext> {
  if (actor.actorType === "PATIENT") {
    requireBoundPatientProfile(actor, patientProfileId);
  }

  const db = dependencies.db ?? (await import("@/lib/db/client")).prisma;
  const profile = await db.patientProfile.findFirst({
    where: {
      id: patientProfileId,
      ...(actor.actorType === "CAREGIVER"
        ? { careCircleId: actor.membership.careCircleId }
        : {}),
      status: "ACTIVE",
      deletedAt: null,
    },
    select: {
      id: true,
      careCircleId: true,
      displayName: true,
      relationshipLabel: true,
      primaryConditions: true,
      primaryConditionsStatus: true,
      allergies: true,
      allergiesStatus: true,
      currentMedicationsStatus: true,
      bpjsMembershipStatus: true,
    },
  });
  if (!profile) throw new PatientProfileError("NOT_FOUND");

  const [latestCheckIn, activeMedications, upcomingReminders, summaries] =
    await Promise.all([
      db.checkIn.findFirst({
        where: { patientProfileId },
        select: {
          mood: true,
          conditionText: true,
          complaintText: true,
          medicationTaken: true,
          needsFamilyHelp: true,
          createdAt: true,
        },
        orderBy: { createdAt: "desc" },
      }),
      db.medication.findMany({
        where: { patientProfileId, status: "ACTIVE" },
        select: {
          name: true,
          doseText: true,
          scheduleText: true,
          instructions: true,
        },
        orderBy: { createdAt: "asc" },
      }),
      db.reminder.findMany({
        where: { patientProfileId, status: "UPCOMING" },
        select: {
          type: true,
          title: true,
          description: true,
          scheduledAt: true,
          scheduleText: true,
        },
        orderBy: [{ scheduledAt: "asc" }, { createdAt: "desc" }],
        take: 5,
      }),
      actor.actorType === "CAREGIVER"
        ? (dependencies.confirmedSummarySelector ??
            getConfirmedExtractionSummaries)(actor, patientProfileId, { db })
        : Promise.resolve([]),
    ]);

  const confirmedDocumentSummaries = summaries.flatMap((summary) => {
    const parsed = documentExtractionV1Schema.safeParse(summary.structuredData);
    return parsed.success
      ? [
          {
            title: summary.title,
            category: summary.category,
            summaryAsWritten: parsed.data.summaryAsWritten.slice(0, 5),
          },
        ]
      : [];
  });

  const profileFacts: ProviderChatContext["profileFacts"] = {};
  const primaryConditions = reportedFact(
    profile.primaryConditionsStatus,
    profile.primaryConditions,
    "Caregiver melaporkan belum ada kondisi utama yang diketahui.",
  );
  if (primaryConditions) profileFacts.primaryConditions = primaryConditions;
  const allergies = reportedFact(
    profile.allergiesStatus,
    profile.allergies,
    "Caregiver melaporkan belum ada alergi yang diketahui.",
  );
  if (allergies) profileFacts.allergies = allergies;
  if (profile.currentMedicationsStatus === "NONE_REPORTED") {
    profileFacts.currentMedications =
      "Caregiver melaporkan belum ada obat aktif yang diketahui.";
  }
  if (profile.bpjsMembershipStatus === "REGISTERED") {
    profileFacts.bpjsMembership =
      "Caregiver melaporkan Patient terdaftar BPJS; konfirmasi status terkini ke BPJS atau faskes.";
  } else if (profile.bpjsMembershipStatus === "NOT_REGISTERED") {
    profileFacts.bpjsMembership =
      "Caregiver melaporkan Patient belum terdaftar BPJS; ini bukan verifikasi BPJS.";
  }

  return {
    persona: actor.actorType === "PATIENT" ? "PATIENT" : "CAREGIVER",
    actorKey:
      actor.actorType === "PATIENT"
        ? `PATIENT:${actor.patientProfile.id}`
        : `CAREGIVER:${actor.user.id}`,
    careCircleId: profile.careCircleId,
    factStatuses: {
      allergies: profile.allergiesStatus,
      currentMedications: profile.currentMedicationsStatus,
    },
    providerContext: {
      patient: {
        displayName: profile.displayName,
        relationshipLabel: profile.relationshipLabel,
      },
      profileFacts,
      latestCheckIn: latestCheckIn
        ? {
            ...latestCheckIn,
            createdAt: latestCheckIn.createdAt.toISOString(),
          }
        : null,
      activeMedications,
      upcomingReminders: upcomingReminders.map((reminder) => ({
        ...reminder,
        scheduledAt: reminder.scheduledAt?.toISOString() ?? null,
      })),
      confirmedDocumentSummaries,
    },
  };
}
