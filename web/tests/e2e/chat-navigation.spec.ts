import "dotenv/config";

import { expect, test } from "@playwright/test";

const ownerEmail = process.env.CAREGIVER_DEMO_OWNER_EMAIL;
const ownerPassword = process.env.CAREGIVER_DEMO_OWNER_PASSWORD;

test("caregiver assistant opens as a dedicated responsive destination", async ({
  page,
}) => {
  test.slow();
  test.skip(
    !ownerEmail || !ownerPassword,
    "Synthetic caregiver credentials are unavailable.",
  );

  await page.goto("/caregiver");
  await page.getByLabel("Email caregiver").fill(ownerEmail ?? "");
  await page.getByLabel("Kata sandi").fill(ownerPassword ?? "");
  await page.getByRole("button", { name: "Masuk sebagai caregiver" }).click();
  await expect(page.getByLabel("Patient Profile aktif")).toBeVisible({
    timeout: 15_000,
  });

  const desktopNavigation = page.getByRole("navigation", {
    name: "Navigasi caregiver",
  });
  const assistantLink = desktopNavigation.getByRole("link", {
    name: "Asisten",
    exact: true,
  });
  await expect(assistantLink).toHaveAttribute("href", "/caregiver/chat");
  await assistantLink.click();
  await expect(page).toHaveURL(/\/caregiver\/chat$/, { timeout: 60_000 });
  await expect(
    page.getByRole("heading", { name: "Asisten caregiver" }),
  ).toBeVisible({ timeout: 15_000 });
  await expect(
    page.getByRole("link", { name: "Asisten", exact: true }).first(),
  ).toHaveAttribute("aria-current", "page");

  await page.setViewportSize({ width: 390, height: 844 });
  await expect(
    page.getByRole("heading", { name: "Asisten caregiver" }),
  ).toBeVisible();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth > window.innerWidth,
    ),
  ).toBe(false);
});
