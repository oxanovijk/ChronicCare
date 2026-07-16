import "server-only";

import { z } from "zod";

import type { PrismaClient } from "@/generated/prisma/client";
import type { MemberRole } from "@/generated/prisma/enums";

type AuditActor =
  | { type: "CAREGIVER"; userId: string; role: MemberRole }
  | { type: "PATIENT"; patientProfileId: string }
  | { type: "SYSTEM" };

type AuditEventInput = {
  careCircleId: string;
  patientProfileId?: string;
  actor: AuditActor;
  action: string;
  targetType: string;
  targetId?: string;
  requestId?: string;
};

const auditLabel = z.string().min(1).max(80).regex(/^[A-Z0-9_]+$/);

export function writeAuditEvent(
  db: Pick<PrismaClient, "auditEvent">,
  input: AuditEventInput,
) {
  const action = auditLabel.parse(input.action);
  const targetType = auditLabel.parse(input.targetType);
  const actor =
    input.actor.type === "CAREGIVER"
      ? { actorUserId: input.actor.userId, actorRole: input.actor.role }
      : input.actor.type === "PATIENT"
        ? { actorPatientProfileId: input.actor.patientProfileId }
        : {};

  return db.auditEvent.create({
    data: {
      careCircleId: input.careCircleId,
      patientProfileId: input.patientProfileId,
      actorType: input.actor.type,
      action,
      targetType,
      targetId: input.targetId,
      requestId: input.requestId,
      summary: `${action} ${targetType}`,
      ...actor,
    },
  });
}
