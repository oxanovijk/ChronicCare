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

  it("shows specific errors for every invalid registration field", async () => {
    const user = userEvent.setup();
    render(<CaregiverRegistrationForm />);

    fireEvent.change(screen.getByLabelText("Nama tampilan"), {
      target: { value: "N" },
    });
    fireEvent.change(screen.getByLabelText("Nama Care Circle"), {
      target: { value: "K" },
    });
    fireEvent.change(screen.getByLabelText("Email"), {
      target: { value: "email-tidak-valid" },
    });
    fireEvent.change(screen.getByLabelText("Kata sandi"), {
      target: { value: "pendek" },
    });
    fireEvent.change(screen.getByLabelText("Ulangi kata sandi"), {
      target: { value: "berbeda" },
    });

    await user.click(screen.getByRole("button", { name: "Daftar sebagai Owner" }));

    expect(screen.getByText("Nama tampilan minimal 2 karakter.")).toBeVisible();
    expect(screen.getByText("Nama Care Circle minimal 2 karakter.")).toBeVisible();
    expect(screen.getByText("Masukkan alamat email yang valid.")).toBeVisible();
    expect(screen.getByText("Kata sandi minimal 8 karakter.")).toBeVisible();
    expect(
      screen.getByText("Konfirmasi kata sandi minimal 8 karakter."),
    ).toBeVisible();
    expect(screen.getByLabelText("Nama tampilan")).toHaveFocus();
    expect(screen.getByLabelText("Nama tampilan")).toHaveAttribute(
      "aria-invalid",
      "true",
    );
    expect(screen.getByLabelText("Nama tampilan")).toHaveAttribute(
      "aria-describedby",
      "registration-display-name-error",
    );
    expect(signUp).not.toHaveBeenCalled();
  });

  it("shows required messages and updates them after fields are corrected", async () => {
    const user = userEvent.setup();
    render(<CaregiverRegistrationForm />);

    await user.click(screen.getByRole("button", { name: "Daftar sebagai Owner" }));

    expect(screen.getByText("Masukkan nama tampilan.")).toBeVisible();
    expect(screen.getByText("Masukkan nama Care Circle.")).toBeVisible();
    expect(screen.getByText("Masukkan email.")).toBeVisible();
    expect(screen.getByText("Masukkan kata sandi.")).toBeVisible();
    expect(screen.getByText("Ulangi kata sandi.")).toBeVisible();

    await user.type(screen.getByLabelText("Nama tampilan"), "Nadia Santoso");

    expect(screen.queryByText("Masukkan nama tampilan.")).not.toBeInTheDocument();
    expect(screen.getByLabelText("Nama tampilan")).not.toHaveAttribute(
      "aria-invalid",
    );
  });

  it("distinguishes maximum lengths and a mismatched confirmation", async () => {
    const user = userEvent.setup();
    render(<CaregiverRegistrationForm />);
    fillRegistration();

    fireEvent.change(screen.getByLabelText("Nama tampilan"), {
      target: { value: "N".repeat(121) },
    });
    fireEvent.change(screen.getByLabelText("Nama Care Circle"), {
      target: { value: "K".repeat(121) },
    });
    fireEvent.change(screen.getByLabelText("Email"), {
      target: { value: `${"a".repeat(244)}@example.com` },
    });
    fireEvent.change(screen.getByLabelText("Kata sandi"), {
      target: { value: "P".repeat(73) },
    });
    fireEvent.change(screen.getByLabelText("Ulangi kata sandi"), {
      target: { value: "KonfirmasiBerbeda123!" },
    });

    await user.click(screen.getByRole("button", { name: "Daftar sebagai Owner" }));

    expect(screen.getByText("Nama tampilan maksimal 120 karakter.")).toBeVisible();
    expect(screen.getByText("Nama Care Circle maksimal 120 karakter.")).toBeVisible();
    expect(screen.getByText("Email maksimal 254 karakter.")).toBeVisible();
    expect(screen.getByText("Kata sandi maksimal 72 karakter.")).toBeVisible();
    expect(screen.getByText("Kata sandi belum sama.")).toBeVisible();
    expect(signUp).not.toHaveBeenCalled();
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

    expect(await screen.findByText("Periksa email atau masuk")).toBeInTheDocument();
    expect(
      screen.getByText(
        "Jika alamat ini dapat didaftarkan, kami mengirim tautan konfirmasi. Jika Anda sudah punya akun, gunakan tombol masuk di bawah.",
      ),
    ).toBeVisible();
    expect(screen.getByRole("status")).toHaveFocus();
    expect(fetch).not.toHaveBeenCalled();
  });

  it("uses the same neutral state for an obfuscated existing identity", async () => {
    signUp.mockResolvedValue({
      data: {
        session: null,
        user: { id: "obfuscated-user", identities: [] },
      },
      error: null,
    });
    const fetch = vi.spyOn(globalThis, "fetch");
    const user = userEvent.setup();
    render(<CaregiverRegistrationForm />);
    fillRegistration();

    await user.click(screen.getByRole("button", { name: "Daftar sebagai Owner" }));

    expect(await screen.findByText("Periksa email atau masuk")).toBeVisible();
    expect(document.body.textContent).not.toContain("sudah terdaftar");
    expect(document.body.textContent).not.toContain("nadia@example.com");
    expect(fetch).not.toHaveBeenCalled();
  });

  it.each(["email_exists", "user_already_exists"])(
    "keeps provider detail private for %s and validates password confirmation",
    async (errorCode) => {
    signUp.mockResolvedValue({
      data: { session: null },
      error: {
        code: errorCode,
        message: "User already registered: nadia@example.com",
      },
    });
    const user = userEvent.setup();
    render(<CaregiverRegistrationForm />);

    fillRegistration();
    fireEvent.change(screen.getByLabelText("Ulangi kata sandi"), {
      target: { value: "BerbedaPass123!" },
    });
    await user.click(screen.getByRole("button", { name: "Daftar sebagai Owner" }));
    expect(screen.getByText("Kata sandi belum sama.")).toBeInTheDocument();
    expect(signUp).not.toHaveBeenCalled();

    fireEvent.change(screen.getByLabelText("Ulangi kata sandi"), {
      target: { value: "SyntheticPass123!" },
    });
    await user.click(screen.getByRole("button", { name: "Daftar sebagai Owner" }));
    expect(await screen.findByText("Periksa email atau masuk"))
      .toBeInTheDocument();
    expect(screen.getByRole("status")).toHaveFocus();
    expect(document.body.textContent).not.toContain("User already registered");
    expect(document.body.textContent).not.toContain("nadia@example.com");
    },
  );

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
