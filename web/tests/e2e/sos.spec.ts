import "dotenv/config";

import { createHmac, randomBytes, randomUUID } from "node:crypto";

import { expect, test, type BrowserContext, type Page } from "@playwright/test";
import { createClient } from "@supabase/supabase-js";
import { Client } from "pg";

const appOrigin = "http://localhost:3100";
const mayaProfileId = "10000000-0000-4000-8000-000000000004";
const rakaProfileId = "10000000-0000-4000-8000-000000000005";
const configured = Boolean(
  process.env.DIRECT_URL &&
    process.env.PATIENT_SESSION_SECRET &&
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY &&
    process.env.SUPABASE_SERVICE_ROLE_KEY,
);

test.describe.configure({ mode: "serial" });

test("Patient-to-caregiver SOS is isolated, resilient, accessible, and first-handler-wins", async ({ browser }) => {
  test.setTimeout(360_000);
  test.skip(!configured, "Synthetic Supabase and database configuration is unavailable.");

  const password = `Sos-${randomBytes(18).toString("base64url")}!`;
  const marker = randomBytes(6).toString("hex");
  const accounts = [
    {
      email: `sos-family-a-${marker}@example.invalid`,
      name: "SOS QA Caregiver A",
    },
    {
      email: `sos-family-b-${marker}@example.invalid`,
      name: "SOS QA Caregiver B",
    },
    {
      email: `sos-outsider-${marker}@example.invalid`,
      name: "SOS QA Outsider",
    },
  ] as const;
  const admin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL ?? "",
    process.env.SUPABASE_SERVICE_ROLE_KEY ?? "",
    { auth: { autoRefreshToken: false, persistSession: false } },
  );
  const db = new Client({ connectionString: process.env.DIRECT_URL });
  const authUserIds: string[] = [];
  const publicUserIds: string[] = [];
  const membershipIds: string[] = [];
  const patientSessionId = randomUUID();
  const patientToken = randomBytes(32).toString("base64url");
  const outsiderCircleId = randomUUID();
  const testStartedAt = new Date();
  let sosEventId: string | null = null;
  const contexts: BrowserContext[] = [];

  await db.connect();
  try {
    for (const account of accounts) {
      const { data, error } = await admin.auth.admin.createUser({
        email: account.email,
        password,
        email_confirm: true,
      });
      if (error || !data.user) throw new Error("Synthetic caregiver Auth setup failed");
      authUserIds.push(data.user.id);
    }

    const fixture = await db.query(
      "SELECT care_circle_id FROM patient_profiles WHERE id = $1::uuid AND status = 'ACTIVE' AND deleted_at IS NULL",
      [mayaProfileId],
    );
    if (!fixture.rows[0]) throw new Error("Synthetic Maya fixture unavailable");
    const careCircleId = fixture.rows[0].care_circle_id as string;

    await db.query("BEGIN");
    for (let index = 0; index < accounts.length; index += 1) {
      const userId = authUserIds[index];
      const membershipId = randomUUID();
      publicUserIds.push(userId);
      membershipIds.push(membershipId);
      await db.query(
        "INSERT INTO users (id, display_name, created_at, updated_at) VALUES ($1::uuid, $2, now(), now())",
        [userId, accounts[index].name],
      );
      if (index < 2) {
        await db.query(
          `INSERT INTO care_circle_members
            (id, care_circle_id, user_id, role, status, joined_at, created_at, updated_at)
           VALUES ($1::uuid, $2::uuid, $3::uuid, 'FAMILY_MEMBER', 'ACTIVE', now(), now(), now())`,
          [membershipId, careCircleId, userId],
        );
      }
    }
    await db.query(
      `INSERT INTO care_circles
        (id, name, created_by_user_id, is_active, created_at, updated_at)
       VALUES ($1::uuid, 'Synthetic SOS outsider circle', $2::uuid, true, now(), now())`,
      [outsiderCircleId, authUserIds[2]],
    );
    await db.query(
      `INSERT INTO care_circle_members
        (id, care_circle_id, user_id, role, status, joined_at, created_at, updated_at)
       VALUES ($1::uuid, $2::uuid, $3::uuid, 'OWNER', 'ACTIVE', now(), now(), now())`,
      [membershipIds[2], outsiderCircleId, authUserIds[2]],
    );
    await db.query(
      `INSERT INTO patient_sessions
        (id, patient_profile_id, token_hash, expires_at, last_seen_at, created_at)
       VALUES ($1::uuid, $2::uuid, $3, now() + interval '1 hour', now(), now())`,
      [
        patientSessionId,
        mayaProfileId,
        createHmac("sha256", process.env.PATIENT_SESSION_SECRET ?? "")
          .update(patientToken)
          .digest("hex"),
      ],
    );
    await db.query("COMMIT");

    const caregiverA = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    const caregiverB = await browser.newContext({ viewport: { width: 390, height: 844 } });
    const outsider = await browser.newContext({ viewport: { width: 390, height: 844 } });
    const patient = await browser.newContext({ viewport: { width: 390, height: 844 } });
    contexts.push(caregiverA, caregiverB, outsider, patient);
    await caregiverB.addInitScript(() => {
      Object.defineProperty(window, "AudioContext", { value: undefined });
    });
    await patient.addCookies([
      {
        name: "chronicare_patient_session",
        value: patientToken,
        url: appOrigin,
        httpOnly: true,
        sameSite: "Lax",
      },
    ]);

    const [pageA, pageB, outsiderPage, patientPage] = await Promise.all([
      caregiverA.newPage(),
      caregiverB.newPage(),
      outsider.newPage(),
      patient.newPage(),
    ]);
    await Promise.all([
      signInCaregiver(pageA, accounts[0].email, password),
      signInCaregiver(pageB, accounts[1].email, password),
      signInCaregiver(outsiderPage, accounts[2].email, password),
    ]);
    console.info("[sos-e2e] caregivers signed in");
    await patientPage.goto("/patient");
    await expect(patientPage.getByRole("heading", { name: "Halo, Maya Pratama" })).toBeVisible();

    await pageA.getByRole("button", { name: "Aktifkan dan tes suara" }).click();
    await expect(pageA.getByText("Suara aktif setelah izin pengguna.")).toBeVisible();
    await pageB.getByRole("button", { name: "Aktifkan dan tes suara" }).click();
    await expect(pageB.getByText(/Audio diblokir atau tidak tersedia/)).toBeVisible();
    console.info("[sos-e2e] audio states verified");

    const wrongProfile = await patientPage.request.post(
      `/api/v1/patient-profiles/${rakaProfileId}/sos`,
      {
        headers: { Origin: appOrigin, "Idempotency-Key": randomUUID() },
        data: { message: "Synthetic wrong-profile probe" },
      },
    );
    expect([403, 404]).toContain(wrongProfile.status());
    expect(JSON.stringify(await wrongProfile.json())).not.toContain("Raka Pratama");
    console.info("[sos-e2e] wrong-profile denial verified");

    const openSos = patientPage.getByRole("button", { name: "Buka SOS" });
    await openSos.focus();
    await expect(openSos).toBeFocused();
    await patientPage.keyboard.press("Enter");
    const createResponse = patientPage.waitForResponse(
      (response) => response.url().endsWith(`/patient-profiles/${mayaProfileId}/sos`) && response.request().method() === "POST",
    );
    await patientPage.getByRole("button", { name: "Ya, kirim SOS" }).click();
    const created = await createResponse;
    expect(created.status()).toBe(201);
    await expect(patientPage.getByText("SOS sudah disimpan")).toBeVisible();
    const createdEvent = await db.query(
      `SELECT id FROM sos_events
       WHERE patient_profile_id = $1::uuid
         AND created_by_patient = true
         AND created_at >= $2::timestamptz
       ORDER BY created_at DESC
       LIMIT 1`,
      [mayaProfileId, testStartedAt],
    );
    sosEventId = createdEvent.rows[0]?.id ?? null;
    expect(sosEventId).not.toBeNull();
    console.info("[sos-e2e] patient creation verified");

    await expect(pageA.getByRole("heading", { name: "Maya Pratama meminta bantuan" })).toBeVisible({ timeout: 20_000 });
    await expect(pageB.getByRole("heading", { name: "Maya Pratama meminta bantuan" })).toBeVisible({ timeout: 20_000 });
    await expect(outsiderPage.getByText("Tidak ada SOS aktif untuk Care Circle ini.")).toBeVisible();
    await expect(outsiderPage.getByRole("heading", { name: "Maya Pratama meminta bantuan" })).toHaveCount(0);
    console.info("[sos-e2e] realtime isolation verified");
    expect(await horizontalOverflow(patientPage)).toBe(false);
    expect(await horizontalOverflow(pageA)).toBe(false);
    expect(await horizontalOverflow(pageB)).toBe(false);
    console.info("[sos-e2e] responsive layouts verified");

    await caregiverB.setOffline(true);
    await expect(pageB.getByText(/Realtime terputus/)).toBeVisible();
    await expect(pageB.getByRole("heading", { name: "Maya Pratama meminta bantuan" })).toBeVisible();
    console.info("[sos-e2e] offline visual state verified");
    const reconnectFetch = pageB.waitForResponse(
      (response) => response.url().includes("/api/v1/sos-events?status=NEW") && response.request().method() === "GET",
    );
    await caregiverB.setOffline(false);
    await pageB.evaluate(() => window.dispatchEvent(new Event("online")));
    expect((await reconnectFetch).status()).toBe(200);
    console.info("[sos-e2e] online refetch verified");
    const focusFetch = pageB.waitForResponse(
      (response) => response.url().includes("/api/v1/sos-events?status=NEW") && response.request().method() === "GET",
    );
    await pageB.evaluate(() => window.dispatchEvent(new Event("focus")));
    expect((await focusFetch).status()).toBe(200);
    console.info("[sos-e2e] focus refetch verified");

    const outsiderHandle = await outsiderPage.request.post(
      `/api/v1/sos-events/${sosEventId}/handle`,
      { headers: { Origin: appOrigin } },
    );
    expect(outsiderHandle.status()).toBe(404);
    const outsiderList = await outsiderPage.request.get("/api/v1/sos-events?status=NEW");
    expect((await outsiderList.json()).data).toEqual([]);
    console.info("[sos-e2e] outsider REST isolation verified");

    const handleA = pageA.getByRole("button", { name: "Saya tangani" });
    await handleA.focus();
    await expect(handleA).toBeFocused();
    await Promise.all([
      pageA.keyboard.press("Enter"),
      pageB.getByRole("button", { name: "Saya tangani" }).click(),
    ]);
    await expect(pageA.getByText(/SOS ditangani|Caregiver lain lebih dulu menangani/)).toBeVisible();
    await expect(pageB.getByText(/SOS ditangani|Caregiver lain lebih dulu menangani/)).toBeVisible();
    const conflictCount =
      (await pageA.getByText("Caregiver lain lebih dulu menangani").count()) +
      (await pageB.getByText("Caregiver lain lebih dulu menangani").count());
    expect(conflictCount).toBe(1);
    console.info("[sos-e2e] first-handler conflict verified");
    await expect(pageA.getByText(/ditangani oleh SOS QA Caregiver/)).toBeVisible();
    await expect(pageB.getByText(/ditangani oleh SOS QA Caregiver/)).toBeVisible();

    const persisted = await db.query(
      `SELECT status, handled_by_user_id IS NOT NULL AS has_handler, handled_at IS NOT NULL AS has_time
       FROM sos_events WHERE id = $1::uuid`,
      [sosEventId],
    );
    expect(persisted.rows).toEqual([
      { status: "HANDLED", has_handler: true, has_time: true },
    ]);
  } finally {
    await Promise.all(contexts.map((context) => context.close().catch(() => {})));
    await cleanup(db, {
      sosEventId,
      patientSessionId,
      testStartedAt,
      membershipIds,
      outsiderCircleId,
      publicUserIds,
    });
    await db.end();
    await Promise.all(authUserIds.map((id) => admin.auth.admin.deleteUser(id)));
  }
});

