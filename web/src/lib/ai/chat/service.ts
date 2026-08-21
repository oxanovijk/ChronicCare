import "server-only";

import { randomUUID } from "node:crypto";

import type { PrismaClient } from "@/generated/prisma/client";
import type {
  ChatPersona,
  ChatRequest,
  ChatResponse,
} from "@/lib/ai/chat/contract";
import { generateChatReply } from "@/lib/ai/chat/provider";
import {
  buildChatContext,
  type BuiltChatContext,
} from "@/lib/ai/context/build-chat-context";
import { classifyChatMessage } from "@/lib/ai/safety/classify";
import { writeAuditEvent } from "@/lib/audit/write-audit-event";
import type { AuthContext } from "@/lib/auth/patient";
import { DEMO_FALLBACK_LABEL } from "@/lib/config/provider-policy";

export class ChatError extends Error {
  constructor(public readonly code: "RATE_LIMITED") {
    super(code);
    this.name = "ChatError";
  }
}

const requestBuckets = new Map<string, number[]>();

function enforceRateLimit(actorKey: string, now = Date.now()) {
  const windowStart = now - 10 * 60 * 1000;
  const recent = (requestBuckets.get(actorKey) ?? []).filter(
    (timestamp) => timestamp > windowStart,
  );
  if (recent.length >= 20) throw new ChatError("RATE_LIMITED");
  recent.push(now);
  requestBuckets.set(actorKey, recent);
  // ponytail: process-local limit is sufficient for the single-instance demo;
  // replace with a shared atomic store before multi-instance deployment.
}

function safetyReply(persona: ChatPersona, route: string) {
  if (route === "EMERGENCY") {
    return persona === "PATIENT"
      ? "Keluhan ini bisa membutuhkan pertolongan segera. Tekan SOS atau hubungi keluarga sekarang. Jika sesak, nyeri dada, pingsan, atau makin lemah, segera minta bantuan ke IGD atau layanan medis."
      : "Gejala ini perlu dinilai tenaga medis secepatnya. Hubungi Patient atau caregiver terdekat, gunakan SOS bila perlu, dan pertimbangkan IGD atau layanan darurat.";
  }
  if (route === "HIDDEN_CONTEXT") {
    return "Saya tidak bisa menampilkan system prompt, hidden context, atau data internal. Saya bisa membantu berdasarkan informasi yang terlihat dan diizinkan untuk Patient Profile aktif.";
  }
  if (route === "MEDICATION_CHANGE") {
    return "Saya tidak bisa merekomendasikan obat atau perubahan dosis. Ikuti catatan/resep yang ada dan konsultasikan perubahan kepada dokter atau tenaga kesehatan.";
  }
  if (route === "LAB_INTERPRETATION") {
    return "Saya tidak bisa menafsirkan hasil lab atau menyatakan hasilnya aman, normal, atau berbahaya. Saya bisa membantu menyiapkan pertanyaan untuk dokter berdasarkan dokumen yang sudah dikonfirmasi caregiver.";
  }
  if (route === "TARGET_OR_DIET") {
    return "Saya tidak bisa menentukan target gula darah personal atau membuat diet/pantangan pribadi. Dokter atau ahli gizi perlu menyesuaikannya; saya bisa membantu menyiapkan pertanyaan untuk kontrol.";
  }
  return "Saya tidak bisa menentukan diagnosis atau memastikan penyebab keluhan. Saya bisa membantu mencatat gejala dan menyiapkan pertanyaan untuk tenaga kesehatan.";
}

function contextualReply(
  message: string,
  context: BuiltChatContext,
): string | null {
  if (/\balergi\b/i.test(message)) {
    if (context.factStatuses.allergies === "UNKNOWN") {
      return `Informasi alergi ${context.providerContext.patient.displayName} belum tercatat di ChroniCare. Jangan menganggap tidak ada alergi; konfirmasikan kepada keluarga yang mengetahui atau tenaga kesehatan.`;
    }
    if (context.factStatuses.allergies === "NONE_REPORTED") {
      return `Caregiver melaporkan belum ada alergi yang diketahui untuk ${context.providerContext.patient.displayName}. Informasi ini bukan verifikasi medis; konfirmasikan kepada tenaga kesehatan bila diperlukan.`;
    }
    const allergies = context.providerContext.profileFacts.allergies;
    if (Array.isArray(allergies)) {
      return `Berdasarkan catatan caregiver, alergi yang dilaporkan untuk ${context.providerContext.patient.displayName}: ${allergies.join(", ")}. Konfirmasikan kepada tenaga kesehatan bila diperlukan.`;
    }
  }

  if (/\bobat\b.{0,40}\b(kapan|jadwal|diminum)\b|\b(kapan|jadwal)\b.{0,40}\bobat\b/i.test(message)) {
    if (context.providerContext.activeMedications.length > 0) {
      return `Jadwal yang dicatat caregiver: ${context.providerContext.activeMedications
        .map((item) => `${item.name} — ${item.scheduleText}`)
        .join("; ")}. Ikuti catatan/resep dan jangan mengubah dosis tanpa arahan tenaga kesehatan.`;
    }
    if (context.factStatuses.currentMedications === "NONE_REPORTED") {
      return "Caregiver melaporkan belum ada obat aktif yang diketahui. Ini bukan kepastian klinis; konfirmasikan kepada keluarga atau tenaga kesehatan.";
    }
    return "Informasi jadwal obat belum tercatat. Tanyakan kepada keluarga atau tenaga kesehatan dan jangan menebak jadwal atau dosis.";
  }

  return null;
}

