# University demonstration

This is the local single-user advertising budget optimizer, Project 2. All demo
campaigns and forecasts are synthetic. No accounts, API keys or live spending
are needed. The interface uses the Adwise name.

## Prepare

Install using the root README, then start both services in terminal 1:

```sh
npm run dev
```

Keep that terminal open. In terminal 2, from the repository root:

```sh
npm run demo
```

This command generates or reuses the exact 10,000-row seed-42 campaign source
(2026-01-01 to 2026-03-31, all five platforms), selects it, actually trains and
evaluates a new local revenue model, reloads it for evaluation, and saves three
advisory plans. It never relaxes acceptance gates. If fitting or acceptance
fails, it exits with an error and preserves the measured report for inspection.
Running it again reuses the source but creates a new model and plan versions.
It does not overwrite existing datasets or model artifacts. Other datasets are
kept separate. To prepare evidence and restore the previous selection instead:

```sh
npm run demo -- --restore-selection
```

Evidence is written under ignored `reports/phase5/`: `manifest.json`, weighted
analytics, readiness, model evaluation, re-evaluation, and JSON/CSV plans. These
are actual API results, not a script's independent calculations. The script only
checks that allocated amounts sum exactly using decimal arithmetic. Its fixed
as-of date is 2026-10-29 and plan start is 2026-10-30; keep those dates for this
reproducible academic scenario. It is not a current merchant forecast.

## Walk through the application

Open [the local app](http://127.0.0.1:3000).

| Screen | Demonstrate | Explain |
| --- | --- | --- |
| Data Studio | Inspect the selected 10K source, provenance, field coverage and paged preview | Generated rows are simulated PKR campaign observations; large lab inputs are a separate namespace |
| Overview | Spend/revenue/ROAS, platform comparison and date trend; filter to Google | Ratios use summed numerators/denominators; revenue is attributed revenue, not profit |
| Campaigns | Reset filters, change grouping, sort, page, expand chart table, export | Backend aggregates and filters; the browser does not load a large dataset |
| ML Studio | Inspect the newest trained model, baseline/holdout errors and diagnostics; choose Evaluate saved model and Export evaluation | XGBoost is fitted locally; complete dates split chronologically; outcomes and simulator truth are excluded from features |
| Budget Optimizer | Set PKR 1,000,000, start 2026-10-30, label as-of 2026-10-29, seven days, Automatic, 0%–100% limits; generate and export | The accepted source-matched model supplies candidate predictions; displayed response adjustments impose disclosed planning assumptions |
| Budget Optimizer | Change Google maximum share to 20%, regenerate; then try PKR 500 | Constraints change the allocation. Small unsupported scenarios can still allocate exactly while withholding revenue/ROAS |
| Big Data Lab | Inspect a saved correct run, repeats, setup time, memory, environment and exports | Pandas, local MapReduce and local Spark run the same aggregation; local measurements are not distributed-cluster claims |
| Help & about | Open definitions and future-scope notes | Recommendations are advisory; commerce and live integrations are later work |

When a saved plan is restored, its inputs are restored too. Review dates, method
and limits before generating. Editing an input hides stale estimates. If manually
training again in ML Studio, set its as-of date to 2026-10-29 to reproduce this
scenario. Synthetic data uses an effective maturity lag of zero.

## Demonstrate a CSV import

In Data Studio, choose **Bring an advertising CSV** and use
`backend/tests/fixtures/daily_budget_training.csv`. It is a deliberately synthetic
500-row fixture, not an advertiser export. Inspect mapping confidence, reporting
rules and missing optional conversion counts; validate, confirm permission and
save. Missing counts do not invent conversions or block revenue-only training.
The weekly fixture is also synthetic; it preserves whole weeks.

For a missing-revenue example save this as `synthetic-no-revenue.csv`, then import
it as a generic campaign file:

```csv
date,campaign,platform,spend,is_synthetic
2026-01-01,Missing revenue demo,Google,100,true
2026-01-02,Missing revenue demo,Google,150,true
```

Spend analytics remain usable; missing revenue stays unavailable. Unknown
reporting definitions may remain unknown for analytics. Do not claim a synthetic
fixture is real data.
Exact duplicate imports are rejected: select the already saved source or use a
fresh local workspace instead of changing its source labels.

## Reproduce the measured Big Data matrix

The recorded four-scale evidence is under `docs/phase-2-benchmark-*`, with method
and environment in `docs/phase-2-methodology.md`. These results were measured on
October 28, 2026; Phase 5 does not relabel them as fresh timings. To remeasure:

```sh
.venv/bin/python scripts/benchmark_phase2.py
```

Run this alone, without tests, model training or builds running concurrently.
It executes all four scales, three engines and three repeats, and overwrites the
Phase 2 evidence files with actual new results. Save a copy first if you need
the old evidence. The 10M path uses bounded Parquet chunks, not a 10M-row browser
table. Spark requires the project-local compatible Java/PySpark runtime described
in the README. Missing runtimes and resource failures must remain visible.

For a short live demonstration without replacing the full matrix files, choose
10K in Big Data Lab and press **Start benchmark**. Review all three engine results
and download that run's report. Do not present a partial matrix as the full one.

## Verify before presenting

```sh
npm run verify
npm run demo -- --restore-selection
npm run test:e2e
```

`verify` runs type/lint checks, the full backend suite, Ruff, formatting and a
production build sequentially; its results are in `reports/phase5/checks.json`.
It configures the already installed bundled macOS OpenMP library as the dev
launcher does. The required direct commands remain documented in the README.
Run these on the local host with permission to open loopback sockets and inspect
child processes. Spark tests must not be skipped merely to obtain a green result.

The browser command requires the demo manifest and running services. It runs
import/analytics/weekly-training/budget regressions followed by a seven-route,
seven-width audit. It uses disposable regression sources and restores selection;
the prepared demo and its saved plans remain inspectable. Run it without
concurrently editing datasets in the app. Install Chromium if needed:

```sh
npm --prefix frontend exec -- playwright install chromium
```

Alternatively set `CHROMIUM_EXECUTABLE` to a verified installed Chromium binary.
On the reviewed Mac, Chromium 153.0.8010.12 is available at this cache path:

```sh
CHROMIUM_EXECUTABLE="$HOME/Library/Caches/ms-playwright/chromium_headless_shell-1243/chrome-headless-shell-mac-arm64/chrome-headless-shell" npm run test:e2e
```

That cache revision is machine-specific; use the install command above if it is
absent on another computer.
The final browser report records its actual version. The suite also launches a
fresh 10K three-engine benchmark with three correctness-checked repeats per
engine; it saves `docs/phase-5-benchmark.json` and `.csv` separately from the
historical four-scale matrix. Browser evidence and
screenshots are under `docs/phase-5-*` and `docs/screenshots/phase-5-*`.

## Explain the limits

Synthetic backtests establish software behavior, not real merchant accuracy.
Historical spend is a proxy for planned spend. The fixed campaign mix and
concave response assumptions do not prove causal uplift. Forecast uncertainty
is not calibrated. Cross-platform attribution may overlap; revenue is not
profit. Current use is offline/local, single-user and unauthenticated. No Shopify
orders importer, live connections, automatic spending or Project 1 integration
is included. Those facts do not block the academic demonstration.
