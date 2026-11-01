import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { writeFile } from "node:fs/promises";
const require = createRequire(
  new URL("../frontend/package.json", import.meta.url),
);
const { chromium } = require("playwright");
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
const results = [],
  errors = [],
  created = [];
let token, originalId;
page.on("pageerror", (e) => errors.push(e.message));
const state = async () =>
  (await context.request.get(`${origin}/api/v1/workspace`)).json();
const previous = (await state()).selected_dataset_id;
const conversion = "What does a result count in this report?";
const timing = "How long after an ad interaction can a result be counted?";
const unique = Date.now();
const rows = Array.from({ length: 1000 }, (_, i) => {
  const d = new Date(Date.UTC(2026, 0, 1 + Math.floor(i / 10)))
    .toISOString()
    .slice(0, 10);
  return `${d},Guided ${unique}-${i % 10},${["Facebook", "Instagram", "Google", "TikTok", "YouTube"][i % 5]},10000,100,${100 + (i % 100) * 7},1,${400 + (i % 100) * 14},true`;
});
const unknownCSV =
  "date,campaign,platform,impressions,clicks,spend,conversions,revenue,is_synthetic\n" +
  rows.join("\n") +
  "\n";
try {
  await page.route("**/api/v1/imports/preview?**", async (route) => {
    const response = await route.fetch();
    const result = await response.json();
    token = result.token;
    await route.fulfill({ response });
  });
  await page.goto(`${origin}/data-studio`);
  await page.getByRole("button", { name: "Bring an advertising CSV" }).click();
  const explicit =
    "date,campaign,platform,spend,revenue,Purchases,attribution_window,is_synthetic\n2026-01-01,Explicit fixture,Google,100,200,1,7-day click,true\n";
  await page.getByLabel("Campaign CSV file").setInputFiles({
    name: "guided-explicit-fixture.csv",
    mimeType: "text/csv",
    buffer: Buffer.from(explicit),
  });
  await page.getByLabel(conversion, { exact: true }).waitFor();
  assert.equal(
    await page.getByLabel(conversion, { exact: true }).inputValue(),
    "purchases",
  );
  assert.equal(
    await page.getByLabel(timing, { exact: true }).inputValue(),
    "7-day click",
  );
  assert.ok(
    (await page.locator(".reporting-evidence").allTextContents()).some((t) =>
      t.includes("Purchases"),
    ),
  );
  results.push(
    "CSV import detects explicit Purchases and attribution rules and displays evidence",
  );
  assert.ok(await page.getByLabel(timing, { exact: true }).isDisabled());
  await page
    .getByText("Optional audience, IDs & attribution columns", { exact: true })
    .click();
  await page
    .getByLabel("Map attribution window", { exact: true })
    .selectOption("");
  assert.equal(
    await page.getByLabel(timing, { exact: true }).inputValue(),
    "unspecified",
  );
  assert.ok(await page.getByLabel(timing, { exact: true }).isEnabled());
  await page
    .getByLabel("Map attribution window", { exact: true })
    .selectOption("attribution_window");
  assert.equal(
    await page.getByLabel(timing, { exact: true }).inputValue(),
    "7-day click",
  );
  results.push(
    "Detected answers stay tied to the current mapping and recorded rules cannot be overwritten",
  );
  await page.getByLabel("Campaign CSV file").setInputFiles({
    name: `guided-unknown-${unique}.csv`,
    mimeType: "text/csv",
    buffer: Buffer.from(unknownCSV),
  });
  await page
    .getByText(`guided-unknown-${unique}.csv`, { exact: true })
    .waitFor();
  await page
    .getByLabel("Dataset name", { exact: true })
    .fill(`Guided setup QA ${unique}`);
  await page.getByLabel("Data type", { exact: true }).selectOption("true");
  assert.equal(
    await page.getByLabel(conversion, { exact: true }).inputValue(),
    "unspecified",
  );
  assert.equal(
    await page.getByLabel(timing, { exact: true }).inputValue(),
    "unspecified",
  );
  results.push(
    "Generic conversions do not produce invented purchase or attribution answers",
  );
  await page
    .getByRole("button", { name: "Validate mapping", exact: true })
    .click();
  await page.getByRole("heading", { name: "Ready for your review" }).waitFor();
  await page.getByLabel(/I have permission to use this data/).check();
  await page
    .getByRole("button", { name: "Confirm and save dataset", exact: true })
    .click();
  await page.locator(".saved-notice").waitFor();
  token = undefined;
  let current = await state();
  originalId = current.selected_dataset_id;
  created.push(originalId);
  assert.equal(current.selected_dataset.data_ready_for_revenue, false);
  await page.goto(`${origin}/ml-studio`);
  await page
    .getByRole("heading", { name: "Let’s make sense of your report." })
    .waitFor();
  assert.equal(
    await page
      .getByRole("button", { name: "Save my answers", exact: true })
      .isDisabled(),
    true,
  );
  assert.equal(
    await page
      .getByRole("button", { name: "Train revenue model", exact: true })
      .isDisabled(),
    true,
  );
  results.push(
    "ML Studio offers plain-language questions and keeps training blocked while unsure",
  );
  await page
    .getByText("I’m not sure — where do I find this?", { exact: true })
    .click();
  await page.getByText(/Missing reporting rules cannot be recovered/).waitFor();
  await page
    .getByRole("link", { name: "Explore my data for now", exact: true })
    .click();
  await page.getByTestId("metric-spend").waitFor();
  results.push("Unsure users can continue to working analytics");
  await page.goto(`${origin}/ml-studio`);
  await page
    .getByRole("heading", { name: "Let’s make sense of your report." })
    .waitFor();
  for (const width of [1440, 1280, 1024, 768, 430, 390, 375]) {
    await page.setViewportSize({ width, height: 1000 });
    assert.ok(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    );
    results.push(
      `Guided setup fits ${width}px without horizontal page overflow`,
    );
    if ([1440, 375].includes(width)) {
      await page.locator(".reporting-setup").screenshot({
        path: `docs/screenshots/reporting-questions-${width}.png`,
      });
    }
  }
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.getByLabel(conversion, { exact: true }).selectOption("purchases");
  assert.equal(
    await page
      .getByRole("button", { name: "Save my answers", exact: true })
      .isDisabled(),
    true,
  );
  await page.getByLabel(timing, { exact: true }).selectOption("7-day click");
  await page
    .getByRole("button", { name: "Save my answers", exact: true })
    .click();
  await page
    .getByText(
      "Your reporting answers are saved with this version of the report. Check training readiness below.",
      { exact: true },
    )
    .waitFor();
  await page.waitForFunction(
    () => !document.querySelector(".ml-form .button.primary")?.disabled,
  );
  current = await state();
  const revision = current.selected_dataset;
  created.push(revision.id);
  assert.notEqual(revision.id, originalId);
  assert.equal(revision.parent_dataset_id, originalId);
  assert.equal(revision.data_ready_for_revenue, true);
  assert.equal(revision.is_synthetic, true);
  assert.equal(
    current.datasets.find((d) => d.id === originalId).conversion_definition,
    "unspecified",
  );
  results.push(
    "Confirmed answers create a source-linked version and leave the original definitions intact",
  );
  const oldRows = await (
    await context.request.get(`${origin}/api/v1/datasets/${originalId}/preview`)
  ).json();
  const newRows = await (
    await context.request.get(
      `${origin}/api/v1/datasets/${revision.id}/preview`,
    )
  ).json();
  assert.deepEqual(
    oldRows.rows.map((r) => [r.spend, r.revenue]),
    newRows.rows.map((r) => [r.spend, r.revenue]),
  );
  results.push(
    "All previewed financial values are preserved through reporting setup",
  );
  const ml = await (await context.request.get(`${origin}/api/v1/ml`)).json();
  assert.equal(ml.jobs.length, 0);
  results.push(
    "Saving answers enables readiness without automatically training a model",
  );
  await page.reload();
  await page
    .getByText(/mature rows ready for chronological evaluation/)
    .waitFor();
  results.push("Answers and selected revision survive reload");
  assert.deepEqual(errors, []);
  results.push("No captured page-level JavaScript errors");
  await writeFile(
    "docs/reporting-setup-browser-results.json",
    JSON.stringify({ results, errors }, null, 2),
  );
  console.log(JSON.stringify({ checks: results.length, errors }, null, 2));
} finally {
  await context.request.put(`${origin}/api/v1/workspace/dataset`, {
    data: { dataset_id: previous },
  });
  for (const id of created.reverse())
    await context.request.delete(`${origin}/api/v1/datasets/${id}`);
  if (token) await context.request.delete(`${origin}/api/v1/imports/${token}`);
  await browser.close();
}
