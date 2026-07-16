import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

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
    setupChecklist: { recommendedActions: ["REVIEW_ALLERGIES"] },
  };
}

describe("caregiver profile switching", () => {
  it("clears Maya details while Raka is still loading", async () => {
    const maya = profile("maya-id", "Maya Pratama", "Maya");
    const raka = profile("raka-id", "Raka Pratama", "Raka");
    let resolveRaka!: (response: Response) => void;
    const pendingRaka = new Promise<Response>((resolve) => {
      resolveRaka = resolve;
    });
    vi.spyOn(globalThis, "fetch").mockImplementation(async (input) => {
      const url = String(input);
      if (url === "/api/v1/patient-profiles") {
        return Response.json({ data: [maya, raka] });
      }
      if (url.endsWith("maya-id")) return Response.json({ data: maya });
      if (url.endsWith("raka-id")) return pendingRaka;
      return new Response(null, { status: 404 });
    });

    const user = userEvent.setup();
    render(<CaregiverProfilePanel role="FAMILY_MEMBER" />);
    expect(
      await screen.findByRole("heading", { level: 3, name: "Maya Pratama" }),
    ).toBeInTheDocument();

    await user.selectOptions(
      screen.getByLabelText("Patient Profile aktif"),
      "raka-id",
    );
    expect(
      screen.queryByRole("heading", { level: 3, name: "Maya Pratama" }),
    ).not.toBeInTheDocument();
    expect(await screen.findByText("Memuat Raka Pratama.")).toBeInTheDocument();

    resolveRaka(Response.json({ data: raka }));
    expect(
      await screen.findByRole("heading", { level: 3, name: "Raka Pratama" }),
    ).toBeInTheDocument();
  });

  it("shows a specific create error without claiming the profile list failed", async () => {
    vi.spyOn(globalThis, "fetch").mockImplementation(async (input, init) => {
      const url = String(input);
      if (url === "/api/v1/patient-profiles" && !init?.method) {
        return Response.json({ data: [] });
      }
      if (url === "/api/v1/patient-profiles" && init?.method === "POST") {
        return Response.json(
          { error: { code: "CONFLICT", message: "generic" } },
          { status: 409 },
        );
      }
      return new Response(null, { status: 404 });
    });

    const user = userEvent.setup();
    render(<CaregiverProfilePanel role="OWNER" />);
    expect(
      await screen.findByText("Belum ada Patient Profile pada Care Circle ini."),
    ).toBeInTheDocument();

    await user.type(screen.getByLabelText("Nama tampilan"), "Profil QA");
    await user.type(screen.getByLabelText("Label hubungan"), "QA");
    await user.click(
      screen.getByRole("button", { name: "Buat profil minimum" }),
    );

    expect(
      await screen.findByText("Patient Profile belum dapat dibuat"),
    ).toBeInTheDocument();
    expect(
      screen.queryByText("Patient Profile belum dapat dimuat"),
    ).not.toBeInTheDocument();
  });
});
