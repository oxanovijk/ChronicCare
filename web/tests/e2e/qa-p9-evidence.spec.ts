import "dotenv/config";

import { readFileSync } from "node:fs";
import { join } from "node:path";

import { expect, test, type Page } from "@playwright/test";

/**
 * Packet 09 manual-QA matrix driven as evidence-producing E2E. The cases that
 * cost an Azure call only run when E2E_P9_QA=1 is set deliberately.
 * Screenshots land in test-results/qa-p9/.
 */
test.describe.configure({ mode: "serial" });

const email = process.env.CAREGIVER_DEMO_OWNER_EMAIL;
const password = process.env.CAREGIVER_DEMO_OWNER_PASSWORD;
const runCosted = process.env.E2E_P9_QA === "1";
const dataDir = join(__dirname, "..", "..", "..", "docs", "data");
const shotDir = join(__dirname, "..", "..", "test-results", "qa-p9");

async function signIn(page: Page) {
  await page.goto("/caregiver");
  await page.getByLabel("Email caregiver").fill(email ?? "");
  await page.getByLabel("Kata sandi").fill(password ?? "");
  await page.getByRole("button", { name: "Masuk sebagai caregiver" }).click();
  await expect(page.getByText("Dokumen & OCR")).toBeVisible({
    timeout: 15_000,
  });
}

function attach(page: Page, fileName: string, mimeType: string) {
  return page.locator('input[type="file"]').setInputFiles({
    name: fileName,
    mimeType,
    buffer: readFileSync(join(dataDir, fileName)),
  });
}

test("file over 5 MB is rejected client-side with no upload", async ({
  page,
}) => {
  test.skip(!email || !password, "Synthetic caregiver credentials missing.");
  await signIn(page);

  const uploadRequests: string[] = [];
  page.on("request", (request) => {
    if (request.url().includes("/documents")) uploadRequests.push(request.url());
  });

  await attach(page, "maya-over-5mb.png", "image/png");
  await expect(page.getByText("Ukuran file maksimal 5 MB.")).toBeVisible();
  expect(uploadRequests.filter((url) => url.includes("upload-intent"))).toEqual(
    [],
  );
  await page.screenshot({ path: join(shotDir, "over-5mb-rejected.png") });
});

test("PDF over three pages fails with the page-limit message", async ({
  page,
}) => {
  test.skip(!email || !password, "Synthetic caregiver credentials missing.");
  test.skip(!runCosted, "Set E2E_P9_QA=1 to run Azure-costing QA cases.");
  await signIn(page);

  await attach(page, "maya-over-3-pages.pdf", "application/pdf");
  await expect(
    page.getByText("Dokumen melebihi batas tiga halaman."),
  ).toBeVisible({ timeout: 90_000 });
  await expect(page.getByText("Gagal").first()).toBeVisible();
  await page.screenshot({ path: join(shotDir, "page-limit-failed.png") });
});

test("blurry document reaches review and can be rejected with a reason", async ({
  page,
}) => {
  test.skip(!email || !password, "Synthetic caregiver credentials missing.");
  test.skip(!runCosted, "Set E2E_P9_QA=1 to run Azure-costing QA cases.");
  await signIn(page);

  await attach(page, "maya-unreadable-blurry.png", "image/png");
  await expect(page.getByText("Review hasil ekstraksi")).toBeVisible({
    timeout: 90_000,
  });
  await page.screenshot({ path: join(shotDir, "blurry-review.png") });

  page.once("dialog", (dialog) =>
    dialog.accept("Teks tidak terbaca; tidak sesuai dokumen."),
  );
  await page.getByRole("button", { name: "Tolak hasil" }).click();
  await expect(page.getByText("Ekstraksi ditolak")).toBeVisible({
    timeout: 15_000,
  });
  await expect(page.getByText("Ditolak").first()).toBeVisible();
  await page.screenshot({ path: join(shotDir, "blurry-rejected.png") });
});

test("Raka never sees Maya's documents", async ({ page }) => {
  test.skip(!email || !password, "Synthetic caregiver credentials missing.");
  await signIn(page);

  // Maya is the default active profile and has documents from earlier cases.
  await expect(
    page.locator(".care-record-list li", { hasText: "maya-" }).first(),
  ).toBeVisible({ timeout: 15_000 });

  await page
    .locator("#active-patient-profile")
    .selectOption({ label: await rakaLabel(page) });
  await expect(page.getByText("Dokumen & OCR")).toBeVisible({
    timeout: 15_000,
  });
  await expect(page.getByText(/maya-/)).toHaveCount(0);
  await page.screenshot({ path: join(shotDir, "raka-isolation.png") });
});

async function rakaLabel(page: Page) {
  const labels = await page
    .locator("#active-patient-profile option")
    .allTextContents();
  const raka = labels.find((label) => label.includes("Raka"));
  if (!raka) test.skip(true, "Raka profile is unavailable in this seed.");
  return raka as string;
}

test("documents panel evidence at mobile and desktop sizes", async ({
  page,
}) => {
  test.skip(!email || !password, "Synthetic caregiver credentials missing.");
  await signIn(page);

  await page.setViewportSize({ width: 1440, height: 900 });
  await page.getByText("Dokumen & OCR").scrollIntoViewIfNeeded();
  await page.screenshot({ path: join(shotDir, "panel-desktop-1440.png") });

  await page.setViewportSize({ width: 390, height: 844 });
  await page.getByText("Dokumen & OCR").scrollIntoViewIfNeeded();
  await page.screenshot({ path: join(shotDir, "panel-mobile-390.png") });
});
