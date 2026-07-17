"use client";

import { useCallback, useEffect, useState } from "react";
import { CheckCircle } from "@phosphor-icons/react/dist/csr/CheckCircle";
import { FileText } from "@phosphor-icons/react/dist/csr/FileText";
import { SpinnerGap } from "@phosphor-icons/react/dist/csr/SpinnerGap";
import { WarningCircle } from "@phosphor-icons/react/dist/csr/WarningCircle";

import type { DocumentExtractionV1 } from "@/lib/ai/extraction/schema";
import { Button } from "@/components/ui/button";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";

const ALLOWED_TYPES = ["application/pdf", "image/jpeg", "image/png"];
const MAX_BYTES = 5 * 1024 * 1024;

const CATEGORY_LABELS: Record<string, string> = {
  BPJS_CARD: "Kartu BPJS",
  REFERRAL_LETTER: "Surat rujukan",
  PRESCRIPTION: "Resep",
  LAB_RESULT: "Hasil lab",
  MEDICAL_RESUME: "Resume medis",
  CONTROL_CARD: "Kartu kontrol",
  OTHER: "Lainnya",
};

const STATUS_LABELS: Record<string, string> = {
  UPLOADING: "Mengunggah",
  UPLOADED: "Siap diproses",
  PROCESSING: "Memproses",
  REVIEW_REQUIRED: "Perlu review",
  CONFIRMED: "Dikonfirmasi",
  REJECTED: "Ditolak",
  FAILED: "Gagal",
};

type DocumentSummary = {
  id: string;
  category: string;
  title: string;
  originalFileName: string;
  status: string;
  confirmedExtractionId: string | null;
  createdAt: string;
};

type ExtractionDto = {
  id: string;
  healthDocumentId: string;
  status: string;
  providerMode: "LIVE" | "DEMO_FALLBACK";
  structuredData: DocumentExtractionV1;
};

async function sha256Hex(file: File) {
  const digest = await crypto.subtle.digest(
    "SHA-256",
    await file.arrayBuffer(),
  );
  return [...new Uint8Array(digest)]
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

async function api<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`/api/v1${path}`, {
    credentials: "same-origin",
    cache: "no-store",
    ...init,
    headers: init?.body ? { "Content-Type": "application/json" } : undefined,
  });
  const payload = (await response.json().catch(() => null)) as {
    data?: T;
    error?: { message?: string };
  } | null;
  if (!response.ok || !payload?.data) {
    throw new Error(payload?.error?.message ?? "Permintaan gagal. Coba lagi.");
  }
  return payload.data;
}

