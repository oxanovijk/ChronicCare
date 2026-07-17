"use client";

import { useEffect, useRef, useState } from "react";
import { CheckCircle } from "@phosphor-icons/react/dist/csr/CheckCircle";
import { ClipboardText } from "@phosphor-icons/react/dist/csr/ClipboardText";
import { Clock } from "@phosphor-icons/react/dist/csr/Clock";
import { FirstAid } from "@phosphor-icons/react/dist/csr/FirstAid";
import { NotePencil } from "@phosphor-icons/react/dist/csr/NotePencil";
import { Pill } from "@phosphor-icons/react/dist/csr/Pill";
import { SpinnerGap } from "@phosphor-icons/react/dist/csr/SpinnerGap";
import { WarningCircle } from "@phosphor-icons/react/dist/csr/WarningCircle";

import { DailyCareForms } from "@/components/caregiver/daily-care-forms";
import { Button } from "@/components/ui/button";

type FactStatus = "UNKNOWN" | "NONE_REPORTED" | "REPORTED";
type PatientProfileSummary = { id: string; displayName: string; relationshipLabel: string; currentMedicationsStatus: FactStatus };
type DashboardData = {
  patientProfile: PatientProfileSummary & { primaryConditionsStatus: FactStatus; allergiesStatus: FactStatus; emergencyContactStatus: FactStatus; bpjsMembershipStatus: "UNKNOWN" | "NOT_REGISTERED" | "REGISTERED" };
  setupChecklist: { recommendedActions: string[] };
  latestCheckIn: null | { id: string; mood: "GOOD" | "OKAY" | "UNWELL"; conditionText: string | null; complaintText: string | null; painLevel: number | null; medicationTaken: boolean | null; needsFamilyHelp: boolean; createdAt: string };
  activeMedications: Array<{ id: string; name: string; doseText: string; scheduleText: string; instructions: string | null; status: "ACTIVE"; updatedAt: string }>;
  upcomingReminders: Array<{ id: string; type: string; title: string; description: string | null; scheduledAt: string | null; scheduleText: string | null; status: "UPCOMING"; updatedAt: string }>;
  recentHealthNotes: Array<{ id: string; title: string; noteText: string; category: string; createdAt: string }>;
};
type FormKind = "medication" | "reminder" | "health-note";

const setupLabels: Record<string, string> = {
  REVIEW_ALLERGIES: "Tinjau informasi alergi",
  REVIEW_CURRENT_MEDICATIONS: "Tinjau obat yang sedang dicatat",
  REVIEW_EMERGENCY_CONTACT: "Lengkapi kontak darurat",
  REVIEW_PRIMARY_CONDITIONS: "Tinjau kondisi utama",
  REVIEW_BPJS_STATUS: "Tinjau status BPJS",
  ADD_DATE_OF_BIRTH: "Tambahkan tanggal lahir",
  ADD_LOCATION: "Tambahkan area umum",
  ADD_USUAL_FACILITY: "Tambahkan fasilitas biasa",
};

