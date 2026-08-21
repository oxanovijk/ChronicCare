import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace: vi.fn(), refresh: vi.fn() }),
}));

import { CaregiverProductionShell } from "@/components/caregiver/caregiver-production-shell";
import { CaregiverProfilePanel } from "@/components/profile/caregiver-profile-panel";
import {
  CaregiverChatSurface,
  PatientChatSurface,
} from "@/components/chat/chat-panel";
import { PatientHome } from "@/components/patient/patient-home";

afterEach(() => vi.restoreAllMocks());

function chatResponse(content: string, isFallback = false) {
  return Response.json({
    data: {
      sessionId: "20000000-0000-4000-8000-000000000004",
      message: { role: "ASSISTANT", content, isFallback },
    },
  });
}

describe("Patient and caregiver chat surfaces", () => {
  it("shows an accessible loading state and labeled fallback", async () => {
    let resolveResponse!: (response: Response) => void;
    vi.spyOn(globalThis, "fetch").mockReturnValue(
      new Promise((resolve) => {
        resolveResponse = resolve;
      }),
    );
    const user = userEvent.setup();
    render(
      <CaregiverChatSurface
        patientProfileId="maya-id"
        patientName="Maya Pratama"
      />,
    );

    expect(screen.getByText(/Konteks aktif: Maya Pratama/i)).toBeInTheDocument();
    await user.type(
      screen.getByLabelText("Pesan"),
      "Apa yang perlu disiapkan sebelum kontrol?",
    );
    await user.click(screen.getByRole("button", { name: "Kirim" }));
    expect(screen.getByRole("status")).toHaveTextContent(
      "Menyiapkan jawaban aman",
    );
    expect(screen.getByLabelText("Pesan")).toBeDisabled();

    resolveResponse(
      chatResponse(
        "DEMO_FALLBACK — Chatbot sedang tidak tersedia.",
        true,
      ),
    );
    expect(await screen.findByText("DEMO_FALLBACK")).toBeInTheDocument();
    expect(
      screen.getByText(/Chatbot sedang tidak tersedia/i),
    ).toBeInTheDocument();
  });

  it("clears stale messages and ignores a late response after profile switching", async () => {
    let resolveMaya!: (response: Response) => void;
    vi.spyOn(globalThis, "fetch").mockReturnValue(
      new Promise((resolve) => {
        resolveMaya = resolve;
      }),
    );
    const user = userEvent.setup();
    const view = render(
      <CaregiverChatSurface
        patientProfileId="maya-id"
        patientName="Maya Pratama"
      />,
    );
    await user.click(
      screen.getByRole("button", {
        name: "Apa yang perlu saya siapkan sebelum kontrol?",
      }),
    );
    expect(
      screen.getByText("Apa yang perlu saya siapkan sebelum kontrol?", {
        selector: "article p",
      }),
    ).toBeInTheDocument();

    view.rerender(
      <CaregiverChatSurface
        patientProfileId="raka-id"
        patientName="Raka Pratama"
      />,
    );
    expect(await screen.findByText(/Konteks aktif: Raka Pratama/i)).toBeInTheDocument();
    await waitFor(() =>
      expect(
        screen.queryByText("Apa yang perlu saya siapkan sebelum kontrol?", {
          selector: "article p",
        }),
      ).not.toBeInTheDocument(),
    );

    resolveMaya(chatResponse("Data lama Maya tidak boleh muncul."));
    await waitFor(() =>
      expect(
        screen.queryByText("Data lama Maya tidak boleh muncul."),
      ).not.toBeInTheDocument(),
    );
  });

  it("announces emergency escalation assertively for the Patient persona", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      chatResponse(
        "Keluhan ini bisa membutuhkan pertolongan segera. Tekan SOS dan minta bantuan ke IGD.",
      ),
    );
    const user = userEvent.setup();
    const view = render(
      <PatientChatSurface patientProfileId="maya-id" patientName="Maya" />,
    );
    await user.type(screen.getByLabelText("Pesan"), "Saya sesak dan nyeri dada.");
    await user.click(screen.getByRole("button", { name: "Kirim" }));
    expect(
      await screen.findByText(/membutuhkan pertolongan segera/i),
    ).toBeInTheDocument();
    expect(
      view.container.querySelector('[aria-live="assertive"]'),
    ).toBeInTheDocument();
  });

  it("shows a generic forbidden state without profile data leakage", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      Response.json({ error: { code: "FORBIDDEN" } }, { status: 403 }),
    );
    const user = userEvent.setup();
    render(
      <PatientChatSurface patientProfileId="maya-id" patientName="Maya" />,
    );
    await user.type(screen.getByLabelText("Pesan"), "Halo");
    await user.click(screen.getByRole("button", { name: "Kirim" }));
    const error = await screen.findByRole("alert");
    expect(error).toHaveTextContent("tidak dapat diakses");
    expect(error).not.toHaveTextContent("Maya");
  });
});

describe("production chat integration", () => {
  it("mounts Patient chat on the Patient homepage", () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      Response.json({ data: [] }),
    );

    render(
      <PatientHome
        patientProfile={{
          id: "maya-id",
          displayName: "Maya Pratama",
          relationshipLabel: "Ibu",
        }}
      />,
    );

    expect(
      screen.getByRole("heading", { name: "Teman bantu ChroniCare" }),
    ).toBeInTheDocument();
  });

  it("mounts Caregiver chat as a dedicated active-profile view", async () => {
    const profile = {
      id: "maya-id",
      displayName: "Maya Pratama",
      relationshipLabel: "Ibu",
      dateOfBirth: null,
      city: null,
      locationLabel: null,
      primaryConditions: [],
      primaryConditionsStatus: "UNKNOWN" as const,
      allergies: [],
      allergiesStatus: "UNKNOWN" as const,
      currentMedicationsStatus: "UNKNOWN" as const,
      emergencyContactName: null,
      emergencyContactPhone: null,
      emergencyContactStatus: "UNKNOWN" as const,
      bpjsMembershipStatus: "UNKNOWN" as const,
      bpjsNumberLast4: null,
      usualFacilityName: null,
      setupChecklist: { recommendedActions: [] },
    };
    vi.spyOn(globalThis, "fetch").mockImplementation(async (input) => {
      return Response.json({
        data: String(input).endsWith("/patient-profiles") ? [profile] : profile,
      });
    });

    render(
      <CaregiverProfilePanel
        caregiverName="Dimas"
        role="OWNER"
        view="chat"
      />,
    );

    expect(
      await screen.findByRole("heading", { name: "Asisten caregiver" }),
    ).toBeInTheDocument();
    expect(screen.getByText("Konteks aktif: Maya Pratama. Profile lain tidak digunakan.")).toBeInTheDocument();
  });

  it("links caregiver navigation to the dedicated assistant route", () => {
    render(
      <CaregiverProductionShell
        caregiverName="Dimas"
        role="OWNER"
        activeSection="chat"
        loggingOut={false}
        onLogout={() => undefined}
      >
        <div />
      </CaregiverProductionShell>,
    );

    const assistantLinks = screen.getAllByRole("link", { name: "Asisten" });
    expect(assistantLinks).toHaveLength(2);
    for (const link of assistantLinks) {
      expect(link).toHaveAttribute("href", "/caregiver/chat");
      expect(link).toHaveAttribute("aria-current", "page");
    }
    expect(screen.queryByText("Dokumen")).not.toBeInTheDocument();
  });
});
