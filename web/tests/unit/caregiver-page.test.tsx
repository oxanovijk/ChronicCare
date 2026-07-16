import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const { redirect, resolvePatientAuthContext } = vi.hoisted(() => ({
  redirect: vi.fn(),
  resolvePatientAuthContext: vi.fn(),
}));

import CaregiverPage from "@/app/caregiver/page";

vi.mock("@/components/auth/caregiver-auth-panel", () => ({
  CaregiverAuthPanel: () => <div>Caregiver auth panel</div>,
}));

vi.mock("next/navigation", () => ({ redirect }));

vi.mock("@/lib/auth/patient", () => {
  class PatientAuthError extends Error {}
  return { PatientAuthError, resolvePatientAuthContext };
});

describe("caregiver page", () => {
  beforeEach(async () => {
    redirect.mockReset();
    resolvePatientAuthContext.mockReset();
    const { PatientAuthError } = await import("@/lib/auth/patient");
    resolvePatientAuthContext.mockRejectedValue(
      new PatientAuthError("UNAUTHENTICATED"),
    );
  });

  it("renders the caregiver area heading", async () => {
    render(await CaregiverPage());

    expect(
      screen.getByRole("heading", { level: 1, name: "Area Caregiver" }),
    ).toBeInTheDocument();
  });

  it("states that caregiver authentication is active", async () => {
    render(await CaregiverPage());

    expect(
      screen.getByText("Autentikasi caregiver aktif"),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Patient Profile terisolasi/),
    ).toBeInTheDocument();
    expect(
      screen.queryByText(/Login caregiver.*belum tersedia/),
    ).not.toBeInTheDocument();
  });

  it("renders the caregiver auth panel", async () => {
    render(await CaregiverPage());

    expect(screen.getByText("Caregiver auth panel")).toBeInTheDocument();
  });

  it("links back to the home page", async () => {
    render(await CaregiverPage());

    expect(
      screen.getByRole("link", { name: "Kembali ke beranda" }),
    ).toHaveAttribute("href", "/");
  });

  it("redirects a bound Patient away from caregiver UI", async () => {
    resolvePatientAuthContext.mockResolvedValue({
      actorType: "PATIENT",
      patientProfile: {
        id: "maya-id",
        displayName: "Maya Pratama",
        relationshipLabel: "Maya",
      },
    });
    redirect.mockImplementation(() => {
      throw new Error("NEXT_REDIRECT");
    });

    await expect(CaregiverPage()).rejects.toThrow("NEXT_REDIRECT");
    expect(redirect).toHaveBeenCalledWith("/patient");
  });
});