function fallbackReply(persona: ChatPersona) {
  return persona === "PATIENT"
    ? `${DEMO_FALLBACK_LABEL} — Maaf, bantuan chat sedang tidak tersedia. Jika Anda merasa tidak enak badan atau butuh bantuan, tekan SOS atau hubungi keluarga sekarang.`
    : `${DEMO_FALLBACK_LABEL} — Chatbot sedang tidak tersedia. Anda masih bisa melihat check-in, obat, dokumen, SOS, dan faskes dari dashboard. Untuk keluhan serius, hubungi tenaga medis atau layanan darurat.`;
}

function isUnsafeProviderReply(content: string) {
  return /\b(naikkan|turunkan|tambah|kurangi|hentikan|ganti)\b.{0,40}\b(dosis|obat|insulin)\b|\b(maya|raka|anda|patient|pasien)\b.{0,30}\b(pasti|mengidap|menderita|terkena)\b|\b(hasil\s*lab|gula\s*darah|hba1c)\b.{0,40}\b(aman|normal|berbahaya)\b|\btarget\b.{0,40}\b(mg\/?dl|mmol|hba1c|gula\s*darah)\b|\b(harus|wajib)\b.{0,20}\b(hindari|pantangan|diet)\b/i.test(
    content,
  );
}

async function auditFallback(
  actor: AuthContext,
  context: BuiltChatContext,
  patientProfileId: string,
  requestId: string | undefined,
  db: PrismaClient | undefined,
) {
  const database = db ?? (await import("@/lib/db/client")).prisma;
  await writeAuditEvent(database, {
    careCircleId: context.careCircleId,
    patientProfileId,
    actor:
      actor.actorType === "PATIENT"
        ? { type: "PATIENT", patientProfileId: actor.patientProfile.id }
        : {
            type: "CAREGIVER",
            userId: actor.user.id,
            role: actor.membership.role,
          },
    action: "CHAT_FALLBACK",
    targetType: "CHAT_PROVIDER",
    requestId,
    note: "PROVIDER_UNAVAILABLE",
  });
}

type Dependencies = {
  db?: PrismaClient;
  now?: () => number;
  buildContext?: typeof buildChatContext;
  provider?: typeof generateChatReply;
  recordFallback?: typeof auditFallback;
  requestId?: string;
};

export async function sendChatMessage(
  actor: AuthContext,
  patientProfileId: string,
  input: ChatRequest,
  dependencies: Dependencies = {},
): Promise<ChatResponse> {
  const context = await (dependencies.buildContext ?? buildChatContext)(
    actor,
    patientProfileId,
    { db: dependencies.db },
  );
  enforceRateLimit(context.actorKey, dependencies.now?.());

  const safetyRoute = classifyChatMessage(input.message);
  const deterministic =
    safetyRoute === "ALLOWED"
      ? contextualReply(input.message, context)
      : safetyReply(context.persona, safetyRoute);
  if (deterministic) {
    return {
      sessionId: input.sessionId ?? randomUUID(),
      message: {
        role: "ASSISTANT",
        content: deterministic,
        isFallback: false,
      },
    };
  }

  try {
    const content = await (dependencies.provider ?? generateChatReply)({
      persona: context.persona,
      message: input.message,
      providerContext: context.providerContext,
    });
    if (isUnsafeProviderReply(content)) throw new Error("UNSAFE_PROVIDER_REPLY");
    return {
      sessionId: input.sessionId ?? randomUUID(),
      message: { role: "ASSISTANT", content, isFallback: false },
    };
  } catch {
    try {
      await (dependencies.recordFallback ?? auditFallback)(
        actor,
        context,
        patientProfileId,
        dependencies.requestId,
        dependencies.db,
      );
    } catch {
      // The safe fallback remains available even if sanitized audit writing fails.
    }
    return {
      sessionId: input.sessionId ?? randomUUID(),
      message: {
        role: "ASSISTANT",
        content: fallbackReply(context.persona),
        isFallback: true,
      },
    };
  }
}
