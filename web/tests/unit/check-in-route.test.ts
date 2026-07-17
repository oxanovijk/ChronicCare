import { beforeEach, describe, expect, it, vi } from "vitest";

const { createCheckIn, listCheckIns, resolveAuthContext } = vi.hoisted(() => ({
  createCheckIn: vi.fn(),
  listCheckIns: vi.fn(),
  resolveAuthContext: vi.fn(),
}));

vi.mock("@/lib/auth/patient", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@/lib/auth/patient")>()),
  resolveAuthContext,
}));
vi.mock("@/lib/daily-care/check-in-service", () => ({
  createCheckIn,
  listCheckIns,
}));

import { GET, POST } from "@/app/api/v1/patient-profiles/[patientProfileId]/check-ins/route";
import { PatientAuthError } from "@/lib/auth/patient";

const patientProfileId = "10000000-0000-4000-8000-000000000004";
const routeContext = { params: Promise.resolve({ patientProfileId }) };
const patient = {
  actorType: "PATIENT" as const,
  patientProfile: {
    id: patientProfileId,
    displayName: "Maya Pratama",
    relationshipLabel: "Ibu",
  },
};

function postRequest(body: unknown, origin = "http://localhost") {
  return new Request(
    `http://localhost/api/v1/patient-profiles/${patientProfileId}/check-ins`,
    {
      method: "POST",
      headers: { Origin: origin, "Content-Type": "application/json" },
      body: JSON.stringify(body),
    },
  );
}

describe("check-in route", () => {
  beforeEach(() => {
    createCheckIn.mockReset();
    listCheckIns.mockReset();
    resolveAuthContext.mockReset().mockResolvedValue(patient);
  });

  it("lists at most ten bound-profile check-ins with no-store", async () => {
    listCheckIns.mockResolvedValue([]);
    const response = await GET(
      new Request(
        `http://localhost/api/v1/patient-profiles/${patientProfileId}/check-ins?limit=10`,
      ),
      routeContext,
    );

    expect(response.status).toBe(200);
    expect(response.headers.get("Cache-Control")).toContain("no-store");
    expect(listCheckIns).toHaveBeenCalledWith(patient, patientProfileId, 10);
  });

  it("creates a validated check-in and returns 201", async () => {
    createCheckIn.mockResolvedValue({ id: "check-in-id" });
    const payload = {
      mood: "OKAY",
      conditionText: "Sedikit lemas.",
      painLevel: 2,
      medicationTaken: true,
      complaintText: null,
      needsFamilyHelp: false,
    };

    const response = await POST(postRequest(payload), routeContext);

    expect(response.status).toBe(201);
    expect(createCheckIn).toHaveBeenCalledWith(
      patient,
      patientProfileId,
      payload,
      expect.objectContaining({ requestId: expect.stringMatching(/^req_/) }),
    );
  });

  it("rejects cross-origin and client authorization fields", async () => {
    expect(
      (await POST(postRequest({ mood: "GOOD" }, "https://evil.example"), routeContext))
        .status,
    ).toBe(403);

    const extraField = await POST(
      postRequest({ mood: "GOOD", role: "OWNER" }),
      routeContext,
    );
    expect(extraField.status).toBe(400);
    expect(createCheckIn).not.toHaveBeenCalled();
  });

  it("returns a generic denial for a wrong-profile session", async () => {
    createCheckIn.mockRejectedValue(new PatientAuthError("FORBIDDEN"));
    const response = await POST(postRequest({ mood: "GOOD" }), routeContext);
    const body = await response.json();

    expect(response.status).toBe(403);
    expect(body.error.message).toBe("Anda tidak memiliki akses.");
    expect(JSON.stringify(body)).not.toContain("Maya Pratama");
  });
});
