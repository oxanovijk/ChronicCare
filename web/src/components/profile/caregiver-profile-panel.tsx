"use client";

import { type FormEvent, useEffect, useState } from "react";
import { LoaderCircle, Plus, Save } from "lucide-react";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";

type FactStatus = "UNKNOWN" | "NONE_REPORTED" | "REPORTED";
type BpjsStatus = "UNKNOWN" | "NOT_REGISTERED" | "REGISTERED";

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
      className="border-input bg-background h-9 w-full rounded-md border px-3 text-sm"
    >
      <option value="UNKNOWN">Belum diketahui</option>
      <option value="NONE_REPORTED">Tidak ada yang dilaporkan</option>
      <option value="REPORTED">Sudah tercatat</option>
    </select>
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
    <form className="space-y-5" onSubmit={save}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="font-medium">{profile.displayName}</h3>
          <p className="text-sm text-muted-foreground">
            {profile.relationshipLabel} ·{" "}
            {profile.setupChecklist.recommendedActions.length} saran pengisian
          </p>
        </div>
        <Button type="submit" disabled={submitting}>
          {submitting ? (
            <LoaderCircle className="animate-spin" aria-hidden="true" />
          ) : (
            <Save aria-hidden="true" />
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

      <div className="grid gap-4 sm:grid-cols-2">
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

      <div className="grid gap-5 sm:grid-cols-2">
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
            className="border-input bg-background h-9 w-full rounded-md border px-3 text-sm"
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

      <div className="grid gap-5 sm:grid-cols-2">
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
            className="border-input bg-background h-9 w-full rounded-md border px-3 text-sm"
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

  async function createProfile(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setCreating(true);
    setError(false);
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
      chooseProfile(result.data.id);
    } catch {
      setError(true);
    } finally {
      setCreating(false);
    }
  }

  if (!profiles && !error) {
    return (
      <div className="flex min-h-24 items-center gap-2 text-sm text-muted-foreground">
        <LoaderCircle className="size-4 animate-spin" aria-hidden="true" />
        Memuat Patient Profile.
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {error ? (
        <Alert variant="destructive">
          <AlertTitle>Patient Profile belum dapat dimuat</AlertTitle>
          <AlertDescription>Muat ulang halaman untuk mencoba lagi.</AlertDescription>
        </Alert>
      ) : null}

      {profiles?.length ? (
        <div className="space-y-2">
          <Label htmlFor="active-patient-profile">Patient Profile aktif</Label>
          <select
            id="active-patient-profile"
            value={selectedId ?? ""}
            onChange={(event) => chooseProfile(event.target.value)}
            className="border-input bg-background h-10 w-full rounded-md border px-3"
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
        <div className="flex min-h-24 items-center gap-2 text-sm text-muted-foreground">
          <LoaderCircle className="size-4 animate-spin" aria-hidden="true" />
          Memuat {profiles?.find((item) => item.id === selectedId)?.displayName}.
        </div>
      ) : null}
      {profile ? (
        <ProfileEditor key={profile.id} profile={profile} onSaved={saveProfile} />
      ) : null}

      {role === "OWNER" && (profiles?.length ?? 0) < 2 ? (
        <>
          <Separator />
          <form className="space-y-3" onSubmit={createProfile}>
            <h3 className="font-medium">Tambah Patient Profile</h3>
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
                <LoaderCircle className="animate-spin" aria-hidden="true" />
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
