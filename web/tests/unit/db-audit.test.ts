import { describe, expect, it, vi } from "vitest";

import { writeAuditEvent } from "@/lib/audit/write-audit-event";

describe("audit event helper", () => {
  it("derives a safe summary instead of accepting sensitive payload text", async () => {
    const create = vi.fn().mockResolvedValue({ id: "audit-id" });
    const db = { auditEvent: { create } };

    await writeAuditEvent(db as never, {
      careCircleId: "circle-id",
      patientProfileId: "profile-id",
      actor: { type: "CAREGIVER", userId: "user-id", role: "OWNER" },
      action: "PATIENT_PROFILE_UPDATED",
      targetType: "PATIENT_PROFILE",
      targetId: "profile-id",
      requestId: "request-id",
    });

    expect(create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        actorType: "CAREGIVER",
        actorUserId: "user-id",
        actorRole: "OWNER",
        summary: "PATIENT_PROFILE_UPDATED PATIENT_PROFILE",
      }),
    });
  });

  it("rejects labels that could copy free-form content", () => {
    const db = { auditEvent: { create: vi.fn() } };

    expect(() =>
      writeAuditEvent(db as never, {
        careCircleId: "circle-id",
        actor: { type: "SYSTEM" },
        action: "copied private detail",
        targetType: "PATIENT_PROFILE",
      }),
    ).toThrow();
  });
});
