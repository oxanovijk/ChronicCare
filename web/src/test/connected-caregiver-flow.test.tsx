import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, test } from "vitest";
import { CaregiverAssistant } from "@/components/caregiver-assistant";
import { CaregiverSosPanel } from "@/components/caregiver-sos-panel";
import { DocumentUploadForm } from "@/components/document-upload-form";
import { FacilityHelper } from "@/components/facility-helper";
import { OcrReviewWorkspace } from "@/components/ocr-review-workspace";
import { PatientContextControl } from "@/components/patient-context-control";

describe("connected Caregiver flow", () => {
  test("clears Maya content when switching to Raka", async () => {
    const user = userEvent.setup({ applyAccept: false });
    render(<PatientContextControl />);
    expect(screen.getByText(/kabar terbaru maya/i)).toBeVisible();
    await user.selectOptions(screen.getByLabelText(/patient profile aktif/i), "raka");
    expect(screen.getByText(/menyiapkan konteks raka/i)).toBeVisible();
    expect(screen.queryByText(/kabar terbaru maya/i)).not.toBeInTheDocument();
  });

  test("validates synthetic document files before upload", async () => {
    const user = userEvent.setup({ applyAccept: false });
    render(<DocumentUploadForm />);
    const input = screen.getByLabelText(/pilih dokumen sintetis/i);
    await user.upload(input, new File(["unsafe"], "notes.txt", { type: "text/plain" }));
    expect(screen.getByRole("alert")).toHaveTextContent(/pdf, jpg, atau png/i);
    expect(screen.getByText(/jumlah halaman pdf diperiksa kembali di server/i)).toBeVisible();
  });

  test("keeps OCR in review until caregiver confirms", async () => {
    const user = userEvent.setup();
    render(<OcrReviewWorkspace />);
    expect(screen.getByText("Perlu review")).toBeVisible();
    await user.clear(screen.getByLabelText(/nama dokumen/i));
    await user.type(screen.getByLabelText(/nama dokumen/i), "Ringkasan kontrol sintetis");
    expect(screen.getByText(/diedit caregiver/i)).toBeVisible();
    await user.click(screen.getByRole("button", { name: /konfirmasi ekstraksi/i }));
    expect(screen.getByRole("status")).toHaveTextContent(/ekstraksi dikonfirmasi/i);
  });

  test("labels assistant output as deterministic demo fallback", async () => {
    const user = userEvent.setup();
    render(<CaregiverAssistant />);
    expect(screen.getByText("Demo fallback")).toBeVisible();
    await user.click(screen.getByRole("button", { name: /siapkan pertanyaan untuk dokter/i }));
    expect(screen.getByText(/catat perubahan rutinitas maya/i)).toBeVisible();
    expect(screen.getByText(/bukan diagnosis atau rekomendasi terapi/i)).toBeVisible();
  });

  test("keeps visual SOS alert and records first handler", async () => {
    const user = userEvent.setup();
    render(<CaregiverSosPanel />);
    expect(screen.getByRole("alert")).toHaveTextContent(/maya mengirim sos/i);
    await user.click(screen.getByRole("button", { name: /saya tangani/i }));
    expect(screen.getByRole("status")).toHaveTextContent(/ditangani oleh dinda/i);
  });

  test("filters static facilities and discloses contact details", async () => {
    const user = userEvent.setup();
    render(<FacilityHelper />);
    expect(screen.getByText(/data statis tangerang/i)).toBeVisible();
    await user.selectOptions(screen.getByLabelText(/wilayah/i), "cipondoh");
    expect(screen.getByText("Puskesmas Cipondoh")).toBeVisible();
    await user.click(screen.getByRole("button", { name: /lihat kontak puskesmas cipondoh/i }));
    expect(screen.getByText("(021) 5574 3123")).toBeVisible();
  });
});
