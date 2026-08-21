import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { CaregiverAuthPanel } from "@/components/auth/caregiver-auth-panel";

const signInWithPassword = vi.fn();
const signOut = vi.fn();
const getSession = vi.fn();

vi.mock("@/lib/supabase/browser", () => ({
  createSupabaseBrowserClient: () => ({
    auth: {
      getSession,
      signInWithPassword,
      signOut,
    },
  }),
}));

describe("caregiver auth panel", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    getSession.mockReset();
    signInWithPassword.mockReset();
    signOut.mockReset();
    getSession.mockResolvedValue({
      data: { session: null },
      error: null,
    });
  });

  it("shows an accessible email/password form when signed out", async () => {
    const fetch = vi.spyOn(globalThis, "fetch");

    render(<CaregiverAuthPanel />);

    expect(await screen.findByLabelText("Email caregiver")).toHaveAttribute(
      "autocomplete",
      "email",
    );
    expect(screen.getByLabelText("Kata sandi")).toHaveAttribute(
      "autocomplete",
      "current-password",
    );
    expect(
      screen.getByRole("button", { name: "Masuk sebagai caregiver" }),
    ).toBeEnabled();
    expect(screen.getByRole("link", { name: "Lupa kata sandi?" })).toHaveAttribute(
      "href",
      "/caregiver/forgot-password",
    );
    expect(fetch).not.toHaveBeenCalled();
  });

  it("uses the verified server context after Supabase sign-in", async () => {
    const fetch = vi.spyOn(globalThis, "fetch").mockResolvedValue(
      Response.json({
        data: {
          actorType: "CAREGIVER",
          user: { id: "verified-owner", displayName: "Dimas Pratama" },
          membership: { careCircleId: "server-circle", role: "OWNER" },
        },
        meta: { requestId: "req-owner" },
      }),
    );
    signInWithPassword.mockResolvedValue({
      data: {
        user: {
          id: "verified-owner",
          user_metadata: {
            role: "FAMILY_MEMBER",
            careCircleId: "client-circle",
          },
        },
      },
      error: null,
    });

    const user = userEvent.setup();
    render(<CaregiverAuthPanel />);

    await user.type(
      await screen.findByLabelText("Email caregiver"),
      "owner@example.com",
    );
    await user.type(screen.getByLabelText("Kata sandi"), "synthetic-password");
    await user.click(
      screen.getByRole("button", { name: "Masuk sebagai caregiver" }),
    );

    expect(await screen.findByText("Dimas Pratama")).toBeInTheDocument();
    expect(screen.getByText("Owner")).toBeInTheDocument();
    expect(screen.queryByText("Family Member")).not.toBeInTheDocument();
    expect(fetch).toHaveBeenCalledWith(
      "/api/v1/auth/me",
      expect.objectContaining({ cache: "no-store" }),
    );
  });

  it("shows a generic error without provider detail when sign-in fails", async () => {
    vi.spyOn(globalThis, "fetch");
    signInWithPassword.mockResolvedValue({
      data: { user: null },
      error: { message: "Invalid login credentials for owner@example.com" },
    });

    const user = userEvent.setup();
    render(<CaregiverAuthPanel />);

    await user.type(
      await screen.findByLabelText("Email caregiver"),
      "owner@example.com",
    );
    await user.type(screen.getByLabelText("Kata sandi"), "wrong-password");
    await user.click(
      screen.getByRole("button", { name: "Masuk sebagai caregiver" }),
    );

    expect(screen.getByLabelText("Kata sandi")).toHaveValue("");
    expect(
      await screen.findByText("Email atau kata sandi belum sesuai."),
    ).toBeInTheDocument();
    expect(
      screen.queryByText(/Invalid login credentials/),
    ).not.toBeInTheDocument();
  });

  it("clears the verified context after logout", async () => {
    getSession.mockResolvedValue({
      data: { session: {} },
      error: null,
    });
    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(
      Response.json({
        data: {
          actorType: "CAREGIVER",
          user: { id: "verified-family", displayName: "Rina Pratama" },
          membership: {
            careCircleId: "server-circle",
            role: "FAMILY_MEMBER",
          },
        },
        meta: { requestId: "req-family" },
      }),
    );
    signOut.mockResolvedValue({ error: null });

    const user = userEvent.setup();
    render(<CaregiverAuthPanel />);

    expect(await screen.findByText("Rina Pratama")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Keluar" }));

    await waitFor(() =>
      expect(screen.getByLabelText("Email caregiver")).toBeInTheDocument(),
    );
  });

  it("keeps the verified context when Supabase logout fails", async () => {
    getSession.mockResolvedValue({
      data: { session: {} },
      error: null,
    });
    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(
      Response.json({
        data: {
          actorType: "CAREGIVER",
          user: { id: "verified-family", displayName: "Rina Pratama" },
          membership: {
            careCircleId: "server-circle",
            role: "FAMILY_MEMBER",
          },
        },
        meta: { requestId: "req-family" },
      }),
    );
    signOut.mockResolvedValue({
      error: { message: "Provider detail must stay hidden" },
    });

    const user = userEvent.setup();
    render(<CaregiverAuthPanel />);

    expect(await screen.findByText("Rina Pratama")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Keluar" }));

    expect(await screen.findByText("Rina Pratama")).toBeInTheDocument();
    expect(
      screen.getByText("Proses keluar belum dapat diselesaikan. Coba lagi."),
    ).toBeInTheDocument();
    expect(
      screen.queryByText("Provider detail must stay hidden"),
    ).not.toBeInTheDocument();
  });

  it("offers resumable Owner onboarding to a new verified Auth user", async () => {
    getSession.mockResolvedValue({ data: { session: {} }, error: null });
    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(
      Response.json(
        {
          error: {
            code: "ONBOARDING_REQUIRED",
            message: "Selesaikan pendaftaran caregiver untuk melanjutkan.",
            details: {
              onboardingDefaults: {
                displayName: "Nadia Santoso",
                careCircleName: "Keluarga Nadia",
              },
            },
          },
        },
        { status: 409 },
      ),
    );

    render(<CaregiverAuthPanel />);

    expect(
      await screen.findByRole("heading", { name: "Selesaikan pendaftaran Owner" }),
    ).toBeInTheDocument();
    expect(screen.getByLabelText("Nama tampilan")).toHaveValue("Nadia Santoso");
    expect(screen.getByLabelText("Nama Care Circle")).toHaveValue(
      "Keluarga Nadia",
    );
  });
});
