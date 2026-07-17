"use client";

import { useEffect, useRef, useState } from "react";
import { AlertTriangle, Check, Copy, Link2, LoaderCircle } from "lucide-react";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type InvitationResponse = {
  data: {
    id: string;
    invitePath: string;
    expiresAt: string;
  };
};

export function InvitationPanel() {
  const [inviteUrl, setInviteUrl] = useState<string | null>(null);
  const [expiresAt, setExpiresAt] = useState<string | null>(null);
  const [localOnly, setLocalOnly] = useState(false);
  const [status, setStatus] = useState<"idle" | "creating" | "copied" | "error">(
    "idle",
  );
  const statusRef = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    if (status === "copied" || status === "error") {
      statusRef.current?.focus();
    }
  }, [status]);

  async function createInvitation() {
    setStatus("creating");
    try {
      const response = await fetch("/api/v1/care-circle/invitations", {
        method: "POST",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ expiresInHours: 24 }),
      });
      if (!response.ok) throw new Error("INVITATION_CREATE_FAILED");
      const body = (await response.json()) as InvitationResponse;
      let baseUrl = window.location.origin;
      const configuredUrl = process.env.NEXT_PUBLIC_APP_URL;
      if (configuredUrl) {
        try {
          const parsed = new URL(configuredUrl);
          if (parsed.protocol === "http:" || parsed.protocol === "https:") {
            baseUrl = parsed.origin;
          }
        } catch {
          baseUrl = window.location.origin;
        }
      }
      const resolvedUrl = new URL(body.data.invitePath, baseUrl);
      setInviteUrl(resolvedUrl.toString());
      setLocalOnly(
        resolvedUrl.hostname === "localhost" ||
          resolvedUrl.hostname === "127.0.0.1" ||
          resolvedUrl.hostname === "::1",
      );
      setExpiresAt(body.data.expiresAt);
      setStatus("idle");
    } catch {
      setStatus("error");
    }
  }

  async function copyInvitation() {
    if (!inviteUrl) return;
    try {
      await navigator.clipboard.writeText(inviteUrl);
      setStatus("copied");
    } catch {
      setStatus("error");
    }
  }

  return (
    <section className="space-y-3 border-t pt-5" aria-labelledby="family-invitation-title">
      <div className="space-y-1">
        <h2 id="family-invitation-title" className="text-base font-semibold">
          Undang Family Member
        </h2>
        <p className="text-sm text-muted-foreground">
          Tautan berlaku 24 jam dan hanya dapat digunakan satu kali.
        </p>
      </div>

      {status === "error" ? (
        <Alert variant="destructive">
          <AlertTriangle aria-hidden="true" />
          <AlertTitle>Undangan belum dapat diproses</AlertTitle>
          <AlertDescription>Coba lagi tanpa membagikan tautan lama.</AlertDescription>
        </Alert>
      ) : null}

      {inviteUrl ? (
        <div className="space-y-2">
          <Label htmlFor="caregiver-invitation-url">Tautan undangan</Label>
          <div className="flex gap-2">
            <Input
              id="caregiver-invitation-url"
              value={inviteUrl}
              readOnly
              className="min-w-0"
            />
            <Button
              type="button"
              variant="outline"
              size="icon"
              aria-label="Salin tautan"
              title="Salin tautan"
              onClick={copyInvitation}
            >
              {status === "copied" ? <Check aria-hidden="true" /> : <Copy aria-hidden="true" />}
            </Button>
          </div>
          {expiresAt ? (
            <p className="text-xs text-muted-foreground">
              Kedaluwarsa {new Intl.DateTimeFormat("id-ID", { dateStyle: "medium", timeStyle: "short" }).format(new Date(expiresAt))}.
            </p>
          ) : null}
          {localOnly ? (
            <p className="text-xs text-amber-700">
              Tautan lokal hanya dapat digunakan pada perangkat ini.
            </p>
          ) : null}
        </div>
      ) : null}

      <Button
        type="button"
        variant={inviteUrl ? "outline" : "default"}
        onClick={createInvitation}
        disabled={status === "creating"}
      >
        {status === "creating" ? <LoaderCircle className="animate-spin" aria-hidden="true" /> : <Link2 aria-hidden="true" />}
        {inviteUrl ? "Buat tautan baru" : "Buat tautan undangan"}
      </Button>
      <p ref={statusRef} tabIndex={-1} role="status" className="text-sm text-emerald-700">
        {status === "copied" ? "Tautan tersalin." : ""}
      </p>
    </section>
  );
}
