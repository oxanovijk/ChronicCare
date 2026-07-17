"use client";

import { type FormEvent, useEffect, useRef, useState } from "react";
import { FloppyDisk } from "@phosphor-icons/react/dist/csr/FloppyDisk";
import { Plus } from "@phosphor-icons/react/dist/csr/Plus";
import { SpinnerGap } from "@phosphor-icons/react/dist/csr/SpinnerGap";

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
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { PatientAccessCodePanel } from "@/components/profile/patient-access-code-panel";

type FactStatus = "UNKNOWN" | "NONE_REPORTED" | "REPORTED";
type BpjsStatus = "UNKNOWN" | "NOT_REGISTERED" | "REGISTERED";
type DeactivationReason =
  | "NO_LONGER_CARED"
  | "PATIENT_DECEASED"
  | "OTHER";

type PatientProfile = {
  id: string;
  displayName: string;
  relationshipLabel: string;
  dateOfBirth: string | null;
  city: string | null;
  locationLabel: string | null;
  primaryConditions: string[];
  primaryConditionsStatus: FactStatus;
  allergies: string[];
  allergiesStatus: FactStatus;
  currentMedicationsStatus: FactStatus;
  emergencyContactName: string | null;
  emergencyContactPhone: string | null;
  emergencyContactStatus: FactStatus;
  bpjsMembershipStatus: BpjsStatus;
  bpjsNumberLast4: string | null;
  usualFacilityName: string | null;
  setupChecklist: {
    recommendedActions: string[];
  };
};

function lines(value: string) {
  return value
    .split("\n")
    .map((item) => item.trim())
    .filter(Boolean);
}

function valueOrNull(value: string) {
  return value.trim() || null;
}

function FactStatusSelect({
  id,
  value,
  onChange,
}: {
  id: string;
  value: FactStatus;
  onChange: (value: FactStatus) => void;
}) {
  return (
    <select
      id={id}
      value={value}
      onChange={(event) => onChange(event.target.value as FactStatus)}
      className="care-profile-select border-input bg-background h-9 w-full rounded-md border px-3 text-sm"
    >
      <option value="UNKNOWN">Belum diketahui</option>
      <option value="NONE_REPORTED">Tidak ada yang dilaporkan</option>
      <option value="REPORTED">Sudah tercatat</option>
    </select>
  );
}

