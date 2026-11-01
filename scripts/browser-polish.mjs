import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { root } from "./runtime-env.mjs";
import { auditTextContrast } from "./contrast-audit.mjs";
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
const errors = [],
  checks = [],
  surfaces = [];
page.on("pageerror", (error) => errors.push(error.message));
const get = async (path) => {
  const response = await context.request.get(`${origin}/api/v1${path}`);
  assert.equal(response.status(), 200, await response.text());
  return response.json();
};
const select = async (id) =>
  assert.equal(
    (
      await context.request.put(`${origin}/api/v1/workspace/dataset`, {
        data: { dataset_id: id },
      })
    ).status(),
    200,
  );
const before = await get("/workspace");
const demo = JSON.parse(
  await readFile(`${root}reports/phase5/manifest.json`, "utf8"),
);
await mkdir(`${root}docs/screenshots`, { recursive: true });
let generated;
try {
  await select(null);
  await page.goto(origin);
  await page
    .getByRole("heading", { name: "Your first plan starts with a report." })
    .waitFor();
  await page.getByRole("link", { name: /No campaign history/ }).click();
  await page
    .getByRole("heading", { name: "Which path fits your situation?" })
    .waitFor();
  assert.match(page.url(), /help#no-data/);
  await page
    .getByText("Are the model and allocations fair?", { exact: true })
    .click();
  await page.getByText(/demographic fairness has not been audited/).waitFor();
  checks.push(
    "Empty workspace offers working no-history guidance, including explicit fairness and first-campaign limits",
  );
  await page
    .getByRole("link", { name: "Explore demo and import options" })
    .click();
  await page.getByText("No CSV yet? Start here.", { exact: true }).click();
  await page.getByText(/download a daily or weekly campaign report/i).waitFor();
  await page
    .getByLabel("Dataset name", { exact: true })
    .fill("Disposable polish onboarding demo");
  await page.getByLabel("Random seed", { exact: true }).fill("20261101");
  await page.getByLabel("Record count", { exact: true }).selectOption("1000");
  await page
    .getByRole("button", { name: "Generate demo", exact: true })
    .click();
  await page
    .getByRole("link", { name: "Review performance", exact: true })
    .waitFor();
  generated = (await get("/workspace")).selected_dataset_id;
  await page
    .getByRole("link", { name: "Review performance", exact: true })
    .click();
  await page.getByTestId("metric-spend").waitFor();
  await page
    .locator(".journey")
    .getByRole("link", { name: /Check model/ })
    .click();
  await page
    .getByRole("button", { name: "Train revenue model", exact: true })
    .waitFor();
  checks.push(
    "First-time demo generation, review CTA and clickable journey reach real analytics and ML readiness without a key",
  );
  await select(demo.dataset_id);
  await page.goto(`${origin}/budget-optimizer`);
  await page.getByLabel("Total budget (PKR)", { exact: true }).waitFor();
  const sampling = page.getByLabel("Curve sampling interval (PKR, optional)", {
    exact: true,
  });
  assert.equal(await sampling.isVisible(), false);
  await page.getByText("Advanced: curve sampling", { exact: true }).click();
  assert.equal(await sampling.isVisible(), true);
  await page.getByText("Advanced: curve sampling", { exact: true }).click();
  await page.getByLabel("Total budget (PKR)", { exact: true }).fill("500");
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
  assert.equal(plan.totals.estimated_revenue, null);
  assert.equal(
    plan.allocations.reduce(
      (sum, row) => sum + Math.round(row.budget * 100),
      0,
    ),
    50000,
  );
  await page.getByText("How should I use this plan?", { exact: true }).click();
  await page
    .getByText(/not a prediction of which platform will earn more/)
    .waitFor();
  checks.push(
    "Advanced sampling stays optional; actual PKR 500 allocation is exact, with no revenue claim and a readable interpretation",
  );
  const aiOutbound = [];
  await page.route("**/api/v1/ai/explain", (route) => {
    aiOutbound.push(route.request().postData());
    return route.fulfill({
      status: 500,
      body: JSON.stringify({ detail: "Unexpected send blocked by audit" }),
    });
  });
  await page.goto(`${origin}/ai-assistant`);
  await page.getByLabel("NVIDIA summary preview").waitFor();
  const summary = JSON.parse(
    await page.getByLabel("NVIDIA summary preview").textContent(),
  );
  assert(summary.is_synthetic);
  assert(!JSON.stringify(summary).includes(demo.dataset_id));
  assert(!JSON.stringify(summary).includes("University demo"));
  const explanation = page.getByRole("button", {
    name: "Explain this report",
    exact: true,
  });
  assert(await explanation.isDisabled());
  await page
    .getByLabel(
      "Send this summary to NVIDIA for an AI-generated explanation.",
      { exact: true },
    )
    .check();
  assert(
    await explanation.isDisabled(),
    "No credential in disposable workspace must keep send disabled",
  );
  await page
    .getByRole("button", { name: "Refresh summary", exact: true })
    .click();
  await page.getByLabel("NVIDIA summary preview").waitFor();
  assert.equal(
    await page
      .getByLabel(
        "Send this summary to NVIDIA for an AI-generated explanation.",
        { exact: true },
      )
      .isChecked(),
    false,
  );
  assert.equal(aiOutbound.length, 0);
  checks.push(
    "NVIDIA local summary works without credentials; approval resets on refresh and no explanation/provider call was made",
  );
  await page.unroute("**/api/v1/ai/explain");
  const routes = [
    "",
    "data-studio",
    "campaigns",
    "ml-studio",
    "budget-optimizer",
    "big-data-lab",
    "commerce",
    "ai-assistant",
    "help",
  ];
  for (const width of [1440, 1280, 1024, 768, 430, 390, 375]) {
    await page.setViewportSize({ width, height: width < 640 ? 844 : 1000 });
    for (const route of routes) {
      await page.goto(`${origin}/${route}`);
      await page.locator("h1").waitFor();
      if (["", "campaigns"].includes(route))
        await page.getByTestId("metric-spend").waitFor();
      else if (route === "data-studio")
        await page
          .getByRole("heading", {
            name: "Selected dataset preview",
            exact: true,
          })
          .waitFor();
      else if (route === "ml-studio")
        await page
          .getByRole("button", { name: "Train revenue model", exact: true })
          .waitFor();
      else if (route === "budget-optimizer")
        await page.getByLabel("Total budget (PKR)", { exact: true }).waitFor();
      else if (route === "ai-assistant")
        await page.getByLabel("NVIDIA summary preview").waitFor();
      else if (route === "commerce")
        await page
          .getByRole("heading", {
            name: /Inspect the numbers before trusting a forecast/,
          })
          .waitFor();
      else if (route === "big-data-lab")
        await page
          .getByRole("button", { name: "Start benchmark", exact: true })
          .waitFor();
      else
        await page
          .getByText("A few useful definitions", { exact: true })
          .waitFor();
      await page.waitForTimeout(150);
      const audit = await page.evaluate(() => {
        const visible = (el) =>
          el.getClientRects().length > 0 &&
          getComputedStyle(el).visibility !== "hidden";
        const unnamed = [
          ...document.querySelectorAll(
            "main input, main select, main textarea",
          ),
        ]
          .filter(visible)
          .filter(
            (el) =>
              el.type !== "hidden" &&
              !el.labels?.length &&
              !el.getAttribute("aria-label") &&
              !el.getAttribute("aria-labelledby"),
          )
          .map((el) => el.outerHTML.slice(0, 200));
        return {
          overflow: document.documentElement.scrollWidth > innerWidth,
          headings: document.querySelectorAll("h1").length,
          main: document.querySelectorAll("main").length,
          unnamed,
          reducedMotion: matchMedia("(prefers-reduced-motion: reduce)").matches,
        };
      });
      assert.deepEqual(
        audit,
        {
          overflow: false,
          headings: 1,
          main: 1,
          unnamed: [],
          reducedMotion: true,
        },
        `${route || "overview"} at ${width}`,
      );
      const lowContrast = await page.evaluate(auditTextContrast);
      assert.deepEqual(
        lowContrast,
        [],
        `${route || "overview"} text contrast at ${width}`,
      );
      surfaces.push({
        route: route || "overview",
        width,
        ...audit,
        lowContrast,
      });
      if (
        [1440, 375].includes(width) &&
        [
          "",
          "data-studio",
          "ml-studio",
          "budget-optimizer",
          "help",
          "ai-assistant",
        ].includes(route)
      )
        await page.screenshot({
          path: `${root}docs/screenshots/polish-${route || "overview"}-${width}.png`,
          fullPage: true,
        });
    }
  }
  checks.push(
    "All nine routes checked at seven widths for overflow, unique main/h1, form labels, rendered HTML text contrast and reduced-motion preference",
  );
  await page.setViewportSize({ width: 375, height: 844 });
  await page.goto(origin);
  const menu = page.getByRole("button", {
    name: "Open navigation",
    exact: true,
  });
  await menu.click();
  const dialog = page.getByRole("dialog", { name: "Workspace navigation" });
  await dialog.waitFor();
  for (let i = 0; i < 15; i++) {
    await page.keyboard.press("Tab");
    assert(await dialog.evaluate((el) => el.contains(document.activeElement)));
  }
  await page.keyboard.press("Escape");
  assert(await menu.evaluate((el) => el === document.activeElement));
  checks.push(
    "Mobile navigation traps keyboard focus, closes on Escape and restores focus to its trigger",
  );
  await page.route("**/api/v1/workspace", (route) =>
    route.fulfill({ status: 503, body: "{}" }),
  );
  await page.goto(`${origin}/help`);
  await page
    .getByRole("button", { name: "Retry connection", exact: true })
    .waitFor();
  await page
    .getByRole("heading", {
      name: "From first visit to a considered plan.",
      exact: true,
    })
    .waitFor();
  await page.getByText("How does NVIDIA help?", { exact: true }).click();
  await page
    .getByText(/NVIDIA only turns a previewed qualitative summary/)
    .waitFor();
  checks.push(
    "Help and its task guidance remain usable during a simulated backend outage",
  );
  await page.unroute("**/api/v1/workspace");
  await select(null);
  await page.goto(origin);
  await page
    .getByRole("heading", {
      name: "Your first plan starts with a report.",
      exact: true,
    })
    .waitFor();
  await page.screenshot({
    path: `${root}docs/screenshots/polish-start-375.png`,
    fullPage: true,
  });
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.screenshot({
    path: `${root}docs/screenshots/polish-start-1440.png`,
    fullPage: true,
  });
  await page.emulateMedia({ forcedColors: "active" });
  assert.equal(
    await page
      .locator(".start-guide")
      .evaluate((el) => getComputedStyle(el).backdropFilter),
    "none",
  );
  checks.push(
    "Forced-colors mode disables surface blur; opaque fallback remains available",
  );
  assert.deepEqual(errors, []);
  checks.push("No captured JavaScript page errors");
} finally {
  if (generated)
    await context.request.delete(`${origin}/api/v1/datasets/${generated}`);
  await select(before.selected_dataset_id);
  await browser.close();
  await writeFile(
    `${root}docs/polish-browser-results.json`,
    JSON.stringify(
      {
        checked_at: new Date().toISOString(),
        checks,
        surfaces,
        page_errors: errors,
        provider_calls: 0,
        notes: [
          "Disposable ADS_DATA_DIR workspace; original merchant data and credentials unused",
          "NVIDIA external service was not reverified; backend contract tests use a simulated provider",
          "Responsive and keyboard audit is not a human usability study or full accessibility certification",
        ],
      },
      null,
      2,
    ) + "\n",
  );
}
console.log(
  JSON.stringify(
    {
      checks: checks.length,
      responsive_surfaces: surfaces.length,
      page_errors: errors,
    },
    null,
    2,
  ),
);
