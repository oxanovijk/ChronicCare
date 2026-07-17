import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  resolveCaregiverAuthContext: vi.fn(),
  resolveAuthContext: vi.fn(),
  getCaregiverDashboard: vi.fn(),
  listMedications: vi.fn(),
  createMedication: vi.fn(),
  updateMedication: vi.fn(),
  createMedicationLog: vi.fn(),
  listReminders: vi.fn(),
  createReminder: vi.fn(),
  updateReminder: vi.fn(),
  listHealthNotes: vi.fn(),
  createHealthNote: vi.fn(),
}));

vi.mock("@/lib/auth/caregiver", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@/lib/auth/caregiver")>()),
  resolveCaregiverAuthContext: mocks.resolveCaregiverAuthContext,
}));
vi.mock("@/lib/auth/patient", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@/lib/auth/patient")>()),
  resolveAuthContext: mocks.resolveAuthContext,
}));
vi.mock("@/lib/daily-care/dashboard-service", () => ({ getCaregiverDashboard: mocks.getCaregiverDashboard }));
vi.mock("@/lib/daily-care/medication-service", () => ({
  listMedications: mocks.listMedications,
  createMedication: mocks.createMedication,
  updateMedication: mocks.updateMedication,
  createMedicationLog: mocks.createMedicationLog,
}));
vi.mock("@/lib/daily-care/reminder-service", () => ({
  listReminders: mocks.listReminders,
  createReminder: mocks.createReminder,
  updateReminder: mocks.updateReminder,
}));
vi.mock("@/lib/daily-care/health-note-service", () => ({
  listHealthNotes: mocks.listHealthNotes,
  createHealthNote: mocks.createHealthNote,
}));

import { GET as getDashboard } from "@/app/api/v1/patient-profiles/[patientProfileId]/dashboard/route";
import { GET as getMedications, POST as postMedication } from "@/app/api/v1/patient-profiles/[patientProfileId]/medications/route";
import { PATCH as patchMedication } from "@/app/api/v1/patient-profiles/[patientProfileId]/medications/[medicationId]/route";
import { POST as postMedicationLog } from "@/app/api/v1/patient-profiles/[patientProfileId]/medications/[medicationId]/logs/route";
import { GET as getReminders, POST as postReminder } from "@/app/api/v1/patient-profiles/[patientProfileId]/reminders/route";
import { GET as getHealthNotes, POST as postHealthNote } from "@/app/api/v1/patient-profiles/[patientProfileId]/health-notes/route";
import { CaregiverAuthError } from "@/lib/auth/caregiver";
import { PatientProfileError } from "@/lib/patient-profile/service";

const patientProfileId = "10000000-0000-4000-8000-000000000004";
const medicationId = "10000000-0000-4000-8000-000000000008";
const context = {
  actorType: "CAREGIVER" as const,
  user: { id: "owner-id", displayName: "Dimas Pratama" },
  membership: { careCircleId: "circle-id", role: "OWNER" as const },
};
const profileRoute = { params: Promise.resolve({ patientProfileId }) };
const medicationRoute = { params: Promise.resolve({ patientProfileId, medicationId }) };

function request(path: string, method = "GET", body?: unknown, origin = "http://localhost") {
  return new Request(`http://localhost${path}`, {
    method,
    headers: { Origin: origin, ...(body === undefined ? {} : { "Content-Type": "application/json" }) },
    ...(body === undefined ? {} : { body: JSON.stringify(body) }),
  });
}

