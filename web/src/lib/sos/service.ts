import "server-only";

import { createHash } from "node:crypto";

import { Prisma, type PrismaClient } from "@/generated/prisma/client";
import type { CaregiverAuthContext } from "@/lib/auth/caregiver";
import type { AuthContext } from "@/lib/auth/patient";
import { requireBoundPatientProfile } from "@/lib/auth/patient";
import { writeAuditEvent } from "@/lib/audit/write-audit-event";
import { PatientProfileError } from "@/lib/patient-profile/service";
import type { CreateSosInput } from "@/lib/sos/contracts";

const sosEventSelect = {
  id: true,
  patientProfileId: true,
  status: true,
  message: true,
  locationLabel: true,
  createdAt: true,
  handledAt: true,
  patientProfile: { select: { displayName: true } },
  handledBy: { select: { id: true, displayName: true } },
} as const;

type SosEventRecord = Prisma.SosEventGetPayload<{
  select: typeof sosEventSelect;
}>;

export type SosEventDto = ReturnType<typeof sosEventDto>;

export class SosAlreadyHandledError extends Error {
  constructor(public readonly current: SosEventDto) {
    super("SOS_ALREADY_HANDLED");
    this.name = "SosAlreadyHandledError";
  }
}

function sosEventDto(event: SosEventRecord) {
  return {
    id: event.id,
    patientProfileId: event.patientProfileId,
    patientDisplayName: event.patientProfile.displayName,
    status: event.status,
    message: event.message,
    locationLabel: event.locationLabel,
    createdAt: event.createdAt.toISOString(),
    handledBy: event.handledBy,
    handledAt: event.handledAt?.toISOString() ?? null,
  };
}

function stableEventId(
  context: AuthContext,
  patientProfileId: string,
  idempotencyKey: string,
) {
  const actorId =
    context.actorType === "PATIENT"
      ? `PATIENT:${context.patientProfile.id}`
      : `CAREGIVER:${context.user.id}`;
  const hex = createHash("sha256")
    .update(`${actorId}:${patientProfileId}:${idempotencyKey}`)
    .digest("hex");
  const variant = ((Number.parseInt(hex[16], 16) & 3) | 8).toString(16);
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-5${hex.slice(13, 16)}-${variant}${hex.slice(17, 20)}-${hex.slice(20, 32)}`;
}

function profileWhere(context: AuthContext, patientProfileId: string) {
  return {
    id: patientProfileId,
    ...(context.actorType === "CAREGIVER"
      ? { careCircleId: context.membership.careCircleId }
      : {}),
    status: "ACTIVE" as const,
    deletedAt: null,
  };
}

function actor(context: AuthContext, patientProfileId: string) {
  return context.actorType === "PATIENT"
    ? ({ type: "PATIENT", patientProfileId } as const)
    : ({
        type: "CAREGIVER",
        userId: context.user.id,
        role: context.membership.role,
      } as const);
}

export async function createSosEvent(
  context: AuthContext,
  patientProfileId: string,
  input: CreateSosInput,
  idempotencyKey: string,
  dependencies: { db?: PrismaClient; requestId?: string } = {},
) {
  if (context.actorType === "PATIENT") {
    requireBoundPatientProfile(context, patientProfileId);
  }

  const db = dependencies.db ?? (await import("@/lib/db/client")).prisma;
  const id = stableEventId(context, patientProfileId, idempotencyKey);
  const scopedEventWhere = {
    id,
    patientProfileId,
    patientProfile:
      context.actorType === "CAREGIVER"
        ? { careCircleId: context.membership.careCircleId }
        : undefined,
  };
  const existing = await db.sosEvent.findFirst({
    where: scopedEventWhere,
    select: sosEventSelect,
  });
  if (existing) return sosEventDto(existing);

  try {
    return await db.$transaction(async (tx) => {
      const profile = await tx.patientProfile.findFirst({
        where: profileWhere(context, patientProfileId),
        select: {
          id: true,
          careCircleId: true,
          locationLabel: true,
          city: true,
        },
      });
      if (!profile) throw new PatientProfileError("NOT_FOUND");

      const event = await tx.sosEvent.create({
        data: {
          id,
          patientProfileId: profile.id,
          createdByPatient: context.actorType === "PATIENT",
          createdByUserId:
            context.actorType === "CAREGIVER" ? context.user.id : null,
          message: input.message,
          locationLabel: profile.locationLabel ?? profile.city,
          contactPhone: null,
        },
        select: sosEventSelect,
      });
      await writeAuditEvent(tx, {
        careCircleId: profile.careCircleId,
        patientProfileId: profile.id,
        actor: actor(context, profile.id),
        action: "SOS_CREATED",
        targetType: "SOS_EVENT",
        targetId: event.id,
        requestId: dependencies.requestId,
      });
      return sosEventDto(event);
    });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      const raced = await db.sosEvent.findFirst({
        where: scopedEventWhere,
        select: sosEventSelect,
      });
      if (raced) return sosEventDto(raced);
    }
    throw error;
  }
}

export async function listNewSosEvents(
  context: CaregiverAuthContext,
  dependencies: { db?: PrismaClient } = {},
) {
  const db = dependencies.db ?? (await import("@/lib/db/client")).prisma;
  const events = await db.sosEvent.findMany({
    where: {
      status: "NEW",
      patientProfile: {
        careCircleId: context.membership.careCircleId,
        status: "ACTIVE",
        deletedAt: null,
      },
    },
    select: sosEventSelect,
    orderBy: { createdAt: "desc" },
    take: 20,
  });
  return events.map(sosEventDto);
}

export async function handleSosEvent(
  context: CaregiverAuthContext,
  sosEventId: string,
  dependencies: { db?: PrismaClient; requestId?: string; now?: Date } = {},
) {
  const db = dependencies.db ?? (await import("@/lib/db/client")).prisma;
  const handledAt = dependencies.now ?? new Date();

  return db.$transaction(async (tx) => {
    const updated = await tx.sosEvent.updateMany({
      where: {
        id: sosEventId,
        status: "NEW",
        patientProfile: {
          careCircleId: context.membership.careCircleId,
          deletedAt: null,
        },
      },
      data: {
        status: "HANDLED",
        handledByUserId: context.user.id,
        handledAt,
      },
    });
    const event = await tx.sosEvent.findFirst({
      where: {
        id: sosEventId,
        patientProfile: {
          careCircleId: context.membership.careCircleId,
          deletedAt: null,
        },
      },
      select: sosEventSelect,
    });
    if (!event) throw new PatientProfileError("NOT_FOUND");
    if (updated.count !== 1) {
      if (event.status === "HANDLED") {
        throw new SosAlreadyHandledError(sosEventDto(event));
      }
      throw new PatientProfileError("CONFLICT");
    }

    await writeAuditEvent(tx, {
      careCircleId: context.membership.careCircleId,
      patientProfileId: event.patientProfileId,
      actor: {
        type: "CAREGIVER",
        userId: context.user.id,
        role: context.membership.role,
      },
      action: "SOS_HANDLED",
      targetType: "SOS_EVENT",
      targetId: event.id,
      requestId: dependencies.requestId,
    });
    return sosEventDto(event);
  });
}
