import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { writeFile } from "node:fs/promises";
const require = createRequire(
  new URL("../frontend/package.json", import.meta.url),
);
const { chromium } = require("playwright");
const input = process.argv[2];
if (!input)
  throw new Error(
    "Usage: node scripts/browser-import-mapping.mjs <sample_marketing_campaigns_pkr.csv>",
  );
const origin = process.env.TEST_ORIGIN || "http://127.0.0.1:3000";
const browser = await chromium.launch({
  headless: true,
  executablePath: process.env.CHROMIUM_EXECUTABLE || undefined,
});
const context = await browser.newContext({
  viewport: { width: 1440, height: 1000 },
  reducedMotion: "reduce",
});
const page = await context.newPage();
let token;
let preview;
let report;
const errors = [],
  checks = [];
page.on("pageerror", (error) => errors.push(error.message));
try {
  // Pass through real server responses, capturing evidence before browser cache eviction.
  await page.route("**/api/v1/imports/**", async (route) => {
    const response = await route.fetch();
    if (route.request().url().includes("/imports/preview")) {
      preview = await response.json();
      token = preview.token;
    } else if (route.request().url().endsWith("/validate")) {
      report = await response.json();
    }
    await route.fulfill({ response });
  });
  await page.goto(`${origin}/data-studio`);
  await page.getByRole("button", { name: "Bring an advertising CSV" }).click();
  await page.getByLabel("Campaign CSV file").setInputFiles(input);
  await page.getByLabel("Map platform", { exact: true }).waitFor();
  assert.equal(preview.row_count, 96);
  for (const [label, value] of [
    ["platform", "channel"],
    ["spend", "spend_pkr"],
    ["revenue", "revenue_pkr"],
  ]) {
    assert.equal(
      await page.getByLabel(`Map ${label}`, { exact: true }).inputValue(),
      value,
    );
    checks.push(`Suggests ${value} for ${label}`);
  }
  await page.getByText(/Weekly\/monthly period columns detected/).waitFor();
  checks.push("Warns about weekly periods before validation");
  await page.getByLabel("Map date", { exact: true }).selectOption("week_start");
  await page
    .getByRole("button", { name: "Validate mapping", exact: true })
    .click();
  await page
    .getByText(/The mapped date is a weekly\/monthly boundary/)
    .waitFor();
  assert.equal(report.valid_rows, 96);
  assert.equal(report.invalid_rows, 0);
  assert.equal(report.errors.filter((e) => e.field === "platform").length, 0);
  assert.equal(report.can_import, false);
  await page
    .getByText(/The mapped date is a weekly\/monthly boundary/)
    .waitFor();
  assert.equal(
    await page
      .getByRole("button", { name: "Confirm and save dataset", exact: true })
      .count(),
    0,
  );
  checks.push("All 96 rows normalize without platform errors");
  checks.push(
    "Weekly totals are blocked from daily storage with an explicit explanation",
  );
  for (const width of [1440, 375]) {
    await page.setViewportSize({ width, height: 1000 });
    await page.locator(".validation-report").scrollIntoViewIfNeeded();
    assert.ok(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    );
    await page.screenshot({
      path: `docs/screenshots/import-mapping-weekly-${width}.png`,
      fullPage: true,
    });
    checks.push(`Import validation fits ${width}px without page overflow`);
  }
  assert.deepEqual(errors, []);
  checks.push("No captured page-level JavaScript errors");
  await writeFile(
    "docs/import-mapping-browser-results.json",
    JSON.stringify(
      {
        checks,
        errors,
        input_rows: report.input_rows,
        valid_metric_rows: report.valid_rows,
        invalid_rows: report.invalid_rows,
        can_import: report.can_import,
        errors_by_field: report.errors.map((e) => e.field),
      },
      null,
      2,
    ),
  );
  console.log(
    JSON.stringify(
      {
        checks: checks.length,
        valid_rows: report.valid_rows,
        invalid_rows: report.invalid_rows,
        blockers: report.errors,
        errors,
      },
      null,
      2,
    ),
  );
} finally {
  if (token) await context.request.delete(`${origin}/api/v1/imports/${token}`);
  await browser.close();
}
