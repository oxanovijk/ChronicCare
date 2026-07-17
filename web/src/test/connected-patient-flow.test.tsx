import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, test } from "vitest";
import { CheckInForm } from "@/components/check-in-form";
import { PatientSosPanel } from "@/components/patient-sos-panel";

describe("connected Patient flow", () => {
  test("requires a check-in choice and confirms a safe saved state", async () => {
    const user = userEvent.setup();
    render(<CheckInForm />);

    await user.click(screen.getByRole("button", { name: /simpan check-in/i }));
    expect(screen.getByRole("alert")).toHaveTextContent(/pilih satu kabar/i);

    await user.click(screen.getByRole("radio", { name: /butuh dukungan/i }));
    await user.type(screen.getByLabelText(/catatan tambahan/i), "Saya ingin ditemani bicara.");
    await user.click(screen.getByRole("button", { name: /simpan check-in/i }));

    expect(screen.getByRole("status")).toHaveTextContent(/check-in tersimpan/i);
    expect(screen.getByText(/caregiver dapat melihat kabar terbaru/i)).toBeVisible();
    expect(screen.getByRole("link", { name: /kembali ke beranda/i })).toBeVisible();
  });

  test("keeps SOS deliberate and states its delivery boundary", async () => {
    const user = userEvent.setup();
    render(<PatientSosPanel />);

    await user.click(screen.getByRole("button", { name: /lanjutkan ke konfirmasi/i }));
    expect(screen.getByRole("heading", { name: /kirim sos sekarang/i })).toBeVisible();
    expect(screen.getByText(/dashboard caregiver harus terbuka dan terhubung/i)).toBeVisible();

    await user.click(screen.getByRole("button", { name: /ya, kirim sos/i }));
    expect(screen.getByRole("status")).toHaveTextContent(/sos terkirim melalui chronicare/i);
    expect(screen.getByText(/tidak menjamin alert diterima/i)).toBeVisible();
  });
});

