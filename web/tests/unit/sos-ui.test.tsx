import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const realtime = vi.hoisted(() => ({
  change: null as null | ((payload: { eventType: string }) => void),
  status: null as null | ((status: string) => void),
  removeChannel: vi.fn(),
}));

vi.mock("@/lib/supabase/browser", () => ({
  createSupabaseBrowserClient: () => {
    const channel = {
      on: vi.fn(
        (
          _kind: string,
          _filter: unknown,
          callback: (payload: { eventType: string }) => void,
        ) => {
          realtime.change = callback;
          return channel;
        },
      ),
      subscribe: vi.fn((callback: (status: string) => void) => {
        realtime.status = callback;
        queueMicrotask(() => callback("SUBSCRIBED"));
        return channel;
      }),
    };
    return { channel: vi.fn(() => channel), removeChannel: realtime.removeChannel };
  },
}));

import { CaregiverSosCenter } from "@/components/sos/caregiver-sos-center";
import { PatientSosAction } from "@/components/sos/patient-sos-action";

const patientProfileId = "10000000-0000-4000-8000-000000000004";
const event = {
  id: "20000000-0000-4000-8000-000000000001",
  patientProfileId,
  patientDisplayName: "Maya Pratama",
  status: "NEW",
  message: "Saya butuh bantuan caregiver sekarang.",
  locationLabel: "Karawaci, Tangerang",
  createdAt: "2026-07-17T09:30:00.000Z",
  handledBy: null,
  handledAt: null,
};

beforeEach(() => {
  vi.restoreAllMocks();
  realtime.change = null;
  realtime.status = null;
  realtime.removeChannel.mockReset();
  Object.defineProperty(window, "AudioContext", {
    value: undefined,
    configurable: true,
  });
});

afterEach(() => vi.restoreAllMocks());

describe("Packet 12 Patient SOS UI", () => {
  it("confirms a profile-bound SOS and focuses honest success copy", async () => {
    const fetch = vi.spyOn(globalThis, "fetch").mockResolvedValue(
      Response.json({ data: event }, { status: 201 }),
    );
    const user = userEvent.setup();
    render(<PatientSosAction patientProfileId={patientProfileId} />);

    await user.click(screen.getByRole("button", { name: "Buka SOS" }));
    expect(screen.getByRole("heading", { name: "Kirim SOS ke caregiver sekarang?" })).toBeVisible();
    await user.click(screen.getByRole("button", { name: "Ya, kirim SOS" }));

    expect(await screen.findByText("SOS sudah disimpan")).toBeVisible();
    expect(screen.getByRole("status")).toHaveFocus();
    expect(screen.getByText(/bukan layanan darurat resmi/i)).toBeVisible();
    const options = fetch.mock.calls[0]?.[1];
    expect(new Headers(options?.headers).get("Idempotency-Key")).toMatch(
      /^[0-9a-f-]{36}$/i,
    );
    expect(JSON.parse(String(options?.body))).toEqual({
      message: "Saya butuh bantuan caregiver sekarang.",
    });
  });

  it("keeps the same idempotency key when a failed request is retried", async () => {
    const fetch = vi
      .spyOn(globalThis, "fetch")
      .mockRejectedValueOnce(new Error("offline"))
      .mockResolvedValueOnce(Response.json({ data: event }, { status: 201 }));
    const user = userEvent.setup();
    render(<PatientSosAction patientProfileId={patientProfileId} />);

    await user.click(screen.getByRole("button", { name: "Buka SOS" }));
    await user.click(screen.getByRole("button", { name: "Ya, kirim SOS" }));
    expect(await screen.findByText("SOS belum tersimpan")).toBeVisible();
    await user.click(screen.getByRole("button", { name: "Ya, kirim SOS" }));
    expect(await screen.findByText("SOS sudah disimpan")).toBeVisible();

    const keys = fetch.mock.calls.map(([, options]) =>
      new Headers(options?.headers).get("Idempotency-Key"),
    );
    expect(keys[0]).toBe(keys[1]);
  });
});

describe("Packet 12 caregiver SOS UI", () => {
  it("keeps the visual alert visible when audio is blocked", async () => {
    vi.spyOn(globalThis, "fetch").mockImplementation(async () =>
      Response.json({ data: [event] }),
    );
    const user = userEvent.setup();
    render(<CaregiverSosCenter />);

    expect(await screen.findByRole("heading", { name: "Maya Pratama meminta bantuan" })).toBeVisible();
    await user.click(screen.getByRole("button", { name: "Aktifkan dan tes suara" }));

    expect(screen.getByText(/Audio diblokir atau tidak tersedia/)).toBeVisible();
    expect(screen.getByRole("alert")).toHaveTextContent("Maya Pratama meminta bantuan");
  });

  it("refetches authoritative REST data on Realtime changes and window focus", async () => {
    const fetch = vi.spyOn(globalThis, "fetch").mockImplementation(async () =>
      Response.json({ data: [event] }),
    );
    render(<CaregiverSosCenter />);
    await screen.findByRole("heading", { name: "Maya Pratama meminta bantuan" });
    const initialCalls = fetch.mock.calls.length;

    realtime.change?.({ eventType: "UPDATE" });
    await waitFor(() => expect(fetch.mock.calls.length).toBeGreaterThan(initialCalls));
    const afterRealtime = fetch.mock.calls.length;
    fireEvent.focus(window);
    await waitFor(() => expect(fetch.mock.calls.length).toBeGreaterThan(afterRealtime));
    expect(fetch.mock.calls.every(([url]) => String(url).includes("/api/v1/sos-events?status=NEW"))).toBe(true);
  });

  it("shows the verified first handler when this caregiver loses the conflict", async () => {
    const handled = {
      ...event,
      status: "HANDLED",
      handledBy: { id: "owner-id", displayName: "Dimas Pratama" },
      handledAt: "2026-07-17T09:31:00.000Z",
    };
    vi.spyOn(globalThis, "fetch").mockImplementation(async (url) => {
      if (String(url).endsWith("/handle")) {
        return Response.json(
          {
            error: {
              code: "SOS_ALREADY_HANDLED",
              details: { current: handled },
            },
          },
          { status: 409 },
        );
      }
      return Response.json({ data: [event] });
    });
    const user = userEvent.setup();
    render(<CaregiverSosCenter />);
    await screen.findByRole("heading", { name: "Maya Pratama meminta bantuan" });

    await user.click(screen.getByRole("button", { name: "Saya tangani" }));

    expect(await screen.findByText("Caregiver lain lebih dulu menangani")).toBeVisible();
    expect(screen.getByText(/ditangani oleh Dimas Pratama/)).toBeVisible();
    expect(screen.queryByRole("button", { name: "Saya tangani" })).not.toBeInTheDocument();
  });
});
