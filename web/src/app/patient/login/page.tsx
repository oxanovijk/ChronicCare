import type { Metadata } from "next";
import Link from "next/link";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Masuk Patient",
};

export default function PatientLoginShellPage() {
  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center gap-6 px-6 py-12">
      <div className="flex flex-col gap-3 text-center">
        <Badge variant="secondary" className="mx-auto w-fit">
          Shell awal — login belum aktif
        </Badge>
        <h1 className="text-3xl font-semibold tracking-tight">
          Masuk sebagai Patient
        </h1>
        <p className="text-muted-foreground">
          Nantinya kamu bisa masuk dengan kode akses dari Care Circle-mu.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Kode akses</CardTitle>
          <CardDescription>
            Formulir ini belum berfungsi. Login Patient dengan kode akses akan
            dibangun pada packet autentikasi.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="patient-access-code">Kode akses Patient</Label>
            <Input
              id="patient-access-code"
              placeholder="Belum aktif"
              disabled
              aria-describedby="patient-login-status"
            />
          </div>
          <Button disabled className="w-full">
            Masuk (belum aktif)
          </Button>
        </CardContent>
      </Card>

      <Alert>
        <AlertTitle id="patient-login-status">Belum tersedia</AlertTitle>
        <AlertDescription>
          Belum ada proses login yang berjalan. Tidak ada kode akses yang
          dibuat atau diperiksa pada tahap ini.
        </AlertDescription>
      </Alert>

      <Link
        href="/"
        className={cn(buttonVariants({ variant: "outline" }), "w-full")}
      >
        Kembali ke beranda
      </Link>
    </main>
  );
}