describe("Packet 08 daily-care routes", () => {
  beforeEach(() => {
    for (const mock of Object.values(mocks)) mock.mockReset();
    mocks.resolveCaregiverAuthContext.mockResolvedValue(context);
    mocks.resolveAuthContext.mockResolvedValue(context);
  });

  it("returns dashboard and list responses as private no-store", async () => {
    mocks.getCaregiverDashboard.mockResolvedValue({ latestCheckIn: null });
    mocks.listMedications.mockResolvedValue([]);
    mocks.listReminders.mockResolvedValue([]);
    mocks.listHealthNotes.mockResolvedValue([]);
    const responses = await Promise.all([
      getDashboard(request(`/api/v1/patient-profiles/${patientProfileId}/dashboard`), profileRoute),
      getMedications(request(`/api/v1/patient-profiles/${patientProfileId}/medications`), profileRoute),
      getReminders(request(`/api/v1/patient-profiles/${patientProfileId}/reminders`), profileRoute),
      getHealthNotes(request(`/api/v1/patient-profiles/${patientProfileId}/health-notes`), profileRoute),
    ]);
    for (const response of responses) {
      expect(response.status).toBe(200);
      expect(response.headers.get("Cache-Control")).toBe("private, no-store");
    }
  });

  it("validates and creates each caregiver daily-care record", async () => {
    mocks.createMedication.mockResolvedValue({ id: medicationId });
    mocks.createMedicationLog.mockResolvedValue({ id: "log-id" });
    mocks.createReminder.mockResolvedValue({ id: "reminder-id" });
    mocks.createHealthNote.mockResolvedValue({ id: "note-id" });
    const medication = await postMedication(request("/medications", "POST", { name: "Metformin", doseText: "500 mg", scheduleText: "Pagi", instructions: null, startDate: null, endDate: null }), profileRoute);
    const log = await postMedicationLog(request("/logs", "POST", { status: "TAKEN", scheduledFor: null }), medicationRoute);
    const reminder = await postReminder(request("/reminders", "POST", { type: "CHECK_IN", title: "Check-in", description: null, scheduledAt: null, scheduleText: "Pagi", relatedMedicationId: null }), profileRoute);
    const note = await postHealthNote(request("/health-notes", "POST", { title: "Persiapan", noteText: "Bawa daftar pertanyaan.", category: "CARE" }), profileRoute);
    expect([medication.status, log.status, reminder.status, note.status]).toEqual([201, 201, 201, 201]);
  });

  it("rejects cross-origin and unknown client authorization fields", async () => {
    expect((await postMedication(request("/medications", "POST", { name: "A" }, "https://evil.example"), profileRoute)).status).toBe(403);
    const response = await postReminder(request("/reminders", "POST", { type: "CHECK_IN", title: "A", role: "OWNER" }), profileRoute);
    expect(response.status).toBe(400);
    expect(mocks.createReminder).not.toHaveBeenCalled();
  });

  it("maps stale writes to a safe conflict envelope", async () => {
    mocks.updateMedication.mockRejectedValue(new PatientProfileError("CONFLICT"));
    const response = await patchMedication(request("/medication", "PATCH", { status: "PAUSED", updatedAt: "2026-07-17T08:00:00.000Z" }), medicationRoute);
    const body = await response.json();
    expect(response.status).toBe(409);
    expect(body.error.code).toBe("CONFLICT");
    expect(JSON.stringify(body)).not.toContain(patientProfileId);
  });

  it("denies unauthenticated or forbidden caregiver writes before the service", async () => {
    mocks.resolveCaregiverAuthContext.mockRejectedValueOnce(new CaregiverAuthError("UNAUTHENTICATED"));
    const unauthenticated = await postMedication(
      request("/medications", "POST", { name: "Metformin", doseText: "500 mg", scheduleText: "Pagi", instructions: null, startDate: null, endDate: null }),
      profileRoute,
    );
    expect(unauthenticated.status).toBe(401);

    mocks.resolveCaregiverAuthContext.mockRejectedValueOnce(new CaregiverAuthError("FORBIDDEN"));
    const forbidden = await postHealthNote(
      request("/health-notes", "POST", { title: "Catatan", noteText: "Koordinasi singkat", category: "CARE" }),
      profileRoute,
    );
    expect(forbidden.status).toBe(403);
    expect(mocks.createMedication).not.toHaveBeenCalled();
    expect(mocks.createHealthNote).not.toHaveBeenCalled();
  });

  it("maps an unavailable profile to a safe no-store 404", async () => {
    mocks.getCaregiverDashboard.mockRejectedValue(new PatientProfileError("NOT_FOUND"));
    const response = await getDashboard(
      request(`/api/v1/patient-profiles/${patientProfileId}/dashboard`),
      profileRoute,
    );
    const body = await response.json();
    expect(response.status).toBe(404);
    expect(response.headers.get("Cache-Control")).toBe("private, no-store");
    expect(body.error.code).toBe("NOT_FOUND");
    expect(JSON.stringify(body)).not.toContain(patientProfileId);
  });
});
