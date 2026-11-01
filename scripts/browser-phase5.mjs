import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { createRequire } from "node:module";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { root } from "./runtime-env.mjs";

const require = createRequire(
  new URL("../frontend/package.json", import.meta.url),
);
const { chromium } = require("playwright");
const origin = process.env.TEST_ORIGIN || "http://127.0.0.1:3000";
const checks = [];
// Existing full workflows cover CSV validation/recovery, weekly training and changed budgets.
for (const script of process.argv.includes("--audit-only")
  ? []
  : ["browser-phase1.mjs", "browser-phase34-debug.mjs"]) {
  console.log(`Running ${script}`);
  const code = await new Promise((resolve) => {
    const child = spawn(process.execPath, [`${root}scripts/${script}`], {
      cwd: root,
      stdio: "inherit",
    });
    child.on("error", () => resolve(1));
    child.on("exit", (code) => resolve(code ?? 1));
  });
  assert.equal(code, 0, `${script} failed`);
  checks.push(`${script}: complete regression journey passed`);
}
const demo = JSON.parse(
  await readFile(`${root}reports/phase5/manifest.json`, "utf8"),
);
const browser = await chromium.launch({
  headless: true,
  executablePath: process.env.CHROMIUM_EXECUTABLE,
});
const browserVersion = browser.version();
const context = await browser.newContext({
  viewport: { width: 1440, height: 1000 },
  reducedMotion: "reduce",
  acceptDownloads: true,
});
const page = await context.newPage();
const errors = [];
const consoleErrors = [];
page.on("pageerror", (error) => errors.push(error.message));
page.on("console", (message) => {
  if (message.type() === "error") consoleErrors.push(message.text());
});
const workspace = async () =>
  (await context.request.get(`${origin}/api/v1/workspace`)).json();
const before = await workspace();
const select = async (id) =>
  assert.equal(
    (
      await context.request.put(`${origin}/api/v1/workspace/dataset`, {
        data: { dataset_id: id },
      })
    ).status(),
    200,
  );
