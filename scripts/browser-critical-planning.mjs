import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { readFile, writeFile } from "node:fs/promises";
const require = createRequire(
  new URL("../frontend/package.json", import.meta.url),
);
const { chromium } = require("playwright");
const origin = process.env.TEST_ORIGIN || "http://127.0.0.1:3000";
const browser = await chromium.launch({
  headless: true,
  executablePath: process.env.CHROMIUM_EXECUTABLE,
});
const context = await browser.newContext({
  viewport: { width: 1440, height: 1000 },
  reducedMotion: "reduce",
});
const page = await context.newPage();
const checks = [],
  errors = [];
let created;
page.on("pageerror", (e) => errors.push(e.message));
const ws = async () =>
  (await context.request.get(`${origin}/api/v1/workspace`)).json();
const before = await ws();
const select = async (id) =>
  context.request.put(`${origin}/api/v1/workspace/dataset`, {
    data: { dataset_id: id },
  });
try {
  const facebook = before.datasets.find(
    (d) => d.original_filename === "Facebook_Ad_Campaigns_with_revenue.csv",
  );
  if (facebook) {
    await select(facebook.id);
    await page.goto(`${origin}/ml-studio`);
    await page
      .getByRole("heading", { name: "Model versus baseline", exact: true })
      .waitFor();
    await page.getByText("1.33%", { exact: true }).waitFor();
    await page
      .getByText(/older import discarded synthetic/)
      .first()
      .waitFor();
    await page
      .getByRole("link", { name: /Plan a budget with baseline evaluation/ })
      .click();
    await page.getByLabel("Total budget (PKR)", { exact: true }).waitFor();
    checks.push(
      "Existing Facebook validation metrics show 1.33% improvement, provenance warning, and working planning link",
    );
  }
  // A disposable copy of the current modified file retains synthetic component flags.
  const csv = await readFile(
    "/Users/adnan/Downloads/Facebook_Ad_Campaigns_with_revenue.csv",
    "utf8",
  );
  const staged = await (
    await context.request.post(
      `${origin}/api/v1/imports/preview?filename=critical-facebook-qa.csv&profile=generic`,
      { data: csv, headers: { "Content-Type": "text/csv" } },
    )
  ).json();
  const saved = await context.request.post(
    `${origin}/api/v1/imports/${staged.token}/commit`,
    {
      data: {
        name: "Synthetic-component Facebook QA",
        mapping: { ...staged.suggested_mapping, campaign: "fb_campaign_id" },
        conversion_definition: "purchases",
        attribution_window: "7-day click",
        confirmed: true,
      },
    },
  );
  assert.equal(saved.status(), 201, await saved.text());
  const source = await saved.json();
  created = source.id;
  assert(
    source.is_synthetic &&
      source.provenance_flags.revenue_is_synthetic &&
      source.provenance_flags.date_is_synthetic,
  );
  checks.push(
    "Current 1,143-row Facebook file imports with synthetic dates/revenue retained",
  );
  await page.goto(`${origin}/budget-optimizer`);
  const budget = page.getByLabel("Total budget (PKR)", { exact: true });
  await budget.waitFor();
  assert.equal(
    await page.getByLabel("Planning method", { exact: true }).inputValue(),
    "auto",
  );
  assert.equal(
    await page.getByLabel("Facebook minimum share (%)").inputValue(),
    "0",
  );
  assert.equal(
    await page.getByLabel("Facebook maximum share (%)").inputValue(),
    "100",
  );
  for (const amount of ["500", "5000", "25000", "1000000", "5123.47"]) {
    await budget.fill(amount);
    const pending = page.waitForResponse(
      (r) =>
        r.url().endsWith("/optimizer/plans") && r.request().method() === "POST",
    );
    await page
      .getByRole("button", { name: "Generate recommendation", exact: true })
      .click();
    const response = await pending;
    assert.equal(response.status(), 201, await response.text());
    const plan = await response.json();
    assert.equal(plan.totals.budget, Number(amount));
    assert.equal(
      plan.allocations.reduce((s, a) => s + Math.round(a.budget * 100), 0),
      Math.round(Number(amount) * 100),
    );
    assert.equal(plan.totals.estimated_revenue, null);
    assert.equal(plan.totals.estimated_roas, null);
    assert.equal(plan.model_id, null);
    await page.getByTestId("plan-budget").waitFor();
    await page
      .getByText("Allocation only · revenue forecast unavailable.", {
        exact: true,
      })
      .waitFor();
    checks.push(
      `Facebook budget ${amount}: exact allocation, no historical minimum, no unsupported revenue/ROAS`,
    );
  }
  for (const width of [1440, 1024, 768, 390, 375]) {
    await page.setViewportSize({ width, height: 1000 });
    await page.waitForTimeout(400);
    assert(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    );
    if ([1440, 375].includes(width))
      await page.screenshot({
        path: `docs/screenshots/critical-planning-${width}.png`,
        fullPage: true,
      });
    checks.push(`Allocation-only result responsive at ${width}px`);
  }
  await page
    .getByText("Actual platform minimums and maximums (PKR)", { exact: true })
    .click();
  await page.getByLabel("Facebook minimum (PKR)", { exact: true }).fill("6000");
  await budget.fill("500");
  const failed = page.waitForResponse(
    (r) =>
      r.url().endsWith("/optimizer/plans") && r.request().method() === "POST",
  );
  await page
    .getByRole("button", { name: "Generate recommendation", exact: true })
    .click();
  assert.equal((await failed).status(), 422);
  await page.getByText(/user minimum PKR/).waitFor();
  checks.push("Explicit PKR 6,000 floor correctly rejects a PKR 500 budget");
  assert.deepEqual(errors, []);
  await writeFile(
    "docs/critical-planning-browser-results.json",
    JSON.stringify({ checks, errors }, null, 2),
  );
  console.log(JSON.stringify({ checks, errors }));
} finally {
  await select(before.selected_dataset_id);
  if (created)
    assert.equal(
      (
        await context.request.delete(`${origin}/api/v1/datasets/${created}`)
      ).status(),
      200,
    );
  assert.deepEqual(
    (await ws()).datasets.map((d) => d.id).sort(),
    before.datasets.map((d) => d.id).sort(),
  );
  await browser.close();
}
