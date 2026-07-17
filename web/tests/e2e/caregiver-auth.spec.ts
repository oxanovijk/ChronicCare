import "dotenv/config";

import { expect, test } from "@playwright/test";

test.describe.configure({ mode: "serial" });

const accounts = [
  {
    name: "Owner",
    email: process.env.CAREGIVER_DEMO_OWNER_EMAIL,
    password: process.env.CAREGIVER_DEMO_OWNER_PASSWORD,
    displayName: "Dimas Pratama",
    role: "Owner",
  },
  {
    name: "Family Member",
    email: process.env.CAREGIVER_DEMO_FAMILY_EMAIL,
    password: process.env.CAREGIVER_DEMO_FAMILY_PASSWORD,
    displayName: "Rina Pratama",
    role: "Family Member",
  },
] as const;

for (const account of accounts) {
  test(`${account.name} signs in with a server-verified role and signs out`, async ({
    page,
  }) => {
    test.skip(
      !account.email || !account.password,
      "Local synthetic caregiver credentials are unavailable.",
    );

    await page.goto("/caregiver");
    await page.getByLabel("Email caregiver").fill(account.email ?? "");
    await page.getByLabel("Kata sandi").fill(account.password ?? "");
    await page.getByRole("button", { name: "Masuk sebagai caregiver" }).click();

    await expect(page.getByText(account.displayName)).toBeVisible({
      timeout: 15_000,
    });
    await expect(page.getByText(account.role, { exact: true })).toBeVisible();

    const meResponse = await page.request.get("/api/v1/auth/me");
    expect(meResponse.status()).toBe(200);
    expect(meResponse.headers()["cache-control"]).toContain("no-store");
    const body = await meResponse.json();
    expect(body.data.user.displayName).toBe(account.displayName);
    expect(body.data.membership.role).toBe(
      account.role === "Owner" ? "OWNER" : "FAMILY_MEMBER",
    );
    expect(body.data).not.toHaveProperty("token");
    expect(body.data).not.toHaveProperty("session");

    await page.getByRole("button", { name: "Keluar" }).click();
    await expect(page.getByLabel("Email caregiver")).toBeVisible();

    const signedOutResponse = await page.request.get("/api/v1/auth/me");
    expect(signedOutResponse.status()).toBe(401);
  });
}

for (const viewport of [
  { name: "mobile", width: 390, height: 844 },
  { name: "desktop", width: 1440, height: 900 },
] as const) {
  test(`caregiver login is responsive at ${viewport.name}`, async ({ page }) => {
    await page.setViewportSize({
      width: viewport.width,
      height: viewport.height,
    });
    await page.goto("/caregiver");

    await expect(page.getByLabel("Email caregiver")).toBeVisible();
    await expect(page.getByLabel("Kata sandi")).toBeVisible();
    await expect(
      page.getByRole("button", { name: "Masuk sebagai caregiver" }),
    ).toBeVisible();

    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth > window.innerWidth,
    );
    expect(overflow).toBe(false);
  });
}
