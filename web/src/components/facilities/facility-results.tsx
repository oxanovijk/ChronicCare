import { ArrowSquareOut, Buildings, Phone, WarningCircle } from "@phosphor-icons/react";

import type { FacilityRecord } from "@/lib/facilities/schemas";

const typeLabels: Record<string, string> = {
  LAB: "Laboratorium",
  KLINIK: "Klinik",
  OTHER: "Fasilitas",
  PUSKESMAS: "Puskesmas",
  RUMAH_SAKIT: "Rumah sakit",
};

function reviewedLabel(value: string) {
  const [year, month, day] = value.split("-").map(Number);
  return new Intl.DateTimeFormat("id-ID", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" }).format(new Date(Date.UTC(year, month - 1, day)));
}

function statusLabel(value: boolean | null, positive: string, unknown: string, negative: string) {
  if (value === true) return positive;
  if (value === false) return negative;
  return unknown;
}

export function FacilityResults({ items, loading }: { items: readonly FacilityRecord[]; loading: boolean }) {
  if (loading) {
    return <div className="px-4 py-10 text-center text-sm text-slate-600" role="status">Memuat data fasilitas...</div>;
  }
  if (items.length === 0) {
    return (
      <section className="mx-auto grid max-w-xl justify-items-center gap-3 px-5 py-12 text-center">
        <WarningCircle size={34} className="text-amber-700" aria-hidden="true" />
        <h3 className="text-lg font-bold text-slate-950">Tidak ada hasil pada dataset ini</h3>
        <p className="text-sm leading-6 text-slate-600">Ubah atau reset filter, lalu konfirmasikan kebutuhan langsung kepada fasilitas atau BPJS. Hasil kosong bukan berarti fasilitas tersebut tidak ada.</p>
      </section>
    );
  }
  return (
    <div className="divide-y divide-slate-200" aria-live="polite">
      {items.map((facility) => (
        <article key={facility.sourceKey} className="grid gap-4 px-4 py-6 sm:px-6 lg:grid-cols-[minmax(0,1fr)_auto]">
          <div className="min-w-0">
            <div className="mb-2 flex flex-wrap items-center gap-2 text-xs font-bold uppercase text-teal-800">
              <Buildings size={17} aria-hidden="true" />
              <span>{typeLabels[facility.facilityType] ?? facility.facilityType}</span>
              <span aria-hidden="true">·</span><span>{facility.city} / {facility.area}</span>
            </div>
            <h3 className="text-lg font-bold text-slate-950">{facility.name}</h3>
            <p className="mt-1 text-sm leading-6 text-slate-600">{facility.addressText}</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {facility.services.slice(0, 5).map((service) => <span key={service} className="rounded-md bg-teal-50 px-2 py-1 text-xs font-semibold text-teal-900">{service}</span>)}
              {facility.specialties.map((specialty) => <span key={specialty} className="rounded-md bg-amber-50 px-2 py-1 text-xs font-semibold text-amber-900">{specialty}</span>)}
            </div>
          </div>
          <div className="grid content-start gap-2 text-sm lg:min-w-64">
            <p className="font-semibold text-slate-800">{statusLabel(facility.supportsBpjs, "Informasi BPJS terverifikasi", "BPJS belum terverifikasi", "Sumber tidak mencatat dukungan BPJS")}</p>
            <p className="font-semibold text-slate-800">{statusLabel(facility.hasEmergencyUnit, "Unit darurat tercatat", "Unit darurat belum terverifikasi", "Sumber tidak mencatat unit darurat")}</p>
            {facility.phoneNumber ? <a href={`tel:${facility.phoneNumber}`} className="inline-flex min-h-11 items-center gap-2 font-bold text-teal-800 underline-offset-4 hover:underline"><Phone aria-hidden="true" />Hubungi {facility.name}</a> : null}
            <p className="mt-2 grid text-xs leading-5 text-slate-500"><span>Sumber: {facility.sourceLabel}</span><span>Ditinjau {reviewedLabel(facility.lastReviewedAt)}</span></p>
            <a href={facility.sourceUrl} target="_blank" rel="noreferrer" className="inline-flex min-h-11 items-center gap-2 text-xs font-bold text-teal-800 underline-offset-4 hover:underline">Buka sumber resmi <ArrowSquareOut aria-hidden="true" /></a>
          </div>
        </article>
      ))}
    </div>
  );
}
