import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { CaregiverDashboard } from "@/components/caregiver/caregiver-dashboard";

const maya = { id: "maya-id", displayName: "Maya Pratama", relationshipLabel: "Maya", currentMedicationsStatus: "REPORTED" as const };
const raka = { id: "raka-id", displayName: "Raka Pratama", relationshipLabel: "Raka", currentMedicationsStatus: "UNKNOWN" as const };

function dashboard(profile: { id: string; displayName: string; relationshipLabel: string; currentMedicationsStatus: "UNKNOWN" | "NONE_REPORTED" | "REPORTED" } = maya) {
  return {
    patientProfile: {
      id: profile.id,
      displayName: profile.displayName,
      relationshipLabel: profile.relationshipLabel,
      primaryConditionsStatus: "REPORTED",
      allergiesStatus: "UNKNOWN",
      currentMedicationsStatus: profile.currentMedicationsStatus,
      emergencyContactStatus: "REPORTED",
      bpjsMembershipStatus: "REGISTERED",
    },
    setupChecklist: {
      minimumIdentityComplete: true,
      primaryConditionsStatus: "REPORTED",
      allergiesStatus: "UNKNOWN",
      currentMedicationsStatus: profile.currentMedicationsStatus,
      emergencyContactStatus: "REPORTED",
      bpjsMembershipStatus: "REGISTERED",
      dateOfBirthRecorded: true,
      broadLocationRecorded: true,
      usualFacilityRecorded: false,
      recommendedActions: ["REVIEW_ALLERGIES"],
    },
    latestCheckIn: profile.id === "maya-id" ? {
      id: "check-in-id", mood: "OKAY", conditionText: "Sedikit lelah.", painLevel: 2,
      medicationTaken: true, complaintText: null, needsFamilyHelp: false,
      createdAt: "2026-07-17T08:00:00.000Z",
    } : null,
    activeMedications: profile.id === "maya-id" ? [{
      id: "med-id", name: "Metformin", doseText: "500 mg sesuai catatan caregiver",
      scheduleText: "Pagi", instructions: null, startDate: null, endDate: null,
      status: "ACTIVE", createdAt: "2026-07-17T08:00:00.000Z", updatedAt: "2026-07-17T08:00:00.000Z",
    }] : [],
    upcomingReminders: [],
    recentHealthNotes: [],
  };
}

describe("Packet 08 caregiver dashboard UI", () => {
  it("shows real Packet 07–08 data and honest later-feature states", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(Response.json({ data: dashboard() }));
    render(<CaregiverDashboard patientProfile={maya} caregiverName="Dimas" role="OWNER" />);
    expect(await screen.findByRole("heading", { name: "Kabar terbaru Maya" })).toBeInTheDocument();
    expect(screen.getByText("Sedikit lelah.")).toBeInTheDocument();
    expect(screen.getByText("500 mg sesuai catatan caregiver")).toBeInTheDocument();
    expect(screen.getByText("Belum ada pengingat")).toBeInTheDocument();
    expect(screen.queryByText(/dokumen perlu ditinjau/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/SOS aktif/i)).not.toBeInTheDocument();
    expect(screen.queryByRole("link", { name: /prototype/i })).not.toBeInTheDocument();
  });

  it("distinguishes UNKNOWN from explicit NONE_REPORTED", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(Response.json({ data: dashboard(raka) }));
    render(<CaregiverDashboard patientProfile={raka} caregiverName="Rina" role="FAMILY_MEMBER" />);
    expect(await screen.findByText("Belum diketahui")).toBeInTheDocument();
    expect(screen.queryByText(/tidak ada obat/i)).not.toBeInTheDocument();
  });

  it("clears stale data and ignores a late response after profile switching", async () => {
    let resolveMaya!: (value: Response) => void;
    const mayaResponse = new Promise<Response>((resolve) => { resolveMaya = resolve; });
    vi.spyOn(globalThis, "fetch").mockImplementation((input) => {
      if (String(input).includes("maya-id")) return mayaResponse;
      return Promise.resolve(Response.json({ data: dashboard(raka) }));
    });
    const view = render(<CaregiverDashboard patientProfile={maya} caregiverName="Dimas" role="OWNER" />);
    expect(screen.getByText("Memuat data Maya Pratama")).toBeInTheDocument();
    view.rerender(<CaregiverDashboard patientProfile={raka} caregiverName="Dimas" role="OWNER" />);
    expect(screen.getByText("Memuat data Raka Pratama")).toBeInTheDocument();
    expect(await screen.findByText("Belum diketahui")).toBeInTheDocument();
    resolveMaya(Response.json({ data: dashboard(maya) }));
    await waitFor(() => expect(screen.queryByText("Sedikit lelah.")).not.toBeInTheDocument());
    expect(screen.getByRole("heading", { name: "Belum ada check-in untuk Raka" })).toBeInTheDocument();
  });

  it("opens a working Packet 08 reminder form with visible labels", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(Response.json({ data: dashboard() }));
    const user = userEvent.setup();
    render(<CaregiverDashboard patientProfile={maya} caregiverName="Dimas" role="OWNER" />);
    await user.click(await screen.findByRole("button", { name: "Tambah pengingat" }));
    expect(screen.getByLabelText("Judul pengingat")).toBeInTheDocument();
    expect(screen.getByText(/tidak mengirim notifikasi sistem operasi/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Batal" })).toBeInTheDocument();
  });

  it("exposes optional recorded dates without clinical recommendations", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(Response.json({ data: dashboard() }));
    const user = userEvent.setup();
    render(<CaregiverDashboard patientProfile={maya} caregiverName="Dimas" role="OWNER" />);
    await user.click(await screen.findByRole("button", { name: "Catat obat" }));
    expect(screen.getByLabelText("Tanggal mulai (opsional)")).toBeInTheDocument();
    expect(screen.getByLabelText("Tanggal selesai (opsional)")).toBeInTheDocument();
    expect(screen.getByText(/tidak menilai keamanan obat atau dosis/i)).toBeInTheDocument();
  });
});
