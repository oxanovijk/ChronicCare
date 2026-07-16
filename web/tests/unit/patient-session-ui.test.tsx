import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { PatientLoginForm } from "@/components/auth/patient-login-form";

describe("Patient login form", () => {
  it.each([
    [401, "Kode tidak valid atau sudah tidak berlaku."],
    [500, "Proses masuk belum dapat diselesaikan. Coba lagi."],
  ])("uses safe copy for HTTP %s", async (status, message) => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(null, { status }),
    );
    const user = userEvent.setup();
    render(<PatientLoginForm />);

    await user.type(screen.getByLabelText("Kode akses Patient"), "secret-code");
    await user.click(screen.getByRole("button", { name: "Masuk" }));

    expect(await screen.findByText(message)).toBeInTheDocument();
    expect(screen.getByLabelText("Kode akses Patient")).toHaveValue("");
    expect(document.body.textContent).not.toContain("secret-code");
  });
});
