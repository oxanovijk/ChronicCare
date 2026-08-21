import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { FacilityHelper } from "@/components/facilities/facility-helper";
import { CaregiverDashboard } from "@/components/caregiver/caregiver-dashboard";
import { CaregiverProductionShell } from "@/components/caregiver/caregiver-production-shell";

const facility = {
  sourceKey: "rsud-kota-tangerang",
  name: "RSUD Kota Tangerang",
  facilityType: "RUMAH_SAKIT",
  city: "Kota Tangerang",
  area: "Tangerang",
  addressText: "Kota Tangerang",
  phoneNumber: null,
  supportsBpjs: true,
  hasEmergencyUnit: true,
  services: ["Penyakit Dalam", "IGD"],
  specialties: [],
  sourceLabel: "Situs resmi RSUD Kota Tangerang",
  sourceUrl: "https://rsud.tangerangkota.go.id/",
  lastReviewedAt: "2026-07-17",
};

const unknownFacility = {
  ...facility,
  sourceKey: "rs-emc-tangerang",
  name: "RS EMC Tangerang",
  supportsBpjs: null,
  hasEmergencyUnit: null,
};

const filterOptions = {
  cities: ["Kabupaten Tangerang", "Kota Tangerang", "Tangerang Selatan"],
  areas: ["Cipondoh", "Tangerang"],
  facilityTypes: ["LAB", "PUSKESMAS", "RUMAH_SAKIT"],
  services: ["Dokter Umum", "IGD", "Penyakit Dalam"],
  specialties: ["Patologi Klinik"],
};

const guide = {
  id: "cek-status-kepesertaan",
  version: "packet10.v1",
  title: "Cek Status Kepesertaan JKN",
  category: "MEMBERSHIP",
  summary: "Periksa status melalui Mobile JKN.",
  steps: ["Buka Mobile JKN.", "Pilih Info Peserta."],
  caveat: "Konfirmasi kembali melalui kanal resmi BPJS Kesehatan.",
  sourceLabel: "BPJS Kesehatan",
  sourceUrl: "https://bpjs-kesehatan.go.id/",
  lastReviewedAt: "2026-07-17",
};

function response(data: unknown, status = 200) {
  return Promise.resolve(new Response(JSON.stringify(status < 400 ? { data } : { error: data }), {
    status,
    headers: { "Content-Type": "application/json" },
  }));
}

