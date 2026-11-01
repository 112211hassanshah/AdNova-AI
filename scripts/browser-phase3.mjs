import assert from "node:assert/strict";
import { mkdir, writeFile } from "node:fs/promises";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
const require = createRequire(
  new URL("../frontend/package.json", import.meta.url),
);
const { chromium } = require("playwright");
const origin = process.env.TEST_ORIGIN || "http://127.0.0.1:3000";
const output = fileURLToPath(new URL("../docs/screenshots/", import.meta.url));
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
const results = [],
  errors = [],
  created = [];
let previous;
page.on("pageerror", (error) => errors.push(error.message));
const workspace = async () =>
  (await context.request.get(`${origin}/api/v1/workspace`)).json();
const select = async (id) => {
  const r = await context.request.put(`${origin}/api/v1/workspace/dataset`, {
    data: { dataset_id: id },
  });
  assert.equal(r.status(), 200);
};
const check = (condition, text) => {
  assert.ok(condition, text);
  results.push(text);
};
const shot = (name) =>
  page.screenshot({ path: `${output}/${name}`, fullPage: true });
try {
  previous = (await workspace()).selected_dataset_id;
  await select(null);
  await page.goto(`${origin}/ml-studio`);
  await page
    .getByRole("heading", { name: "Give your model a history to learn from." })
    .waitFor();
  results.push("Empty ML Studio directs the user to campaign data");
  const smallResponse = await context.request.post(
    `${origin}/api/v1/datasets/generate`,
    {
      data: {
        name: "Phase 3 readiness QA",
        rows: 100,
        seed: Date.now() % 4294967295,
      },
    },
  );
  assert.equal(smallResponse.status(), 201);
  const small = await smallResponse.json();
  created.push(small.id);
  await page.reload();
  await page.getByText(/Need 300 mature rows/).waitFor();
  check(
    await page
      .getByRole("button", { name: "Train revenue model", exact: true })
      .isDisabled(),
    "Insufficient history blocks training with a real readiness explanation",
  );
  await shot("phase-3-insufficient-1440.png");
  const state = await workspace();
  let demo = state.datasets.find(
    (d) => d.is_synthetic && d.seed === 42 && d.rows === 10000,
  );
  if (!demo) {
    const r = await context.request.post(`${origin}/api/v1/datasets/generate`, {
      data: { name: "Phase 3 revenue-model demo", rows: 10000, seed: 42 },
    });
    assert.equal(r.status(), 201);
    demo = await r.json();
  }
  await select(demo.id);
  await page.reload();
  await page
    .getByRole("button", { name: "Train revenue model", exact: true })
    .waitFor();
  await page.waitForFunction(
    () => !document.querySelector(".ml-form button")?.disabled,
  );
  await page
    .getByRole("button", { name: "Train revenue model", exact: true })
    .click();
  await page
    .getByText("Training and holdout evaluation completed.", { exact: true })
    .waitFor({ timeout: 120000 });
  const ml = await (await context.request.get(`${origin}/api/v1/ml`)).json();
  const job = ml.jobs[0];
  check(
    job.status === "succeeded" && job.result.algorithm === "XGBoost",
    "Train button runs an actual local XGBoost fit and sealed holdout evaluation",
  );
  check(
    job.result.splits.train.end < job.result.splits.validation.start &&
      job.result.splits.validation.end < job.result.splits.test.start,
    "Complete dates remain chronologically separated",
  );
  check(
    job.result.test.model.rows > 0 && job.result.test.baseline.rmse > 0,
    "Holdout model and baseline metrics are actual nonempty measurements",
  );
  await page.getByRole("button", { name: "Evaluate saved model" }).click();
  await page.getByText(/Re-evaluated the same sealed holdout/).waitFor();
  results.push(
    "Explicit Evaluate reloads persisted weights and re-measures the same holdout",
  );
  const downloadPromise = page.waitForEvent("download");
  await page.getByRole("link", { name: "Export evaluation" }).click();
  const download = await downloadPromise;
  check(
    download.suggestedFilename().endsWith(".json"),
    "Evaluation JSON export is downloadable",
  );
  await page
    .getByText("View diagnostics & methodology", { exact: true })
    .click();
  await page.getByRole("heading", { name: "Acceptance policy" }).waitFor();
  check(
    (await page.getByText(/Prediction uncertainty is not quantified/).count()) >
      0,
    "Diagnostics disclose uncertainty and causal limits",
  );
  await shot("phase-3-diagnostics-1440.png");
  await page
    .getByText("View diagnostics & methodology", { exact: true })
    .click();
  if (job.result.acceptance.eligible) {
    await page
      .getByRole("button", { name: "Estimate revenue", exact: true })
      .click();
    await page
      .getByText("Estimated attributed revenue", { exact: true })
      .waitFor();
    check(
      (await page.locator(".ml-prediction strong").textContent()).startsWith(
        "Rs.",
      ),
      "Eligible model produces a real source-labelled future campaign-day estimate",
    );
    const bad = await context.request.post(
      `${origin}/api/v1/ml/models/${job.id}/predict`,
      { data: { date: "2026-10-29", platform: "Google", spend: 1e9 } },
    );
    check(bad.status() === 422, "Server rejects extrapolated spend");
  } else {
    check(
      (await page
        .getByRole("button", { name: "Estimate revenue", exact: true })
        .count()) === 0,
      "A failed acceptance policy blocks prediction without hiding measured results",
    );
  }
  await shot("phase-3-studio-1440.png");
  await page.reload();
  await page
    .getByText("Training and holdout evaluation completed.", { exact: true })
    .waitFor();
  results.push("Completed model and history survive navigation/reload");
  for (const width of [1440, 1280, 1024, 768, 430, 390, 375]) {
    await page.setViewportSize({ width, height: 1000 });
    await page.waitForTimeout(150);
    check(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= window.innerWidth,
      ),
      `ML Studio has no page overflow at ${width}px`,
    );
    if (width === 375) await shot("phase-3-studio-375.png");
  }
  await page.getByRole("button", { name: "Open navigation" }).click();
  await page
    .getByRole("dialog")
    .getByRole("link", { name: "Overview", exact: true })
    .click();
  await page.getByTestId("metric-spend").waitFor();
  check(
    (await page.locator(".analytics-next").textContent()).includes(
      job.result.acceptance.eligible ? "validated" : "trained",
    ),
    "Overview shows the actual selected-dataset model status",
  );
  for (const width of [1440, 375]) {
    await page.setViewportSize({ width, height: 1000 });
    for (const path of [
      "/",
      "/data-studio",
      "/campaigns",
      "/ml-studio",
      "/budget-optimizer",
      "/big-data-lab",
      "/help",
    ]) {
      await page.goto(`${origin}${path}`);
      await page.locator(".page-footer").waitFor();
      await page.waitForTimeout(100);
      check(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= window.innerWidth,
        ),
        `Route ${path} fits ${width}px`,
      );
    }
  }
  await page.goto(`${origin}/ml-studio`);
  await page
    .getByText("Training and holdout evaluation completed.", { exact: true })
    .waitFor();
  await page.route("**/api/v1/ml", (route) =>
    route.fulfill({
      status: 503,
      contentType: "application/json",
      body: '{"detail":"QA outage"}',
    }),
  );
  await page.reload();
  await page.getByRole("button", { name: "Retry ML Studio" }).waitFor();
  await page.unroute("**/api/v1/ml");
  await page.getByRole("button", { name: "Retry ML Studio" }).click();
  await page
    .getByText("Training and holdout evaluation completed.", { exact: true })
    .waitFor();
  results.push("ML service outage has a working retry recovery");
  check(
    errors.length === 0,
    "No captured browser JavaScript or hydration errors",
  );
  await writeFile(
    new URL("../docs/phase-3-demo-evaluation.json", import.meta.url),
    JSON.stringify(job, null, 2),
  );
  await writeFile(
    new URL("../docs/phase-3-browser-results.json", import.meta.url),
    JSON.stringify({ results, errors, model_id: job.id }, null, 2),
  );
  console.log(
    JSON.stringify(
      {
        checks: results.length,
        errors,
        eligible: job.result.acceptance,
        metrics: job.result.test,
      },
      null,
      2,
    ),
  );
  // Keep the evaluated demo selected for user review.
  previous = demo.id;
} finally {
  if (previous !== undefined) await select(previous);
  for (const id of created)
    await context.request.delete(`${origin}/api/v1/datasets/${id}`);
  await browser.close();
}
