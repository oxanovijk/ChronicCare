import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import CaregiverShellPage from "@/app/caregiver/page";

describe("caregiver shell page", () => {
  it("renders the caregiver area heading", () => {
    render(<CaregiverShellPage />);

    expect(
      screen.getByRole("heading", { level: 1, name: "Area Caregiver" }),
    ).toBeInTheDocument();
  });

  it("states that no feature or data is live yet", () => {
    render(<CaregiverShellPage />);

    expect(
      screen.getByText("Shell awal — belum ada fitur aktif"),
    ).toBeInTheDocument();
    expect(
      screen.getByText("Belum ada data yang ditampilkan"),
    ).toBeInTheDocument();
  });

  it("marks every planned area as in development", () => {
    render(<CaregiverShellPage />);

    const badges = screen.getAllByText("Dalam pengembangan");
    expect(badges).toHaveLength(4);
  });

  it("links back to the home page", () => {
    render(<CaregiverShellPage />);

    expect(
      screen.getByRole("link", { name: "Kembali ke beranda" }),
    ).toHaveAttribute("href", "/");
  });
});
