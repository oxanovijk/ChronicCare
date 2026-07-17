import { ArrowCounterClockwise, FunnelSimple } from "@phosphor-icons/react";

import { Button } from "@/components/ui/button";

export type FacilityFilterState = {
  city: string;
  area: string;
  facilityType: string;
  service: string;
  specialty: string;
  supportsBpjs: boolean;
  hasEmergencyUnit: boolean;
};

export type FacilityFilterOptions = {
  cities: string[];
  areas: string[];
  facilityTypes: string[];
  services: string[];
  specialties: string[];
};

const typeLabels: Record<string, string> = {
  LAB: "Laboratorium",
  KLINIK: "Klinik",
  OTHER: "Lainnya",
  PUSKESMAS: "Puskesmas",
  RUMAH_SAKIT: "Rumah sakit",
};

function FilterSelect({
  id,
  label,
  value,
  options,
  allLabel,
  onChange,
  formatOption = (option) => option,
}: {
  id: string;
  label: string;
  value: string;
  options: string[];
  allLabel: string;
  onChange: (value: string) => void;
  formatOption?: (option: string) => string;
}) {
  return (
    <label className="grid min-w-0 gap-1.5 text-sm font-semibold text-slate-700" htmlFor={id}>
      {label}
      <select
        id={id}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-11 min-w-0 rounded-md border border-slate-300 bg-white px-3 text-sm font-normal text-slate-900 outline-none transition focus:border-teal-700 focus:ring-3 focus:ring-teal-700/15"
      >
        <option value="">{allLabel}</option>
        {options.map((option) => <option key={option} value={option}>{formatOption(option)}</option>)}
      </select>
    </label>
  );
}

export function FacilityFilters({
  value,
  options,
  onChange,
  onReset,
}: {
  value: FacilityFilterState;
  options: FacilityFilterOptions;
  onChange: (next: FacilityFilterState) => void;
  onReset: () => void;
}) {
  const update = (patch: Partial<FacilityFilterState>) => onChange({ ...value, ...patch });
  return (
    <section className="border-y border-slate-200 bg-slate-50/80 px-4 py-5 sm:px-6" aria-labelledby="facility-filter-title">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <FunnelSimple size={20} weight="bold" className="text-teal-800" aria-hidden="true" />
          <h3 id="facility-filter-title" className="text-base font-bold text-slate-950">Filter fasilitas</h3>
        </div>
        <Button type="button" variant="ghost" className="min-h-11" onClick={onReset}>
          <ArrowCounterClockwise aria-hidden="true" />Reset filter
        </Button>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <FilterSelect id="facility-city" label="Kota" value={value.city} options={options.cities} allLabel="Seluruh Tangerang Raya" onChange={(city) => update({ city, area: "", facilityType: "", service: "", specialty: "" })} />
        <FilterSelect id="facility-area" label="Area" value={value.area} options={options.areas} allLabel="Semua area" onChange={(area) => update({ area })} />
        <FilterSelect id="facility-type" label="Jenis fasilitas" value={value.facilityType} options={options.facilityTypes} allLabel="Semua jenis" formatOption={(option) => typeLabels[option] ?? option} onChange={(facilityType) => update({ facilityType })} />
        <FilterSelect id="facility-service" label="Layanan" value={value.service} options={options.services} allLabel="Semua layanan" onChange={(service) => update({ service })} />
        <FilterSelect id="facility-specialty" label="Spesialisasi" value={value.specialty} options={options.specialties} allLabel="Semua spesialisasi" onChange={(specialty) => update({ specialty })} />
        <div className="grid content-end gap-2">
          <label className="flex min-h-11 items-center gap-3 rounded-md border border-slate-300 bg-white px-3 text-sm font-medium text-slate-800">
            <input type="checkbox" checked={value.supportsBpjs} onChange={(event) => update({ supportsBpjs: event.target.checked })} className="size-4 accent-teal-700" />
            Informasi BPJS terverifikasi
          </label>
          <label className="flex min-h-11 items-center gap-3 rounded-md border border-slate-300 bg-white px-3 text-sm font-medium text-slate-800">
            <input type="checkbox" checked={value.hasEmergencyUnit} onChange={(event) => update({ hasEmergencyUnit: event.target.checked })} className="size-4 accent-teal-700" />
            Unit darurat tercatat
          </label>
        </div>
      </div>
    </section>
  );
}