export function DocumentsPanel({
  patientProfileId,
  patientName,
}: {
  patientProfileId: string;
  patientName: string;
}) {
  const [documents, setDocuments] = useState<DocumentSummary[] | null>(null);
  const [listError, setListError] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [review, setReview] = useState<ExtractionDto | null>(null);
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("LAB_RESULT");

  const [reload, setReload] = useState(0);
  const refresh = useCallback(() => setReload((value) => value + 1), []);

  useEffect(() => {
    const controller = new AbortController();
    void fetch(`/api/v1/patient-profiles/${patientProfileId}/documents`, {
      cache: "no-store",
      credentials: "same-origin",
      signal: controller.signal,
    })
      .then(async (response) => {
        if (!response.ok) throw new Error("DOCUMENTS_UNAVAILABLE");
        return ((await response.json()) as { data: DocumentSummary[] }).data;
      })
      .then((data) => {
        setDocuments(data);
        setListError(false);
      })
      .catch((cause) => {
        if (cause instanceof DOMException && cause.name === "AbortError") return;
        setListError(true);
      });
    return () => controller.abort();
  }, [patientProfileId, reload]);

  async function handleUpload(file: File) {
    setError(null);
    setNotice(null);
    if (!ALLOWED_TYPES.includes(file.type)) {
      setError("Gunakan file PDF, JPG, atau PNG.");
      return;
    }
    if (file.size > MAX_BYTES) {
      setError("Ukuran file maksimal 5 MB.");
      return;
    }
    setBusy("upload");
    try {
      const intent = await api<{
        document: DocumentSummary;
        upload: { token: string; path: string };
      }>(`/patient-profiles/${patientProfileId}/documents/upload-intent`, {
        method: "POST",
        body: JSON.stringify({
          title: title.trim() || file.name,
          category,
          fileName: file.name,
          mimeType: file.type,
          fileSizeBytes: file.size,
          sha256: await sha256Hex(file),
        }),
      });

      const supabase = createSupabaseBrowserClient();
      const uploaded = await supabase.storage
        .from("health-documents")
        .uploadToSignedUrl(intent.upload.path, intent.upload.token, file, {
          contentType: file.type,
        });
      if (uploaded.error) {
        throw new Error("Unggahan ke penyimpanan privat gagal. Coba lagi.");
      }

      await api(
        `/patient-profiles/${patientProfileId}/documents/${intent.document.id}/complete`,
        { method: "POST", body: JSON.stringify({}) },
      );

      setBusy("extract");
      const extraction = await api<ExtractionDto>(
        `/patient-profiles/${patientProfileId}/documents/${intent.document.id}/extract`,
        { method: "POST", body: JSON.stringify({}) },
      );
      setReview(extraction);
      setNotice("Dokumen terbaca. Periksa hasil ekstraksi di bawah.");
    } catch (cause) {
      setError(
        cause instanceof Error ? cause.message : "Proses dokumen gagal.",
      );
    } finally {
      setBusy(null);
      refresh();
    }
  }

  async function openReview(documentId: string) {
    setError(null);
    try {
      const detail = await api<{ extraction: ExtractionDto | null }>(
        `/patient-profiles/${patientProfileId}/documents/${documentId}`,
      );
      if (!detail.extraction) {
        setError("Belum ada hasil ekstraksi untuk dokumen ini.");
        return;
      }
      setReview(detail.extraction);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Gagal memuat.");
    }
  }

  async function decide(action: "confirm" | "reject") {
    if (!review) return;
    let body: string | undefined;
    if (action === "reject") {
      const reason = window.prompt(
        "Tulis alasan penolakan (wajib, tercatat di audit):",
      );
      if (!reason?.trim()) return;
      body = JSON.stringify({ reason: reason.trim() });
    } else {
      body = JSON.stringify({});
    }
    setBusy(action);
    setError(null);
    try {
      await api(
        `/patient-profiles/${patientProfileId}/documents/${review.healthDocumentId}/extractions/${review.id}/${action}`,
        { method: "POST", body },
      );
      setNotice(
        action === "confirm"
          ? "Ekstraksi dikonfirmasi. Hanya data terkonfirmasi yang dapat dipakai asisten."
          : "Ekstraksi ditolak. Dokumen privat tetap tersimpan.",
      );
      setReview(null);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Aksi gagal.");
    } finally {
      setBusy(null);
      refresh();
    }
  }

  async function saveEdits(draft: DocumentExtractionV1) {
    if (!review) return;
    setBusy("save");
    setError(null);
    try {
      const updated = await api<ExtractionDto>(
        `/patient-profiles/${patientProfileId}/documents/${review.healthDocumentId}/extractions/${review.id}`,
        { method: "PATCH", body: JSON.stringify({ structuredData: draft }) },
      );
      setReview(updated);
      setNotice("Perubahan tersimpan. Status tetap menunggu review.");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Gagal menyimpan.");
    } finally {
      setBusy(null);
    }
  }

  return (
    <section className="care-data-card" id="documents" aria-label="Dokumen kesehatan">
      <div className="care-card-title">
        <FileText size={22} aria-hidden="true" />
        <span>Dokumen &amp; OCR</span>
      </div>

      {notice ? (
        <p className="care-dashboard-notice" role="status" aria-live="polite">
          <CheckCircle size={16} weight="fill" aria-hidden="true" /> {notice}
        </p>
      ) : null}
      {error ? (
        <p className="form-error" role="alert">
          <WarningCircle size={16} aria-hidden="true" /> {error}
        </p>
      ) : null}

      <form
        className="document-upload-row"
        onSubmit={(event) => event.preventDefault()}
      >
        <label>
          Nama dokumen
          <input
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder={`Contoh: Hasil lab ${patientName}`}
            maxLength={180}
          />
        </label>
        <label>
          Kategori
          <select
            value={category}
            onChange={(event) => setCategory(event.target.value)}
          >
            {Object.entries(CATEGORY_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </label>
        <label className="document-file-label">
          {busy === "upload" || busy === "extract" ? (
            <span aria-live="polite">
              <SpinnerGap className="animate-spin" size={16} aria-hidden="true" />
              {busy === "upload" ? " Mengunggah…" : " Membaca dokumen…"}
            </span>
          ) : (
            "Pilih file (PDF/JPG/PNG)"
          )}
          <input
            className="sr-only"
            type="file"
            accept=".pdf,.jpg,.jpeg,.png"
            disabled={busy !== null}
            onChange={(event) => {
              const file = event.target.files?.[0];
              event.target.value = "";
              if (file) void handleUpload(file);
            }}
          />
        </label>
      </form>
      <p className="care-metadata">
        Dokumen kesehatan sintetis saja: hasil lab, resep, rujukan, resume,
        kartu kontrol, atau kartu BPJS. Jangan unggah KTP atau dokumen
        identitas lain. Maksimum 5 MB dan 3 halaman. File tersimpan privat.
      </p>

      {listError ? (
        <p className="form-error" role="alert">
          Daftar dokumen belum dapat dimuat.{" "}
          <Button size="sm" variant="outline" onClick={refresh}>
            Muat ulang daftar
          </Button>
        </p>
      ) : null}

      {documents === null ? (
        !listError && (
          <p aria-busy="true">
            <SpinnerGap className="animate-spin" size={16} aria-hidden="true" />{" "}
            Memuat dokumen…
          </p>
        )
      ) : documents.length ? (
        <ul className="care-record-list">
          {documents.map((item) => (
            <li key={item.id}>
              <div>
                <strong>{item.title}</strong>
                <span>
                  {CATEGORY_LABELS[item.category] ?? item.category} ·{" "}
                  {STATUS_LABELS[item.status] ?? item.status}
                </span>
                <small>{item.originalFileName}</small>
              </div>
              {item.status === "REVIEW_REQUIRED" ? (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => void openReview(item.id)}
                >
                  Review hasil
                </Button>
              ) : null}
            </li>
          ))}
        </ul>
      ) : (
        <div className="care-empty-inline">
          <h2>Belum ada dokumen</h2>
          <p>Unggah dokumen kesehatan sintetis untuk memulai review OCR.</p>
        </div>
      )}

      {review ? (
        <ExtractionReview
          key={review.id}
          extraction={review}
          busy={busy}
          onSave={saveEdits}
          onDecide={decide}
          onClose={() => setReview(null)}
        />
      ) : null}
    </section>
  );
}

function ExtractionReview({
  extraction,
  busy,
  onSave,
  onDecide,
  onClose,
}: {
  extraction: ExtractionDto;
  busy: string | null;
  onSave: (draft: DocumentExtractionV1) => void;
  onDecide: (action: "confirm" | "reject") => void;
  onClose: () => void;
}) {
  const [draft, setDraft] = useState<DocumentExtractionV1>(
    extraction.structuredData,
  );

  const scalarFields = [
    ["patientNameAsWritten", "Nama pasien (tertulis)"],
    ["documentDateAsWritten", "Tanggal dokumen (tertulis)"],
    ["facilityNameAsWritten", "Fasilitas (tertulis)"],
    ["clinicianNameAsWritten", "Tenaga medis (tertulis)"],
    ["documentNumberAsWritten", "Nomor dokumen (tertulis)"],
  ] as const;

  function setScalar(field: (typeof scalarFields)[number][0], value: string) {
    setDraft((current) => ({ ...current, [field]: value || null }));
  }

  return (
    <section
      className="extraction-review"
      aria-label="Review hasil ekstraksi"
    >
      <header className="review-title-row">
        <div>
          <h3>Review hasil ekstraksi</h3>
          <p>
            Bandingkan dengan dokumen aslinya. ChroniCare tidak menilai
            diagnosis, keamanan nilai lab, atau dosis.
          </p>
        </div>
        {extraction.providerMode === "DEMO_FALLBACK" ? (
          <span className="review-status demo-fallback-badge" role="status">
            DEMO_FALLBACK · bukan hasil OCR live
          </span>
        ) : (
          <span className="review-status">Perlu review</span>
        )}
      </header>

      <div className="extraction-fields">
        {scalarFields.map(([field, label]) => (
          <label key={field}>
            {label}
            <input
              value={draft[field] ?? ""}
              onChange={(event) => setScalar(field, event.target.value)}
            />
          </label>
        ))}
        <label>
          Ringkasan (tertulis, satu baris per poin)
          <textarea
            rows={4}
            value={draft.summaryAsWritten.join("\n")}
            onChange={(event) =>
              setDraft((current) => ({
                ...current,
                summaryAsWritten: event.target.value
                  .split("\n")
                  .filter((line) => line.trim() !== ""),
              }))
            }
          />
        </label>
      </div>

      {draft.labResults.length ? (
        <div className="extraction-table" role="group" aria-label="Hasil lab">
          <h4>Hasil lab (tertulis)</h4>
          {draft.labResults.map((row, index) => (
            <div className="extraction-table-row" key={index}>
              <input
                aria-label={`Nama tes ${index + 1}`}
                value={row.testNameAsWritten}
                onChange={(event) =>
                  setDraft((current) => ({
                    ...current,
                    labResults: current.labResults.map((item, i) =>
                      i === index
                        ? { ...item, testNameAsWritten: event.target.value }
                        : item,
                    ),
                  }))
                }
              />
              <input
                aria-label={`Nilai ${index + 1}`}
                value={row.valueAsWritten ?? ""}
                onChange={(event) =>
                  setDraft((current) => ({
                    ...current,
                    labResults: current.labResults.map((item, i) =>
                      i === index
                        ? { ...item, valueAsWritten: event.target.value || null }
                        : item,
                    ),
                  }))
                }
              />
              <input
                aria-label={`Satuan ${index + 1}`}
                value={row.unitAsWritten ?? ""}
                onChange={(event) =>
                  setDraft((current) => ({
                    ...current,
                    labResults: current.labResults.map((item, i) =>
                      i === index
                        ? { ...item, unitAsWritten: event.target.value || null }
                        : item,
                    ),
                  }))
                }
              />
            </div>
          ))}
        </div>
      ) : null}

      {draft.medications.length ? (
        <div className="extraction-table" role="group" aria-label="Obat">
          <h4>Obat (tertulis)</h4>
          {draft.medications.map((row, index) => (
            <div className="extraction-table-row" key={index}>
              <input
                aria-label={`Nama obat ${index + 1}`}
                value={row.nameAsWritten}
                onChange={(event) =>
                  setDraft((current) => ({
                    ...current,
                    medications: current.medications.map((item, i) =>
                      i === index
                        ? { ...item, nameAsWritten: event.target.value }
                        : item,
                    ),
                  }))
                }
              />
              <input
                aria-label={`Dosis ${index + 1}`}
                value={row.doseAsWritten ?? ""}
                onChange={(event) =>
                  setDraft((current) => ({
                    ...current,
                    medications: current.medications.map((item, i) =>
                      i === index
                        ? { ...item, doseAsWritten: event.target.value || null }
                        : item,
                    ),
                  }))
                }
              />
            </div>
          ))}
        </div>
      ) : null}

      {draft.warnings.length ? (
        <ul className="extraction-warnings" aria-label="Catatan pembacaan">
          {draft.warnings.map((warning) => (
            <li key={warning}>
              <WarningCircle size={14} aria-hidden="true" /> {warning}
            </li>
          ))}
        </ul>
      ) : null}

      <div className="review-actions">
        <Button
          type="button"
          variant="outline"
          disabled={busy !== null}
          onClick={() => onSave(draft)}
        >
          Simpan perubahan
        </Button>
        <Button
          type="button"
          disabled={busy !== null}
          onClick={() => onDecide("confirm")}
        >
          {busy === "confirm" ? "Menyimpan…" : "Konfirmasi ekstraksi"}
        </Button>
        <Button
          type="button"
          variant="ghost"
          disabled={busy !== null}
          onClick={() => onDecide("reject")}
        >
          Tolak hasil
        </Button>
        <Button type="button" variant="ghost" onClick={onClose}>
          Tutup
        </Button>
      </div>
    </section>
  );
}
