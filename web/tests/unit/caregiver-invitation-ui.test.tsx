import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

const getSession = vi.fn();
const signInWithPassword = vi.fn();
const signUp = vi.fn();
const replace = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace, refresh: vi.fn() }),
}));

vi.mock("@/lib/supabase/browser", () => ({
  createSupabaseBrowserClient: () => ({
    auth: { getSession, signInWithPassword, signUp },
  }),
}));

import { FamilyInvitationForm } from "@/components/auth/family-invitation-form";
import { InvitationPanel } from "@/components/auth/invitation-panel";

describe("caregiver invitation UI", () => {
  beforeEach(() => {
    getSession.mockReset();
    signInWithPassword.mockReset();
    signUp.mockReset();
    replace.mockReset();
    vi.restoreAllMocks();
    vi.unstubAllEnvs();
  });

  it("lets an Owner create and copy an invitation link", async () => {
    const user = userEvent.setup();
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: { writeText },
    });
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      Response.json(
        {
          data: {
            id: "invitation-id",
            invitePath: "/caregiver/invite/synthetic-token",
            expiresAt: "2026-07-18T07:00:00.000Z",
          },
        },
        { status: 201 },
      ),
    );
    render(<InvitationPanel />);
    await user.click(
      screen.getByRole("button", { name: "Buat tautan undangan" }),
    );

    const link = await screen.findByLabelText("Tautan undangan");
    expect(link).toHaveValue(
      "http://localhost:3000/caregiver/invite/synthetic-token",
    );
    await user.click(screen.getByRole("button", { name: "Salin tautan" }));
    expect(await screen.findByText("Tautan tersalin.")).toBeInTheDocument();
    expect(writeText).toHaveBeenCalledWith(
      "http://localhost:3000/caregiver/invite/synthetic-token",
    );
    expect(
      screen.getByText("Tautan lokal hanya dapat digunakan pada perangkat ini."),
    ).toBeInTheDocument();
  });

  it("uses NEXT_PUBLIC_APP_URL for a shareable deployed invitation", async () => {
    vi.stubEnv("NEXT_PUBLIC_APP_URL", "https://chronicare.example/");
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      Response.json(
        {
          data: {
            id: "invitation-id",
            invitePath: "/caregiver/invite/synthetic-token",
            expiresAt: "2026-07-18T07:00:00.000Z",
          },
        },
        { status: 201 },
      ),
    );
    const user = userEvent.setup();
    render(<InvitationPanel />);

    await user.click(
      screen.getByRole("button", { name: "Buat tautan undangan" }),
    );

    expect(await screen.findByLabelText("Tautan undangan")).toHaveValue(
      "https://chronicare.example/caregiver/invite/synthetic-token",
    );
    expect(
      screen.queryByText("Tautan lokal hanya dapat digunakan pada perangkat ini."),
    ).not.toBeInTheDocument();
  });

  it("registers a Family Member through a valid invitation without client role data", async () => {
    getSession.mockResolvedValue({ data: { session: null }, error: null });
    signUp.mockResolvedValue({ data: { session: {} }, error: null });
    const fetch = vi
      .spyOn(globalThis, "fetch")
      .mockResolvedValueOnce(
        Response.json({
          data: {
            careCircleName: "Keluarga Nadia",
            expiresAt: "2026-07-18T07:00:00.000Z",
          },
        }),
      )
      .mockResolvedValueOnce(
        Response.json(
          { data: { membership: { role: "FAMILY_MEMBER" } } },
          { status: 201 },
        ),
      );

    const user = userEvent.setup();
    render(<FamilyInvitationForm token="synthetic-token" />);
    expect(
      await screen.findByText("Gabung ke Keluarga Nadia"),
    ).toBeInTheDocument();
    await user.type(screen.getByLabelText("Nama tampilan"), "Rina Santoso");
    await user.type(screen.getByLabelText("Email"), "rina@example.com");
    await user.type(screen.getByLabelText("Kata sandi"), "SyntheticPass123!");
    await user.type(
      screen.getByLabelText("Ulangi kata sandi"),
      "SyntheticPass123!",
    );
    await user.click(
      screen.getByRole("button", { name: "Daftar dan bergabung" }),
    );

    await waitFor(() => expect(replace).toHaveBeenCalledWith("/caregiver"));
    expect(signUp).toHaveBeenCalledWith(
      expect.objectContaining({
        email: "rina@example.com",
        options: expect.objectContaining({
          data: { display_name: "Rina Santoso" },
        }),
      }),
    );
    expect(signUp.mock.calls[0]?.[0].options.data).not.toHaveProperty("role");
    expect(signUp.mock.calls[0]?.[0].options.data).not.toHaveProperty(
      "careCircleId",
    );
    expect(fetch).toHaveBeenNthCalledWith(
      2,
      "/api/v1/care-circle/invitations/synthetic-token/accept",
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({ displayName: "Rina Santoso" }),
      }),
    );
  });

  it("waits for email verification without consuming the invitation", async () => {
    getSession.mockResolvedValue({ data: { session: null }, error: null });
    signUp.mockResolvedValue({
      data: { session: null, user: { id: "pending-family" } },
      error: null,
    });
    const fetch = vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(
      Response.json({
        data: {
          careCircleName: "Keluarga Nadia",
          expiresAt: "2026-07-18T07:00:00.000Z",
        },
      }),
    );

    const user = userEvent.setup();
    render(<FamilyInvitationForm token="synthetic-token" />);
    await screen.findByText("Gabung ke Keluarga Nadia");
    await user.type(screen.getByLabelText("Nama tampilan"), "Rina Santoso");
    await user.type(screen.getByLabelText("Email"), "rina@example.com");
    await user.type(screen.getByLabelText("Kata sandi"), "SyntheticPass123!");
    await user.type(
      screen.getByLabelText("Ulangi kata sandi"),
      "SyntheticPass123!",
    );
    await user.click(
      screen.getByRole("button", { name: "Daftar dan bergabung" }),
    );

    expect(await screen.findByText("Periksa email Anda")).toBeInTheDocument();
    expect(fetch).toHaveBeenCalledTimes(1);
  });

  it("shows a generic unavailable state for an invalid invitation", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      Response.json(
        { error: { code: "NOT_FOUND", message: "provider detail" } },
        { status: 404 },
      ),
    );

    render(<FamilyInvitationForm token="invalid-token" />);

    expect(
      await screen.findByText("Undangan tidak tersedia"),
    ).toBeInTheDocument();
    expect(screen.queryByText("provider detail")).not.toBeInTheDocument();
  });
});
