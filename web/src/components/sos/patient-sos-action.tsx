"use client";

import { useEffect, useRef, useState } from "react";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type SendState = "idle" | "confirm" | "sending" | "sent" | "error";

export function PatientSosAction({
  patientProfileId,
}: {
  patientProfileId: string;
}) {
  const [state, setState] = useState<SendState>("idle");
  const idempotencyKey = useRef<string | null>(null);
  const resultRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (state === "sent" || state === "error") resultRef.current?.focus();
  }, [state]);

  async function send() {
    setState("sending");
    idempotencyKey.current ??= crypto.randomUUID();
    try {
      const response = await fetch(
        `/api/v1/patient-profiles/${patientProfileId}/sos`,
        {
          method: "POST",
          credentials: "same-origin",
          headers: {
            "Content-Type": "application/json",
            "Idempotency-Key": idempotencyKey.current,
          },
          body: JSON.stringify({
            message: "Saya butuh bantuan caregiver sekarang.",
          }),
        },
      );
      if (!response.ok) throw new Error("SOS_CREATE_FAILED");
      setState("sent");
    } catch {
      setState("error");
    }
  }

  return (
    <Card className="border-destructive/40 bg-destructive/5" aria-labelledby="patient-sos-title">
      <CardHeader>
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-destructive">
          Bantuan segera
        </p>
        <CardTitle id="patient-sos-title">Hubungi caregiver melalui SOS</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="max-w-3xl text-sm leading-6 text-muted-foreground">
          SOS membuat alert koordinasi untuk caregiver yang sedang membuka
          dashboard ChroniCare. Ini bukan layanan darurat resmi dan tidak
          menjamin alert diterima saat dashboard tertutup atau terputus.
        </p>

        {state === "sent" ? (
          <Alert ref={resultRef} role="status" tabIndex={-1}>
            <AlertTitle>SOS sudah disimpan</AlertTitle>
            <AlertDescription>
              Alert ditujukan ke dashboard caregiver yang sedang terbuka. Untuk
              kondisi berat atau cepat memburuk, hubungi keluarga terdekat,
              tenaga medis, IGD, atau layanan darurat sekarang.
            </AlertDescription>
          </Alert>
        ) : state === "error" ? (
          <Alert
            ref={resultRef}
            role="alert"
            tabIndex={-1}
            variant="destructive"
          >
            <AlertTitle>SOS belum tersimpan</AlertTitle>
            <AlertDescription>
              Jangan menunggu aplikasi. Hubungi keluarga, tenaga medis, IGD,
              atau layanan darurat sekarang, lalu coba lagi bila aman.
            </AlertDescription>
          </Alert>
        ) : null}

        {state === "confirm" || state === "sending" || state === "error" ? (
          <div className="rounded-xl border border-destructive/30 bg-background p-4" role="group" aria-labelledby="patient-sos-confirm">
            <h3 id="patient-sos-confirm" className="font-semibold">
              Kirim SOS ke caregiver sekarang?
            </h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Caregiver perlu membuka dashboard dan tetap terhubung untuk
              menerima alert Realtime.
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              <Button
                type="button"
                variant="destructive"
                disabled={state === "sending"}
                onClick={() => void send()}
              >
                {state === "sending" ? "Mengirim SOS..." : "Ya, kirim SOS"}
              </Button>
              <Button
                type="button"
                variant="outline"
                disabled={state === "sending"}
                onClick={() => setState("idle")}
              >
                Batal
              </Button>
            </div>
          </div>
        ) : state !== "sent" ? (
          <Button
            type="button"
            variant="destructive"
            size="lg"
            onClick={() => setState("confirm")}
          >
            Buka SOS
          </Button>
        ) : null}
      </CardContent>
    </Card>
  );
}
