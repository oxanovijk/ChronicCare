"use client";

import { ArrowClockwise, Buildings, Info, MapPin } from "@phosphor-icons/react";
import { useEffect, useMemo, useState } from "react";

import { BpjsGuideList } from "@/components/facilities/bpjs-guide-list";
import { FacilityFilters, type FacilityFilterOptions, type FacilityFilterState } from "@/components/facilities/facility-filters";
import { FacilityResults } from "@/components/facilities/facility-results";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { BpjsGuideRecord, FacilityRecord } from "@/lib/facilities/schemas";

type RequestState<T> = { requestKey: string; status: "ready" | "error" | "expired"; data: T };
type FacilityPayload = { items: FacilityRecord[]; total: number; filterOptions: FacilityFilterOptions };
type GuidePayload = { items: BpjsGuideRecord[]; total: number; version: "packet10.v1" };

const emptyFilters: FacilityFilterState = {
  city: "", area: "", facilityType: "", service: "", specialty: "",
  supportsBpjs: false, hasEmergencyUnit: false,
};
const emptyOptions: FacilityFilterOptions = { cities: [], areas: [], facilityTypes: [], services: [], specialties: [] };

async function readPayload<T>(response: Response): Promise<T> {
  const body = await response.json();
  if (!response.ok) {
    const error = new Error(body?.error?.message ?? "REQUEST_FAILED") as Error & { status?: number };
    error.status = response.status;
    throw error;
  }
  return body.data as T;
}

function facilityUrl(filters: FacilityFilterState) {
  const query = new URLSearchParams();
  if (filters.city) query.set("city", filters.city);
  if (filters.area) query.set("area", filters.area);
  if (filters.facilityType) query.set("facilityType", filters.facilityType);
  if (filters.service) query.set("service", filters.service);
  if (filters.specialty) query.set("specialty", filters.specialty);
  if (filters.supportsBpjs) query.set("supportsBpjs", "true");
  if (filters.hasEmergencyUnit) query.set("hasEmergencyUnit", "true");
  const value = query.toString();
  return `/api/v1/facilities${value ? `?${value}` : ""}`;
}

export function FacilityHelper({ patientProfileId, patientName }: { patientProfileId: string; patientName: string }) {
  const [filters, setFilters] = useState(emptyFilters);
  const [facilityRetry, setFacilityRetry] = useState(0);
  const [guideRetry, setGuideRetry] = useState(0);
  const [facilityState, setFacilityState] = useState<RequestState<FacilityPayload>>({ requestKey: "", status: "ready", data: { items: [], total: 0, filterOptions: emptyOptions } });
  const [guideState, setGuideState] = useState<RequestState<GuidePayload>>({ requestKey: "", status: "ready", data: { items: [], total: 0, version: "packet10.v1" } });
  const url = useMemo(() => facilityUrl(filters), [filters]);
  const facilityRequestKey = `${patientProfileId}:${facilityRetry}:${url}`;
  const guideRequestKey = `${patientProfileId}:${guideRetry}`;

  useEffect(() => {
    const controller = new AbortController();
    fetch(url, { cache: "no-store", signal: controller.signal })
      .then(readPayload<FacilityPayload>)
      .then((data) => setFacilityState({ requestKey: facilityRequestKey, status: "ready", data }))
      .catch((error: Error & { status?: number }) => {
        if (error.name !== "AbortError") setFacilityState((current) => ({ requestKey: facilityRequestKey, data: current.data, status: error.status === 401 ? "expired" : "error" }));
      });
    return () => controller.abort();
  }, [facilityRequestKey, url]);

  useEffect(() => {
    const controller = new AbortController();
    fetch("/api/v1/bpjs-guides", { cache: "no-store", signal: controller.signal })
      .then(readPayload<GuidePayload>)
      .then((data) => setGuideState({ requestKey: guideRequestKey, status: "ready", data }))
      .catch((error: Error & { status?: number }) => {
        if (error.name !== "AbortError") setGuideState((current) => ({ requestKey: guideRequestKey, data: current.data, status: error.status === 401 ? "expired" : "error" }));
      });
    return () => controller.abort();
  }, [guideRequestKey]);

  const visibleFacilityState = facilityState.requestKey === facilityRequestKey
    ? facilityState
    : { ...facilityState, status: "loading" as const };
  const visibleGuideState = guideState.requestKey === guideRequestKey
    ? guideState
    : { ...guideState, status: "loading" as const };

  return (
    <section id="faskes-bpjs" className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm" aria-labelledby="facility-helper-title">
      <header className="grid gap-4 border-b border-slate-200 px-4 py-6 sm:px-6 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
        <div>
          <div className="mb-2 flex items-center gap-2 text-xs font-bold uppercase text-teal-800"><MapPin size={18} weight="fill" aria-hidden="true" />Tangerang Raya</div>
          <h2 id="facility-helper-title" className="text-2xl font-bold text-slate-950">Faskes &amp; panduan BPJS</h2>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">Cari berdasarkan data statis yang tersedia. Urutan hasil bukan ranking atau rekomendasi klinis; konfirmasikan layanan dan BPJS langsung sebelum berkunjung.</p>
        </div>
        <p className="inline-flex min-h-11 items-center gap-2 rounded-md bg-teal-50 px-3 text-sm font-bold text-teal-950"><Info aria-hidden="true" />Konteks aktif: {patientName}</p>
      </header>

      <Tabs defaultValue="facilities" className="gap-0">
        <TabsList variant="line" className="mx-4 mt-4 h-11 sm:mx-6">
          <TabsTrigger value="facilities" className="px-3"><Buildings aria-hidden="true" />Cari faskes</TabsTrigger>
          <TabsTrigger value="guides" className="px-3">Panduan BPJS</TabsTrigger>
        </TabsList>
        <TabsContent value="facilities">
          <FacilityFilters value={filters} options={visibleFacilityState.data.filterOptions} onChange={setFilters} onReset={() => setFilters(emptyFilters)} />
          {visibleFacilityState.status === "error" || visibleFacilityState.status === "expired" ? (
            <div className="grid justify-items-center gap-3 px-4 py-10 text-center" role="alert">
              <p className="font-semibold text-slate-800">{visibleFacilityState.status === "expired" ? "Sesi caregiver telah berakhir." : "Data fasilitas belum dapat dimuat."}</p>
              <Button type="button" variant="outline" className="min-h-11" onClick={() => setFacilityRetry((value) => value + 1)}><ArrowClockwise aria-hidden="true" />Coba lagi memuat fasilitas</Button>
            </div>
          ) : <FacilityResults items={visibleFacilityState.data.items} loading={visibleFacilityState.status === "loading"} />}
        </TabsContent>
        <TabsContent value="guides">
          {visibleGuideState.status === "error" || visibleGuideState.status === "expired" ? (
            <div className="grid justify-items-center gap-3 px-4 py-10 text-center" role="alert">
              <p className="font-semibold text-slate-800">{visibleGuideState.status === "expired" ? "Sesi caregiver telah berakhir." : "Panduan BPJS belum dapat dimuat."}</p>
              <Button type="button" variant="outline" className="min-h-11" onClick={() => setGuideRetry((value) => value + 1)}><ArrowClockwise aria-hidden="true" />Coba lagi memuat panduan</Button>
            </div>
          ) : <BpjsGuideList items={visibleGuideState.data.items} loading={visibleGuideState.status === "loading"} />}
        </TabsContent>
      </Tabs>
    </section>
  );
}