function DeactivateProfileDialog({
  profile,
  onDeactivated,
}: {
  profile: PatientProfile;
  onDeactivated: (patientProfileId: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [reason, setReason] =
    useState<DeactivationReason>("NO_LONGER_CARED");
  const [note, setNote] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(false);
  const errorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (error) errorRef.current?.focus();
  }, [error]);

  async function deactivate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setError(false);
    try {
      const response = await fetch(
        `/api/v1/patient-profiles/${profile.id}/deactivate`,
        {
          method: "POST",
          credentials: "same-origin",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ reason, note: valueOrNull(note) }),
        },
      );
      if (!response.ok) {
        setError(true);
        return;
      }
      setOpen(false);
      onDeactivated(profile.id);
    } catch {
      setError(true);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        setOpen(nextOpen);
        if (nextOpen) setError(false);
      }}
    >
      <DialogTrigger render={<Button type="button" variant="destructive" />}>
        Nonaktifkan profil
      </DialogTrigger>
      <DialogContent className="care-lifecycle-dialog" showCloseButton={!submitting}>
        <DialogHeader>
          <DialogTitle>Akhiri perawatan profil</DialogTitle>
          <DialogDescription>
            {profile.displayName} akan dikeluarkan dari alur perawatan aktif.
            Riwayat tetap tersimpan, sedangkan kode dan sesi Patient dicabut.
            Ini bukan pembatalan langganan atau pembayaran.
          </DialogDescription>
        </DialogHeader>
        <form className="space-y-4" onSubmit={deactivate}>
          <div className="space-y-2">
            <Label htmlFor={`deactivation-reason-${profile.id}`}>Alasan</Label>
            <select
              id={`deactivation-reason-${profile.id}`}
              value={reason}
              onChange={(event) =>
                setReason(event.target.value as DeactivationReason)
              }
              className="care-profile-select border-input bg-background h-9 w-full rounded-md border px-3 text-sm"
            >
              <option value="NO_LONGER_CARED">Perawatan berakhir</option>
              <option value="OTHER">Pasien berpindah perawatan</option>
              <option value="PATIENT_DECEASED">Pasien meninggal dunia</option>
            </select>
          </div>
          <div className="space-y-2">
            <Label htmlFor={`deactivation-note-${profile.id}`}>
              Catatan singkat (opsional)
            </Label>
            <Textarea
              id={`deactivation-note-${profile.id}`}
              value={note}
              onChange={(event) => setNote(event.target.value)}
              maxLength={500}
              placeholder="Hindari detail medis atau data sensitif."
            />
          </div>
          {error ? (
            <Alert
              ref={errorRef}
              variant="destructive"
              tabIndex={-1}
              aria-live="assertive"
            >
              <AlertTitle>Profil belum dinonaktifkan</AlertTitle>
              <AlertDescription>
                Muat ulang data profil, lalu coba lagi.
              </AlertDescription>
            </Alert>
          ) : null}
          <DialogFooter>
            <DialogClose
              render={
                <Button type="button" variant="outline" disabled={submitting} />
              }
            >
              Batal
            </DialogClose>
            <Button type="submit" variant="destructive" disabled={submitting}>
              {submitting ? (
                <SpinnerGap className="animate-spin" aria-hidden="true" />
              ) : null}
              Akhiri perawatan profil
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function ProfileEditor({
  profile,
  onSaved,
}: {
  profile: PatientProfile;
  onSaved: (profile: PatientProfile) => void;
}) {
  const [dateOfBirth, setDateOfBirth] = useState(profile.dateOfBirth ?? "");
  const [city, setCity] = useState(profile.city ?? "");
  const [locationLabel, setLocationLabel] = useState(
    profile.locationLabel ?? "",
  );
  const [primaryConditions, setPrimaryConditions] = useState(
    profile.primaryConditions.join("\n"),
  );
  const [primaryConditionsStatus, setPrimaryConditionsStatus] = useState(
    profile.primaryConditionsStatus,
  );
  const [allergies, setAllergies] = useState(profile.allergies.join("\n"));
  const [allergiesStatus, setAllergiesStatus] = useState(
    profile.allergiesStatus,
  );
  const [currentMedicationsStatus, setCurrentMedicationsStatus] = useState(
    profile.currentMedicationsStatus,
  );
  const [emergencyContactName, setEmergencyContactName] = useState(
    profile.emergencyContactName ?? "",
  );
  const [emergencyContactPhone, setEmergencyContactPhone] = useState(
    profile.emergencyContactPhone ?? "",
  );
  const [emergencyContactStatus, setEmergencyContactStatus] = useState(
    profile.emergencyContactStatus,
  );
  const [bpjsMembershipStatus, setBpjsMembershipStatus] = useState(
    profile.bpjsMembershipStatus,
  );
  const [bpjsNumberLast4, setBpjsNumberLast4] = useState(
    profile.bpjsNumberLast4 ?? "",
  );
  const [usualFacilityName, setUsualFacilityName] = useState(
    profile.usualFacilityName ?? "",
  );
  const [submitting, setSubmitting] = useState(false);
  const [notice, setNotice] = useState<"saved" | "error" | null>(null);

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setNotice(null);
    const body: Record<string, unknown> = {
      dateOfBirth: valueOrNull(dateOfBirth),
      city: valueOrNull(city),
      locationLabel: valueOrNull(locationLabel),
      primaryConditionsStatus,
      primaryConditions:
        primaryConditionsStatus === "REPORTED" ? lines(primaryConditions) : [],
      allergiesStatus,
      allergies: allergiesStatus === "REPORTED" ? lines(allergies) : [],
      emergencyContactStatus,
      emergencyContactName:
        emergencyContactStatus === "REPORTED"
          ? valueOrNull(emergencyContactName)
          : null,
      emergencyContactPhone:
        emergencyContactStatus === "REPORTED"
          ? valueOrNull(emergencyContactPhone)
          : null,
      bpjsMembershipStatus,
      bpjsNumberLast4:
        bpjsMembershipStatus === "REGISTERED"
          ? valueOrNull(bpjsNumberLast4)
          : null,
      usualFacilityName: valueOrNull(usualFacilityName),
    };
    if (currentMedicationsStatus !== "REPORTED") {
      body.currentMedicationsStatus = currentMedicationsStatus;
    }

    try {
      const response = await fetch(
        `/api/v1/patient-profiles/${profile.id}`,
        {
          method: "PATCH",
          credentials: "same-origin",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        },
      );
      if (!response.ok) {
        setNotice("error");
        return;
      }
      const result = (await response.json()) as { data: PatientProfile };
      onSaved(result.data);
      setNotice("saved");
    } catch {
      setNotice("error");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form className="care-profile-editor space-y-5" onSubmit={save}>
      <div className="care-profile-editor-heading flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="font-medium">{profile.displayName}</h3>
          <p className="text-sm text-muted-foreground">
            {profile.relationshipLabel} ·{" "}
            {profile.setupChecklist.recommendedActions.length} saran pengisian
          </p>
        </div>
        <Button type="submit" disabled={submitting}>
          {submitting ? (
            <SpinnerGap className="animate-spin" aria-hidden="true" />
          ) : (
            <FloppyDisk aria-hidden="true" />
          )}
          Simpan profil
        </Button>
      </div>

      {notice ? (
        <Alert variant={notice === "error" ? "destructive" : "default"}>
          <AlertTitle>
            {notice === "saved" ? "Profil tersimpan" : "Profil belum tersimpan"}
          </AlertTitle>
          <AlertDescription>
            {notice === "saved"
              ? "Perubahan hanya diterapkan pada Patient Profile aktif."
              : "Periksa status dan nilai yang dipilih, lalu coba lagi."}
          </AlertDescription>
        </Alert>
      ) : null}

      <div className="care-profile-section grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor={`birth-${profile.id}`}>Tanggal lahir</Label>
          <Input
            id={`birth-${profile.id}`}
            type="date"
            value={dateOfBirth}
            onChange={(event) => setDateOfBirth(event.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor={`city-${profile.id}`}>Kota</Label>
          <Input
            id={`city-${profile.id}`}
            value={city}
            onChange={(event) => setCity(event.target.value)}
          />
        </div>
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor={`location-${profile.id}`}>Area umum</Label>
          <Input
            id={`location-${profile.id}`}
            value={locationLabel}
            onChange={(event) => setLocationLabel(event.target.value)}
            placeholder="Contoh: Karawaci, Tangerang"
          />
        </div>
      </div>

      <Separator />

      <div className="care-profile-section grid gap-5 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor={`conditions-status-${profile.id}`}>Kondisi utama</Label>
          <FactStatusSelect
            id={`conditions-status-${profile.id}`}
            value={primaryConditionsStatus}
            onChange={setPrimaryConditionsStatus}
          />
          <Textarea
            aria-label="Daftar kondisi utama"
            value={primaryConditions}
            onChange={(event) => setPrimaryConditions(event.target.value)}
            disabled={primaryConditionsStatus !== "REPORTED"}
            placeholder="Satu catatan per baris"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor={`allergies-status-${profile.id}`}>Alergi</Label>
          <FactStatusSelect
            id={`allergies-status-${profile.id}`}
            value={allergiesStatus}
            onChange={setAllergiesStatus}
          />
          <Textarea
            aria-label="Daftar alergi"
            value={allergies}
            onChange={(event) => setAllergies(event.target.value)}
            disabled={allergiesStatus !== "REPORTED"}
            placeholder="Satu catatan per baris"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor={`medications-status-${profile.id}`}>Obat aktif</Label>
          <select
            id={`medications-status-${profile.id}`}
            value={currentMedicationsStatus}
            onChange={(event) =>
              setCurrentMedicationsStatus(event.target.value as FactStatus)
            }
            disabled={currentMedicationsStatus === "REPORTED"}
            className="care-profile-select border-input bg-background h-9 w-full rounded-md border px-3 text-sm"
          >
            <option value="UNKNOWN">Belum diketahui</option>
            <option value="NONE_REPORTED">Tidak ada yang dilaporkan</option>
            <option value="REPORTED">Tercatat melalui data obat</option>
          </select>
        </div>
        <div className="space-y-2">
          <Label htmlFor={`facility-${profile.id}`}>Fasilitas biasa</Label>
          <Input
            id={`facility-${profile.id}`}
            value={usualFacilityName}
            onChange={(event) => setUsualFacilityName(event.target.value)}
          />
        </div>
      </div>

      <Separator />

      <div className="care-profile-section grid gap-5 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor={`contact-status-${profile.id}`}>Kontak darurat</Label>
          <FactStatusSelect
            id={`contact-status-${profile.id}`}
            value={emergencyContactStatus}
            onChange={setEmergencyContactStatus}
          />
          <Input
            aria-label="Nama kontak darurat"
            value={emergencyContactName}
            onChange={(event) => setEmergencyContactName(event.target.value)}
            disabled={emergencyContactStatus !== "REPORTED"}
            placeholder="Nama"
          />
          <Input
            aria-label="Nomor kontak darurat"
            value={emergencyContactPhone}
            onChange={(event) => setEmergencyContactPhone(event.target.value)}
            disabled={emergencyContactStatus !== "REPORTED"}
            placeholder="Nomor yang dicatat caregiver"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor={`bpjs-status-${profile.id}`}>Status BPJS</Label>
          <select
            id={`bpjs-status-${profile.id}`}
            value={bpjsMembershipStatus}
            onChange={(event) =>
              setBpjsMembershipStatus(event.target.value as BpjsStatus)
            }
            className="care-profile-select border-input bg-background h-9 w-full rounded-md border px-3 text-sm"
          >
            <option value="UNKNOWN">Belum diketahui</option>
            <option value="NOT_REGISTERED">Dilaporkan belum terdaftar</option>
            <option value="REGISTERED">Dilaporkan terdaftar</option>
          </select>
          <Input
            aria-label="Empat digit terakhir BPJS"
            inputMode="numeric"
            maxLength={4}
            value={bpjsNumberLast4}
            onChange={(event) => setBpjsNumberLast4(event.target.value)}
            disabled={bpjsMembershipStatus !== "REGISTERED"}
            placeholder="Opsional, 4 digit"
          />
        </div>
      </div>
    </form>
  );
}

export function CaregiverProfilePanel({
  role,
}: {
  role: "OWNER" | "FAMILY_MEMBER";
}) {
  const [profiles, setProfiles] = useState<PatientProfile[] | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [profile, setProfile] = useState<PatientProfile | null>(null);
  const [error, setError] = useState(false);
  const [displayName, setDisplayName] = useState("");
  const [relationshipLabel, setRelationshipLabel] = useState("");
  const [creating, setCreating] = useState(false);
  const [createNotice, setCreateNotice] = useState<
    "created" | "error" | null
  >(null);
  const [lifecycleNotice, setLifecycleNotice] = useState(false);
  const lifecycleNoticeRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (lifecycleNotice) lifecycleNoticeRef.current?.focus();
  }, [lifecycleNotice]);

  useEffect(() => {
    let active = true;
    void fetch("/api/v1/patient-profiles", {
      cache: "no-store",
      credentials: "same-origin",
    })
      .then(async (response) => {
        if (!response.ok) throw new Error("profile list unavailable");
        return (await response.json()) as { data: PatientProfile[] };
      })
      .then(({ data }) => {
        if (!active) return;
        setProfiles(data);
        setSelectedId(data[0]?.id ?? null);
      })
      .catch(() => {
        if (active) setError(true);
      });
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!selectedId) return;
    let active = true;
    void fetch(`/api/v1/patient-profiles/${selectedId}`, {
      cache: "no-store",
      credentials: "same-origin",
    })
      .then(async (response) => {
        if (!response.ok) throw new Error("profile unavailable");
        return (await response.json()) as { data: PatientProfile };
      })
      .then(({ data }) => {
        if (active) setProfile(data);
      })
      .catch(() => {
        if (active) setError(true);
      });
    return () => {
      active = false;
    };
  }, [selectedId]);

  function chooseProfile(id: string) {
    setError(false);
    setProfile(null);
    setSelectedId(id);
  }

  function saveProfile(saved: PatientProfile) {
    setProfile(saved);
    setProfiles((current) =>
      current?.map((item) => (item.id === saved.id ? saved : item)) ?? null,
    );
  }

  function removeDeactivatedProfile(patientProfileId: string) {
    const remaining =
      profiles?.filter((item) => item.id !== patientProfileId) ?? [];
    setProfiles(remaining);
    setProfile(null);
    setSelectedId(remaining[0]?.id ?? null);
    setLifecycleNotice(true);
  }

  async function createProfile(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setCreating(true);
    setCreateNotice(null);
    try {
      const response = await fetch("/api/v1/patient-profiles", {
        method: "POST",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ displayName, relationshipLabel }),
      });
      if (!response.ok) throw new Error("profile creation failed");
      const result = (await response.json()) as { data: PatientProfile };
      setProfiles((current) => [...(current ?? []), result.data]);
      setDisplayName("");
      setRelationshipLabel("");
      setCreateNotice("created");
      chooseProfile(result.data.id);
    } catch {
      setCreateNotice("error");
    } finally {
      setCreating(false);
    }
  }

  if (!profiles && !error) {
    return (
      <div className="care-profile-loading flex min-h-24 items-center gap-2 text-sm text-muted-foreground">
        <SpinnerGap className="size-4 animate-spin" aria-hidden="true" />
        Memuat Patient Profile.
      </div>
    );
  }

  return (
    <div className="care-profile-workspace space-y-5">
      {error ? (
        <Alert variant="destructive">
          <AlertTitle>Patient Profile belum dapat dimuat</AlertTitle>
          <AlertDescription>Muat ulang halaman untuk mencoba lagi.</AlertDescription>
        </Alert>
      ) : null}
      {createNotice ? (
        <Alert
          variant={createNotice === "error" ? "destructive" : "default"}
          aria-live="polite"
        >
          <AlertTitle>
            {createNotice === "created"
              ? "Patient Profile berhasil dibuat"
              : "Patient Profile belum dapat dibuat"}
          </AlertTitle>
          <AlertDescription>
            {createNotice === "created"
              ? "Data opsional tetap Belum diketahui dan dapat diisi nanti."
              : "Periksa nama dan label hubungan, lalu coba lagi."}
          </AlertDescription>
        </Alert>
      ) : null}
      {lifecycleNotice ? (
        <Alert
          ref={lifecycleNoticeRef}
          role="status"
          tabIndex={-1}
          aria-live="polite"
        >
          <AlertTitle>Patient Profile dinonaktifkan</AlertTitle>
          <AlertDescription>
            Profil sudah keluar dari alur aktif. Riwayat tetap tersimpan dan
            akses Patient telah dicabut.
          </AlertDescription>
        </Alert>
      ) : null}

      {profiles?.length ? (
        <div className="care-active-profile space-y-2">
          <Label htmlFor="active-patient-profile">Patient Profile aktif</Label>
          <select
            id="active-patient-profile"
            value={selectedId ?? ""}
            onChange={(event) => chooseProfile(event.target.value)}
            className="care-profile-select border-input bg-background h-10 w-full rounded-md border px-3"
          >
            {profiles.map((item) => (
              <option key={item.id} value={item.id}>
                {item.displayName}
              </option>
            ))}
          </select>
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">
          Belum ada Patient Profile pada Care Circle ini.
        </p>
      )}

      {selectedId && !profile && !error ? (
        <div className="care-profile-loading flex min-h-24 items-center gap-2 text-sm text-muted-foreground">
          <SpinnerGap className="size-4 animate-spin" aria-hidden="true" />
          Memuat {profiles?.find((item) => item.id === selectedId)?.displayName}.
        </div>
      ) : null}
      {profile ? (
        <>
          <ProfileEditor
            key={profile.id}
            profile={profile}
            onSaved={saveProfile}
          />
          {role === "OWNER" ? (
            <>
              <Separator />
              <PatientAccessCodePanel
                patientProfile={{
                  id: profile.id,
                  displayName: profile.displayName,
                }}
              />
              <Separator />
              <div className="care-danger-zone space-y-2">
                <h3 className="font-medium">Akhiri perawatan profil</h3>
                <p className="text-sm text-muted-foreground">
                  Gunakan hanya saat profil tidak lagi menjadi bagian dari
                  perawatan aktif.
                </p>
                <DeactivateProfileDialog
                  profile={profile}
                  onDeactivated={removeDeactivatedProfile}
                />
              </div>
            </>
          ) : null}
        </>
      ) : null}

      {role === "OWNER" && (profiles?.length ?? 0) < 2 ? (
        <>
          <Separator />
          <form className="care-create-profile space-y-3" onSubmit={createProfile}>
            <h3 className="font-medium">Tambah Patient Profile</h3>
            <p className="text-sm text-muted-foreground">
              Nama dan label hubungan cukup untuk membuat profil. Data opsional
              dapat diisi nanti tanpa menebak.
            </p>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="new-profile-name">Nama tampilan</Label>
                <Input
                  id="new-profile-name"
                  value={displayName}
                  onChange={(event) => setDisplayName(event.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="new-profile-relationship">Label hubungan</Label>
                <Input
                  id="new-profile-relationship"
                  value={relationshipLabel}
                  onChange={(event) => setRelationshipLabel(event.target.value)}
                  required
                />
              </div>
            </div>
            <Button type="submit" variant="outline" disabled={creating}>
              {creating ? (
                <SpinnerGap className="animate-spin" aria-hidden="true" />
              ) : (
                <Plus aria-hidden="true" />
              )}
              Buat profil minimum
            </Button>
          </form>
        </>
      ) : null}

      {role === "OWNER" && profiles?.length === 2 ? (
        <p className="text-sm text-muted-foreground">
          Batas dua Patient Profile untuk MVP sudah terpakai.
        </p>
      ) : null}
    </div>
  );
}
