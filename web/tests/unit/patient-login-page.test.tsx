import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import PatientLoginShellPage from "@/app/patient/login/page";

describe("patient login shell page", () => {
  it("renders the patient login heading", () => {
    render(<PatientLoginShellPage />);

    expect(
      screen.getByRole("heading", { level: 1, name: "Masuk sebagai Patient" }),
    ).toBeInTheDocument();
  });

  it("keeps the access-code form visibly inactive", () => {
    render(<PatientLoginShellPage />);

    expect(screen.getByLabelText("Kode akses Patient")).toBeDisabled();
    expect(
      screen.getByRole("button", { name: "Masuk (belum aktif)" }),
    ).toBeDisabled();
    expect(
      screen.getByText("Shell awal — login belum aktif"),
    ).toBeInTheDocument();
  });

  it("links back to the home page", () => {
    render(<PatientLoginShellPage />);

    expect(
      screen.getByRole("link", { name: "Kembali ke beranda" }),
    ).toHaveAttribute("href", "/");
  });
});
