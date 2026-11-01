import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { readFile, writeFile } from "node:fs/promises";
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
  acceptDownloads: true,
});
const page = await context.newPage();
const checks = [],
  errors = [];
page.on("pageerror", (error) => errors.push(error.message));
const get = async (path) => {
  const response = await context.request.get(`${origin}/api/v1${path}`);
  assert.equal(response.status(), 200, await response.text());
  return response.json();
};
const before = await get("/workspace");
const beforeCommerce = await get("/commerce");
const fixture = (name) =>
  `${root}backend/src/ads_optimizer/commerce/fixtures/${name}`;
let pilotReport, profitReport, cappedReport;
async function auditCommerce() {
  const audit = await page.evaluate(() => {
    const visible = (el) =>
      el.getClientRects().length > 0 &&
      getComputedStyle(el).visibility !== "hidden";
    const controls = [
      ...document.querySelectorAll("main input, main select, main textarea"),
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
        .map((v) => (v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4))
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
    `Commerce accessibility: ${JSON.stringify(audit)}`,
  );
}

async function importPanel() {
  const panel = page.locator(".commerce-upload-panel");
  if (!(await panel.evaluate((el) => el.open)))
    await panel.locator(":scope > summary").click();
}
async function commit() {
  const validationPending = page.waitForResponse(
    (r) =>
      r.url().includes("/commerce/imports/") &&
      r.url().endsWith("/validate") &&
      r.request().method() === "POST",
  );
  await page
    .getByRole("button", { name: "Validate commerce import", exact: true })
    .click();
  const validation = await validationPending;
  assert.equal(validation.status(), 200, await validation.text());
  const validated = await validation.json();
  assert(validated.can_import, JSON.stringify(validated));
  await page
    .getByRole("heading", { name: "Ready for commerce review", exact: true })
    .waitFor();
  await page
    .getByLabel(
      "I have permission and reviewed the definitions and validation",
      { exact: true },
    )
    .check();
  const pending = page.waitForResponse(
    (r) =>
      r.url().includes("/commerce/imports/") &&
      r.url().endsWith("/commit") &&
      r.request().method() === "POST",
  );
  await page
    .getByRole("button", {
      name: "Confirm and save commerce snapshot",
      exact: true,
    })
    .click();
  const response = await pending;
  assert.equal(response.status(), 201, await response.text());
  const saved = await response.json();
  await page
    .getByText(`${saved.name} saved in the separate commerce workspace.`, {
      exact: true,
    })
    .waitFor();
  return saved;
}
async function saveComparison() {
  const pending = page.waitForResponse(
    (r) =>
      r.url().endsWith("/commerce/reconciliations") &&
      r.request().method() === "POST",
  );
  await page
    .getByRole("button", { name: "Save commerce reconciliation", exact: true })
    .click();
  const response = await pending;
  assert.equal(response.status(), 201, await response.text());
  await page.getByTestId("commerce-store-net").waitFor();
  return response.json();
}
async function expandComparison() {
  const details = page.locator(".commerce-reconcile > details");
  if (!(await details.evaluate((el) => el.open)))
    await details.locator(":scope > summary").click();
}
try {
  await page.goto(`${origin}/commerce`);
  await page.getByLabel("Selected orders snapshot", { exact: true }).waitFor();
  assert.match(await page.title(), /Commerce & Attribution · Adwise/);
  await importPanel();
  await page
    .getByLabel("Commerce CSV file", { exact: true })
    .setInputFiles(fixture("pilot-shopify.csv"));
  await page.getByLabel("Map commerce order_id", { exact: true }).waitFor();
  assert.equal(
    await page
      .getByLabel("Map commerce order_id", { exact: true })
      .inputValue(),
    "Name",
  );
  await page
    .getByLabel("Snapshot name", { exact: true })
    .fill("Phase 6 synthetic browser orders");
  await page
    .getByLabel("Store identifier", { exact: true })
    .fill(`qa_${Date.now()}`);
  await page
    .getByLabel("Snapshot as-of date", { exact: true })
    .fill("2026-10-30");
  await page
    .getByLabel("Export coverage start", { exact: true })
    .fill("2026-01-01");
  await page
    .getByLabel("Export coverage end", { exact: true })
    .fill("2026-01-03");
  await page
    .getByLabel("Commerce subtotal definition", { exact: true })
    .selectOption("after_discounts");
  await page
    .getByLabel(
      "This contains all store orders in the explicit coverage window",
      { exact: true },
    )
    .check();
  await page
    .getByLabel("I verified refund completeness at the snapshot date", {
      exact: true,
    })
    .check();
  await auditCommerce();
  const orders = await commit();
  assert.equal(orders.orders, 8);
  assert.equal(orders.line_items, 9);
  assert(orders.is_synthetic);
  checks.push(
    "Shopify UI maps Name/line items, removes personal columns, preserves synthetic markers and saves eight unique orders from nine lines",
  );
  await importPanel();
  await page
    .getByLabel("Commerce file type", { exact: true })
    .selectOption("expenses");
  await page
    .getByLabel("Commerce CSV file", { exact: true })
    .setInputFiles(fixture("pilot-expenses.csv"));
  await page.getByLabel("Map commerce cogs", { exact: true }).waitFor();
  await page
    .getByLabel("Snapshot name", { exact: true })
    .fill("Phase 6 synthetic browser costs");
  const costs = await commit();
  assert.equal(costs.cost_rows, 8);
  checks.push(
    "Order expenses import attaches to the same store/snapshot, with explicit zeroes and all cost categories retained",
  );
  const staged = await (
    await context.request.post(
      `${origin}/api/v1/imports/preview?filename=phase6-outcomes-ads.csv&profile=generic`,
      {
        data: await readFile(fixture("pilot-ads.csv")),
        headers: { "Content-Type": "text/csv" },
      },
    )
  ).json();
  const adResponse = await context.request.post(
    `${origin}/api/v1/imports/${staged.token}/commit`,
    {
      data: {
        name: "Phase 6 synthetic outcome ads",
        mapping: staged.suggested_mapping,
        confirmed: true,
      },
    },
  );
  let ad;
  if (adResponse.status() === 409) {
    ad = (await get("/workspace")).datasets.find(
      (d) =>
        d.is_synthetic &&
        d.rows === 6 &&
        d.date_start === "2026-01-01" &&
        d.date_end === "2026-01-03",
    );
    assert(ad);
  } else {
    assert.equal(adResponse.status(), 201, await adResponse.text());
    ad = await adResponse.json();
  }
  // Refresh the shell's ad catalog while restoring the saved independent orders selection.
  await page.reload();
  await page.getByLabel("Selected orders snapshot", { exact: true }).waitFor();
  await expandComparison();
  await page
    .getByLabel("Commerce advertising report", { exact: true })
    .selectOption(ad.id);
  await page.getByLabel(`${costs.name} · expenses`, { exact: true }).check();
  await page
    .getByText(
      "Confirm UTM-to-campaign evidence when identifiers need a mapping",
      { exact: true },
    )
    .click();
  await page
    .getByRole("button", { name: "Add verified UTM mapping", exact: true })
    .click();
  await page
    .getByLabel("UTM source 1", { exact: true })
    .fill("merchant-google");
  await page
    .getByLabel("UTM campaign 1", { exact: true })
    .fill("winter-launch");
  await page
    .getByLabel("Verified paid campaign 1", { exact: true })
    .selectOption({ label: "Google · g-01 · main" });
  await page
    .getByLabel("I verified these UTM associations against campaign evidence", {
      exact: true,
    })
    .check();
  await page
    .getByLabel("This advertising report belongs only to the selected store", {
      exact: true,
    })
    .check();
  await page
    .getByLabel(
      "I verified comparable store-local dates and reporting timezones",
      { exact: true },
    )
    .check();
  await page
    .getByText("Store reference totals and shipping definition", {
      exact: true,
    })
    .click();
  await page
    .getByLabel("Reference merchandise net sales (PKR)", { exact: true })
    .fill("6400");
  await page
    .getByLabel("Reference eligible paid orders", { exact: true })
    .fill("6");
  pilotReport = await saveComparison();
  assert.equal(pilotReport.store.net_sales, 640000);
  assert.equal(pilotReport.advertising.platform_reported_revenue, 1200000);
  assert.equal(pilotReport.attribution.matched_net_sales, 515000);
  assert.equal(pilotReport.profit.contribution_after_ads, 169000);
  for (const [id, value] of [
    ["commerce-store-net", "Rs. 6,400"],
    ["commerce-ad-revenue", "Rs. 12,000"],
    ["commerce-matched-net", "Rs. 5,150"],
    ["commerce-contribution", "Rs. 1,690"],
  ])
    assert.equal(await page.getByTestId(id).textContent(), value);
  assert(
    await page
      .getByRole("button", {
        name: "Contribution-profit forecast unavailable",
        exact: true,
      })
      .isDisabled(),
  );
  checks.push(
    "Actual backend and UI match independent hand totals: store net 6400, platform revenue 12000, matched net 5150 and contribution 1690 PKR; insufficient attribution blocks profit forecasts",
  );
  await page
    .getByLabel("Show commerce attribution outcomes", { exact: true })
    .selectOption("unmatched");
  await page.getByText("Page 1 · 1 outcomes", { exact: true }).waitFor();
  checks.push(
    "Pseudonymous attribution filtering exposes the unmatched order without guessing a channel from its domain",
  );
  const download = page.waitForEvent("download");
  await page
    .getByRole("link", { name: "Attribution CSV", exact: true })
    .click();
  assert.match((await download).suggestedFilename(), /^commerce-synthetic-/);
  checks.push("Source-labelled attribution CSV downloads successfully");
  await page.locator("h1").click();
  for (const width of [1440, 375]) {
    await page.setViewportSize({ width, height: 1000 });
    await page.waitForTimeout(200);
    assert(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    );
    await page.screenshot({
      path: `${root}docs/screenshots/phase-6-pilot-${width}.png`,
      fullPage: true,
    });
  }
  await expandComparison();
  await page
    .getByLabel("Reference merchandise net sales (PKR)", { exact: true })
    .fill("6500");
  assert.equal(await page.getByTestId("commerce-store-net").count(), 0);
  const discrepancy = await saveComparison();
  assert.equal(discrepancy.reference.net_sales_difference, -100);
  checks.push(
    "Editing a comparison hides stale metrics; a supplied 6500 reference exposes the measured minus-100 PKR discrepancy",
  );
  await expandComparison();
  await page.getByLabel(`${costs.name} · expenses`, { exact: true }).uncheck();
  const missing = await saveComparison();
  assert.equal(missing.costs.total, null);
  assert.equal(missing.profit.contribution_after_ads, null);
  assert.equal(
    await page.getByTestId("commerce-contribution").textContent(),
    "Not available",
  );
  checks.push(
    "Removing cost evidence preserves unavailable contribution instead of replacing expenses with zero",
  );
  const demoPending = page.waitForResponse(
    (r) =>
      r.url().includes("/commerce/demo?variant=history") &&
      r.request().method() === "POST",
  );
  await page
    .getByRole("button", {
      name: "Try complete fictional history",
      exact: true,
    })
    .click();
  const demoResponse = await demoPending;
  assert.equal(demoResponse.status(), 201, await demoResponse.text());
  await page.getByLabel("Profit-plan budget (PKR)", { exact: true }).waitFor();
  const amount = page.getByLabel("Profit-plan budget (PKR)", { exact: true });
  assert.equal(await amount.inputValue(), "");
  await amount.fill("5000.37");
  await page
    .getByLabel("Profit-plan start date", { exact: true })
    .fill("2026-10-31");
  const createProfit = async () => {
    const pending = page.waitForResponse(
      (r) =>
        r.url().endsWith("/commerce/profit-plans") &&
        r.request().method() === "POST",
    );
    await page
      .getByRole("button", {
        name: "Generate contribution-profit plan",
        exact: true,
      })
      .click();
    const response = await pending;
    assert.equal(response.status(), 201, await response.text());
    await page.getByTestId("commerce-plan-budget").waitFor();
    return response.json();
  };
  profitReport = await createProfit();
  assert(profitReport.assessment.eligible);
  assert.equal(profitReport.result.budget, 5000.37);
  assert.equal(
    profitReport.result.allocations.reduce(
      (sum, row) => sum + Math.round(row.budget * 100),
      0,
    ),
    500037,
  );
  checks.push(
    "Complete fictional history passes actual chronological response evaluation and produces an exact 5000.37 PKR advisory profit plan",
  );
  await amount.fill("7500.19");
  assert.equal(await page.getByTestId("commerce-plan-budget").count(), 0);
  await page
    .getByText(
      "Enabled platforms, share limits and actual account restrictions",
      { exact: true },
    )
    .click();
  await page
    .getByLabel("Commerce YouTube max_percent", { exact: true })
    .fill("20");
  const capped = await createProfit();
  cappedReport = capped;
  assert.equal(
    capped.result.allocations.reduce(
      (sum, row) => sum + Math.round(row.budget * 100),
      0,
    ),
    750019,
  );
  assert(
    capped.result.allocations.find((row) => row.platform === "YouTube")
      .budget <=
      7500.19 * 0.2 + 0.00001,
  );
  assert.equal(
    capped.result.allocations.find((row) => row.platform === "YouTube").budget,
    0,
  );
  checks.push(
    "What-if budget changes hide stale estimates; a binding 20% YouTube cap falls below positive historical support, so YouTube receives zero and the remaining platforms total exactly",
  );
  const planDownload = page.waitForEvent("download");
  await page
    .getByRole("link", { name: "Export profit allocation CSV", exact: true })
    .click();
  assert.match(
    (await planDownload).suggestedFilename(),
    /^commerce-synthetic-/,
  );
  checks.push("Evaluated profit allocations export with synthetic provenance");
  const savedPlan = page.getByLabel("Saved contribution-profit plan", {
    exact: true,
  });
  await savedPlan.selectOption(profitReport.manifest.id);
  await page
    .getByRole("button", { name: "Restore saved profit plan", exact: true })
    .click();
  await page
    .getByTestId("commerce-plan-budget")
    .filter({ hasText: "Rs. 5,000.37" })
    .waitFor();
  assert.equal(await amount.inputValue(), "5000.37");
  await savedPlan.selectOption(capped.manifest.id);
  await page
    .getByRole("button", { name: "Restore saved profit plan", exact: true })
    .click();
  await page
    .getByTestId("commerce-plan-budget")
    .filter({ hasText: "Rs. 7,500.19" })
    .waitFor();
  checks.push(
    "Saved immutable profit plans restore their exact budget, constraints and source-bound results",
  );
  await page.locator("h1").click();
  for (const width of [1440, 1280, 1024, 768, 430, 390, 375]) {
    await page.setViewportSize({ width, height: width < 640 ? 844 : 1000 });
    await page.waitForTimeout(200);
    assert(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
      `Commerce overflow at ${width}`,
    );
    if ([1440, 375].includes(width))
      await page.screenshot({
        path: `${root}docs/screenshots/phase-6-profit-${width}.png`,
        fullPage: true,
      });
    await auditCommerce();
    if ([1440, 375].includes(width)) {
      const opener = page.getByRole("button", {
        name: "Delete selected orders snapshot",
        exact: true,
      });
      await opener.click();
      const dialog = page.getByRole("dialog");
      await dialog.waitFor();
      for (let i = 0; i < 6; i++) {
        await page.keyboard.press("Tab");
        assert(
          await dialog.evaluate((el) => el.contains(document.activeElement)),
        );
      }
      await page.keyboard.press("Escape");
      await dialog.waitFor({ state: "hidden" });
      assert(await opener.evaluate((el) => document.activeElement === el));
    }
    checks.push(
      `Commerce result, controls, tables and profit plan contained at ${width}px`,
    );
  }
  checks.push(
    "Visible commerce fields labelled, one main/h1, control text contrast and reduced motion checked; deletion dialog traps focus and restores it on Escape at desktop/mobile",
  );
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.screenshot({
    path: `${root}docs/screenshots/phase-6-mobile-top.png`,
  });
  await page
    .locator(".commerce-plan-head")
    .screenshot({ path: `${root}docs/screenshots/phase-6-mobile-plan.png` });
  await amount.fill("500");
  const unsupportedPending = page.waitForResponse(
    (r) =>
      r.url().endsWith("/commerce/profit-plans") &&
      r.request().method() === "POST",
  );
  await page
    .getByRole("button", {
      name: "Generate contribution-profit plan",
      exact: true,
    })
    .click();
  assert.equal((await unsupportedPending).status(), 422);
  await page
    .getByText(/This budget has no supported profit forecast/)
    .waitFor();
  assert.equal(await page.getByTestId("commerce-plan-budget").count(), 0);
  checks.push(
    "Unsupported small-budget profit forecast is withheld with an actionable remedy; no estimated profit is invented",
  );
  await page.route("**/api/v1/commerce", (route) =>
    route.fulfill({ status: 503, contentType: "application/json", body: "{}" }),
  );
  await page.goto(`${origin}/commerce`);
  await page
    .getByRole("button", { name: "Retry commerce workspace", exact: true })
    .waitFor();
  await page.unroute("**/api/v1/commerce");
  await page
    .getByRole("button", { name: "Retry commerce workspace", exact: true })
    .click();
  await page.getByLabel("Selected orders snapshot", { exact: true }).waitFor();
  checks.push(
    "Commerce workspace service failure displays a retry and recovers without fabricated financial data",
  );
  for (const width of [1440, 375]) {
    await page.setViewportSize({ width, height: 1000 });
    for (const route of [
      "",
      "data-studio",
      "campaigns",
      "commerce",
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
        `${route} overflows at ${width}`,
      );
    }
    checks.push(
      `All nine application routes reviewed at ${width}px with the new commerce navigation`,
    );
  }
  assert.deepEqual(errors, []);
  await writeFile(
    `${root}docs/phase-6-outcomes.json`,
    JSON.stringify(
      {
        pilot: pilotReport,
        profit: profitReport,
        capped_profit: cappedReport,
        source:
          "Actual API results on explicitly fictional fixtures; not merchant validation.",
      },
      null,
      2,
    ) + "\n",
  );
} finally {
  await context.request.put(`${origin}/api/v1/workspace/dataset`, {
    data: { dataset_id: before.selected_dataset_id },
  });
  const latest = await get("/commerce");
  for (const kind of ["profit_plan", "reconciliation", "costs", "orders"]) {
    const prior = new Set(beforeCommerce[kind].map((meta) => meta.id));
    for (const meta of latest[kind])
      if (!prior.has(meta.id)) {
        const response = await context.request.delete(
          `${origin}/api/v1/commerce/snapshots/${meta.id}`,
        );
        assert([200, 404].includes(response.status()));
      }
  }
  await context.request.put(`${origin}/api/v1/commerce/selection`, {
    data: { order_batch_id: beforeCommerce.selected_order_batch_id },
  });
  const oldAds = new Set(before.datasets.map((meta) => meta.id));
  for (const meta of (await get("/workspace")).datasets)
    if (!oldAds.has(meta.id))
      assert.equal(
        (
          await context.request.delete(`${origin}/api/v1/datasets/${meta.id}`)
        ).status(),
        200,
      );
  assert.equal(
    (await get("/workspace")).selected_dataset_id,
    before.selected_dataset_id,
  );
  assert.equal(
    (await get("/commerce")).selected_order_batch_id,
    beforeCommerce.selected_order_batch_id,
  );
  await browser.close();
}
await writeFile(
  `${root}docs/phase-6-browser-results.json`,
  JSON.stringify(
    {
      checked_at: new Date().toISOString(),
      checks,
      errors,
      original_selections_restored: true,
    },
    null,
    2,
  ) + "\n",
);
console.log(`Passed ${checks.length} Phase 6 browser/outcome checks.`);
