import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace: vi.fn(), refresh: vi.fn() }),
}));

import { PatientHome } from "@/components/patient/patient-home";

const patientProfile = {
  id: "10000000-0000-4000-8000-000000000004",
  displayName: "Maya Pratama",
  relationshipLabel: "Ibu",
};

afterEach(() => vi.restoreAllMocks());

describe("Patient check-in UI", () => {
  it("uses the Care in Motion patient shell without unavailable feature navigation", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      Response.json({ data: [] }),
    );

    render(<PatientHome patientProfile={patientProfile} />);

    expect(screen.getByText("ChroniCare")).toBeInTheDocument();
    expect(screen.queryByRole("link", { name: /reminder/i })).not.toBeInTheDocument();
    expect(screen.queryByRole("link", { name: /assistant/i })).not.toBeInTheDocument();
    expect(screen.queryByRole("link", { name: /sos/i })).not.toBeInTheDocument();
  });

  it("shows the bound profile and a useful empty state after loading", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      Response.json({ data: [] }),
    );

    render(<PatientHome patientProfile={patientProfile} />);

    expect(
      screen.getByRole("heading", { level: 1, name: "Halo, Maya Pratama" }),
    ).toBeInTheDocument();
    expect(screen.getByText("Memuat check-in terbaru..."))
      .toBeInTheDocument();
    expect(
      await screen.findByText("Belum ada check-in. Mulai saat sudah siap."),
    ).toBeInTheDocument();
  });

  it("requires a mood before sending health data", async () => {
    const fetch = vi
      .spyOn(globalThis, "fetch")
      .mockResolvedValue(Response.json({ data: [] }));
    const user = userEvent.setup();
    render(<PatientHome patientProfile={patientProfile} />);
    await screen.findByText("Belum ada check-in. Mulai saat sudah siap.");

    await user.click(screen.getByRole("button", { name: "Simpan check-in" }));

    expect(screen.getByText("Pilih kondisi hari ini."))
      .toBeInTheDocument();
    expect(screen.getByRole("radio", { name: "Baik" })).toHaveFocus();
    expect(fetch).toHaveBeenCalledTimes(1);
  });

  it("submits once, resets the form, and focuses the success state", async () => {
    const created = {
      id: "check-in-id",
      patientProfileId: patientProfile.id,
      submittedByPatient: true,
      mood: "OKAY",
      conditionText: "Sedikit lemas setelah bangun tidur.",
      painLevel: null,
      medicationTaken: null,
      complaintText: null,
      needsFamilyHelp: false,
      createdAt: "2026-07-17T05:00:00.000Z",
    };
    const fetch = vi
      .spyOn(globalThis, "fetch")
      .mockResolvedValueOnce(Response.json({ data: [] }))
      .mockResolvedValueOnce(Response.json({ data: created }, { status: 201 }));
    const user = userEvent.setup();
    render(<PatientHome patientProfile={patientProfile} />);
    await screen.findByText("Belum ada check-in. Mulai saat sudah siap.");

    await user.click(screen.getByRole("radio", { name: "Biasa saja" }));
    await user.type(
      screen.getByLabelText("Kondisi hari ini (opsional)"),
      "Sedikit lemas setelah bangun tidur.",
    );
    await user.click(screen.getByRole("button", { name: "Simpan check-in" }));

    expect(await screen.findByText("Check-in berhasil disimpan"))
      .toBeInTheDocument();
    expect(screen.getByRole("status")).toHaveFocus();
    expect(screen.getByLabelText("Kondisi hari ini (opsional)"))
      .toHaveValue("");
    expect(fetch).toHaveBeenCalledTimes(2);
    expect(JSON.parse(String(fetch.mock.calls[1][1]?.body))).toEqual({
      mood: "OKAY",
      conditionText: "Sedikit lemas setelah bangun tidur.",
      painLevel: null,
      medicationTaken: null,
      complaintText: null,
      needsFamilyHelp: false,
    });
  });

  it("shows and focuses a retryable error", async () => {
    vi.spyOn(globalThis, "fetch")
      .mockResolvedValueOnce(Response.json({ data: [] }))
      .mockResolvedValueOnce(
        Response.json(
          { error: { code: "INTERNAL_ERROR", message: "generic" } },
          { status: 500 },
        ),
      );
    const user = userEvent.setup();
    render(<PatientHome patientProfile={patientProfile} />);
    await screen.findByText("Belum ada check-in. Mulai saat sudah siap.");

    await user.click(screen.getByRole("radio", { name: "Baik" }));
    await user.click(screen.getByRole("button", { name: "Simpan check-in" }));

    expect(await screen.findByText("Check-in belum tersimpan"))
      .toBeInTheDocument();
    expect(screen.getByRole("alert")).toHaveFocus();
    expect(screen.getByRole("button", { name: "Simpan check-in" }))
      .toBeEnabled();
  });

  it("routes urgent wording to immediate human help without diagnosis", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      Response.json({ data: [] }),
    );
    const user = userEvent.setup();
    render(<PatientHome patientProfile={patientProfile} />);
    await screen.findByText("Belum ada check-in. Mulai saat sudah siap.");

    await user.type(
      screen.getByLabelText("Keluhan (opsional)"),
      "Saya sulit bernapas dan nyeri dada",
    );

    expect(screen.getByText("Cari bantuan sekarang"))
      .toBeInTheDocument();
    expect(
      screen.getByText(/Segera hubungi keluarga, caregiver, atau layanan medis\/IGD/),
    ).toBeInTheDocument();
    expect(screen.getByText(/Jangan menunggu balasan dari aplikasi ini/))
      .toBeInTheDocument();
    expect(document.body.textContent?.toLowerCase()).not.toContain("diagnosis");
  });
});
