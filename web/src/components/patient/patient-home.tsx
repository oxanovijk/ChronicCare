"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  AlertTriangle,
  CalendarCheck,
  Check,
  ClipboardCheck,
  HeartPulse,
  LoaderCircle,
  RefreshCw,
  ShieldCheck,
} from "lucide-react";

import { PatientLogoutButton } from "@/components/auth/patient-logout-button";
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
  selectedClass: string;
}> = [
  {
    value: "GOOD",
    label: "Baik",
    helper: "Hari terasa lancar",
    selectedClass: "border-emerald-600 bg-emerald-50 text-emerald-950",
  },
  {
    value: "OKAY",
    label: "Biasa saja",
    helper: "Ada sedikit perubahan",
    selectedClass: "border-amber-600 bg-amber-50 text-amber-950",
  },
  {
    value: "UNWELL",
    label: "Kurang baik",
    helper: "Butuh lebih diperhatikan",
    selectedClass: "border-rose-600 bg-rose-50 text-rose-950",
  },
];

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
    <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-6 px-4 py-6 sm:px-6 sm:py-10">
      <header className="flex flex-col gap-4 border-b pb-6 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-3">
          <Badge variant="secondary" className="gap-1.5">
            <ShieldCheck aria-hidden="true" />
            Profil aktif: {patientProfile.relationshipLabel}
          </Badge>
          <div className="space-y-1">
            <h1 className="text-2xl font-semibold sm:text-3xl">
              Halo, {patientProfile.displayName}
            </h1>
            <p className="max-w-xl text-sm text-muted-foreground sm:text-base">
              Ceritakan kondisi hari ini. Jawaban singkat juga tidak apa-apa.
            </p>
          </div>
        </div>
        <PatientLogoutButton />
      </header>

      <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1.6fr)_minmax(17rem,0.8fr)]">
        <Card className="border-t-4 border-t-emerald-600">
          <CardHeader>
            <div className="flex items-start gap-3">
              <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-emerald-100 text-emerald-800">
                <HeartPulse aria-hidden="true" />
              </span>
              <div className="space-y-1">
                <CardTitle className="text-lg">Check-in hari ini</CardTitle>
                <CardDescription>
                  Catat yang Anda rasakan. ChroniCare tidak menilai atau
                  mengubah pengobatan.
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <form className="space-y-6" onSubmit={submit} noValidate>
              {submitState === "success" ? (
                <Alert
                  ref={successRef}
                  role="status"
                  tabIndex={-1}
                  className="border-emerald-200 bg-emerald-50 text-emerald-950"
                >
                  <Check aria-hidden="true" />
                  <AlertTitle>Check-in berhasil disimpan</AlertTitle>
                  <AlertDescription>
                    Terima kasih sudah berbagi kondisi hari ini.
                  </AlertDescription>
                </Alert>
              ) : null}
              {submitState === "error" ? (
                <Alert ref={errorRef} variant="destructive" tabIndex={-1}>
                  <AlertTriangle aria-hidden="true" />
                  <AlertTitle>Check-in belum tersimpan</AlertTitle>
                  <AlertDescription>
                    Data belum berubah. Periksa koneksi lalu coba lagi.
                  </AlertDescription>
                </Alert>
              ) : null}

              <fieldset className="space-y-3" aria-invalid={validationError}>
                <legend className="text-sm font-medium">
                  Bagaimana kondisi Anda hari ini?
                </legend>
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                  {moodOptions.map((option) => (
                    <label
                      key={option.value}
                      onClick={() => {
                        setMood(option.value);
                        setValidationError(false);
                      }}
                      className={cn(
                        "relative flex min-h-20 cursor-pointer flex-col justify-center rounded-lg border bg-background px-3 py-2 transition-colors hover:bg-muted/60 focus-within:ring-3 focus-within:ring-ring/40",
                        mood === option.value && option.selectedClass,
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
                      <span className="font-medium">{option.label}</span>
                      <span className="text-xs text-muted-foreground">
                        {option.helper}
                      </span>
                    </label>
                  ))}
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

              <details className="group rounded-lg border bg-muted/20 p-3 open:bg-background">
                <summary className="cursor-pointer font-medium">
                  Tambahkan detail lain (opsional)
                </summary>
                <div className="mt-5 space-y-5 border-t pt-5">
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
                <Alert variant="destructive" aria-live="assertive">
                  <AlertTriangle aria-hidden="true" />
                  <AlertTitle>Cari bantuan sekarang</AlertTitle>
                  <AlertDescription>
                    Segera hubungi keluarga, caregiver, atau layanan medis/IGD.
                    Jangan menunggu balasan dari aplikasi ini.
                  </AlertDescription>
                </Alert>
              ) : null}

              <Button type="submit" size="lg" className="w-full sm:w-auto" disabled={submitting}>
                {submitting ? (
                  <LoaderCircle className="animate-spin" aria-hidden="true" />
                ) : (
                  <ClipboardCheck aria-hidden="true" />
                )}
                {submitting ? "Menyimpan..." : "Simpan check-in"}
              </Button>
            </form>
          </CardContent>
        </Card>

        <section aria-labelledby="recent-check-ins" className="space-y-4">
          <div className="flex items-center gap-2">
            <CalendarCheck className="size-5 text-emerald-700" aria-hidden="true" />
            <h2 id="recent-check-ins" className="text-lg font-semibold">
              Check-in terbaru
            </h2>
          </div>

          {items === null ? (
            <div role="status" className="space-y-3" aria-live="polite">
              <p className="text-sm text-muted-foreground">Memuat check-in terbaru...</p>
              <Skeleton className="h-24 w-full" />
            </div>
          ) : loadError ? (
            <Alert variant="destructive">
              <AlertTriangle aria-hidden="true" />
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
                  <RefreshCw aria-hidden="true" />
                  Coba lagi
                </Button>
              </AlertDescription>
            </Alert>
          ) : items.length === 0 ? (
            <div className="rounded-lg border border-dashed p-5 text-sm text-muted-foreground">
              Belum ada check-in. Mulai saat sudah siap.
            </div>
          ) : (
            <ol className="space-y-3">
              {items.map((item) => (
                <li key={item.id} className="rounded-lg border bg-background p-4">
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
    </main>
  );
}
