"use client";

import { type FormEvent, useEffect, useRef, useState } from "react";

import type { ChatResponse } from "@/lib/ai/chat/contract";

import styles from "./chat-panel.module.css";

type Message = {
  id: string;
  role: "USER" | "ASSISTANT";
  content: string;
  isFallback?: boolean;
};

type Props = {
  patientProfileId: string;
  patientName: string;
  persona: "PATIENT" | "CAREGIVER";
};

const suggestions = {
  PATIENT: [
    "Saya pusing dan badan terasa lemas, harus bagaimana?",
    "Obat saya diminum kapan?",
  ],
  CAREGIVER: [
    "Apa yang perlu saya siapkan sebelum kontrol?",
    "Ringkas konteks yang sudah dikonfirmasi.",
  ],
};

function publicError(status: number) {
  if (status === 401) return "Sesi sudah berakhir. Masuk kembali untuk melanjutkan.";
  if (status === 403 || status === 404) {
    return "Chat untuk Patient Profile ini tidak dapat diakses.";
  }
  if (status === 429) return "Terlalu banyak pesan. Tunggu sebentar lalu coba lagi.";
  return "Pesan belum dapat dikirim. Coba lagi tanpa mengubah data Patient.";
}

function ChatPanelSession({ patientProfileId, patientName, persona }: Props) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [status, setStatus] = useState<"idle" | "sending" | "error">("idle");
  const [error, setError] = useState<string | null>(null);
  const request = useRef<AbortController | null>(null);

  useEffect(() => {
    return () => request.current?.abort();
  }, []);

  async function send(content: string) {
    const message = content.trim();
    if (!message || status === "sending") return;
    const controller = new AbortController();
    request.current?.abort();
    request.current = controller;
    setMessages((current) => [
      ...current,
      { id: crypto.randomUUID(), role: "USER", content: message },
    ]);
    setInput("");
    setError(null);
    setStatus("sending");

    try {
      const response = await fetch(
        `/api/v1/patient-profiles/${patientProfileId}/chat`,
        {
          method: "POST",
          credentials: "same-origin",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ sessionId, message }),
          signal: controller.signal,
        },
      );
      if (!response.ok) throw new Error(String(response.status));
      const body = (await response.json()) as { data: ChatResponse };
      setSessionId(body.data.sessionId);
      setMessages((current) => [
        ...current,
        {
          id: crypto.randomUUID(),
          role: "ASSISTANT",
          content: body.data.message.content,
          isFallback: body.data.message.isFallback,
        },
      ]);
      setStatus("idle");
    } catch (caught) {
      if (caught instanceof DOMException && caught.name === "AbortError") return;
      const statusCode = caught instanceof Error ? Number(caught.message) : 0;
      setError(publicError(statusCode));
      setStatus("error");
    }
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void send(input);
  }

  const lastAssistant = [...messages]
    .reverse()
    .find((message) => message.role === "ASSISTANT");
  const emergency = lastAssistant
    ? /pertolongan segera|gunakan SOS|tekan SOS|\bIGD\b/i.test(
        lastAssistant.content,
      )
    : false;

  return (
    <section
      id={persona === "PATIENT" ? "patient-chat" : "caregiver-assistant"}
      className={styles.panel}
      aria-labelledby={`chat-title-${patientProfileId}`}
    >
      <header className={styles.header}>
        <div>
          <h2 id={`chat-title-${patientProfileId}`}>
            {persona === "PATIENT" ? "Teman bantu ChroniCare" : "Asisten caregiver"}
          </h2>
          <p>Konteks aktif: {patientName}. Profile lain tidak digunakan.</p>
        </div>
        <span className={styles.persona}>
          {persona === "PATIENT" ? "Patient" : "Caregiver"}
        </span>
      </header>

      <div className={styles.suggestions} aria-label="Saran pertanyaan">
        {suggestions[persona].map((suggestion) => (
          <button
            key={suggestion}
            type="button"
            disabled={status === "sending"}
            onClick={() => void send(suggestion)}
          >
            {suggestion}
          </button>
        ))}
      </div>

      <div
        className={styles.thread}
        aria-live={emergency ? "assertive" : "polite"}
        aria-busy={status === "sending"}
      >
        {messages.length === 0 ? (
          <div className={styles.empty}>
            <p>
              Mulai dengan satu pertanyaan singkat. Chat tidak menggantikan dokter
              atau layanan darurat.
            </p>
          </div>
        ) : (
          messages.map((message) => (
            <article
              key={message.id}
              className={`${styles.message} ${
                message.role === "USER" ? styles.user : styles.assistant
              }`}
            >
              <div className={styles.messageHeader}>
                <strong>{message.role === "USER" ? "Anda" : "ChroniCare"}</strong>
                {message.isFallback ? (
                  <span className={styles.fallback}>DEMO_FALLBACK</span>
                ) : null}
              </div>
              <p>{message.content}</p>
            </article>
          ))
        )}
        {status === "sending" ? <p role="status">Menyiapkan jawaban aman…</p> : null}
      </div>

      {error ? (
        <p className={styles.error} role="alert">
          {error}
        </p>
      ) : null}

      <form className={styles.composer} onSubmit={submit}>
        <div className={styles.field}>
          <label htmlFor={`chat-message-${patientProfileId}`}>Pesan</label>
          <textarea
            id={`chat-message-${patientProfileId}`}
            value={input}
            maxLength={4000}
            disabled={status === "sending"}
            placeholder={
              persona === "PATIENT"
                ? "Contoh: Saya merasa pusing…"
                : "Contoh: Apa yang perlu disiapkan sebelum kontrol?"
            }
            onChange={(event) => setInput(event.target.value)}
          />
        </div>
        <button type="submit" disabled={status === "sending" || !input.trim()}>
          {status === "sending" ? "Mengirim…" : "Kirim"}
        </button>
      </form>

      <aside className={styles.safetyNote}>
        <p>
          Jika ada nyeri dada, sesak, pingsan, atau kondisi memburuk cepat,
          hubungi keluarga/tenaga medis, gunakan SOS, atau menuju IGD.
        </p>
      </aside>
    </section>
  );
}

export function ChatPanel(props: Props) {
  return (
    <ChatPanelSession
      key={`${props.persona}:${props.patientProfileId}`}
      {...props}
    />
  );
}

export function PatientChatSurface(
  props: Omit<Props, "persona">,
) {
  return <ChatPanel {...props} persona="PATIENT" />;
}

export function CaregiverChatSurface(
  props: Omit<Props, "persona">,
) {
  return <ChatPanel {...props} persona="CAREGIVER" />;
}
