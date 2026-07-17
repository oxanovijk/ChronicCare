"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";

type SosEvent = {
  id: string;
  patientProfileId: string;
  patientDisplayName: string;
  status: "NEW" | "HANDLED" | "CANCELLED";
  message: string | null;
  locationLabel: string | null;
  createdAt: string;
  handledBy: { id: string; displayName: string } | null;
  handledAt: string | null;
};

type ConnectionState = "connecting" | "connected" | "recovering" | "disconnected";
type AudioState = "off" | "enabled" | "muted" | "blocked";

function readableTime(value: string) {
  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

async function playAlertTone() {
  if (!window.AudioContext) throw new Error("AUDIO_UNAVAILABLE");
  const audio = new window.AudioContext();
  await audio.resume();
  const oscillator = audio.createOscillator();
  const gain = audio.createGain();
  oscillator.frequency.value = 740;
  gain.gain.setValueAtTime(0.08, audio.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, audio.currentTime + 0.2);
  oscillator.connect(gain).connect(audio.destination);
  oscillator.start();
  oscillator.stop(audio.currentTime + 0.2);
  oscillator.addEventListener("ended", () => void audio.close(), { once: true });
}

export function CaregiverSosCenter() {
  const [events, setEvents] = useState<SosEvent[] | null>(null);
  const [loadError, setLoadError] = useState(false);
  const [connection, setConnection] =
    useState<ConnectionState>("connecting");
  const [audio, setAudio] = useState<AudioState>("off");
  const [handlingId, setHandlingId] = useState<string | null>(null);
  const [handled, setHandled] = useState<SosEvent | null>(null);
  const [conflict, setConflict] = useState(false);
  const audioEnabled = useRef(false);

  const loadEvents = useCallback(async () => {
    try {
      const response = await fetch("/api/v1/sos-events?status=NEW", {
        cache: "no-store",
        credentials: "same-origin",
      });
      if (!response.ok) throw new Error("SOS_LIST_FAILED");
      const body = (await response.json()) as { data: SosEvent[] };
      setEvents(body.data);
      setLoadError(false);
    } catch {
      setLoadError(true);
      setEvents((current) => current ?? []);
    }
  }, []);

  useEffect(() => {
    const recover = () => {
      setConnection((current) =>
        current === "disconnected" ? current : "recovering",
      );
      void loadEvents().finally(() =>
        setConnection((current) =>
          current === "recovering" ? "connected" : current,
        ),
      );
    };
    const disconnect = () => setConnection("disconnected");
    window.addEventListener("focus", recover);
    window.addEventListener("online", recover);
    window.addEventListener("offline", disconnect);
    const initialLoad = window.setTimeout(() => void loadEvents(), 0);
    let removeRealtime = () => {};

    try {
      const supabase = createSupabaseBrowserClient();
      const channel = supabase
        .channel("caregiver-sos-events")
        .on(
          "postgres_changes",
          { event: "*", schema: "public", table: "sos_events" },
          (payload) => {
            if (payload.eventType === "INSERT" && audioEnabled.current) {
              void playAlertTone().catch(() => {
                audioEnabled.current = false;
                setAudio("blocked");
              });
            }
            void loadEvents();
          },
        )
        .subscribe((status) => {
          if (status === "SUBSCRIBED") {
            setConnection((current) =>
              current === "connecting" ? "connected" : "recovering",
            );
            void loadEvents().finally(() => setConnection("connected"));
          } else if (
            status === "CHANNEL_ERROR" ||
            status === "TIMED_OUT" ||
            status === "CLOSED"
          ) {
            setConnection("disconnected");
          }
        });
      removeRealtime = () => void supabase.removeChannel(channel);
    } catch {
      const unavailable = window.setTimeout(disconnect, 0);
      removeRealtime = () => window.clearTimeout(unavailable);
    }

    return () => {
      window.clearTimeout(initialLoad);
      window.removeEventListener("focus", recover);
      window.removeEventListener("online", recover);
      window.removeEventListener("offline", disconnect);
      removeRealtime();
    };
  }, [loadEvents]);

  async function enableAudio() {
    try {
      await playAlertTone();
      audioEnabled.current = true;
      setAudio("enabled");
    } catch {
      audioEnabled.current = false;
      setAudio("blocked");
    }
  }

  function muteAudio() {
    audioEnabled.current = false;
    setAudio("muted");
  }

  async function handle(event: SosEvent) {
    setHandlingId(event.id);
    setConflict(false);
    try {
      const response = await fetch(`/api/v1/sos-events/${event.id}/handle`, {
        method: "POST",
        credentials: "same-origin",
      });
      const body = (await response.json().catch(() => null)) as
        | { data: SosEvent }
        | { error?: { code?: string; details?: { current?: SosEvent } } }
        | null;
      if (response.ok && body && "data" in body) {
        setHandled(body.data);
        setEvents((current) => current?.filter((item) => item.id !== event.id) ?? []);
        return;
      }
      if (
        response.status === 409 &&
        body &&
        "error" in body &&
        body.error?.code === "SOS_ALREADY_HANDLED" &&
        body.error.details?.current
      ) {
        setConflict(true);
        setHandled(body.error.details.current);
        setEvents((current) => current?.filter((item) => item.id !== event.id) ?? []);
        return;
      }
      throw new Error("SOS_HANDLE_FAILED");
    } catch {
      setLoadError(true);
    } finally {
      setHandlingId(null);
    }
  }

  const connectionCopy = {
    connecting: "Menghubungkan Realtime",
    connected: "Realtime terhubung",
    recovering: "Memuat ulang data terbaru",
    disconnected: "Realtime terputus · data dapat tertunda",
  }[connection];

  return (
    <section className="mb-6 space-y-4" aria-labelledby="caregiver-sos-title">
      <div className="flex flex-wrap items-start justify-between gap-3 rounded-xl border bg-card p-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-destructive">
            SOS Care Circle
          </p>
          <h2 id="caregiver-sos-title" className="mt-1 text-lg font-semibold">
            Alert koordinasi keluarga
          </h2>
          <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
            Alert visual selalu aktif saat dashboard terbuka. ChroniCare bukan
            layanan dispatch resmi dan tidak menjamin delivery saat tab tertutup.
          </p>
        </div>
        <Badge variant={connection === "connected" ? "secondary" : "outline"}>
          {connectionCopy}
        </Badge>
      </div>

      <div className="flex flex-wrap items-center gap-2 rounded-xl border bg-card p-3">
        {audio === "enabled" ? (
          <>
            <Button type="button" size="sm" variant="outline" onClick={() => void enableAudio()}>
              Tes suara
            </Button>
            <Button type="button" size="sm" variant="ghost" onClick={muteAudio}>
              Matikan suara
            </Button>
          </>
        ) : (
          <Button type="button" size="sm" variant="outline" onClick={() => void enableAudio()}>
            Aktifkan dan tes suara
          </Button>
        )}
        <span className="text-sm text-muted-foreground" role="status" aria-live="polite">
          {audio === "enabled"
            ? "Suara aktif setelah izin pengguna."
            : audio === "blocked"
              ? "Audio diblokir atau tidak tersedia; alert visual tetap aktif."
              : audio === "muted"
                ? "Suara dimatikan; alert visual tetap aktif."
                : "Suara belum diaktifkan."}
        </span>
      </div>

      {loadError ? (
        <Alert variant="destructive">
          <AlertTitle>Daftar SOS belum dapat diperbarui</AlertTitle>
          <AlertDescription>
            Data terakhir mungkin sudah usang. Periksa koneksi lalu muat ulang;
            untuk kondisi darurat gunakan kontak langsung atau layanan darurat.
            <Button className="mt-3" type="button" size="sm" variant="outline" onClick={() => void loadEvents()}>
              Muat ulang SOS
            </Button>
          </AlertDescription>
        </Alert>
      ) : null}

      {handled ? (
        <Alert role="status" aria-live="polite">
          <AlertTitle>
            {conflict ? "Caregiver lain lebih dulu menangani" : "SOS ditangani"}
          </AlertTitle>
          <AlertDescription>
            {handled.patientDisplayName} ditangani oleh {handled.handledBy?.displayName ?? "caregiver terverifikasi"}
            {handled.handledAt ? ` pada ${readableTime(handled.handledAt)}` : ""}.
          </AlertDescription>
        </Alert>
      ) : null}

      {events === null ? (
        <div className="rounded-xl border bg-card p-4 text-sm text-muted-foreground" role="status" aria-live="polite">
          Memuat SOS aktif...
        </div>
      ) : events.length === 0 ? (
        <div className="rounded-xl border bg-card p-4 text-sm text-muted-foreground">
          Tidak ada SOS aktif untuk Care Circle ini.
        </div>
      ) : (
        <div className="grid gap-3" aria-live="assertive">
          {events.map((event) => (
            <article
              key={event.id}
              role="alert"
              className="rounded-xl border-2 border-destructive bg-destructive/5 p-4 shadow-sm"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-destructive">
                    SOS aktif · {readableTime(event.createdAt)}
                  </p>
                  <h3 className="mt-1 text-xl font-semibold">
                    {event.patientDisplayName} meminta bantuan
                  </h3>
                  <p className="mt-2 text-sm text-muted-foreground">
                    {event.message ?? "Patient meminta bantuan caregiver melalui ChroniCare."}
                  </p>
                  <p className="mt-2 text-sm">
                    <strong>Lokasi umum:</strong> {event.locationLabel ?? "Belum dicatat"}
                  </p>
                </div>
                <Button
                  type="button"
                  variant="destructive"
                  disabled={handlingId === event.id}
                  onClick={() => void handle(event)}
                >
                  {handlingId === event.id ? "Menyimpan..." : "Saya tangani"}
                </Button>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
