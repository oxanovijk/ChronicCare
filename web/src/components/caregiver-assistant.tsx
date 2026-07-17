"use client";

import { FormEvent, useState } from "react";

type Message = { role: "user" | "assistant"; text: string };

export function CaregiverAssistant() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  function respond(prompt: string) {
    const lower = prompt.toLowerCase();
    let response = "Berdasarkan konteks yang dikonfirmasi: catat perubahan rutinitas Maya, waktu keluhan muncul, dan pertanyaan yang ingin dibahas saat kunjungan. Ini bukan diagnosis atau rekomendasi terapi.";
    if (/dosis|obat apa|diagnosis|normal|bahaya/.test(lower)) response = "Saya tidak dapat menentukan diagnosis, menilai hasil sebagai normal atau berbahaya, maupun menyarankan perubahan obat atau dosis. Hubungi tenaga kesehatan untuk penilaian tersebut.";
    if (/sesak|pingsan|darurat|gawat/.test(lower)) response = "Jika ada kemungkinan keadaan darurat, hentikan percakapan ini dan hubungi IGD atau layanan darurat setempat. ChroniCare bukan layanan darurat resmi.";
    setMessages((current) => [...current, { role: "user", text: prompt }, { role: "assistant", text: response }]);
    setInput("");
  }
  function submit(event: FormEvent) { event.preventDefault(); if (input.trim()) respond(input.trim()); }
  return (
    <div className="assistant-layout">
      <aside className="assistant-context"><span className="card-index">Konteks yang diizinkan</span><h2>Maya Pratama</h2><dl><div><dt>Check-in terbaru</dt><dd>Butuh dukungan</dd></div><div><dt>Dokumen dikonfirmasi</dt><dd>1 ringkasan kontrol</dd></div></dl><p>Tidak memuat dokumen mentah, OCR mentah, alamat lengkap, atau nomor BPJS lengkap.</p></aside>
      <section className="chat-panel"><header><div><span className="section-kicker"><span aria-hidden="true" /> Screen 07</span><h1>Asisten persiapan perawatan</h1></div><span className="fallback-badge">Demo fallback</span></header><p className="assistant-disclaimer">Jawaban pada halaman contoh ini sudah disiapkan dan bukan respons AI langsung.</p><div className="suggestion-row"><button type="button" onClick={() => respond("Siapkan pertanyaan untuk dokter")}>Siapkan pertanyaan untuk dokter</button><button type="button" onClick={() => respond("Ringkas konteks terkonfirmasi")}>Ringkas konteks terkonfirmasi</button><button type="button" onClick={() => respond("Apa yang perlu disiapkan untuk BPJS?")}>Persiapan BPJS</button></div><div className="chat-thread" aria-live="polite">{messages.length ? messages.map((message, index) => <div className={`chat-bubble ${message.role}`} key={`${message.role}-${index}`}><strong>{message.role === "assistant" ? "Care in Motion · Demo fallback" : "Anda"}</strong><p>{message.text}</p></div>) : <div className="chat-empty"><span aria-hidden="true">07</span><h2>Mulai dari satu kebutuhan praktis.</h2><p>Gunakan saran di atas atau tulis pertanyaan singkat.</p></div>}</div><form className="chat-composer" onSubmit={submit}><label className="sr-only" htmlFor="chat-input">Pesan untuk asisten</label><input id="chat-input" value={input} onChange={(event) => setInput(event.target.value)} placeholder="Tulis kebutuhan persiapan..." /><button className="primary-button" type="submit">Kirim</button></form>{messages.length ? <button className="clear-chat" type="button" onClick={() => setMessages([])}>Bersihkan percakapan</button> : null}</section>
    </div>
  );
}

