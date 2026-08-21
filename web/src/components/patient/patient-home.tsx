"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ArrowClockwise } from "@phosphor-icons/react/dist/csr/ArrowClockwise";
import { CalendarCheck } from "@phosphor-icons/react/dist/csr/CalendarCheck";
import { CaretDown } from "@phosphor-icons/react/dist/csr/CaretDown";
import { Check } from "@phosphor-icons/react/dist/csr/Check";
import { ClipboardText } from "@phosphor-icons/react/dist/csr/ClipboardText";
import { CloudRain } from "@phosphor-icons/react/dist/csr/CloudRain";
import { CloudSun } from "@phosphor-icons/react/dist/csr/CloudSun";
import { Heartbeat } from "@phosphor-icons/react/dist/csr/Heartbeat";
import { ShieldCheck } from "@phosphor-icons/react/dist/csr/ShieldCheck";
import { SpinnerGap } from "@phosphor-icons/react/dist/csr/SpinnerGap";
import { Sun } from "@phosphor-icons/react/dist/csr/Sun";
import { Warning } from "@phosphor-icons/react/dist/csr/Warning";

import { PatientLogoutButton } from "@/components/auth/patient-logout-button";
import { BrandMark } from "@/components/brand-mark";
import { PatientChatSurface } from "@/components/chat/chat-panel";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { shouldEscalateCheckIn } from "@/lib/daily-care/check-in-contract";
import { cn } from "@/lib/utils";

type PatientProfile = {
  id: string;
  displayName: string;
  relationshipLabel: string;
};

type CheckInMood = "GOOD" | "OKAY" | "UNWELL";

type CheckInItem = {
  id: string;
  patientProfileId: string;
  submittedByPatient: boolean;
  mood: CheckInMood;
  conditionText: string | null;
  painLevel: number | null;
  medicationTaken: boolean | null;
  complaintText: string | null;
  needsFamilyHelp: boolean;
  createdAt: string;
};

const moodOptions: Array<{
  value: CheckInMood;
  label: string;
  helper: string;
}> = [
  {
    value: "GOOD",
    label: "Baik",
    helper: "Hari terasa lancar",
  },
  {
    value: "OKAY",
    label: "Biasa saja",
    helper: "Ada sedikit perubahan",
  },
  {
    value: "UNWELL",
    label: "Kurang baik",
    helper: "Butuh lebih diperhatikan",
  },
];

const moodIcons = {
  GOOD: Sun,
  OKAY: CloudSun,
  UNWELL: CloudRain,
};

const moodLabels: Record<CheckInMood, string> = {
  GOOD: "Baik",
  OKAY: "Biasa saja",
  UNWELL: "Kurang baik",
};