describe("Packet 10 facility helper UI", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("keeps active Patient context and renders source-backed null semantics", async () => {
    vi.spyOn(globalThis, "fetch").mockImplementation((input) => {
      const url = String(input);
      return url.includes("bpjs-guides")
        ? response({ items: [guide], total: 1, version: "packet10.v1" })
        : response({ items: [facility, unknownFacility], total: 2, filterOptions, appliedFilters: {} });
    });

    render(<FacilityHelper patientProfileId="maya-id" patientName="Maya Pratama" />);

    expect(screen.getByText(/Memuat data fasilitas/i)).toBeInTheDocument();
    expect(await screen.findByRole("heading", { name: "RSUD Kota Tangerang" })).toBeInTheDocument();
    expect(screen.getByText("Konteks aktif: Maya Pratama")).toBeInTheDocument();
    expect(screen.getAllByText("Ditinjau 17 Juli 2026").length).toBeGreaterThan(0);
    expect(screen.getByText("BPJS belum terverifikasi")).toBeInTheDocument();
    expect(screen.getByText("Unit darurat belum terverifikasi")).toBeInTheDocument();
    expect(screen.queryByRole("link", { name: /Hubungi RS EMC/i })).not.toBeInTheDocument();
  });

  it("requests combined filters, resets them, and explains dataset no-result", async () => {
    const fetchMock = vi.spyOn(globalThis, "fetch").mockImplementation((input) => {
      const url = new URL(String(input), "http://localhost");
      if (url.pathname.includes("bpjs-guides")) {
        return response({ items: [guide], total: 1, version: "packet10.v1" });
      }
      const isNoResult = url.searchParams.get("city") === "Kabupaten Tangerang" && url.searchParams.get("service") === "Dokter Umum";
      return response({ items: isNoResult ? [] : [facility], total: isNoResult ? 0 : 1, filterOptions, appliedFilters: {} });
    });
    const user = userEvent.setup();
    render(<FacilityHelper patientProfileId="maya-id" patientName="Maya Pratama" />);
    await screen.findByRole("heading", { name: "RSUD Kota Tangerang" });

    await user.selectOptions(screen.getByLabelText("Kota"), "Kota Tangerang");
    await user.selectOptions(screen.getByLabelText("Layanan"), "Penyakit Dalam");
    await user.click(screen.getByRole("checkbox", { name: "Informasi BPJS terverifikasi" }));

    await waitFor(() => expect(fetchMock).toHaveBeenCalledWith(expect.stringContaining("supportsBpjs=true"), expect.anything()));
    await user.click(screen.getByRole("button", { name: "Reset filter" }));
    expect(screen.getByLabelText("Kota")).toHaveValue("");

    await user.selectOptions(screen.getByLabelText("Kota"), "Kabupaten Tangerang");
    await user.selectOptions(screen.getByLabelText("Layanan"), "Dokter Umum");
    expect(await screen.findByRole("heading", { name: "Tidak ada hasil pada dataset ini" })).toBeInTheDocument();
    expect(screen.getByText(/bukan berarti fasilitas tersebut tidak ada/i)).toBeInTheDocument();
  });

  it("clears city-scoped filters when the city changes", async () => {
    const requestedUrls: string[] = [];
    vi.spyOn(globalThis, "fetch").mockImplementation((input) => {
      const url = String(input);
      if (url.includes("bpjs-guides")) {
        return response({ items: [guide], total: 1, version: "packet10.v1" });
      }
      requestedUrls.push(url);
      return response({ items: [facility], total: 1, filterOptions, appliedFilters: {} });
    });
    const user = userEvent.setup();
    render(<FacilityHelper patientProfileId="maya-id" patientName="Maya Pratama" />);
    await screen.findByRole("heading", { name: "RSUD Kota Tangerang" });

    await user.selectOptions(screen.getByLabelText("Jenis fasilitas"), "RUMAH_SAKIT");
    await user.selectOptions(screen.getByLabelText("Layanan"), "Penyakit Dalam");
    await user.selectOptions(screen.getByLabelText("Spesialisasi"), "Patologi Klinik");
    await user.selectOptions(screen.getByLabelText("Kota"), "Tangerang Selatan");

    expect(screen.getByLabelText("Jenis fasilitas")).toHaveValue("");
    expect(screen.getByLabelText("Layanan")).toHaveValue("");
    expect(screen.getByLabelText("Spesialisasi")).toHaveValue("");
    await waitFor(() => {
      const latest = new URL(requestedUrls.at(-1) ?? "", "http://localhost");
      expect(latest.searchParams.get("city")).toBe("Tangerang Selatan");
      expect(latest.searchParams.has("facilityType")).toBe(false);
      expect(latest.searchParams.has("service")).toBe(false);
      expect(latest.searchParams.has("specialty")).toBe(false);
    });
  });

  it("shows BPJS steps and caveat in the guide tab", async () => {
    vi.spyOn(globalThis, "fetch").mockImplementation((input) => String(input).includes("bpjs-guides")
      ? response({ items: [guide], total: 1, version: "packet10.v1" })
      : response({ items: [facility], total: 1, filterOptions, appliedFilters: {} }));
    const user = userEvent.setup();
    render(<FacilityHelper patientProfileId="maya-id" patientName="Maya Pratama" />);

    await user.click(screen.getByRole("tab", { name: "Panduan BPJS" }));
    const disclosure = await screen.findByText("Cek Status Kepesertaan JKN");
    fireEvent.click(disclosure);
    const guideRegion = screen.getByTestId("bpjs-guide-cek-status-kepesertaan");
    expect(within(guideRegion).getByText("Buka Mobile JKN.")).toBeInTheDocument();
    expect(within(guideRegion).getByText(/Konfirmasi kembali/i)).toBeInTheDocument();
  });

  it("offers a retry after a facilities request fails", async () => {
    const fetchMock = vi.spyOn(globalThis, "fetch")
      .mockImplementationOnce(() => response({ code: "INTERNAL_ERROR", message: "Terjadi kesalahan." }, 500))
      .mockImplementationOnce(() => response({ items: [guide], total: 1, version: "packet10.v1" }))
      .mockImplementation(() => response({ items: [facility], total: 1, filterOptions, appliedFilters: {} }));
    const user = userEvent.setup();
    render(<FacilityHelper patientProfileId="maya-id" patientName="Maya Pratama" />);

    expect(await screen.findByText("Data fasilitas belum dapat dimuat.")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Coba lagi memuat fasilitas" }));
    expect(await screen.findByRole("heading", { name: "RSUD Kota Tangerang" })).toBeInTheDocument();
    expect(fetchMock).toHaveBeenCalledTimes(3);
  });

  it("labels an expired caregiver session without exposing data", async () => {
    vi.spyOn(globalThis, "fetch").mockImplementation((input) => String(input).includes("bpjs-guides")
      ? response({ items: [guide], total: 1, version: "packet10.v1" })
      : response({ code: "UNAUTHENTICATED", message: "Sesi tidak tersedia." }, 401));

    render(<FacilityHelper patientProfileId="maya-id" patientName="Maya Pratama" />);

    expect(await screen.findByText("Sesi caregiver telah berakhir.")).toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: "RSUD Kota Tangerang" })).not.toBeInTheDocument();
  });

  it("retries a failed BPJS guide request", async () => {
    let guideAttempts = 0;
    vi.spyOn(globalThis, "fetch").mockImplementation((input) => {
      if (!String(input).includes("bpjs-guides")) {
        return response({ items: [facility], total: 1, filterOptions, appliedFilters: {} });
      }
      guideAttempts += 1;
      return guideAttempts === 1
        ? response({ code: "INTERNAL_ERROR", message: "Terjadi kesalahan." }, 500)
        : response({ items: [guide], total: 1, version: "packet10.v1" });
    });
    const user = userEvent.setup();
    render(<FacilityHelper patientProfileId="maya-id" patientName="Maya Pratama" />);

    await user.click(screen.getByRole("tab", { name: "Panduan BPJS" }));
    expect(await screen.findByText("Panduan BPJS belum dapat dimuat.")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Coba lagi memuat panduan" }));
    expect(await screen.findByText("Cek Status Kepesertaan JKN")).toBeInTheDocument();
    expect(guideAttempts).toBe(2);
  });

  it("keeps the production dashboard focused on daily care", async () => {
    vi.spyOn(globalThis, "fetch").mockImplementation((input) => {
      const url = String(input);
      if (url.includes("/dashboard")) return response({
        patientProfile: {
          id: "maya-id", displayName: "Maya Pratama", relationshipLabel: "Maya",
          primaryConditionsStatus: "REPORTED", allergiesStatus: "UNKNOWN",
          currentMedicationsStatus: "UNKNOWN", emergencyContactStatus: "UNKNOWN",
          bpjsMembershipStatus: "UNKNOWN",
        },
        setupChecklist: { recommendedActions: [] }, latestCheckIn: null,
        activeMedications: [], upcomingReminders: [], recentHealthNotes: [],
      });
      return response({ code: "NOT_FOUND", message: "Not found." }, 404);
    });
    render(<CaregiverDashboard
      patientProfile={{ id: "maya-id", displayName: "Maya Pratama", relationshipLabel: "Maya", currentMedicationsStatus: "UNKNOWN" }}
      caregiverName="Dimas"
      role="OWNER"
    />);

    expect(await screen.findByRole("heading", { name: "Selamat datang, Dimas" })).toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: "Faskes & panduan BPJS" })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Buka Faskes & BPJS" })).not.toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: "Asisten caregiver" })).not.toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "Jaga rutinitas tetap mudah diikuti" }).closest("section"),
    ).toHaveAttribute("id", "daily-care");
    expect(screen.getByText("SOS Realtime")).toBeInTheDocument();
    expect(screen.getAllByText("Belum tersedia", { selector: "small" })).toHaveLength(2);
  });

  it("exposes a dedicated active facility destination in caregiver navigation", () => {
    render(
      <CaregiverProductionShell
        caregiverName="Dimas"
        role="OWNER"
        activeSection="facilities"
        onLogout={() => undefined}
        loggingOut={false}
      >
        <p>Konten fasilitas</p>
      </CaregiverProductionShell>,
    );

    const desktopNavigation = screen.getByRole("navigation", { name: "Navigasi caregiver" });
    const facilityLink = within(desktopNavigation).getByRole("link", { name: "Fasilitas Kesehatan" });
    expect(facilityLink).toHaveAttribute("href", "/caregiver/facilities");
    expect(facilityLink).toHaveAttribute("aria-current", "page");
    expect(within(desktopNavigation).getByRole("link", { name: "Ringkasan" })).not.toHaveAttribute("aria-current");

    const mobileNavigation = screen.getByRole("navigation", { name: "Navigasi caregiver mobile" });
    expect(within(mobileNavigation).getByRole("link", { name: "Fasilitas" })).toHaveAttribute("aria-current", "page");
  });
});
