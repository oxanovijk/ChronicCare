"use client";

import { useEffect, useRef, useState } from "react";
import { Check, Copy, KeyRound, LoaderCircle } from "lucide-react";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function PatientAccessCodePanel({
  patientProfile,
}: {
  patientProfile: { id: string; displayName: string };
}) {
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [code, setCode] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState(false);
  const statusRef = useRef<HTMLDivElement>(null);
  const errorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (code) statusRef.current?.focus();
  }, [code]);

  useEffect(() => {
    if (error) errorRef.current?.focus();
  }, [error]);

  async function rotateCode() {
    setSubmitting(true);
    setError(false);
    try {
      const response = await fetch(
        `/api/v1/patient-profiles/${patientProfile.id}/access-code`,
        { method: "POST", credentials: "same-origin" },
      );
      if (!response.ok) throw new Error("PATIENT_ACCESS_CODE_FAILED");
      const body = (await response.json()) as {
        data: { code: string; expiresAt: string | null };
      };
      setCode(body.data.code);
      setCopied(false);
      setOpen(false);
    } catch {
      setError(true);
    } finally {
      setSubmitting(false);
    }
  }

  async function copyCode() {
    if (!code) return;
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
    } catch {
      setCopied(false);
    }
  }

  return (
    <section className="space-y-3" aria-labelledby="patient-access-title">
      <div className="space-y-1">
        <h3 id="patient-access-title" className="font-medium">
          Akses Patient
        </h3>
        <p className="text-sm text-muted-foreground">
          Terbitkan kode untuk {patientProfile.displayName}. Kode ini bukan
          tautan undangan Family Member.
        </p>
      </div>

      {code ? (
        <Alert ref={statusRef} role="status" tabIndex={-1}>
          <KeyRound aria-hidden="true" />
          <AlertTitle>Kode Patient siap dibagikan</AlertTitle>
          <AlertDescription className="space-y-3">
            <p>
              Kode hanya ditampilkan sekarang. Simpan melalui salinan yang
              aman; jika hilang, terbitkan kode baru.
            </p>
            <div className="space-y-2">
              <Label htmlFor={`patient-code-${patientProfile.id}`}>
                Kode akses {patientProfile.displayName}
              </Label>
              <div className="flex gap-2">
                <Input
                  id={`patient-code-${patientProfile.id}`}
                  value={code}
                  readOnly
                  className="min-w-0 font-mono text-lg"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  aria-label="Salin kode"
                  title="Salin kode"
                  onClick={copyCode}
                >
                  {copied ? <Check aria-hidden="true" /> : <Copy aria-hidden="true" />}
                </Button>
              </div>
              {copied ? <p className="text-sm text-emerald-700">Kode tersalin.</p> : null}
            </div>
          </AlertDescription>
        </Alert>
      ) : null}

      <Dialog
        open={open}
        onOpenChange={(nextOpen) => {
          setOpen(nextOpen);
          if (nextOpen) setError(false);
        }}
      >
        <DialogTrigger render={<Button type="button" variant="outline" />}>
          <KeyRound aria-hidden="true" />
          Buat atau ganti kode Patient
        </DialogTrigger>
        <DialogContent showCloseButton={!submitting}>
          <DialogHeader>
            <DialogTitle>Terbitkan kode Patient baru?</DialogTitle>
            <DialogDescription>
              Kode lama tidak dapat dipakai lagi. {patientProfile.displayName}
              akan keluar dari perangkat yang masih terhubung. Riwayat
              perawatan tidak berubah.
            </DialogDescription>
          </DialogHeader>
          {error ? (
            <Alert ref={errorRef} variant="destructive" tabIndex={-1}>
              <AlertTitle>Kode belum dapat diterbitkan</AlertTitle>
              <AlertDescription>
                Pastikan profil masih aktif, lalu coba lagi.
              </AlertDescription>
            </Alert>
          ) : null}
          <DialogFooter>
            <DialogClose
              render={<Button type="button" variant="outline" disabled={submitting} />}
            >
              Batal
            </DialogClose>
            <Button type="button" onClick={rotateCode} disabled={submitting}>
              {submitting ? (
                <LoaderCircle className="animate-spin" aria-hidden="true" />
              ) : (
                <KeyRound aria-hidden="true" />
              )}
              Terbitkan kode baru
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </section>
  );
}
