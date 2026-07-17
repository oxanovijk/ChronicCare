"use client";

import { useState } from "react";

const facilities = [
  { name: "Puskesmas Cipondoh", area: "cipondoh", type: "puskesmas", bpjs: true, address: "Cipondoh, Kota Tangerang", phone: "(021) 5574 3123" },
  { name: "RSUD Kota Tangerang", area: "benda", type: "rumah-sakit", bpjs: true, address: "Kota Tangerang", phone: "(021) 2942 9999" },
  { name: "Klinik Sehat Bersama", area: "cipondoh", type: "klinik", bpjs: false, address: "Cipondoh, Kota Tangerang", phone: "(021) 5500 1842" },
];

export function FacilityHelper() {
  const [area, setArea] = useState("semua"); const [type, setType] = useState("semua"); const [bpjs, setBpjs] = useState(false); const [open, setOpen] = useState<string[]>([]);
  const results = facilities.filter((item) => (area === "semua" || item.area === area) && (type === "semua" || item.type === type) && (!bpjs || item.bpjs));
  return (
    <div className="facility-layout"><aside className="facility-filters"><span className="section-kicker"><span aria-hidden="true" /> Screen 10</span><h1>Faskes & BPJS helper</h1><p>Data statis Tangerang untuk kebutuhan demo. Verifikasi ulang sebelum menghubungi fasilitas.</p><label>Wilayah<select aria-label="Wilayah" value={area} onChange={(event) => setArea(event.target.value)}><option value="semua">Semua wilayah</option><option value="cipondoh">Cipondoh</option><option value="benda">Benda</option></select></label><label>Tipe fasilitas<select aria-label="Tipe fasilitas" value={type} onChange={(event) => setType(event.target.value)}><option value="semua">Semua tipe</option><option value="puskesmas">Puskesmas</option><option value="rumah-sakit">Rumah sakit</option><option value="klinik">Klinik</option></select></label><label className="checkbox-row"><input type="checkbox" checked={bpjs} onChange={(event) => setBpjs(event.target.checked)} />Tandai informasi BPJS tersedia</label><small>Sumber demo internal · Ditinjau 16 Juli 2026</small></aside><section className="facility-results"><header><div><span className="card-index">Hasil statis</span><h2>{results.length} fasilitas ditampilkan</h2></div><p>Urutan bukan rekomendasi, jarak terdekat, atau jaminan layanan.</p></header>{results.length ? <div className="facility-list">{results.map((item) => <article key={item.name}><div className="facility-card-heading"><span>{item.type.replace("-", " ")}</span>{item.bpjs ? <strong>Info BPJS tersedia</strong> : <strong>BPJS perlu dikonfirmasi</strong>}</div><h3>{item.name}</h3><p>{item.address}</p><button type="button" onClick={() => setOpen((items) => items.includes(item.name) ? items.filter((name) => name !== item.name) : [...items, item.name])} aria-expanded={open.includes(item.name)}>Lihat kontak {item.name}</button>{open.includes(item.name) ? <div className="contact-detail"><strong>{item.phone}</strong><span>Konfirmasi jam layanan dan penerimaan BPJS langsung ke fasilitas.</span></div> : null}</article>)}</div> : <div className="facility-empty"><h3>Belum ada hasil untuk filter ini.</h3><p>Coba perluas wilayah atau tipe fasilitas. ChroniCare tidak menentukan fasilitas yang paling sesuai secara klinis.</p></div>}</section></div>
  );
}

