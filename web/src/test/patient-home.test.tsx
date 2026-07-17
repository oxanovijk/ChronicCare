import { render, screen, within } from "@testing-library/react";
import { describe, expect, test } from "vitest";
import PatientHomePage from "@/app/prototype/patient/home/page";

describe("Patient Home", () => {
  test("prioritizes check-in and recorded caregiver context", () => {
    render(<PatientHomePage />);

    expect(
      screen.getByRole("heading", { name: /halo, maya/i }),
    ).toBeVisible();
    expect(
      screen.getByRole("link", { name: /isi check-in hari ini/i }),
    ).toBeVisible();
    expect(screen.getByText(/sesuai catatan caregiver/i)).toBeVisible();
    expect(screen.getByText("19.00")).toBeVisible();
  });

  test("keeps assistant, reminders, and SOS visually explicit", () => {
    render(<PatientHomePage />);

    expect(
      screen.getByRole("link", { name: /tanya asisten/i }),
    ).toBeVisible();
    expect(
      screen.getByRole("link", { name: /lihat pengingat/i }),
    ).toBeVisible();
    expect(screen.getByRole("link", { name: /buka sos/i })).toBeVisible();
    expect(screen.getByText(/bukan layanan darurat resmi/i)).toBeVisible();
  });

  test("renders four labeled Patient destinations with Home active", () => {
    render(<PatientHomePage />);

    const navigation = screen.getByRole("navigation", {
      name: /navigasi pasien/i,
    });

    expect(within(navigation).getAllByRole("link")).toHaveLength(4);
    expect(within(navigation).getByRole("link", { name: "Beranda" })).toHaveAttribute(
      "aria-current",
      "page",
    );
    expect(within(navigation).getByRole("link", { name: "Check-in" })).toBeVisible();
    expect(within(navigation).getByRole("link", { name: "Asisten" })).toBeVisible();
    expect(within(navigation).getByRole("link", { name: "SOS" })).toBeVisible();
  });
});

