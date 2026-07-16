import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import CaregiverPage from "@/app/caregiver/page";

vi.mock("@/components/auth/caregiver-auth-panel", () => ({
  CaregiverAuthPanel: () => <div>Caregiver auth panel</div>,
}));

describe("caregiver page", () => {
  it("renders the caregiver area heading", () => {
    render(<CaregiverPage />);

    expect(
      screen.getByRole("heading", { level: 1, name: "Area Caregiver" }),
    ).toBeInTheDocument();
  });

  it("states that caregiver authentication is active", () => {
    render(<CaregiverPage />);

    expect(
      screen.getByText("Autentikasi caregiver aktif"),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Dashboard Patient belum tersedia/),
    ).toBeInTheDocument();
    expect(
      screen.queryByText(/Login caregiver.*belum tersedia/),
    ).not.toBeInTheDocument();
  });

  it("renders the caregiver auth panel", () => {
    render(<CaregiverPage />);

    expect(screen.getByText("Caregiver auth panel")).toBeInTheDocument();
  });

  it("links back to the home page", () => {
    render(<CaregiverPage />);

    expect(
      screen.getByRole("link", { name: "Kembali ke beranda" }),
    ).toHaveAttribute("href", "/");
  });
});
