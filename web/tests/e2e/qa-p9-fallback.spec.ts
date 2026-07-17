import "dotenv/config";

import { readFileSync } from "node:fs";
import { join } from "node:path";

import { expect, test } from "@playwright/test";

/**
 * DEMO_FALLBACK labeling QA. Run with the provider deliberately unconfigured:
 *
 *   E2E_P9_FALLBACK=1 OCR_FALLBACK_MODE=synthetic-demo \
 *   AZURE_DOCUMENT_INTELLIGENCE_ENDPOINT= AZURE_DOCUMENT_INTELLIGENCE_KEY= \
 *   npx playwright test tests/e2e/qa-p9-fallback.spec.ts
 *
 * Makes zero Azure calls.
 */
const email = process.env.CAREGIVER_DEMO_OWNER_EMAIL;
const password = process.env.CAREGIVER_DEMO_OWNER_PASSWORD;

test("fallback extraction is visibly labeled DEMO_FALLBACK", async ({
  page,
}) => {
  test.skip(!email || !password, "Synthetic caregiver credentials missing.");
  test.skip(
    process.env.E2E_P9_FALLBACK !== "1",
    "Set E2E_P9_FALLBACK=1 with unset Azure env to run the fallback QA.",
  );

  await page.goto("/caregiver");
  await page.getByLabel("Email caregiver").fill(email ?? "");
  await page.getByLabel("Kata sandi").fill(password ?? "");
  await page.getByRole("button", { name: "Masuk sebagai caregiver" }).click();
  // 60s: switching env between runs invalidates the .next-e2e cache, so the
  // first page after login can sit behind a full dev recompile.
  await expect(page.getByText("Dokumen & OCR")).toBeVisible({
    timeout: 60_000,
  });

  // Cold dev servers can fail the panel's first list fetch while the route
  // compiles; retry until the list has actually rendered.
  await expect(async () => {
    const retry = page.getByRole("button", { name: "Muat ulang daftar" });
    if (await retry.isVisible()) await retry.click();
    await expect(
      page.getByText(/Belum ada dokumen|maya-/).first(),
    ).toBeVisible({ timeout: 5_000 });
  }).toPass({ timeout: 60_000 });

  await page.locator('input[type="file"]').setInputFiles({
    name: "maya-valid-health-document.pdf",
    mimeType: "application/pdf",
    buffer: readFileSync(
      join(
        __dirname,
        "..",
        "..",
        "..",
        "docs",
        "data",
        "maya-valid-health-document.pdf",
      ),
    ),
  });

  await expect(page.getByText("Review hasil ekstraksi")).toBeVisible({
    timeout: 30_000,
  });
  await expect(
    page.getByText("DEMO_FALLBACK · bukan hasil OCR live"),
  ).toBeVisible();
  await page
    .getByText("DEMO_FALLBACK · bukan hasil OCR live")
    .scrollIntoViewIfNeeded();
  await page.screenshot({
    path: join(__dirname, "..", "..", "test-results", "qa-p9", "fallback-labeled.png"),
  });
});
