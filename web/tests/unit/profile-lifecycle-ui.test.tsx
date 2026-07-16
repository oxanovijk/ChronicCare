import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";

import { CaregiverProfilePanel } from "@/components/profile/caregiver-profile-panel";

function profile(id: string, displayName: string, relationshipLabel: string) {
  return {
    id,
    displayName,
    relationshipLabel,
    dateOfBirth: null,
    city: "Tangerang",
    locationLabel: null,
    primaryConditions: [],
    primaryConditionsStatus: "UNKNOWN",
    allergies: [],
    allergiesStatus: "UNKNOWN",
    currentMedicationsStatus: "UNKNOWN",
    emergencyContactName: null,
    emergencyContactPhone: null,
    emergencyContactStatus: "UNKNOWN",
    bpjsMembershipStatus: "UNKNOWN",
    bpjsNumberLast4: null,
    usualFacilityName: null,
    setupChecklist: { recommendedActions: [] },
  };
}

afterEach(() => vi.restoreAllMocks());

describe("caregiver Patient Profile lifecycle UI", () => {
  it("requires Owner confirmation and removes the deactivated profile", async () => {
    const maya = profile("maya-id", "Maya Pratama", "Maya");
    const raka = profile("raka-id", "Raka Pratama", "Raka");
    const fetch = vi.spyOn(globalThis, "fetch").mockImplementation(
      async (input, init) => {
        const url = String(input);
        if (url === "/api/v1/patient-profiles" && !init?.method) {
          return Response.json({ data: [maya, raka] });
        }
        if (url.endsWith("maya-id")) return Response.json({ data: maya });
        if (url.endsWith("raka-id")) return Response.json({ data: raka });
        if (url.endsWith("maya-id/deactivate") && init?.method === "POST") {
          return Response.json({
            data: {
              id: "maya-id",
              status: "END_OF_CARE",
              reason: "OTHER",
              deactivatedAt: "2026-07-17T04:00:00.000Z",
            },
          });
        }
        return new Response(null, { status: 404 });
      },
    );

    const user = userEvent.setup();
    render(<CaregiverProfilePanel role="OWNER" />);
    expect(
      await screen.findByRole("heading", { level: 3, name: "Maya Pratama" }),
    ).toBeInTheDocument();

    await user.click(
      screen.getByRole("button", { name: "Nonaktifkan profil" }),
    );
    expect(
      screen.getByText(/Riwayat tetap tersimpan, sedangkan kode dan sesi/),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/bukan pembatalan langganan atau pembayaran/),
    ).toBeInTheDocument();
    await user.selectOptions(screen.getByLabelText("Alasan"), "OTHER");
    await user.type(
      screen.getByLabelText("Catatan singkat (opsional)"),
      "Catatan sintetis",
    );
    await user.click(
      screen.getByRole("button", { name: "Akhiri perawatan profil" }),
    );

    expect(
      await screen.findByText("Patient Profile dinonaktifkan"),
    ).toBeInTheDocument();
    expect(
      await screen.findByRole("heading", { level: 3, name: "Raka Pratama" }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("heading", { level: 3, name: "Maya Pratama" }),
    ).not.toBeInTheDocument();

    const lifecycleCall = fetch.mock.calls.find(
      ([url, init]) =>
        String(url).endsWith("maya-id/deactivate") && init?.method === "POST",
    );
    expect(JSON.parse(String(lifecycleCall?.[1]?.body))).toEqual({
      reason: "OTHER",
      note: "Catatan sintetis",
    });
  });

  it("does not show the lifecycle action to Family Members", async () => {
    const maya = profile("maya-id", "Maya Pratama", "Maya");
    vi.spyOn(globalThis, "fetch").mockImplementation(async (input) => {
      const url = String(input);
      if (url === "/api/v1/patient-profiles") {
        return Response.json({ data: [maya] });
      }
      if (url.endsWith("maya-id")) return Response.json({ data: maya });
      return new Response(null, { status: 404 });
    });

    render(<CaregiverProfilePanel role="FAMILY_MEMBER" />);
    expect(
      await screen.findByRole("heading", { level: 3, name: "Maya Pratama" }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "Nonaktifkan profil" }),
    ).not.toBeInTheDocument();
  });
});
