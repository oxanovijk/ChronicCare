import { beforeEach, describe, expect, it, vi } from "vitest";

const { authenticatePatientCode, revokePatientSession } = vi.hoisted(() => ({
  authenticatePatientCode: vi.fn(),
  revokePatientSession: vi.fn(),
}));

vi.mock("@/lib/auth/patient", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/auth/patient")>();
  return { ...actual, authenticatePatientCode, revokePatientSession };
});

import { POST as login } from "@/app/api/v1/auth/patient/login/route";
import { POST as logout } from "@/app/api/v1/auth/patient/logout/route";
import { PatientAuthError } from "@/lib/auth/patient";

function request(path: string, body?: unknown) {
  return new Request(`http://localhost${path}`, {
    method: "POST",
    headers: {
      Origin: "http://localhost",
      "Content-Type": "application/json",
    },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
}

describe("Patient session routes", () => {
  beforeEach(() => {
    authenticatePatientCode.mockReset();
    revokePatientSession.mockReset();
  });

  it("sets the locked opaque cookie and returns only safe profile data", async () => {
    authenticatePatientCode.mockResolvedValue({
      token: "opaque-token-must-only-enter-cookie",
      expiresAt: new Date("2026-07-17T08:00:00.000Z"),
      context: {
        actorType: "PATIENT",
        patientProfile: {
          id: "maya-id",
          displayName: "Maya Pratama",
          relationshipLabel: "Maya",
        },
      },
    });

    const response = await login(
      request("/api/v1/auth/patient/login", { code: "48 29 13" }),
    );
    const body = await response.json();
    const cookie = response.headers.get("set-cookie") ?? "";

    expect(response.status).toBe(200);
    expect(authenticatePatientCode).toHaveBeenCalledWith(
      expect.objectContaining({ code: "482913" }),
    );
    expect(cookie).toContain("chronicare_patient_session=");
    expect(cookie).toContain("HttpOnly");
    expect(cookie).toContain("SameSite=lax");
    expect(cookie).toContain("Max-Age=28800");
    expect(JSON.stringify(body)).not.toContain("opaque-token");
    expect(JSON.stringify(body)).not.toContain("482913");
  });

  it("uses one generic error for an unavailable code", async () => {
    authenticatePatientCode.mockRejectedValue(
      new PatientAuthError("UNAUTHENTICATED"),
    );
    const response = await login(
      request("/api/v1/auth/patient/login", { code: "wrong-code" }),
    );
    const body = await response.json();

    expect(response.status).toBe(401);
    expect(body.error.message).toBe(
      "Kode tidak valid atau sudah tidak berlaku.",
    );
    expect(JSON.stringify(body)).not.toContain("wrong-code");
  });

  it("rejects cross-origin mutation before code verification", async () => {
    const crossOrigin = new Request(
      "http://localhost/api/v1/auth/patient/login",
      {
        method: "POST",
        headers: {
          Origin: "https://attacker.example",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ code: "482913" }),
      },
    );
    const response = await login(crossOrigin);

    expect(response.status).toBe(403);
    expect(authenticatePatientCode).not.toHaveBeenCalled();
  });

  it("revokes the server session and clears the cookie", async () => {
    revokePatientSession.mockResolvedValue(undefined);
    const response = await logout(
      request("/api/v1/auth/patient/logout"),
    );

    expect(response.status).toBe(204);
    expect(revokePatientSession).toHaveBeenCalledOnce();
    expect(response.headers.get("set-cookie")).toContain("Max-Age=0");
  });
});
