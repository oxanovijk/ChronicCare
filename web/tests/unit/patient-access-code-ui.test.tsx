import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";

import { PatientAccessCodePanel } from "@/components/profile/patient-access-code-panel";

afterEach(() => vi.restoreAllMocks());

describe("Owner Patient access-code controls", () => {
  it("confirms rotation and reveals the raw code only after success", async () => {
    const fetch = vi.spyOn(globalThis, "fetch").mockResolvedValue(
      Response.json(
        { data: { code: "482913", expiresAt: null } },
        { status: 201 },
      ),
    );
    const user = userEvent.setup();

    render(
      <PatientAccessCodePanel
        patientProfile={{ id: "maya-id", displayName: "Maya Pratama" }}
      />,
    );

    expect(screen.queryByText("482913")).not.toBeInTheDocument();
    await user.click(
      screen.getByRole("button", { name: "Buat atau ganti kode Patient" }),
    );
    expect(
      screen.getByText(/kode lama tidak dapat dipakai lagi/i),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Maya Pratama.*akan keluar dari perangkat yang masih terhubung/i),
    ).toBeInTheDocument();
    await user.click(
      screen.getByRole("button", { name: "Terbitkan kode baru" }),
    );

    expect(await screen.findByDisplayValue("482913")).toBeInTheDocument();
    expect(screen.getByRole("status")).toHaveFocus();
    expect(fetch).toHaveBeenCalledWith(
      "/api/v1/patient-profiles/maya-id/access-code",
      expect.objectContaining({ method: "POST", credentials: "same-origin" }),
    );
    expect(localStorage.getItem("patient-access-code")).toBeNull();
  });

  it("copies the one-time code without logging or navigating it", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      Response.json(
        { data: { code: "482913", expiresAt: null } },
        { status: 201 },
      ),
    );
    const user = userEvent.setup();
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: { writeText },
    });
    render(
      <PatientAccessCodePanel
        patientProfile={{ id: "maya-id", displayName: "Maya Pratama" }}
      />,
    );
    await user.click(
      screen.getByRole("button", { name: "Buat atau ganti kode Patient" }),
    );
    await user.click(
      screen.getByRole("button", { name: "Terbitkan kode baru" }),
    );
    await user.click(await screen.findByRole("button", { name: "Salin kode" }));

    expect(writeText).toHaveBeenCalledWith("482913");
    expect(window.location.href).not.toContain("482913");
  });

  it("keeps the confirmation dialog open and focuses a generic error", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      Response.json(
        { error: { code: "INTERNAL_ERROR", message: "private detail" } },
        { status: 500 },
      ),
    );
    const user = userEvent.setup();

    render(
      <PatientAccessCodePanel
        patientProfile={{ id: "maya-id", displayName: "Maya Pratama" }}
      />,
    );
    await user.click(
      screen.getByRole("button", { name: "Buat atau ganti kode Patient" }),
    );
    await user.click(
      screen.getByRole("button", { name: "Terbitkan kode baru" }),
    );

    expect(await screen.findByText("Kode belum dapat diterbitkan")).toBeVisible();
    expect(screen.getByRole("alert")).toHaveFocus();
    expect(screen.getByRole("dialog")).toBeVisible();
    expect(document.body.textContent).not.toContain("private detail");
  });
});
