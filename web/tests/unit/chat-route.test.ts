import { beforeEach, describe, expect, it, vi } from "vitest";

const { resolveAuthContext, sendChatMessage } = vi.hoisted(() => ({
  resolveAuthContext: vi.fn(),
  sendChatMessage: vi.fn(),
}));

vi.mock("@/lib/auth/patient", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@/lib/auth/patient")>()),
  resolveAuthContext,
}));
vi.mock("@/lib/ai/chat/service", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@/lib/ai/chat/service")>()),
  sendChatMessage,
}));

import { POST } from "@/app/api/v1/patient-profiles/[patientProfileId]/chat/route";
import { ChatError } from "@/lib/ai/chat/service";

const patientProfileId = "10000000-0000-4000-8000-000000000004";
const routeContext = { params: Promise.resolve({ patientProfileId }) };
const patient = {
  actorType: "PATIENT" as const,
  patientProfile: {
    id: patientProfileId,
    displayName: "Maya Pratama",
    relationshipLabel: "Maya",
  },
};

function request(body: unknown, origin = "http://localhost") {
  return new Request(
    `http://localhost/api/v1/patient-profiles/${patientProfileId}/chat`,
    {
      method: "POST",
      headers: { Origin: origin, "Content-Type": "application/json" },
      body: JSON.stringify(body),
    },
  );
}

describe("chat route", () => {
  beforeEach(() => {
    resolveAuthContext.mockReset().mockResolvedValue(patient);
    sendChatMessage.mockReset().mockResolvedValue({
      sessionId: "20000000-0000-4000-8000-000000000004",
      message: {
        role: "ASSISTANT",
        content: "Jawaban aman.",
        isFallback: false,
      },
    });
  });

  it("derives the persona from auth and returns private no-store", async () => {
    const response = await POST(
      request({ sessionId: null, message: "Obat saya diminum kapan?" }),
      routeContext,
    );
    expect(response.status).toBe(200);
    expect(response.headers.get("Cache-Control")).toContain("no-store");
    expect(sendChatMessage).toHaveBeenCalledWith(
      patient,
      patientProfileId,
      { sessionId: null, message: "Obat saya diminum kapan?" },
      expect.objectContaining({ requestId: expect.stringMatching(/^req_/) }),
    );
  });

  it("rejects client persona/role fields and cross-origin requests before service work", async () => {
    expect(
      (
        await POST(
          request({ message: "Halo", persona: "CAREGIVER" }),
          routeContext,
        )
      ).status,
    ).toBe(400);
    expect(
      (
        await POST(
          request({ message: "Halo" }, "https://evil.example"),
          routeContext,
        )
      ).status,
    ).toBe(403);
    expect(sendChatMessage).not.toHaveBeenCalled();
  });

  it("returns a sanitized rate-limit error", async () => {
    sendChatMessage.mockRejectedValue(new ChatError("RATE_LIMITED"));
    const response = await POST(request({ message: "Halo" }), routeContext);
    const body = await response.json();
    expect(response.status).toBe(429);
    expect(body.error).toEqual(
      expect.objectContaining({ code: "RATE_LIMITED" }),
    );
    expect(JSON.stringify(body)).not.toContain("Halo");
  });
});