async function signInCaregiver(page: Page, email: string, password: string) {
  await page.goto("/caregiver");
  await page.getByLabel("Email caregiver").fill(email);
  await page.getByLabel("Kata sandi").fill(password);
  await page.getByRole("button", { name: "Masuk sebagai caregiver" }).click();
  await expect(
    page.getByRole("heading", { name: "Alert koordinasi keluarga" }),
  ).toBeVisible({ timeout: 60_000 });
}

async function horizontalOverflow(page: Page) {
  return page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth);
}

async function cleanup(
  db: Client,
  input: {
    sosEventId: string | null;
    patientSessionId: string;
    testStartedAt: Date;
    membershipIds: string[];
    outsiderCircleId: string;
    publicUserIds: string[];
  },
) {
  try {
    await db.query("BEGIN");
    const testEvents = await db.query(
      `SELECT id FROM sos_events
       WHERE patient_profile_id = $1::uuid
         AND created_by_patient = true
         AND created_at >= $2::timestamptz`,
      [mayaProfileId, input.testStartedAt],
    );
    const testEventIds = testEvents.rows.map((row) => row.id as string);
    if (input.sosEventId && !testEventIds.includes(input.sosEventId)) {
      testEventIds.push(input.sosEventId);
    }
    if (testEventIds.length) {
      await db.query("DELETE FROM audit_events WHERE target_id = ANY($1::uuid[])", [
        testEventIds,
      ]);
      await db.query("DELETE FROM sos_events WHERE id = ANY($1::uuid[])", [
        testEventIds,
      ]);
    }
    await db.query("DELETE FROM patient_sessions WHERE id = $1::uuid", [input.patientSessionId]);
    if (input.membershipIds.length) {
      await db.query("DELETE FROM care_circle_members WHERE id = ANY($1::uuid[])", [input.membershipIds]);
    }
    await db.query("DELETE FROM care_circles WHERE id = $1::uuid", [input.outsiderCircleId]);
    if (input.publicUserIds.length) {
      await db.query("DELETE FROM users WHERE id = ANY($1::uuid[])", [input.publicUserIds]);
    }
    await db.query("COMMIT");
  } catch (error) {
    await db.query("ROLLBACK").catch(() => {});
    throw error;
  }
}