await mkdir(`${root}docs/screenshots`, { recursive: true });
try {
  await select(null);
  await page.goto(origin);
  await page.getByText("You choose the amount", { exact: true }).waitFor();
  assert.equal(
    await page.getByText("Rs. 1,000,000", { exact: true }).count(),
    0,
  );
  checks.push(
    "Empty Overview gives user-entered budget guidance without a default amount",
  );
  await select(demo.dataset_id);
  await page.goto(`${origin}/big-data-lab`);
  await page.getByLabel("Dataset scale", { exact: true }).selectOption("10000");
  const labPending = page.waitForResponse(
    (r) => r.url().endsWith("/lab/jobs") && r.request().method() === "POST",
  );
  await page
    .getByRole("button", { name: "Start benchmark", exact: true })
    .click();
  const labResponse = await labPending;
  assert.equal(labResponse.status(), 202, await labResponse.text());
  let lab = await labResponse.json();
  const deadline = Date.now() + 120000;
  while (
    !["completed", "failed", "cancelled", "interrupted"].includes(lab.status)
  ) {
    if (Date.now() > deadline) {
      await context.request.post(`${origin}/api/v1/lab/jobs/${lab.id}/cancel`);
      throw new Error(
        "Live benchmark exceeded 120 seconds; cancellation requested",
      );
    }
    await page.waitForTimeout(500);
    lab = await (
      await context.request.get(`${origin}/api/v1/lab/jobs/${lab.id}`)
    ).json();
  }
  assert.equal(lab.status, "completed", JSON.stringify(lab));
  assert.deepEqual(lab.results.map((r) => r.engine).sort(), [
    "mapreduce",
    "pandas",
    "spark",
  ]);
  for (const result of lab.results) {
    assert.equal(result.status, "completed");
    assert.equal(result.runs.length, 3);
    assert(result.runs.every((run) => run.correct));
  }
  for (const format of ["json", "csv"]) {
    const exported = await context.request.get(
      `${origin}/api/v1/lab/jobs/${lab.id}/export?format=${format}`,
    );
    assert.equal(exported.status(), 200);
    await writeFile(
      `${root}docs/phase-5-benchmark.${format}`,
      await exported.body(),
    );
  }
  checks.push(
    "Live Big Data Lab button completed 10K rows across three engines with three correct measured repeats each; JSON/CSV exports saved",
  );
  for (const width of [1440, 1280, 1024, 768, 430, 390, 375]) {
    await page.setViewportSize({ width, height: width < 640 ? 844 : 1000 });
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
      if (["", "campaigns"].includes(route))
        await page.getByTestId("metric-spend").waitFor();
      else if (route === "data-studio")
        await page
          .getByRole("heading", { name: "Selected dataset preview" })
          .waitFor();
      else if (route === "budget-optimizer")
        await page.getByLabel("Total budget (PKR)", { exact: true }).waitFor();
      else if (route === "ml-studio")
        await page
          .getByRole("button", { name: "Train revenue model", exact: true })
          .waitFor();
      else if (route === "big-data-lab")
        await page
          .getByRole("button", { name: "Start benchmark", exact: true })
          .waitFor();
      else
        await page
          .getByText("A few useful definitions", { exact: true })
          .waitFor();
      await page.waitForTimeout(250);
      if (route === "big-data-lab") {
        const tickLabels = page.locator(
          ".recharts-yAxis-tick-labels .recharts-cartesian-axis-tick-value",
        );
        await tickLabels.first().waitFor();
        const ticks = await tickLabels.allTextContents();
        assert(
          ticks.length >= 2 && new Set(ticks).size === ticks.length,
          `Runtime axis must distinguish ticks: ${ticks}`,
        );
      }
      assert.match(
        await page.title(),
        new RegExp(
          `${route ? { "data-studio": "Data Studio", campaigns: "Campaigns", "ml-studio": "ML Studio", "budget-optimizer": "Budget Optimizer", "big-data-lab": "Big Data Lab", help: "Help & about" }[route] : "Overview"} · Adwise`,
        ),
      );
      const audit = await page.evaluate(() => {
        const visible = (el) =>
          el.getClientRects().length > 0 &&
          getComputedStyle(el).visibility !== "hidden";
        const controls = [
          ...document.querySelectorAll(
            "main input, main select, main textarea",
          ),
        ].filter(visible);
        const unnamed = controls
          .filter(
            (el) =>
              el.type !== "hidden" &&
              !el.labels?.length &&
              !el.getAttribute("aria-label") &&
              !el.getAttribute("aria-labelledby"),
          )
          .map((el) => el.outerHTML.slice(0, 200));
        const rgb = (color) => color.match(/[\d.]+/g)?.map(Number);
        const luminance = (color) =>
          color
            .slice(0, 3)
            .map((v) => v / 255)
            .map((v) =>
              v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4,
            )
            .reduce(
              (sum, value, i) => sum + value * [0.2126, 0.7152, 0.0722][i],
              0,
            );
        const lowContrast = [
          ...document.querySelectorAll(
            ".button, .nav-link, main input, main select, main summary",
          ),
        ]
          .filter((el) => visible(el) && !el.disabled && el.type !== "checkbox")
          .flatMap((el) => {
            const style = getComputedStyle(el);
            let background;
            for (let parent = el; parent; parent = parent.parentElement) {
              const color = rgb(getComputedStyle(parent).backgroundColor);
              if (color && (color.length === 3 || color[3] === 1)) {
                background = color;
                break;
              }
            }
            const foreground = rgb(style.color);
            if (!background || !foreground) return [];
            const a = luminance(foreground),
              b = luminance(background);
            const ratio = (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
            const large =
              parseFloat(style.fontSize) >= 24 ||
              (parseFloat(style.fontSize) >= 18.67 &&
                Number(style.fontWeight) >= 700);
            return ratio + 0.01 < (large ? 3 : 4.5)
              ? [
                  {
                    text: (
                      el.textContent ||
                      el.getAttribute("aria-label") ||
                      el.type
                    ).slice(0, 70),
                    ratio,
                  },
                ]
              : [];
          });
        return {
          overflow: document.documentElement.scrollWidth > innerWidth,
          headings: document.querySelectorAll("h1").length,
          main: document.querySelectorAll("main").length,
          unnamed,
          lowContrast,
          reduced: matchMedia("(prefers-reduced-motion: reduce)").matches,
        };
      });
      assert.deepEqual(
        audit,
        {
          overflow: false,
          headings: 1,
          main: 1,
          unnamed: [],
          lowContrast: [],
          reduced: true,
        },
        `${route || "overview"} at ${width}: ${JSON.stringify(audit)}`,
      );
      if ([1440, 375].includes(width)) {
        await page.screenshot({
          path: `${root}docs/screenshots/phase-5-${route || "overview"}-${width}.png`,
          fullPage: true,
        });
      }
      checks.push(
        `${route || "overview"} at ${width}px: no overflow, labelled fields, unique title, main/h1, control text contrast and reduced motion`,
      );
    }
  }
  await page.goto(`${origin}/help`);
  const skip = page.getByRole("link", { name: "Skip to content" });
  await page.keyboard.press("Tab");
  assert(await skip.evaluate((el) => document.activeElement === el));
  assert(
    await skip.evaluate((el) => getComputedStyle(el).outlineStyle !== "none"),
  );
  await page.keyboard.press("Enter");
  assert(
    await page.locator("main").evaluate((el) => document.activeElement === el),
  );
  checks.push(
    "First keyboard stop is the visibly focused skip link; Enter focuses main",
  );
  await page.getByRole("button", { name: "Open navigation" }).click();
  const dialog = page.getByRole("dialog");
  await dialog.waitFor();
  for (let i = 0; i < 12; i++) {
    await page.keyboard.press("Tab");
    assert(await dialog.evaluate((el) => el.contains(document.activeElement)));
  }
  await page.keyboard.press("Escape");
  await dialog.waitFor({ state: "hidden" });
  assert(
    await page
      .getByRole("button", { name: "Open navigation" })
      .evaluate((el) => el === document.activeElement),
  );
  checks.push(
    "Mobile navigation traps keyboard focus, closes with Escape and restores focus",
  );
  await page.goto(`${origin}/budget-optimizer`);
  const budget = page.getByLabel("Total budget (PKR)", { exact: true });
  await budget.waitFor();
  // Saved plans may be selected; editing always hides their previous estimates.
  await budget.fill("1000000");
  await page.getByLabel("Start date", { exact: true }).fill("2026-10-30");
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
  assert.equal(plan.model_id, demo.model_id);
  assert.equal(plan.totals.budget, 1000000);
  assert(plan.prediction_rows > 0);
  await page.getByTestId("plan-budget").waitFor();
  await page.locator("h1").click();
  for (const width of [1440, 768, 375]) {
    await page.setViewportSize({ width, height: width < 640 ? 844 : 1000 });
    await page.waitForTimeout(350);
    assert(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    );
    await page.screenshot({
      path: `${root}docs/screenshots/phase-5-plan-${width}.png`,
      fullPage: true,
    });
  }
  checks.push(
    "Prepared seeded demo uses its actual accepted model in a cent-exact plan on desktop/tablet/mobile",
  );
  assert.deepEqual(errors, []);
  assert.deepEqual(consoleErrors, []);
  checks.push(
    "No captured JavaScript runtime or error-level console messages during final audit",
  );
} finally {
  await select(before.selected_dataset_id);
  assert.equal(
    (await workspace()).selected_dataset_id,
    before.selected_dataset_id,
  );
  assert.deepEqual(
    (await workspace()).datasets.map((d) => d.id).sort(),
    before.datasets.map((d) => d.id).sort(),
  );
  await browser.close();
}
const regressionCounts = await Promise.all(
  ["phase-1-browser-results.json", "phase-34-debug-browser-results.json"].map(
    async (name) => {
      const data = JSON.parse(await readFile(`${root}docs/${name}`, "utf8"));
      return { report: name, checks: (data.results || data.checks).length };
    },
  ),
);
await writeFile(
  `${root}docs/phase-5-browser-results.json`,
  JSON.stringify(
    {
      checked_at: new Date().toISOString(),
      origin,
      browser_version: browserVersion,
      regressions_executed_this_invocation:
        !process.argv.includes("--audit-only"),
      checks,
      regressionCounts,
      errors,
      consoleErrors,
      selected_dataset_restored: true,
    },
    null,
    2,
  ) + "\n",
);
console.log(
  `Passed ${checks.length} final checks plus ${regressionCounts.reduce((s, r) => s + r.checks, 0)} regression checks.`,
);