function readableDate(value: string) {
  return new Intl.DateTimeFormat("id-ID", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" }).format(new Date(value));
}

export function CaregiverDashboard({ section = "overview", patientProfile, caregiverName, role }: { section?: "overview" | "care"; patientProfile: PatientProfileSummary; caregiverName: string; role: "OWNER" | "FAMILY_MEMBER" }) {
  const [state, setState] = useState<{ profileId: string; status: "loading" | "ready" | "error" | "expired"; data: DashboardData | null }>({ profileId: patientProfile.id, status: "loading", data: null });
  const [activeForm, setActiveForm] = useState<FormKind | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [reload, setReload] = useState(0);
  const generation = useRef(0);

  useEffect(() => {
    const current = ++generation.current;
    const controller = new AbortController();
    void fetch(`/api/v1/patient-profiles/${patientProfile.id}/dashboard`, { cache: "no-store", credentials: "same-origin", signal: controller.signal })
      .then(async (response) => {
        if (response.status === 401) return { expired: true as const, data: null };
        if (!response.ok) throw new Error("DASHBOARD_UNAVAILABLE");
        return { expired: false as const, data: ((await response.json()) as { data: DashboardData }).data };
      })
      .then((result) => {
        if (current !== generation.current) return;
        setState(result.expired
          ? { profileId: patientProfile.id, status: "expired", data: null }
          : { profileId: patientProfile.id, status: "ready", data: result.data });
      })
      .catch((error) => {
        if (error instanceof DOMException && error.name === "AbortError") return;
        if (current === generation.current) setState({ profileId: patientProfile.id, status: "error", data: null });
      });
    return () => controller.abort();
  }, [patientProfile.id, reload]);

  async function mutate(path: string, method: "POST" | "PATCH", body: unknown, success: string) {
    setNotice(null);
    const response = await fetch(`/api/v1/patient-profiles/${patientProfile.id}${path}`, { method, credentials: "same-origin", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    if (!response.ok) {
      const payload = (await response.json().catch(() => null)) as { error?: { code?: string } } | null;
      setNotice(payload?.error?.code === "CONFLICT" ? "Catatan sudah berubah. Muat versi terbaru sebelum mencoba lagi." : "Perubahan belum dapat disimpan. Coba lagi.");
      return;
    }
    setNotice(success);
    setReload((value) => value + 1);
  }

  const visibleState = state.profileId === patientProfile.id
    ? state
    : { profileId: patientProfile.id, status: "loading" as const, data: null };

  if (visibleState.status === "loading") return (
    <section className="care-dashboard-loading" aria-live="polite" aria-busy="true">
      <SpinnerGap className="animate-spin" size={24} aria-hidden="true" />
      <div><h2>Memuat data {patientProfile.displayName}</h2><p>Data Patient Profile sebelumnya sudah dibersihkan.</p></div>
    </section>
  );
  if (visibleState.status === "expired") return <section className="care-dashboard-error" role="alert"><WarningCircle size={24} aria-hidden="true" /><div><h2>Sesi caregiver berakhir</h2><p>Masuk kembali untuk membuka data Patient.</p><Button type="button" onClick={() => window.location.reload()}>Masuk lagi</Button></div></section>;
  if (visibleState.status === "error" || !visibleState.data) return <section className="care-dashboard-error" role="alert"><WarningCircle size={24} aria-hidden="true" /><div><h2>Data {patientProfile.displayName} belum dapat dimuat</h2><p>Konteks Patient tetap dipertahankan tanpa menampilkan data profile sebelumnya.</p><Button type="button" onClick={() => { setState({ profileId: patientProfile.id, status: "loading", data: null }); setReload((value) => value + 1); }}>Coba lagi</Button></div></section>;

  const data = visibleState.data;
  const firstName = caregiverName.trim().split(/\s+/)[0] || "Caregiver";
  const medicationEmpty = data.patientProfile.currentMedicationsStatus === "UNKNOWN"
    ? { title: "Belum diketahui", copy: "Informasi obat aktif belum ditinjau oleh caregiver." }
    : { title: "Tidak ada yang dilaporkan oleh caregiver", copy: "Ini adalah informasi yang dicatat, bukan kepastian klinis." };

  return (
    <div className="care-dashboard" id={section === "care" ? "caregiver-care" : "caregiver-overview"}>
      <header className="care-dashboard-heading">
        {section === "overview" ? (
          <div><span className="section-kicker"><span aria-hidden="true" /> Ringkasan harian</span><h1>Selamat datang, {firstName}</h1><p>Berikut konteks perawatan {patientProfile.displayName} sesuai informasi yang dicatat.</p></div>
        ) : (
          <div><span className="section-kicker"><span aria-hidden="true" /> Perawatan harian</span><h1>Perawatan {patientProfile.displayName}</h1><p>Kelola obat, pengingat, dan catatan perawatan pada Patient aktif.</p></div>
        )}
        <span className="care-role-tag"><CheckCircle size={16} weight="fill" aria-hidden="true" />{role === "OWNER" ? "Owner" : "Family Member"}</span>
      </header>

      {notice ? <p className="care-dashboard-notice" role="status" aria-live="polite">{notice}</p> : null}

      <div className={section === "overview" ? "care-dashboard-columns" : "care-dashboard-care-view"}>
        <div className="care-dashboard-primary">
          {section === "care" ? <section className="care-motion-card">
            <div><span className="card-index">Aksi utama</span><h2>Jaga rutinitas tetap mudah diikuti</h2><p>Tambahkan pengingat yang benar-benar tersedia untuk Patient Profile aktif.</p></div>
            <Button type="button" onClick={() => setActiveForm("reminder")}><Clock aria-hidden="true" />Tambah pengingat</Button>
          </section> : null}

          <div className="care-summary-grid">
            {section === "overview" ? <section className="care-data-card">
              <div className="care-card-title"><ClipboardText size={22} aria-hidden="true" /><span>Check-in terbaru</span></div>
              {data.latestCheckIn ? <><h2>Kabar terbaru {patientProfile.relationshipLabel}</h2><p className="care-data-primary">{data.latestCheckIn.conditionText ?? data.latestCheckIn.complaintText ?? "Check-in tersimpan tanpa catatan tambahan."}</p><p className="care-metadata">{readableDate(data.latestCheckIn.createdAt)} · {data.latestCheckIn.needsFamilyHelp ? "Meminta dukungan keluarga" : "Sesuai catatan Patient"}</p></> : <><h2>Belum ada check-in untuk {patientProfile.relationshipLabel}</h2><p>Patient belum menyimpan check-in. Daily care tetap dapat digunakan.</p></>}
            </section> : null}
            <section className="care-data-card">
              <div className="care-card-title"><Pill size={22} aria-hidden="true" /><span>Obat tercatat</span></div>
              {data.activeMedications.length ? <ul className="care-record-list">{data.activeMedications.map((item) => <li key={item.id}><div><strong>{item.name}</strong><span>{item.doseText}</span><small>{item.scheduleText}</small></div>{section === "care" ? <div className="care-record-actions"><Button size="sm" variant="outline" onClick={() => void mutate(`/medications/${item.id}/logs`, "POST", { status: "TAKEN", scheduledFor: null }, "Log obat tersimpan sesuai catatan.")}>Catat diminum</Button><Button size="sm" variant="ghost" onClick={() => void mutate(`/medications/${item.id}`, "PATCH", { status: "PAUSED", updatedAt: item.updatedAt }, "Status obat diperbarui.")}>Jeda</Button></div> : null}</li>)}</ul> : <><h2>{medicationEmpty.title}</h2><p>{medicationEmpty.copy}</p></>}
            </section>
          </div>

          {section === "care" ? <>
          <section className="care-data-card">
            <div className="care-card-title"><Clock size={22} aria-hidden="true" /><span>Pengingat berikutnya</span></div>
            {data.upcomingReminders.length ? <ul className="care-record-list">{data.upcomingReminders.map((item) => <li key={item.id}><div><strong>{item.title}</strong><span>{item.scheduleText ?? (item.scheduledAt ? readableDate(item.scheduledAt) : "Waktu belum dicatat")}</span><small>Pengingat koordinasi · tidak menjamin notifikasi terkirim</small></div><Button size="sm" variant="outline" onClick={() => void mutate(`/reminders/${item.id}`, "PATCH", { status: "DONE", updatedAt: item.updatedAt }, "Pengingat ditandai selesai.")}>Tandai selesai</Button></li>)}</ul> : <div className="care-empty-inline"><h2>Belum ada pengingat</h2><p>Gunakan aksi utama di atas untuk menambahkan waktu atau jadwal sesuai informasi yang dicatat caregiver.</p></div>}
          </section>

          <section className="care-data-card">
            <div className="care-card-title"><NotePencil size={22} aria-hidden="true" /><span>Catatan perawatan</span></div>
            {data.recentHealthNotes.length ? <ul className="care-record-list">{data.recentHealthNotes.map((item) => <li key={item.id}><div><strong>{item.title}</strong><span>{item.noteText}</span><small>{readableDate(item.createdAt)} · dicatat caregiver</small></div></li>)}</ul> : <div className="care-empty-inline"><h2>Belum ada catatan perawatan</h2><p>Gunakan catatan singkat untuk kebutuhan koordinasi minimum.</p></div>}
          </section>

          <div className="care-quick-actions" aria-label="Aksi cepat Packet 08">
            <Button type="button" variant="outline" onClick={() => setActiveForm("medication")}><Pill aria-hidden="true" />Catat obat</Button>
            <Button type="button" variant="outline" onClick={() => setActiveForm("health-note")}><NotePencil aria-hidden="true" />Tambah catatan</Button>
          </div>

          {activeForm ? <DailyCareForms kind={activeForm} patientProfileId={patientProfile.id} patientName={patientProfile.displayName} medications={data.activeMedications.map(({ id, name }) => ({ id, name }))} onClose={() => setActiveForm(null)} onSaved={() => { setNotice("Catatan perawatan sudah disimpan."); setReload((value) => value + 1); }} /> : null}
          </> : null}
        </div>

        {section === "overview" ? <aside className="care-dashboard-rail" aria-label="Konteks Packet 08">
          <section className="care-setup-card"><div className="care-card-title"><FirstAid size={22} aria-hidden="true" /><span>Checklist setup</span></div><p>Advisory saja. Data yang belum diketahui tidak memblokir daily care.</p>{data.setupChecklist.recommendedActions.length ? <ul>{data.setupChecklist.recommendedActions.slice(0, 4).map((action) => <li key={action}><WarningCircle size={16} aria-hidden="true" />{setupLabels[action] ?? "Tinjau data Patient"}</li>)}</ul> : <p className="care-complete-line"><CheckCircle size={18} weight="fill" aria-hidden="true" />Tidak ada saran pengisian saat ini.</p>}</section>
          <section className="care-unavailable-card"><h2>Fitur berikutnya</h2><ul><li><span>Dokumen & OCR</span><small>Belum tersedia</small></li><li><span>Asisten caregiver</span><small>Belum tersedia</small></li><li><span>SOS Realtime</span><small>Belum tersedia</small></li><li><span>Faskes/BPJS</span><small>Belum tersedia</small></li></ul></section>
        </aside> : null}
      </div>
    </div>
  );
}
