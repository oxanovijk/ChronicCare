import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import {
  PasswordResetRequestForm,
  PasswordUpdateForm,
} from "@/components/auth/password-reset-forms";

const resetPasswordForEmail = vi.fn();
const getUser = vi.fn();
const updateUser = vi.fn();

vi.mock("@/lib/supabase/browser", () => ({
  createSupabaseBrowserClient: () => ({
    auth: { resetPasswordForEmail, getUser, updateUser },
  }),
}));

describe("caregiver password recovery", () => {
  beforeEach(() => {
    resetPasswordForEmail.mockReset();
    getUser.mockReset();
    updateUser.mockReset();
    resetPasswordForEmail.mockResolvedValue({ error: null });
    getUser.mockResolvedValue({
      data: { user: { id: "synthetic-caregiver" } },
      error: null,
    });
    updateUser.mockResolvedValue({ error: null });
  });

  it("requests a recovery link with the local PKCE callback", async () => {
    const user = userEvent.setup();
    render(<PasswordResetRequestForm />);

    await user.type(screen.getByLabelText("Email caregiver"), "owner@example.com");
    await user.click(screen.getByRole("button", { name: "Kirim tautan pemulihan" }));

    expect(await screen.findByText("Periksa email Anda")).toBeInTheDocument();
    expect(resetPasswordForEmail).toHaveBeenCalledWith("owner@example.com", {
      redirectTo: `${window.location.origin}/auth/callback?next=%2Fcaregiver%2Freset-password`,
    });
  });

  it("hides provider details when the recovery request fails", async () => {
    resetPasswordForEmail.mockResolvedValue({
      error: { message: "No user exists for private@example.com" },
    });
    const user = userEvent.setup();
    render(<PasswordResetRequestForm />);

    await user.type(screen.getByLabelText("Email caregiver"), "private@example.com");
    await user.click(screen.getByRole("button", { name: "Kirim tautan pemulihan" }));

    expect(await screen.findByText("Email belum dapat dikirim")).toBeInTheDocument();
    expect(screen.queryByText(/No user exists/)).not.toBeInTheDocument();
  });

  it("updates the password after validating the recovery session", async () => {
    const user = userEvent.setup();
    render(<PasswordUpdateForm />);

    expect(await screen.findByLabelText("Kata sandi baru")).toHaveAttribute(
      "autocomplete",
      "new-password",
    );
    await user.type(screen.getByLabelText("Kata sandi baru"), "new-password-123");
    await user.type(
      screen.getByLabelText("Ulangi kata sandi baru"),
      "new-password-123",
    );
    await user.click(screen.getByRole("button", { name: "Simpan kata sandi baru" }));

    expect(await screen.findByText("Kata sandi berhasil diperbarui")).toBeInTheDocument();
    expect(updateUser).toHaveBeenCalledWith({ password: "new-password-123" });
  });

  it("rejects mismatched passwords before calling Supabase", async () => {
    const user = userEvent.setup();
    render(<PasswordUpdateForm />);

    await screen.findByLabelText("Kata sandi baru");
    await user.type(screen.getByLabelText("Kata sandi baru"), "new-password-123");
    await user.type(
      screen.getByLabelText("Ulangi kata sandi baru"),
      "different-password",
    );
    await user.click(screen.getByRole("button", { name: "Simpan kata sandi baru" }));

    expect(await screen.findByText("Kata sandi belum sama.")).toBeInTheDocument();
    expect(updateUser).not.toHaveBeenCalled();
  });

  it("rejects an expired or invalid recovery session", async () => {
    getUser.mockResolvedValue({
      data: { user: null },
      error: { message: "Auth session missing" },
    });

    render(<PasswordUpdateForm />);

    expect(await screen.findByText("Tautan tidak dapat digunakan")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Minta tautan baru" })).toHaveAttribute(
      "href",
      "/caregiver/forgot-password",
    );
    await waitFor(() => expect(updateUser).not.toHaveBeenCalled());
    expect(screen.queryByText(/Auth session missing/)).not.toBeInTheDocument();
  });
});
