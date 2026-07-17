import { ArrowSquareOut, BookOpenText, CaretDown, WarningCircle } from "@phosphor-icons/react";

import type { BpjsGuideRecord } from "@/lib/facilities/schemas";

function reviewedLabel(value: string) {
  const [year, month, day] = value.split("-").map(Number);
  return new Intl.DateTimeFormat("id-ID", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" }).format(new Date(Date.UTC(year, month - 1, day)));
}

export function BpjsGuideList({ items, loading }: { items: readonly BpjsGuideRecord[]; loading: boolean }) {
  if (loading) return <div className="px-4 py-10 text-center text-sm text-slate-600" role="status">Memuat panduan BPJS...</div>;
  return (
    <div className="divide-y divide-slate-200">
      <div className="flex gap-3 bg-amber-50 px-4 py-4 text-sm leading-6 text-amber-950 sm:px-6">
        <WarningCircle size={21} className="mt-0.5 shrink-0" aria-hidden="true" />
        <p>Panduan ini bersifat administratif berdasarkan sumber yang tersedia. Ketentuan dapat berubah; konfirmasikan melalui Mobile JKN, BPJS Kesehatan, atau fasilitas.</p>
      </div>
      {items.map((guide) => (
        <details key={guide.id} data-testid={`bpjs-guide-${guide.id}`} className="group px-4 py-5 sm:px-6">
          <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between gap-4 font-bold text-slate-950 outline-none focus-visible:ring-3 focus-visible:ring-teal-700/20">
            <span className="flex items-center gap-2"><BookOpenText size={20} className="text-teal-800" aria-hidden="true" />{guide.title}</span>
            <CaretDown className="shrink-0 transition group-open:rotate-180" aria-hidden="true" />
          </summary>
          <div className="grid gap-4 pb-2 pt-3 pl-7 text-sm leading-6 text-slate-700">
            <p>{guide.summary}</p>
            <ol className="list-decimal space-y-1 pl-5">{guide.steps.map((step) => <li key={step}>{step}</li>)}</ol>
            <p className="rounded-md border-l-4 border-amber-500 bg-amber-50 px-3 py-2 text-amber-950">{guide.caveat}</p>
            <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-slate-500">
              <span>Sumber: {guide.sourceLabel} · Ditinjau {reviewedLabel(guide.lastReviewedAt)}</span>
              <a href={guide.sourceUrl} target="_blank" rel="noreferrer" className="inline-flex min-h-11 items-center gap-2 font-bold text-teal-800 underline-offset-4 hover:underline">Buka panduan resmi <ArrowSquareOut aria-hidden="true" /></a>
            </div>
          </div>
        </details>
      ))}
    </div>
  );
}

