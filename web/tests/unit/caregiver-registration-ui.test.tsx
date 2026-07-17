import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

const signUp = vi.fn();
const replace = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace, refresh: vi.fn() }),
}));
vi.mock("@/lib/supabase/browser", () => ({
  createSupabaseBrowserClient: () => ({ auth: { signUp } }),
}));

import { CaregiverRegistrationForm } from "@/components/auth/caregiver-registration-form";
import { OwnerOnboardingForm } from "@/components/auth/owner-onboarding-form";

function fillRegistration() {
  fireEvent.change(screen.getByLabelText("Nama tampilan"), {
    target: { value: "Nadia Santoso" },
  });
  fireEvent.change(screen.getByLabelText("Nama Care Circle"), {
    target: { value: "Keluarga Nadia" },
  });
  fireEvent.change(screen.getByLabelText("Email"), {
    target: { value: "nadia@example.com" },
  });
  fireEvent.change(screen.getByLabelText("Kata sandi"), {
    target: { value: "SyntheticPass123!" },
  });
  fireEvent.change(screen.getByLabelText("Ulangi kata sandi"), {
    target: { value: "SyntheticPass123!" },
  });
}

describe("Caregiver registration UI", () => {
  beforeEach(() => {
    signUp.mockReset();
    replace.mockReset();
    vi.restoreAllMocks();
  });

  it("creates Auth identity, bootstraps Owner, and clears passwords", async () => {
    signUp.mockResolvedValue({ data: { session: {} }, error: null });
    const fetch = vi.spyOn(globalThis, "fetch").mockResolvedValue(
      Response.json({ data: { membership: { role: "OWNER" } } }, { status: 201 }),
    );
    const user = userEvent.setup();
    render(<CaregiverRegistrationForm />);
    fillRegistration();

    await user.click(screen.getByRole("button", { name: "Daftar sebagai Owner" }));

    await waitFor(() => expect(replace).toHaveBeenCalledWith("/caregiver"));
    expect(screen.getByLabelText("Kata sandi")).toHaveValue("");
    expect(screen.getByLabelText("Ulangi kata sandi")).toHaveValue("");
    expect(signUp).toHaveBeenCalledWith(
      expect.objectContaining({
        email: "nadia@example.com",
        password: "SyntheticPass123!",
        options: expect.objectContaining({
          emailRedirectTo: expect.stringMatching(/\/auth\/callback\?next=%2Fcaregiver$/),
        }),
      }),
    );
    expect(fetch).toHaveBeenCalledWith(
      "/api/v1/onboarding/owner",
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({
          displayName: "Nadia Santoso",
          careCircleName: "Keluarga Nadia",
        }),
      }),
    );
  });

  it("shows a verification state when Supabase does not return a session", async () => {
    signUp.mockResolvedValue({
      data: { session: null, user: { id: "pending-user" } },
      error: null,
    });
    const fetch = vi.spyOn(globalThis, "fetch");
    const user = userEvent.setup();
    render(<CaregiverRegistrationForm />);
    fillRegistration();

    await user.click(screen.getByRole("button", { name: "Daftar sebagai Owner" }));

    expect(await screen.findByText("Periksa email Anda")).toBeInTheDocument();
    expect(screen.getByRole("status")).toHaveFocus();
    expect(fetch).not.toHaveBeenCalled();
  });

  it("keeps provider detail private and validates password confirmation", async () => {
    signUp.mockResolvedValue({
      data: { session: null },
      error: { message: "User already registered: nadia@example.com" },
    });
    const user = userEvent.setup();
    render(<CaregiverRegistrationForm />);

    fillRegistration();
    fireEvent.change(screen.getByLabelText("Ulangi kata sandi"), {
      target: { value: "berbeda" },
    });
    await user.click(screen.getByRole("button", { name: "Daftar sebagai Owner" }));
    expect(screen.getByText("Kata sandi belum sama.")).toBeInTheDocument();
    expect(signUp).not.toHaveBeenCalled();

    fireEvent.change(screen.getByLabelText("Ulangi kata sandi"), {
      target: { value: "SyntheticPass123!" },
    });
    await user.click(screen.getByRole("button", { name: "Daftar sebagai Owner" }));
    expect(await screen.findByText("Pendaftaran belum dapat diselesaikan"))
      .toBeInTheDocument();
    expect(screen.getByRole("alert")).toHaveFocus();
    expect(document.body.textContent).not.toContain("User already registered");
  });

  it("resumes Owner bootstrap for an authenticated account", async () => {
    const onComplete = vi.fn();
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      Response.json({
        data: {
          actorType: "CAREGIVER",
          user: { id: "owner-id", displayName: "Nadia Santoso" },
          membership: { careCircleId: "circle-id", role: "OWNER" },
        },
      }),
    );
    const user = userEvent.setup();
    render(
      <OwnerOnboardingForm
        initialValues={{
          displayName: "Nadia Santoso",
          careCircleName: "Keluarga Nadia",
        }}
        onComplete={onComplete}
      />,
    );
    expect(screen.getByLabelText("Nama tampilan")).toHaveValue("Nadia Santoso");
    expect(screen.getByLabelText("Nama Care Circle")).toHaveValue(
      "Keluarga Nadia",
    );
    await user.click(screen.getByRole("button", { name: "Selesaikan pendaftaran" }));

    await waitFor(() => expect(onComplete).toHaveBeenCalledTimes(1));
  });
});
