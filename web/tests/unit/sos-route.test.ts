import { beforeEach, describe, expect, it, vi } from "vitest";

const {
  createSosEvent,
  handleSosEvent,
  listNewSosEvents,
  resolveAuthContext,
  resolveCaregiverAuthContext,
} = vi.hoisted(() => ({
  createSosEvent: vi.fn(),
  handleSosEvent: vi.fn(),
  listNewSosEvents: vi.fn(),
  resolveAuthContext: vi.fn(),
  resolveCaregiverAuthContext: vi.fn(),
}));

vi.mock("@/lib/auth/patient", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@/lib/auth/patient")>()),
  resolveAuthContext,
}));
vi.mock("@/lib/auth/caregiver", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@/lib/auth/caregiver")>()),
  resolveCaregiverAuthContext,
}));
vi.mock("@/lib/sos/service", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@/lib/sos/service")>()),
  createSosEvent,
  handleSosEvent,
  listNewSosEvents,
}));

import { POST as create } from "@/app/api/v1/patient-profiles/[patientProfileId]/sos/route";
import { POST as handle } from "@/app/api/v1/sos-events/[sosEventId]/handle/route";
import { GET as list } from "@/app/api/v1/sos-events/route";
import {
  SosAlreadyHandledError,
  type SosEventDto,
} from "@/lib/sos/service";

const patientProfileId = "10000000-0000-4000-8000-000000000004";
const sosEventId = "20000000-0000-4000-8000-000000000001";
const idempotencyKey = "30000000-0000-4000-8000-000000000001";
const patient = {
  actorType: "PATIENT" as const,
  patientProfile: { id: patientProfileId, displayName: "Maya Pratama", relationshipLabel: "Maya" },
};
const caregiver = {
  actorType: "CAREGIVER" as const,
  user: { id: "owner-id", displayName: "Dimas Pratama" },
  membership: { careCircleId: "circle-id", role: "OWNER" as const },
};
const event = {
  id: sosEventId,
  patientProfileId,
  patientDisplayName: "Maya Pratama",
  status: "NEW" as const,
  message: null,
  locationLabel: "Tangerang",
  createdAt: "2026-07-17T09:30:00.000Z",
  handledBy: null,
  handledAt: null,
} satisfies SosEventDto;

beforeEach(() => {
  vi.clearAllMocks();
  resolveAuthContext.mockResolvedValue(patient);
  resolveCaregiverAuthContext.mockResolvedValue(caregiver);
});

describe("Packet 12 SOS routes", () => {
  it("requires same-origin, a UUID idempotency key, and a strict body", async () => {
    const routeContext = { params: Promise.resolve({ patientProfileId }) };
    const request = (body: unknown, origin = "http://localhost", key = idempotencyKey) =>
      new Request(`http://localhost/api/v1/patient-profiles/${patientProfileId}/sos`, {
        method: "POST",
        headers: { Origin: origin, "Content-Type": "application/json", "Idempotency-Key": key },
        body: JSON.stringify(body),
      });

    expect((await create(request({}, "https://evil.example"), routeContext)).status).toBe(403);
    expect((await create(request({}, "http://localhost", "not-a-uuid"), routeContext)).status).toBe(400);
    expect((await create(request({ role: "OWNER" }), routeContext)).status).toBe(400);
    expect(createSosEvent).not.toHaveBeenCalled();
  });

  it("creates a profile-bound SOS with no-store", async () => {
    createSosEvent.mockResolvedValue(event);
    const response = await create(
      new Request(`http://localhost/api/v1/patient-profiles/${patientProfileId}/sos`, {
        method: "POST",
        headers: { Origin: "http://localhost", "Content-Type": "application/json", "Idempotency-Key": idempotencyKey },
        body: JSON.stringify({ message: null }),
      }),
      { params: Promise.resolve({ patientProfileId }) },
    );

    expect(response.status).toBe(201);
    expect(response.headers.get("Cache-Control")).toContain("no-store");
    expect(createSosEvent).toHaveBeenCalledWith(
      patient,
      patientProfileId,
      { message: null },
      idempotencyKey,
      expect.objectContaining({ requestId: expect.stringMatching(/^req_/) }),
    );
  });

  it("lists only NEW events for a verified caregiver", async () => {
    listNewSosEvents.mockResolvedValue([event]);
    const response = await list(new Request("http://localhost/api/v1/sos-events?status=NEW"));

    expect(response.status).toBe(200);
    expect(listNewSosEvents).toHaveBeenCalledWith(caregiver);
    expect(await response.json()).toEqual(
      expect.objectContaining({ data: [event] }),
    );
  });

  it("returns the current handler summary to the losing caregiver", async () => {
    const handled = {
      ...event,
      status: "HANDLED" as const,
      handledBy: { id: "owner-id", displayName: "Dimas Pratama" },
      handledAt: "2026-07-17T09:31:00.000Z",
    } satisfies SosEventDto;
    handleSosEvent.mockRejectedValue(new SosAlreadyHandledError(handled));

    const response = await handle(
      new Request(`http://localhost/api/v1/sos-events/${sosEventId}/handle`, {
        method: "POST",
        headers: { Origin: "http://localhost" },
      }),
      { params: Promise.resolve({ sosEventId }) },
    );
    const body = await response.json();

    expect(response.status).toBe(409);
    expect(body.error.code).toBe("SOS_ALREADY_HANDLED");
    expect(body.error.details.current.handledBy.displayName).toBe("Dimas Pratama");
    expect(JSON.stringify(body)).not.toContain("careCircleId");
  });
});