function nullableText(value: string) {
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function readableTime(value: string) {
  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

async function requestCheckIns(endpoint: string, signal?: AbortSignal) {
  const response = await fetch(`${endpoint}?limit=3`, {
    credentials: "same-origin",
    signal,
  });
  if (!response.ok) throw new Error("CHECK_IN_LOAD_FAILED");
  const body = (await response.json()) as { data: CheckInItem[] };
  return body.data;
}

export function PatientHome({ patientProfile }: { patientProfile: PatientProfile }) {
  const endpoint = `/api/v1/patient-profiles/${patientProfile.id}/check-ins`;
  const [items, setItems] = useState<CheckInItem[] | null>(null);
  const [loadError, setLoadError] = useState(false);
  const [mood, setMood] = useState<CheckInMood | "">("");
  const [conditionText, setConditionText] = useState("");
  const [complaintText, setComplaintText] = useState("");
  const [recordPain, setRecordPain] = useState(false);
  const [painLevel, setPainLevel] = useState(0);
  const [medicationTaken, setMedicationTaken] = useState<
    "UNANSWERED" | "YES" | "NO"
  >("UNANSWERED");
  const [needsFamilyHelp, setNeedsFamilyHelp] = useState(false);
  const [validationError, setValidationError] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitState, setSubmitState] = useState<"idle" | "success" | "error">(
    "idle",
  );
  const successRef = useRef<HTMLDivElement>(null);
  const errorRef = useRef<HTMLDivElement>(null);
  const firstMoodRef = useRef<HTMLInputElement>(null);

  const loadCheckIns = useCallback(async (signal?: AbortSignal) => {
    try {
      setItems(await requestCheckIns(endpoint, signal));
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") return;
      setItems([]);
      setLoadError(true);
    }
  }, [endpoint]);

  useEffect(() => {
    const controller = new AbortController();
    void requestCheckIns(endpoint, controller.signal)
      .then(setItems)
      .catch((error: unknown) => {
        if (error instanceof DOMException && error.name === "AbortError") return;
        setItems([]);
        setLoadError(true);
      });
    return () => controller.abort();
  }, [endpoint]);

  useEffect(() => {
    if (submitState === "success") successRef.current?.focus();
    if (submitState === "error") errorRef.current?.focus();
  }, [submitState]);

  const urgent = useMemo(
    () =>
      shouldEscalateCheckIn({
        conditionText: nullableText(conditionText),
        complaintText: nullableText(complaintText),
      }),
    [complaintText, conditionText],
  );

  function resetForm() {
    setMood("");
    setConditionText("");
    setComplaintText("");
    setRecordPain(false);
    setPainLevel(0);
    setMedicationTaken("UNANSWERED");
    setNeedsFamilyHelp(false);
    setValidationError(false);
  }

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitState("idle");
    if (!mood) {
      setValidationError(true);
      firstMoodRef.current?.focus();
      return;
    }

    setValidationError(false);
    setSubmitting(true);
    const payload = {
      mood,
      conditionText: nullableText(conditionText),
      painLevel: recordPain ? painLevel : null,
      medicationTaken:
        medicationTaken === "UNANSWERED"
          ? null
          : medicationTaken === "YES",
      complaintText: nullableText(complaintText),
      needsFamilyHelp,
    };

    try {
      const response = await fetch(endpoint, {
        method: "POST",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!response.ok) throw new Error("CHECK_IN_SUBMIT_FAILED");
      const body = (await response.json()) as { data: CheckInItem };
      setItems((current) => [body.data, ...(current ?? [])].slice(0, 3));
      resetForm();
      setSubmitState("success");
    } catch {
      setSubmitState("error");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="production-patient-home">
      <header className="production-patient-home-header">
        <BrandMark />
        <div className="production-patient-home-actions">
          <Badge variant="secondary" className="patient-profile-badge">
            <ShieldCheck aria-hidden="true" weight="bold" />
            {patientProfile.displayName} · {patientProfile.relationshipLabel}
          </Badge>
          <PatientLogoutButton />
        </div>
      </header>

      <div className="production-patient-home-content">
        <section className="patient-home-intro" aria-labelledby="patient-home-title">
          <p className="patient-home-eyebrow">Ruang perawatan Anda</p>
          <h1 id="patient-home-title">Halo, {patientProfile.displayName}</h1>
          <p>Ceritakan kondisi hari ini. Jawaban singkat juga tidak apa-apa.</p>
        </section>

        <div className="patient-checkin-layout">
        <Card className="patient-checkin-card">
          <CardHeader>
            <div className="patient-checkin-card-heading">
              <span className="patient-checkin-card-icon">
                <Heartbeat aria-hidden="true" weight="bold" />
              </span>
              <div>
                <CardTitle>Check-in hari ini</CardTitle>
                <CardDescription>
                  Catat yang Anda rasakan. ChroniCare tidak menilai atau
                  mengubah pengobatan.
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <form className="patient-checkin-form" onSubmit={submit} noValidate>
              {submitState === "success" ? (
                <Alert
                  ref={successRef}
                  role="status"
                  tabIndex={-1}
                  className="patient-checkin-success"
                >
                  <Check aria-hidden="true" weight="bold" />
                  <AlertTitle>Check-in berhasil disimpan</AlertTitle>
                  <AlertDescription>
                    Terima kasih sudah berbagi kondisi hari ini.
                  </AlertDescription>
                </Alert>
              ) : null}
              {submitState === "error" ? (
                <Alert ref={errorRef} variant="destructive" tabIndex={-1}>
                  <Warning aria-hidden="true" weight="fill" />
                  <AlertTitle>Check-in belum tersimpan</AlertTitle>
                  <AlertDescription>
                    Data belum berubah. Periksa koneksi lalu coba lagi.
                  </AlertDescription>
                </Alert>
              ) : null}

              <fieldset className="patient-mood-fieldset" aria-invalid={validationError}>
                <legend>
                  Bagaimana kondisi Anda hari ini?
                </legend>
                <div className="patient-mood-options">
                  {moodOptions.map((option) => {
                    const MoodIcon = moodIcons[option.value];
                    const selected = mood === option.value;
                    return (
                      <label
                        key={option.value}
                        onClick={() => {
                          setMood(option.value);
                          setValidationError(false);
                        }}
                        className={cn(
                          "patient-mood-option",
                          `patient-mood-${option.value.toLowerCase()}`,
                          selected && "is-selected",
                        )}
                      >
                      <input
                        ref={option.value === "GOOD" ? firstMoodRef : undefined}
                        className="sr-only"
                        type="radio"
                        name="mood"
                        value={option.value}
                        aria-label={option.label}
                        checked={mood === option.value}
                        onChange={() => {
                          setMood(option.value);
                          setValidationError(false);
                        }}
                      />
                        <MoodIcon className="patient-mood-icon" aria-hidden="true" weight="duotone" />
                        <span className="patient-mood-label">{option.label}</span>
                        <span className="patient-mood-helper">{option.helper}</span>
                        {selected ? (
                          <span className="patient-mood-selected"><Check aria-hidden="true" weight="bold" /> Dipilih</span>
                        ) : null}
                      </label>
                    );
                  })}
                </div>
                {validationError ? (
                  <p className="text-sm text-destructive">Pilih kondisi hari ini.</p>
                ) : null}
              </fieldset>

              <div className="space-y-2">
                <Label htmlFor="conditionText">Kondisi hari ini (opsional)</Label>
                <Textarea
                  id="conditionText"
                  value={conditionText}
                  onChange={(event) => setConditionText(event.target.value)}
                  maxLength={1000}
                  placeholder="Contoh: tidur cukup dan bisa beraktivitas ringan."
                />
              </div>

              <details className="patient-checkin-details">
                <summary>
                  <span>Tambahkan detail lain (opsional)</span>
                  <CaretDown aria-hidden="true" weight="bold" />
                </summary>
                <div className="patient-checkin-details-content">
                  <div className="space-y-3">
                    <label className="flex items-center gap-2 text-sm font-medium">
                      <input
                        type="checkbox"
                        checked={recordPain}
                        onChange={(event) => setRecordPain(event.target.checked)}
                        className="size-4 accent-foreground"
                      />
                      Catat tingkat nyeri
                    </label>
                    {recordPain ? (
                      <div className="grid grid-cols-[1fr_auto] items-center gap-3">
                        <Label htmlFor="painLevel">Tingkat nyeri 0 sampai 10</Label>
                        <output htmlFor="painLevel" className="min-w-8 text-right font-semibold">
                          {painLevel}
                        </output>
                        <input
                          id="painLevel"
                          className="col-span-2 w-full accent-foreground"
                          type="range"
                          min="0"
                          max="10"
                          value={painLevel}
                          onChange={(event) => setPainLevel(Number(event.target.value))}
                        />
                      </div>
                    ) : null}
                  </div>

                  <fieldset className="space-y-2">
                    <legend className="text-sm font-medium">
                      Obat yang dicatat sudah diminum?
                    </legend>
                    <div className="flex flex-wrap gap-2">
                      {[
                        ["UNANSWERED", "Tidak dijawab"],
                        ["YES", "Sudah"],
                        ["NO", "Belum"],
                      ].map(([value, label]) => (
                        <label
                          key={value}
                          className={cn(
                            "cursor-pointer rounded-lg border px-3 py-2 text-sm focus-within:ring-3 focus-within:ring-ring/40",
                            medicationTaken === value && "border-foreground bg-secondary",
                          )}
                        >
                          <input
                            className="sr-only"
                            type="radio"
                            name="medicationTaken"
                            value={value}
                            checked={medicationTaken === value}
                            onChange={() =>
                              setMedicationTaken(value as typeof medicationTaken)
                            }
                          />
                          {label}
                        </label>
                      ))}
                    </div>
                  </fieldset>

                  <div className="space-y-2">
                    <Label htmlFor="complaintText">Keluhan (opsional)</Label>
                    <Textarea
                      id="complaintText"
                      value={complaintText}
                      onChange={(event) => setComplaintText(event.target.value)}
                      maxLength={1000}
                      placeholder="Tuliskan dengan kata-kata Anda sendiri."
                    />
                  </div>

                  <label className="flex items-start gap-3 rounded-lg border p-3 text-sm">
                    <input
                      type="checkbox"
                      checked={needsFamilyHelp}
                      onChange={(event) => setNeedsFamilyHelp(event.target.checked)}
                      className="mt-0.5 size-4 accent-foreground"
                    />
                    <span>
                      <span className="block font-medium">Saya perlu bantuan keluarga</span>
                      <span className="text-muted-foreground">
                        Catatan ini akan terlihat oleh caregiver yang berwenang.
                      </span>
                    </span>
                  </label>
                </div>
              </details>

              {urgent ? (
                <Alert className="patient-checkin-urgent" variant="destructive" aria-live="assertive">
                  <Warning aria-hidden="true" weight="fill" />
                  <AlertTitle>Cari bantuan sekarang</AlertTitle>
                  <AlertDescription>
                    Segera hubungi keluarga, caregiver, atau layanan medis/IGD.
                    Jangan menunggu balasan dari aplikasi ini.
                  </AlertDescription>
                </Alert>
              ) : null}

              <Button type="submit" size="lg" className="patient-checkin-submit" disabled={submitting}>
                {submitting ? (
                  <SpinnerGap className="animate-spin" aria-hidden="true" weight="bold" />
                ) : (
                  <ClipboardText aria-hidden="true" weight="bold" />
                )}
                {submitting ? "Menyimpan..." : "Simpan check-in"}
              </Button>
            </form>
          </CardContent>
        </Card>

        <section aria-labelledby="recent-check-ins" className="patient-checkin-history">
          <div className="patient-checkin-history-heading">
            <span><CalendarCheck aria-hidden="true" weight="duotone" /></span>
            <h2 id="recent-check-ins">
              Check-in terbaru
            </h2>
          </div>

          {items === null ? (
            <div role="status" className="patient-checkin-history-loading" aria-live="polite">
              <p>Memuat check-in terbaru...</p>
              <Skeleton className="h-24 w-full" />
            </div>
          ) : loadError ? (
            <Alert variant="destructive">
              <Warning aria-hidden="true" weight="fill" />
              <AlertTitle>Riwayat belum dapat dimuat</AlertTitle>
              <AlertDescription>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="mt-2"
                  onClick={() => {
                    setLoadError(false);
                    setItems(null);
                    void loadCheckIns();
                  }}
                >
                  <ArrowClockwise aria-hidden="true" weight="bold" />
                  Coba lagi
                </Button>
              </AlertDescription>
            </Alert>
          ) : items.length === 0 ? (
            <div className="patient-checkin-history-empty">
              Belum ada check-in. Mulai saat sudah siap.
            </div>
          ) : (
            <ol className="patient-checkin-history-list">
              {items.map((item) => (
                <li key={item.id}>
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-medium">{moodLabels[item.mood]}</p>
                      <p className="text-xs text-muted-foreground">
                        {readableTime(item.createdAt)}
                      </p>
                    </div>
                    {item.needsFamilyHelp ? (
                      <Badge variant="destructive">Perlu bantuan</Badge>
                    ) : null}
                  </div>
                  {item.conditionText ? (
                    <p className="mt-3 break-words text-sm text-muted-foreground">
                      {item.conditionText}
                    </p>
                  ) : null}
                </li>
              ))}
            </ol>
          )}
        </section>
        </div>

        <div className="mt-6">
          <PatientChatSurface
            patientProfileId={patientProfile.id}
            patientName={patientProfile.displayName}
          />
        </div>
      </div>
    </main>
  );
}
