import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import Home from "@/app/page";

describe("root page", () => {
  it("positions ChroniCare as care coordination", () => {
    render(<Home />);

    expect(
      screen.getByRole("heading", { level: 1, name: "ChroniCare" }),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/bukan alat\s+diagnosis/i),
    ).toBeInTheDocument();
  });

  it("links to the caregiver and patient login shells", () => {
    render(<Home />);

    expect(
      screen.getByRole("link", { name: "Buka area caregiver" }),
    ).toHaveAttribute("href", "/caregiver");
    expect(
      screen.getByRole("link", { name: "Buka halaman masuk Patient" }),
    ).toHaveAttribute("href", "/patient/login");
  });

  it("labels the app as pre-release without live feature claims", () => {
    render(<Home />);

    expect(
      screen.getByText("Pra-rilis — fitur belum aktif"),
    ).toBeInTheDocument();
  });
});
