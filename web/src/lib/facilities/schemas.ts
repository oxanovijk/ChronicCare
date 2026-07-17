import { z } from "zod";

const dateOnlySchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/).refine(
  (value) => !Number.isNaN(Date.parse(`${value}T00:00:00+07:00`)),
  "Tanggal peninjauan tidak valid.",
);

const officialSourceUrlSchema = z.url().refine((value) => {
  const url = new URL(value);
  const host = url.hostname.toLowerCase();
  const isOfficialHost =
    host.endsWith(".go.id") ||
    host === "bpjs-kesehatan.go.id" ||
    host === "www.bpjs-kesehatan.go.id" ||
    host === "primayahospital.com" ||
    host === "www.primayahospital.com" ||
    host === "sariasih.id" ||
    host === "www.sariasih.id" ||
    host === "emc.id" ||
    host === "www.emc.id" ||
    host === "rsud-tangerangkab.id" ||
    host === "www.rsud-tangerangkab.id";
  return url.protocol === "https:" && isOfficialHost && !url.searchParams.has("utm_source");
}, "Sumber harus berupa URL HTTPS resmi tanpa tracking.");

export const facilityCitySchema = z.enum([
  "Kota Tangerang",
  "Tangerang Selatan",
  "Kabupaten Tangerang",
]);

export const facilityTypeSchema = z.enum([
  "PUSKESMAS",
  "RUMAH_SAKIT",
  "LAB",
  "KLINIK",
  "OTHER",
]);

export const facilitySchema = z.object({
  sourceKey: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  name: z.string().trim().min(1).max(180),
  facilityType: facilityTypeSchema,
  city: facilityCitySchema,
  area: z.string().trim().min(1).max(100),
  addressText: z.string().trim().min(1).max(500),
  phoneNumber: z.string().trim().min(3).max(32).nullable(),
  supportsBpjs: z.boolean().nullable(),
  hasEmergencyUnit: z.boolean().nullable(),
  services: z.array(z.string().trim().min(1).max(100)).min(1),
  specialties: z.array(z.string().trim().min(1).max(100)),
  sourceLabel: z.string().trim().min(1).max(180),
  sourceUrl: officialSourceUrlSchema,
  lastReviewedAt: dateOnlySchema,
}).strict();

export const bpjsGuideCategorySchema = z.enum([
  "MEMBERSHIP",
  "FKTP",
  "REFERRAL",
  "QUEUE",
  "CONTROL_VISIT",
  "EMERGENCY",
  "SUPPORT",
]);

export const bpjsGuideSchema = z.object({
  id: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  version: z.literal("packet10.v1"),
  title: z.string().trim().min(1).max(180),
  category: bpjsGuideCategorySchema,
  summary: z.string().trim().min(1).max(600),
  steps: z.array(z.string().trim().min(1).max(500)).min(1),
  caveat: z.string().trim().min(1).max(600),
  sourceLabel: z.literal("BPJS Kesehatan"),
  sourceUrl: officialSourceUrlSchema,
  lastReviewedAt: dateOnlySchema,
}).strict();

export const facilityDatasetSchema = z.array(facilitySchema).length(20).superRefine((items, context) => {
  if (new Set(items.map((item) => item.sourceKey)).size !== items.length) {
    context.addIssue({ code: "custom", message: "sourceKey fasilitas harus unik." });
  }
});

export const bpjsGuideDatasetSchema = z.array(bpjsGuideSchema).length(7).superRefine((items, context) => {
  if (new Set(items.map((item) => item.id)).size !== items.length) {
    context.addIssue({ code: "custom", message: "ID panduan BPJS harus unik." });
  }
});

export type Facility = z.infer<typeof facilitySchema>;
export type FacilityCity = z.infer<typeof facilityCitySchema>;
export type FacilityType = z.infer<typeof facilityTypeSchema>;
export type BpjsGuide = z.infer<typeof bpjsGuideSchema>;
export type FacilityRecord = Readonly<Omit<Facility, "services" | "specialties">> & {
  readonly services: readonly string[];
  readonly specialties: readonly string[];
};
export type BpjsGuideRecord = Readonly<Omit<BpjsGuide, "steps">> & {
  readonly steps: readonly string[];
};
