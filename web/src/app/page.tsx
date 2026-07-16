import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";

export default function Home() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-8 px-6 py-16">
      <div className="flex max-w-2xl flex-col items-center gap-4 text-center">
        <Badge variant="secondary">Pra-rilis — fitur belum aktif</Badge>
        <h1 className="text-4xl font-semibold tracking-tight">ChroniCare</h1>
        <p className="text-lg text-muted-foreground">
          Membantu pasien chronic illness dan caregiver menjaga rutinitas
          perawatan jangka panjang dalam satu Care Circle: check-in harian,
          pengingat, dokumen kesehatan, dan koordinasi keluarga.
        </p>
      </div>

      <div className="grid w-full max-w-2xl gap-4 sm:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Caregiver</CardTitle>
            <CardDescription>
              Area caregiver untuk memantau konteks perawatan Patient.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link
              href="/caregiver"
              className={cn(buttonVariants(), "w-full")}
            >
              Buka area caregiver
            </Link>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Patient</CardTitle>
            <CardDescription>
              Halaman masuk Patient dengan kode akses dari Care Circle.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link
              href="/patient/login"
              className={cn(buttonVariants({ variant: "outline" }), "w-full")}
            >
              Buka halaman masuk Patient
            </Link>
          </CardContent>
        </Card>
      </div>

      <p className="max-w-2xl text-center text-sm text-muted-foreground">
        ChroniCare adalah alat bantu koordinasi perawatan, bukan alat
        diagnosis, bukan penentu dosis obat, dan bukan pengganti dokter, IGD,
        ambulans, atau BPJS.
      </p>
    </main>
  );
}
