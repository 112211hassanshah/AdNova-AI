import assert from "node:assert/strict";
import { mkdir, writeFile } from "node:fs/promises";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
const require = createRequire(
  new URL("../frontend/package.json", import.meta.url),
);
const { chromium } = require("playwright");
const origin = process.env.TEST_ORIGIN || "http://127.0.0.1:3000";
const output = new URL("../docs/screenshots/", import.meta.url);
await mkdir(output, { recursive: true });
const browser = await chromium.launch({
  headless: true,
  executablePath: process.env.CHROMIUM_EXECUTABLE || undefined,
});
const context = await browser.newContext({
  viewport: { width: 1440, height: 1080 },
  reducedMotion: "reduce",
  acceptDownloads: true,
});
const page = await context.newPage();
const errors = [];
const results = [];
const created = [];
let previous = null;
let keepDemo = false;
let demoId = null;
page.on("pageerror", (error) => errors.push(error.message));
const state = async () =>
  (await context.request.get(`${origin}/api/v1/workspace`)).json();
const metric = async (key, text) =>
  page.waitForFunction(
    ({ key, text }) =>
      document.querySelector(`[data-testid="metric-${key}"]`)?.textContent ===
      text,
    { key, text },
  );
const screenshot = (name) =>
  page.screenshot({
    path: fileURLToPath(new URL(name, output)),
    fullPage: true,
  });
