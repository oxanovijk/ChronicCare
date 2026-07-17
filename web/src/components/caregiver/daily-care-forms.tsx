"use client";

import { type FormEvent, useState } from "react";
import { SpinnerGap } from "@phosphor-icons/react/dist/csr/SpinnerGap";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

type FormKind = "medication" | "reminder" | "health-note";
type MedicationOption = { id: string; name: string };

export function DailyCareForms({
  kind,
  patientProfileId,
  patientName,
  medications,
  onClose,
  onSaved,
}: {
  kind: FormKind;
  patientProfileId: string;
  patientName: string;
  medications: MedicationOption[];
  onClose: () => void;
  onSaved: () => void;
}) {
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setSaving(true);
    setError(null);
    const endpoint = `/api/v1/patient-profiles/${patientProfileId}/${kind === "medication" ? "medications" : kind === "reminder" ? "reminders" : "health-notes"}`;
    const payload = kind === "medication"
      ? {
          name: form.get("name"),
          doseText: form.get("doseText"),
          scheduleText: form.get("scheduleText"),
          instructions: String(form.get("instructions") ?? "").trim() || null,
          startDate: String(form.get("startDate") ?? "").trim() || null,
          endDate: String(form.get("endDate") ?? "").trim() || null,
        }
      : kind === "reminder"
        ? {
            type: form.get("type"),
            title: form.get("title"),
            description: String(form.get("description") ?? "").trim() || null,
            scheduledAt: null,
            scheduleText: String(form.get("scheduleText") ?? "").trim() || null,
            relatedMedicationId: String(form.get("relatedMedicationId") ?? "").trim() || null,
          }
        : {
            title: form.get("title"),
            noteText: form.get("noteText"),
            category: form.get("category"),
          };
    try {
      const response = await fetch(endpoint, {
        method: "POST",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!response.ok) {
        const body = (await response.json().catch(() => null)) as { error?: { code?: string } } | null;
        throw new Error(body?.error?.code ?? "REQUEST_FAILED");
      }
      onSaved();
      onClose();
    } catch (cause) {
      setError(cause instanceof Error && cause.message === "CONFLICT"
        ? "Catatan sudah berubah. Muat data terbaru lalu periksa kembali."
        : "Perubahan belum dapat disimpan. Periksa data dan coba lagi.");
    } finally {
      setSaving(false);
    }
  }

  const title = kind === "medication" ? "Catat obat" : kind === "reminder" ? "Tambah pengingat" : "Tambah catatan perawatan";
  return (
    <section className="daily-care-form-panel" aria-labelledby={`daily-care-${kind}-title`}>
      <div className="daily-care-form-heading">
        <div>
          <span className="section-kicker"><span aria-hidden="true" /> Perawatan · {patientName}</span>
          <h2 id={`daily-care-${kind}-title`}>{title}</h2>
        </div>
        <Button type="button" variant="ghost" onClick={onClose}>Tutup formulir</Button>
      </div>
      <form onSubmit={submit} className="daily-care-form" noValidate>
        {kind === "medication" ? (
          <>
            <div><Label htmlFor="medication-name">Nama obat</Label><Input id="medication-name" name="name" maxLength={160} required /></div>
            <div><Label htmlFor="medication-dose">Dosis sesuai catatan</Label><Input id="medication-dose" name="doseText" maxLength={160} required /><p className="field-help">Tulis sebagai informasi yang dicatat, bukan rekomendasi ChroniCare.</p></div>
            <div><Label htmlFor="medication-schedule">Jadwal sesuai catatan</Label><Input id="medication-schedule" name="scheduleText" maxLength={240} required /></div>
            <div><Label htmlFor="medication-start-date">Tanggal mulai (opsional)</Label><Input id="medication-start-date" name="startDate" type="date" /></div>
            <div><Label htmlFor="medication-end-date">Tanggal selesai (opsional)</Label><Input id="medication-end-date" name="endDate" type="date" /></div>
            <div><Label htmlFor="medication-instructions">Instruksi tambahan (opsional)</Label><Textarea id="medication-instructions" name="instructions" maxLength={2000} /></div>
            <p className="form-safety-note">ChroniCare tidak menilai keamanan obat atau dosis. Perubahan pengobatan dikonfirmasi kepada dokter atau apoteker.</p>
          </>
        ) : null}
        {kind === "reminder" ? (
          <>
            <div><Label htmlFor="reminder-title">Judul pengingat</Label><Input id="reminder-title" name="title" maxLength={160} required /></div>
            <div><Label htmlFor="reminder-type">Jenis</Label><select id="reminder-type" name="type" className="daily-care-select"><option value="MEDICATION">Obat</option><option value="CHECK_IN">Check-in</option><option value="DOCTOR_VISIT">Kunjungan dokter</option><option value="BPJS">BPJS</option><option value="OTHER">Lainnya</option></select></div>
            <div><Label htmlFor="reminder-schedule">Waktu atau jadwal yang dicatat</Label><Input id="reminder-schedule" name="scheduleText" maxLength={240} required /></div>
            <div><Label htmlFor="reminder-description">Keterangan (opsional)</Label><Textarea id="reminder-description" name="description" maxLength={1000} /></div>
            {medications.length ? <div><Label htmlFor="reminder-medication">Obat terkait (opsional)</Label><select id="reminder-medication" name="relatedMedicationId" className="daily-care-select"><option value="">Tidak terkait obat</option>{medications.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select></div> : null}
            <p className="form-safety-note">Pengingat ini hanya catatan koordinasi. ChroniCare tidak mengirim notifikasi sistem operasi dan tidak menjamin pengiriman saat tab tertutup.</p>
          </>
        ) : null}
        {kind === "health-note" ? (
          <>
            <div><Label htmlFor="health-note-title">Judul catatan</Label><Input id="health-note-title" name="title" maxLength={160} required /></div>
            <div><Label htmlFor="health-note-category">Kategori</Label><select id="health-note-category" name="category" className="daily-care-select"><option value="CARE_COORDINATION">Koordinasi perawatan</option><option value="VISIT_PREPARATION">Persiapan kunjungan</option><option value="ROUTINE">Rutinitas</option></select></div>
            <div><Label htmlFor="health-note-text">Catatan singkat</Label><Textarea id="health-note-text" name="noteText" maxLength={4000} required aria-describedby="health-note-guidance" /><p id="health-note-guidance" className="field-help">Catat kebutuhan koordinasi minimum. Hindari diagnosis atau narasi medis pribadi yang tidak diperlukan.</p></div>
          </>
        ) : null}
        {error ? <p className="form-error" role="alert">{error}</p> : null}
        <div className="daily-care-form-actions">
          <Button type="submit" disabled={saving}>{saving ? <SpinnerGap className="animate-spin" aria-hidden="true" /> : null}{saving ? "Menyimpan" : "Simpan"}</Button>
          <Button type="button" variant="outline" onClick={onClose} disabled={saving}>Batal</Button>
        </div>
        <div className="sr-only" aria-live="polite">{saving ? `Menyimpan catatan untuk ${patientName}` : ""}</div>
      </form>
    </section>
  );
}
