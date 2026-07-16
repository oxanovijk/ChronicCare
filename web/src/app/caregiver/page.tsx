import type { Metadata } from "next";
import Link from "next/link";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Area Caregiver",
};

const plannedAreas = [
  {
    title: "Dashboard Patient aktif",
    description:
      "Ringkasan check-in, pengobatan, pengingat, dan catatan kesehatan.",
  },
  {
    title: "Dokumen kesehatan",
    description:
      "Unggah dokumen sintetis secara privat dan tinjau hasil ekstraksi.",
  },
  {
    title: "SOS dan koordinasi",
    description:
      "Alert SOS untuk dashboard yang sedang terbuka dan penanganan keluarga.",
  },
  {
    title: "Faskes dan BPJS",
    description: "Bantuan navigasi fasilitas kesehatan di Tangerang.",
  },
];

export default function CaregiverShellPage() {
  return (
    <main className="mx-auto flex w-full max-w-4xl flex-1 flex-col gap-8 px-6 py-12">
      <div className="flex flex-col gap-3">
        <Badge variant="secondary" className="w-fit">
          Shell awal — belum ada fitur aktif
        </Badge>
        <h1 className="text-3xl font-semibold tracking-tight">
          Area Caregiver
        </h1>
        <p className="text-muted-foreground">
          Halaman ini adalah kerangka awal area caregiver ChroniCare. Login
          caregiver, data Patient, dan fitur perawatan harian belum tersedia
          dan akan dibangun pada packet berikutnya.
        </p>
      </div>

      <Alert>
        <AlertTitle>Belum ada data yang ditampilkan</AlertTitle>
        <AlertDescription>
          Autentikasi caregiver dan Patient Profile belum diimplementasikan.
          Tidak ada data pasien — sintetis maupun sungguhan — pada halaman ini.
        </AlertDescription>
      </Alert>

      <section aria-labelledby="planned-areas-heading" className="flex flex-col gap-4">
        <h2 id="planned-areas-heading" className="text-xl font-medium">
          Area yang direncanakan
        </h2>
        <div className="grid gap-4 sm:grid-cols-2">
          {plannedAreas.map((area) => (
            <Card key={area.title}>
              <CardHeader>
                <CardTitle className="flex items-center justify-between gap-2 text-base">
                  {area.title}
                  <Badge variant="outline">Dalam pengembangan</Badge>
                </CardTitle>
                <CardDescription>{area.description}</CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>
      </section>

      <div>
        <Link href="/" className={buttonVariants({ variant: "outline" })}>
          Kembali ke beranda
        </Link>
      </div>
    </main>
  );
}