async function purchasesDefinition() {
  const control = page.getByLabel("What does a result count in this report?", {
    exact: true,
  });
  if (await control.isEnabled()) await control.selectOption("purchases");
  else assert.equal(await control.inputValue(), "purchases");
}
try {
  previous = (await state()).selected_dataset_id;
  await context.request.put(`${origin}/api/v1/workspace/dataset`, {
    data: { dataset_id: null },
  });
  await page.goto(origin);
  await page
    .getByRole("heading", { name: "A clear view starts here." })
    .waitFor();
  await page.goto(`${origin}/data-studio`);
  await page
    .getByLabel("Dataset name", { exact: true })
    .fill("Pakistan campaign demo · Phase 1");
  await page.getByLabel("Record count", { exact: true }).selectOption("10000");
  await page
    .getByLabel("Random seed", { exact: true })
    .fill(String(Date.now() % 4294967295));
  await page
    .getByRole("button", { name: "Generate demo", exact: true })
    .click();
  await page.locator(".saved-notice").waitFor();
  let current = await state();
  demoId = current.selected_dataset_id;
  created.push(demoId);
  assert.equal(current.selected_dataset.rows, 10000);
  assert.equal(current.selected_dataset.is_synthetic, true);
  assert.equal(current.selected_dataset.options.platform.length, 5);
  results.push(
    "Demo UI generates 10,000 real seeded synthetic rows across five platforms and saves/selects the dataset",
  );
  await page
    .getByRole("link", { name: "Review performance", exact: true })
    .click();
  await page.getByTestId("metric-spend").waitFor();
  await page
    .getByText(
      "Synthetic demo · simulated outcomes, not real business performance.",
    )
    .waitFor();
  assert.match(await page.getByTestId("metric-spend").textContent(), /^Rs\. /);
  assert.notEqual(
    await page.getByTestId("metric-roas").textContent(),
    "Not available",
  );
  await screenshot("phase-1-overview-1440.png");
  results.push(
    "Overview uses live backend spend, attributed revenue and weighted ROAS with a synthetic disclaimer",
  );
  await page
    .getByText("Refine period, platform & audience", { exact: false })
    .click();
  await page.getByLabel("platform", { exact: true }).selectOption("Google");
  await page
    .getByRole("button", { name: "Apply filters", exact: true })
    .click();
  await page
    .locator(".analysis-context")
    .getByText(/platform: Google/)
    .waitFor();
  await page.getByTestId("metric-spend").waitFor();
  const expected = await (
    await context.request.get(
      `${origin}/api/v1/datasets/${demoId}/analytics?platform=Google`,
    )
  ).json();
  const expectedSpend = `Rs. ${new Intl.NumberFormat("en-PK", { maximumFractionDigits: 2 }).format(expected.totals.spend)}`;
  await metric("spend", expectedSpend);
  await page
    .locator(".sidebar")
    .getByRole("link", { name: "Campaigns", exact: true })
    .click();
  await metric("spend", expectedSpend);
  assert.equal(
    await page.getByLabel("platform", { exact: true }).inputValue(),
    "Google",
  );
  await page
    .getByRole("button", { name: "Reset filters", exact: true })
    .click();
  await page.getByRole("button", { name: "Spend (PKR)", exact: true }).click();
  await page
    .locator('th[aria-sort="descending"]')
    .getByRole("button", { name: "Spend (PKR)" })
    .waitFor();
  const next = page.getByRole("button", { name: "Next performance page" });
  await next.click();
  await page.getByText(/Page 2 of/).waitFor();
  await page.getByLabel("Group performance by").selectOption("platform");
  await page.getByText(/5 platform groups/).waitFor();
  await page
    .getByText("Read chart values as a table", { exact: true })
    .first()
    .click();
  await screenshot("phase-1-campaigns-1440.png");
  results.push(
    "Server filters persist from Overview to Campaigns; sort, pagination, grouping and accessible chart table work",
  );
  const downloadPromise = page.waitForEvent("download");
  await page.getByRole("link", { name: "Export filtered CSV" }).click();
  const download = await downloadPromise;
  assert.match(download.suggestedFilename(), /^synthetic_generator-/);
  results.push(
    "Filtered export downloads a source-labelled CSV from the backend",
  );

  await page.goto(`${origin}/data-studio`);
  await page.getByRole("button", { name: "Bring an advertising CSV" }).click();
  const content =
    "date,campaign,platform,impressions,clicks,spend,conversions,is_synthetic\n2026-01-01,Fixture Search,Google,100,10,50,2,true\n2026-01-02,Fixture Social,Facebook,1000,10,150,1,true\n";
  await page.getByLabel("Campaign CSV file").setInputFiles({
    name: "phase-1-missing-revenue.csv",
    mimeType: "text/csv",
    buffer: Buffer.from(content),
  });
  await page.getByRole("heading", { name: "Map your columns" }).waitFor();
  await purchasesDefinition();
  await page
    .getByLabel("How long after an ad interaction can a result be counted?", {
      exact: true,
    })
    .selectOption("7-day click");
  await page.getByRole("button", { name: "Validate mapping" }).click();
  await page.getByRole("heading", { name: "Ready for your review" }).waitFor();
  assert.equal(
    await page
      .getByRole("button", { name: "Confirm and save dataset" })
      .isDisabled(),
    true,
  );
  await page.getByRole("checkbox", { name: /I have permission/ }).check();
  await page.getByRole("button", { name: "Confirm and save dataset" }).click();
  await page.locator(".saved-notice").waitFor();
  current = await state();
  const missingId = current.selected_dataset_id;
  created.push(missingId);
  assert.equal(current.selected_dataset.coverage.revenue, 0);
  assert.equal(current.selected_dataset.is_synthetic, true);
  assert.equal(current.selected_dataset.data_ready_for_revenue, false);
  await page
    .getByRole("link", { name: "Review performance", exact: true })
    .click();
  await metric("spend", "Rs. 200");
  await metric("revenue", "Not available");
  await metric("roas", "Not available");
  await page.reload();
  await metric("spend", "Rs. 200");
  results.push(
    "CSV preview, mapping, validation, explicit confirmation and save work; synthetic provenance is retained and missing revenue never becomes zero",
  );
  results.push(
    "Saved dataset selection survives page reload and remains separate from demo data",
  );

  await page.goto(`${origin}/data-studio`);
  await page.getByRole("button", { name: "Bring an advertising CSV" }).click();
  const invalidCsv =
    "Day,Campaign name,Publisher platform,Impressions,Link clicks,Budget used,Purchases,Revenue,is_synthetic\n2026-01-01,Manual fixture,instagram,100,10,20,1,100,true\nbad-date,Bad row,instagram,100,10,30,1,200,true\n";
  await page.getByLabel("Campaign CSV file").setInputFiles({
    name: "phase-1-invalid-row.csv",
    mimeType: "text/csv",
    buffer: Buffer.from(invalidCsv),
  });
  await page.getByRole("heading", { name: "Map your columns" }).waitFor();
  await page
    .getByLabel("Map spend", { exact: true })
    .selectOption("Budget used");
  await purchasesDefinition();
  await page
    .getByLabel("How long after an ad interaction can a result be counted?", {
      exact: true,
    })
    .selectOption("7-day click");
  await page.getByRole("button", { name: "Validate mapping" }).click();
  await page
    .getByRole("heading", { name: "A few things need attention" })
    .waitFor();
  assert.equal(
    await page
      .getByRole("button", { name: "Confirm and save dataset" })
      .count(),
    0,
  );
  await page
    .getByRole("checkbox", {
      name: "Explicitly exclude invalid rows after reviewing their count",
    })
    .check();
  assert.equal(
    await page.getByRole("region", { name: "Validation report" }).count(),
    0,
  );
  await page.getByRole("button", { name: "Validate mapping" }).click();
  await page.getByRole("heading", { name: "Ready for your review" }).waitFor();
  await screenshot("phase-1-import-validation-1440.png");
  await page.getByRole("checkbox", { name: /I have permission/ }).check();
  await page.getByRole("button", { name: "Confirm and save dataset" }).click();
  await page.locator(".saved-notice").waitFor();
  current = await state();
  const invalidId = current.selected_dataset_id;
  created.push(invalidId);
  assert.equal(current.selected_dataset.rows, 1);
  results.push(
    "Manual mapping works; an invalid row blocks saving until explicit exclusion, revalidation and confirmation",
  );
  await page
    .getByRole("button", { name: "Delete phase-1-invalid-row", exact: true })
    .click();
  await page
    .getByRole("dialog")
    .getByRole("button", { name: "Keep dataset" })
    .click();
  assert.equal(
    (await state()).datasets.some((dataset) => dataset.id === invalidId),
    true,
  );
  await page
    .getByRole("button", { name: "Delete phase-1-invalid-row", exact: true })
    .click();
  await page
    .getByRole("dialog")
    .getByRole("button", { name: "Delete dataset", exact: true })
    .click();
  await page.getByRole("dialog").waitFor({ state: "hidden" });
  assert.equal(
    (await state()).datasets.some((dataset) => dataset.id === invalidId),
    false,
  );
  results.push(
    "Delete confirmation can be cancelled; confirmed deletion removes only the intended local dataset",
  );
  await page.getByLabel("Selected campaign dataset").selectOption(demoId);
  await page.getByRole("button", { name: "Next preview page" }).click();
  await page.getByText(/Page 2 of 500/).waitFor();
  results.push("Dataset switching and server-paginated raw previews work");

  for (const width of [1440, 1280, 1024, 768, 430, 390, 375]) {
    await page.setViewportSize({ width, height: width < 640 ? 844 : 1080 });
    for (const path of ["/", "/data-studio", "/campaigns"]) {
      await page.goto(`${origin}${path}`);
      if (path === "/data-studio")
        await page
          .getByRole("heading", { name: "Selected dataset preview" })
          .waitFor();
      else await page.getByTestId("metric-spend").waitFor();
      assert.equal(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth,
        ),
        true,
        `Overflow at ${width} on ${path}`,
      );
    }
    if (width === 390) {
      await screenshot("phase-1-campaigns-390.png");
      await page.goto(origin);
      await page.getByTestId("metric-spend").waitFor();
      await screenshot("phase-1-overview-390.png");
      await page.goto(`${origin}/data-studio`);
      await page
        .getByRole("heading", { name: "Selected dataset preview" })
        .waitFor();
      await screenshot("phase-1-data-studio-390.png");
    }
    results.push(
      `Overview, Data Studio and Campaigns have no horizontal overflow at ${width}px`,
    );
  }
  await page.getByRole("button", { name: "Open navigation" }).click();
  await page
    .getByRole("dialog")
    .getByRole("link", { name: "ML Studio" })
    .click();
  await page.getByRole("heading", { name: "Train a revenue model" }).waitFor();
  results.push(
    "Mobile drawer navigates correctly to the working Phase 3 training screen",
  );
  await page.goto(`${origin}/campaigns`);
  await page.getByTestId("metric-spend").waitFor();
  await page.getByLabel("start date", { exact: true }).fill("2030-01-01");
  await page.getByLabel("end date", { exact: true }).fill("2026-01-01");
  await page
    .getByRole("button", { name: "Apply filters", exact: true })
    .click();
  await page
    .getByText("Start date must not be after end date.", { exact: true })
    .waitFor();
  await page.getByLabel("end date", { exact: true }).fill("2030-01-02");
  await page
    .getByRole("button", { name: "Apply filters", exact: true })
    .click();
  await page
    .getByRole("heading", { name: "No observations match these filters." })
    .waitFor();
  await page
    .getByRole("button", { name: "Clear filters", exact: true })
    .click();
  await page.getByTestId("metric-spend").waitFor();
  results.push(
    "Invalid date ranges explain the remedy; empty results and clear-filter recovery work",
  );
  await page.goto(`${origin}/help`);
  await page.getByText("ROAS · return on ad spend", { exact: true }).click();
  assert.equal(
    await page
      .getByText("ROAS · return on ad spend", { exact: true })
      .evaluate((summary) => summary.parentElement.open),
    true,
  );
  const skip = page.getByRole("link", { name: "Skip to content" });
  await skip.focus();
  await skip.press("Enter");
  assert.equal(
    await page
      .locator("main")
      .evaluate((element) => element === document.activeElement),
    true,
  );
  results.push("Help glossary and keyboard skip link remain functional");
  await page.route("**/api/v1/workspace", (route) =>
    route.fulfill({ status: 503, body: "{}" }),
  );
  await page.goto(origin);
  await page.locator('.notice[role="alert"]').waitFor();
  await page.unroute("**/api/v1/workspace");
  await page.getByRole("button", { name: "Retry connection" }).click();
  await page.getByTestId("metric-spend").waitFor();
  results.push(
    "Workspace outage shows an error and retry recovers selected dataset analytics",
  );
  const analyticsRoute = /\/api\/v1\/datasets\/[^/]+\/analytics(?:\?|$)/;
  await page.route(analyticsRoute, (route) =>
    route.fulfill({ status: 503, body: "{}" }),
  );
  await page.goto(`${origin}/campaigns`);
  await page.locator('.analytics-screen .notice[role="alert"]').waitFor();
  await page.unroute(analyticsRoute);
  await page.getByRole("button", { name: "Retry analytics" }).click();
  await page.getByTestId("metric-spend").waitFor();
  results.push(
    "Analytics failure has its own recoverable error state without inventing results",
  );
  await page.route(analyticsRoute, async (route) => {
    await new Promise((resolve) => setTimeout(resolve, 800));
    await route.continue();
  });
  await page.goto(`${origin}/campaigns`);
  await page.locator(".analytics-screen .loading-state").waitFor();
  await page.getByTestId("metric-spend").waitFor();
  await page.unroute(analyticsRoute);
  results.push(
    "Analytics loading state reflects an actual outstanding request",
  );
  await page.goto(`${origin}/not-a-real-page`);
  await page.getByRole("heading", { name: "That page isn’t here." }).waitFor();
  results.push("Unknown routes retain a working recovery link");
  assert.deepEqual(errors, []);
  keepDemo = true;
  await writeFile(
    new URL("../phase-1-browser-results.json", output),
    `${JSON.stringify({ checked_at: new Date().toISOString(), results }, null, 2)}\n`,
  );
  console.log(
    `Passed ${results.length} Phase 1 browser checks with no JavaScript errors.`,
  );
} finally {
  for (const id of created) {
    if (id === demoId && keepDemo && !previous) continue;
    await context.request.delete(`${origin}/api/v1/datasets/${id}`);
  }
  await context.request.put(`${origin}/api/v1/workspace/dataset`, {
    data: { dataset_id: previous || (keepDemo ? demoId : null) },
  });
  await browser.close();
}
