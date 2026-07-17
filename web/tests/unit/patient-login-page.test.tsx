import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import PatientLoginShellPage from "@/app/patient/login/page";

describe("patient login shell page", () => {
  it("renders the patient login heading", () => {
    render(<PatientLoginShellPage />);

    expect(
      screen.getByRole("heading", {
        level: 1,
        name: "Selamat datang. Mari mulai dengan aman.",
      }),
    ).toBeInTheDocument();
  });

  it("renders the active access-code form", () => {
    render(<PatientLoginShellPage />);

    expect(screen.getByLabelText("Kode akses Patient")).toBeEnabled();
    expect(
      screen.getByRole("button", { name: "Masuk" }),
    ).toBeEnabled();
    expect(screen.getByText("Akses Patient")).toBeInTheDocument();
  });

  it("links back to the home page", () => {
    render(<PatientLoginShellPage />);

    expect(
      screen.getByRole("link", { name: "Beranda" }),
    ).toHaveAttribute("href", "/");
  });
});
