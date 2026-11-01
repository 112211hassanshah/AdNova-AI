import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { mkdir, writeFile } from "node:fs/promises";
import { root } from "./runtime-env.mjs";
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
page.on("pageerror", (error) => errors.push(error.message));
const workspace = async () =>
  (await context.request.get(`${origin}/api/v1/workspace`)).json();
const select = async (id) =>
  assert.equal(
    (
      await context.request.put(`${origin}/api/v1/workspace/dataset`, {
        data: { dataset_id: id },
      })
    ).status(),
    200,
  );
const before = await workspace();
let created;
try {
  const sourceResponse = await context.request.post(
    `${origin}/api/v1/datasets/generate`,
    {
      data: {
        name: "Disposable synthetic NVIDIA browser QA",
        rows: 1000,
        seed: Date.now() % 4294967295,
      },
    },
  );
  assert.equal(sourceResponse.status(), 201);
  created = (await sourceResponse.json()).id;
  await page.goto(`${origin}/ai-assistant`);
  await page.getByLabel("NVIDIA summary preview").waitFor();
  await page
    .getByRole("button", { name: "Test NVIDIA access", exact: true })
    .waitFor();
  assert.match(await page.title(), /AI Assistant · Adwise/);
  assert.equal(
    await page.getByLabel("NVIDIA API key", { exact: true }).inputValue(),
    "",
  );
  const status = await (
    await context.request.get(`${origin}/api/v1/ai/status`)
  ).json();
  assert(status.configured, "Configure NVIDIA before the live browser journey");
  assert(!JSON.stringify(status).includes("nvapi-"));
  checks.push(
    "AI route has a unique title and configured status without returning or prefilling the saved key",
  );
  const connectionPending = page.waitForResponse(
    (response) =>
      response.url().endsWith("/ai/test") &&
      response.request().method() === "POST",
    { timeout: 45000 },
  );
  await page
    .getByRole("button", { name: "Test NVIDIA access", exact: true })
    .click();
  const connection = await connectionPending;
  assert.equal(connection.status(), 200, await connection.text());
  assert((await connection.json()).verified);
  await page
    .getByText("NVIDIA API responded successfully", { exact: true })
    .waitFor();
  checks.push(
    "Real NVIDIA connection check succeeded without sending report data",
  );
  const send = page.getByRole("button", {
    name: "Explain this report",
    exact: true,
  });
  assert(await send.isDisabled());
  const approval = page.getByLabel(
    "Send this summary to NVIDIA for an AI-generated explanation.",
    { exact: true },
  );
  const preview = await page.getByLabel("NVIDIA summary preview").textContent();
  assert(JSON.parse(preview).is_synthetic);
  assert(!preview.includes("Disposable") && !preview.includes("Campaign 001"));
  checks.push(
    "Only the displayed synthetic aggregate summary is eligible; explanation starts disabled until approval",
  );
  await approval.check();
  const answerPending = page.waitForResponse(
    (response) =>
      response.url().endsWith("/ai/explain") &&
      response.request().method() === "POST",
    { timeout: 45000 },
  );
  await send.click();
  const answerResponse = await answerPending;
  assert.equal(answerResponse.status(), 200, await answerResponse.text());
  const answer = await answerResponse.json();
  assert(answer.text && answer.is_synthetic && !/\d/.test(answer.text));
  assert(!JSON.stringify(answer).includes("reasoning_content"));
  await page
    .getByRole("heading", { name: "AI-generated explanation", exact: true })
    .waitFor();
  assert.equal(await approval.isChecked(), false);
  checks.push(
    "Actual hosted model explained the synthetic report; only final text displayed, numeric claims withheld and approval reset",
  );
  await mkdir(`${root}docs/screenshots`, { recursive: true });
  for (const width of [1440, 1280, 1024, 768, 430, 390, 375]) {
    await page.setViewportSize({ width, height: width < 640 ? 844 : 1000 });
    await page.waitForTimeout(200);
    assert(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
      `AI page overflows at ${width}`,
    );
    if ([1440, 375].includes(width))
      await page.screenshot({
        path: `${root}docs/screenshots/nvidia-assistant-${width}.png`,
        fullPage: true,
      });
    checks.push(`Actual answer and summary remain contained at ${width}px`);
  }
  const report = page.getByLabel("Report to explain", { exact: true });
  await report.selectOption("model");
  await page
    .getByText(
      "Train and evaluate a model for this dataset in ML Studio first.",
      { exact: true },
    )
    .waitFor();
  assert.equal(
    await page
      .getByRole("heading", { name: "AI-generated explanation", exact: true })
      .count(),
    0,
  );
  await report.selectOption("budget");
  await page
    .getByText(
      "Generate a saved plan for this dataset in Budget Optimizer first.",
      { exact: true },
    )
    .waitFor();
  checks.push(
    "Missing model/plan evidence shows genuine remedies and clears the previous AI answer",
  );
  await report.selectOption("performance");
  await page.getByLabel("NVIDIA summary preview").waitFor();
  assert(await send.isDisabled());
  await approval.check();
  await page.route("**/api/v1/ai/explain", (route) =>
    route.fulfill({
      status: 429,
      contentType: "application/json",
      body: JSON.stringify({
        detail: "NVIDIA's rate limit was reached. Wait and try again.",
      }),
    }),
  );
  await send.click();
  await page
    .getByText("NVIDIA's rate limit was reached. Wait and try again.", {
      exact: true,
    })
    .waitFor();
  assert.equal(
    await page
      .getByRole("heading", { name: "AI-generated explanation", exact: true })
      .count(),
    0,
  );
  await page.unroute("**/api/v1/ai/explain");
  checks.push(
    "Simulated rate-limit UI state is recoverable and invents no answer; separate from real provider evidence",
  );
  await page.getByRole("button", { name: "Open navigation" }).click();
  const drawer = page.getByRole("dialog");
  await drawer
    .getByRole("link", { name: "AI Assistant", exact: true })
    .waitFor();
  await page.keyboard.press("Escape");
  checks.push(
    "Mobile navigation includes the new AI route and closes with Escape",
  );
  await select(null);
  await page.reload();
  await page
    .getByRole("heading", {
      name: "Choose a campaign report first.",
      exact: true,
    })
    .waitFor();
  checks.push(
    "No selection leaves provider settings usable and requires data before explaining",
  );
  for (const width of [1440, 375]) {
    await select(created);
    await page.setViewportSize({ width, height: 1000 });
    for (const route of [
      "",
      "data-studio",
      "campaigns",
      "ml-studio",
      "budget-optimizer",
      "big-data-lab",
      "ai-assistant",
      "help",
    ]) {
      await page.goto(`${origin}/${route}`);
      await page.locator("h1").waitFor();
      await page.waitForTimeout(200);
      assert(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth,
        ),
        `${route} at ${width}`,
      );
    }
    checks.push(
      `All eight routes remain contained at ${width}px with the additional navigation item`,
    );
  }
  assert.deepEqual(errors, []);
  await writeFile(
    `${root}docs/nvidia-live-example.json`,
    JSON.stringify(
      { explanation: answer, summary: JSON.parse(preview) },
      null,
      2,
    ) + "\n",
  );
} finally {
  await select(before.selected_dataset_id);
  if (created)
    assert.equal(
      (
        await context.request.delete(`${origin}/api/v1/datasets/${created}`)
      ).status(),
      200,
    );
  const after = await workspace();
  assert.equal(after.selected_dataset_id, before.selected_dataset_id);
  assert.deepEqual(
    after.datasets.map((dataset) => dataset.id).sort(),
    before.datasets.map((dataset) => dataset.id).sort(),
  );
  await browser.close();
}
await writeFile(
  `${root}docs/nvidia-browser-results.json`,
  JSON.stringify(
    {
      checked_at: new Date().toISOString(),
      checks,
      errors,
      original_selection_restored: true,
    },
    null,
    2,
  ) + "\n",
);
console.log(
  `Passed ${checks.length} NVIDIA browser checks with a real synthetic explanation.`,
);
