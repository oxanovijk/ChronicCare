import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import Home from "@/app/page";

describe("root page", () => {
  it("positions ChroniCare as care coordination", () => {
    render(<Home />);

    expect(
      screen.getByRole("heading", {
        level: 1,
        name: "Satu langkah tenang untuk mulai merawat.",
      }),
    ).toBeInTheDocument();
    expect(screen.getByText(/bukan alat\s+diagnosis/i)).toBeInTheDocument();
    expect(
      screen.getByText(
        "ChroniCare membantu Patient dan keluarga menjalani rutinitas perawatan dari satu tempat.",
      ),
    ).toBeInTheDocument();
    expect(screen.getByText("Masukkan kode dari caregiver Anda.")).toBeInTheDocument();
    expect(document.body.textContent).not.toMatch(/Owner Care Circle|terverifikasi/i);
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

  it("does not claim unavailable care features", () => {
    render(<Home />);

    expect(screen.getByText("Care in Motion")).toBeInTheDocument();
    expect(screen.queryByText(/check-in|pengingat|chatbot|SOS/i)).not.toBeInTheDocument();
  });
});
