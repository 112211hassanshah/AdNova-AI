import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { readFile, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
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
page.on("pageerror", (e) => errors.push(e.message));
const ws = async () =>
  (await context.request.get(`${origin}/api/v1/workspace`)).json();
const before = await ws();
const previous = before.selected_dataset_id;
const created = [];
try {
  await page.goto(`${origin}/data-studio`);
  await page.getByRole("button", { name: "Bring an advertising CSV" }).click();
  await page
    .getByLabel("Campaign CSV file")
    .setInputFiles(
      fileURLToPath(
        new URL(
          "../backend/tests/fixtures/weekly_training.csv",
          import.meta.url,
        ),
      ),
    );
  await page.getByLabel("Map date", { exact: true }).waitFor();
  assert.equal(
    await page.getByLabel("Map date", { exact: true }).inputValue(),
    "Week Start",
  );
  assert.equal(
    await page.getByLabel("Map spend", { exact: true }).inputValue(),
    "Amount Spent",
  );
  await page
    .getByText(/mapping confidence/)
    .first()
    .waitFor();
  checks.push(
    "Alternative date/spend headers selected with visible confidence",
  );
  for (const width of [1440, 375]) {
    await page.setViewportSize({ width, height: 1000 });
    await page.waitForTimeout(500);
    assert(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    );
    await page.screenshot({
      path: `docs/screenshots/debug-mapping-${width}.png`,
      fullPage: true,
    });
    checks.push(`Mapping responsive at ${width}px`);
  }
  await page
    .getByRole("button", { name: "Validate mapping", exact: true })
    .click();
  await page.getByText(/Reporting period: weekly/).waitFor();
  await page.getByLabel(/I have permission to use this data/).check();
  await page
    .getByRole("button", { name: "Confirm and save dataset", exact: true })
    .click();
  await page.getByText(/weekly_training saved/).waitFor();
  created.push((await ws()).selected_dataset_id);
  const source = (await ws()).selected_dataset;
  assert.equal(source.date_granularity, "weekly");
  assert.equal(source.rows, 480);
  checks.push("Weekly upload saved as 480 weekly records, no daily expansion");
  await page.goto(`${origin}/ml-studio`);
  await page
    .getByRole("button", { name: "Train revenue model", exact: true })
    .click();
  await page
    .getByText("Training and holdout evaluation completed.", { exact: true })
    .waitFor({ timeout: 90000 });
  await page.getByText("Passed the model checks.", { exact: true }).waitFor();
  await page.getByText(/Holdout R²:/).waitFor();
  checks.push(
    "Actual uploaded weekly data fits XGBoost and displays genuine holdout metrics",
  );
  for (const width of [1440, 375]) {
    await page.setViewportSize({ width, height: 1000 });
    await page.waitForTimeout(500);
    await page.screenshot({
      path: `docs/screenshots/debug-ml-${width}.png`,
      fullPage: true,
    });
    assert(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    );
    checks.push(`ML results responsive at ${width}px`);
  }
  const csv = await readFile(
    new URL(
      "../backend/tests/fixtures/daily_budget_training.csv",
      import.meta.url,
    ),
    "utf8",
  );
  const staged = await (
    await context.request.post(
      `${origin}/api/v1/imports/preview?filename=synthetic-budget-qa.csv&profile=generic`,
      { data: csv, headers: { "Content-Type": "text/csv" } },
    )
  ).json();
  const saved = await context.request.post(
    `${origin}/api/v1/imports/${staged.token}/commit`,
    {
      data: {
        name: "Synthetic budget browser QA",
        mapping: staged.suggested_mapping,
        confirmed: true,
      },
    },
  );
  assert.equal(saved.status(), 201, await saved.text());
  created.push((await saved.json()).id);
  await page.goto(`${origin}/ml-studio`);
  await page
    .getByRole("button", { name: "Train revenue model", exact: true })
    .click();
  await page
    .getByText("Training and holdout evaluation completed.", { exact: true })
    .waitFor({ timeout: 90000 });
  await page.getByText("Passed the model checks.", { exact: true }).waitFor();
  await page.goto(`${origin}/budget-optimizer`);
  const budget = page.getByLabel("Total budget (PKR)", { exact: true });
  await budget.waitFor();
  assert.equal(await budget.inputValue(), "");
  checks.push("New plans have an empty budget input; no million-rupee default");
  const modelIdsBefore = (
    await (await context.request.get(`${origin}/api/v1/ml`)).json()
  ).jobs.map((j) => j.id);
  const plans = [];
  for (const amount of ["50000", "10000", "100000", "1000000", "54321.87"]) {
    await budget.fill(amount);
    assert.equal(await page.getByTestId("plan-budget").count(), 0);
    const response = page.waitForResponse(
      (r) =>
        r.url().endsWith("/optimizer/plans") && r.request().method() === "POST",
    );
    await page
      .getByRole("button", { name: "Generate recommendation", exact: true })
      .click();
    const result = await response;
    assert.equal(result.status(), 201, await result.text());
    const plan = await result.json();
    await page.getByTestId("plan-budget").waitFor();
    assert.equal(plan.totals.budget, Number(amount));
    assert.equal(
      plan.allocations.reduce((sum, a) => sum + Math.round(a.budget * 100), 0),
      Math.round(Number(amount) * 100),
    );
    assert(plan.prediction_rows > 0);
    plans.push(plan);
    checks.push(
      `UI amount ${amount} reaches API/model and allocations total exactly; stale estimates hidden`,
    );
  }
  assert.notEqual(
    plans[0].totals.estimated_revenue,
    plans[1].totals.estimated_revenue,
  );
  assert.deepEqual(
    (await (await context.request.get(`${origin}/api/v1/ml`)).json()).jobs.map(
      (j) => j.id,
    ),
    modelIdsBefore,
  );
  checks.push("Budget changes update predictions without retraining");
  for (const width of [1440, 1024, 768, 390, 375]) {
    await page.setViewportSize({ width, height: 1000 });
    await page.waitForTimeout(600);
    const overflow = await page.evaluate(() => ({
      width: innerWidth,
      scroll: document.documentElement.scrollWidth,
      items: [...document.querySelectorAll("main *")]
        .filter(
          (el) =>
            el.getBoundingClientRect().right > innerWidth &&
            getComputedStyle(el).position !== "absolute",
        )
        .slice(0, 12)
        .map((el) => ({
          tag: el.tagName,
          cls: el.className,
          text: el.textContent.slice(0, 100),
        })),
    }));
    if (overflow.scroll > width) {
      console.log(JSON.stringify(overflow));
      await page.screenshot({
        path: "docs/screenshots/critical-overflow.png",
        fullPage: true,
      });
    }
    assert(overflow.scroll <= width, `Budget overflow at ${width}`);
    if ([1440, 375].includes(width))
      await page.screenshot({
        path: `docs/screenshots/debug-budget-${width}.png`,
        fullPage: true,
      });
    checks.push(`Budget result responsive at ${width}px`);
  }
  await page
    .getByLabel("Planning method", { exact: true })
    .selectOption("historical");
  const heuristicResponse = page.waitForResponse(
    (r) =>
      r.url().endsWith("/optimizer/plans") && r.request().method() === "POST",
  );
  await page
    .getByRole("button", { name: "Generate recommendation", exact: true })
    .click();
  const heuristic = await heuristicResponse;
  assert.equal(heuristic.status(), 201, await heuristic.text());
  assert.match((await heuristic.json()).method_label, /no ML/);
  checks.push("Explicit historical fallback is labelled no ML");
  await budget.fill("100000000");
  const unsupportedResponse = page.waitForResponse(
    (r) =>
      r.url().endsWith("/optimizer/plans") && r.request().method() === "POST",
  );
  await page
    .getByRole("button", { name: "Generate recommendation", exact: true })
    .click();
  const unsupported = await unsupportedResponse;
  assert.equal(unsupported.status(), 201);
  assert.equal((await unsupported.json()).totals.estimated_revenue, null);
  await page
    .getByText("Allocation only · revenue forecast unavailable.", {
      exact: true,
    })
    .waitFor();
  checks.push(
    "Large budget remains feasible while unsupported revenue is withheld",
  );
  await budget.fill("0");
  assert(
    await page
      .getByRole("button", { name: "Generate recommendation", exact: true })
      .isDisabled(),
  );
  checks.push("Zero budget blocked before submission");
  for (const width of [1440, 375]) {
    await page.setViewportSize({ width, height: 1000 });
    for (const route of [
      "",
      "data-studio",
      "campaigns",
      "ml-studio",
      "budget-optimizer",
      "big-data-lab",
      "help",
    ]) {
      await page.goto(`${origin}/${route}`);
      await page.locator("h1").waitFor();
      await page.waitForTimeout(300);
      assert(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth,
        ),
        `${route} overflows at ${width}`,
      );
    }
    checks.push(
      `All seven routes reviewed without page overflow at ${width}px`,
    );
  }
  assert.deepEqual(errors, []);
  await writeFile(
    "docs/phase-34-debug-browser-results.json",
    JSON.stringify({ checks, errors }, null, 2),
  );
  console.log(JSON.stringify({ checks, errors }));
} finally {
  await context.request.put(`${origin}/api/v1/workspace/dataset`, {
    data: { dataset_id: previous },
  });
  for (const id of created)
    await context.request.delete(`${origin}/api/v1/datasets/${id}`);
  const after = await ws();
  assert.equal(after.selected_dataset_id, previous);
  assert.deepEqual(
    after.datasets.map((d) => d.id).sort(),
    before.datasets.map((d) => d.id).sort(),
  );
  await browser.close();
}
