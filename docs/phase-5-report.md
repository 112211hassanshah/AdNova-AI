# Phase 5 completion report

Completed October 30, 2026: university demonstration, acceptance review and final
local QA. This is the academic deliverable for Phases 0–5, not merchant/production
certification. Phase 6 has not started. No delegation, Project 1 access, new
dependency, live connection or spending action was used.

## Delivered

- `npm run demo`: fixed seed-42, 10,000-row synthetic campaign scenario, real
  XGBoost training, persisted-model re-evaluation and exact-budget advisory plans.
  Generated data is reused only when configuration matches; existing sources and
  model versions are preserved. Optional selection restoration is supported.
- `npm run verify`: sequential type/lint, full pytest, Ruff, format and production
  build checks. Shares the dev launcher's existing macOS OpenMP discovery through
  `scripts/runtime-env.mjs`; no system library installation is required here.
- `npm run test:e2e`: full import/analytics/recovery, weekly training and changed-
  budget regression journeys, then the final desktop/mobile review and a live
  10K three-engine benchmark. `--audit-only` is an internal rerun option that reuses
  the separately saved regression results; the report discloses that option.
- [Instructor walkthrough](university-demo.md), fixed scenario controls, CSV
  example, exact commands, evidence locations, benchmark reproduction and limits.
- Removed the stale million-PKR amount from empty Overview, updated Help/footer
  scope, and added distinct document titles for route announcements. Runtime
  chart ticks now preserve sub-second precision instead of repeating rounded
  labels. Existing light rounded design, model gates and optimization policy stay.

## Verification

All required commands passed on this local environment. The sequential verifier
records actual exit codes and durations in ignored `reports/phase5/checks.json`;
a copy is retained as `phase-5-checks.json`.

| Check | Result |
| --- | --- |
| `npm run check` | TypeScript and ESLint passed |
| `.venv/bin/python -m pytest` with documented macOS OpenMP environment | **149 passed, zero skips**, including real XGBoost and existing Spark/MapReduce |
| `.venv/bin/ruff check backend scripts` | Passed |
| `npm run format:check` | Passed |
| `npm run build` | Passed, all application routes generated |
| Browser regressions | **23** import/analytics/recovery checks + **24** weekly training/budget checks passed |
| Final browser audit | **55 checks**: seven routes × seven widths, empty budget guidance, live benchmark, focus/skip navigation, model plan and error capture |

The final audit covers 1440, 1280, 1024, 768, 430, 390 and 375px. It verifies
no horizontal page overflow, one main/h1, visible form labels, distinct titles,
enabled control/navigation text contrast on opaque surfaces, reduced-motion
preference, and distinct runtime-axis tick labels. Mobile navigation traps focus,
Escape closes it and restores focus; the first Tab reaches a visible skip link
and Enter focuses main. Existing regression checks exercise chart tables,
loading/error/retry/empty states, CSV downloads, deletion confirmation, invalid
dates/mappings and stale estimate removal. No final page-level JavaScript errors
or error-level console messages were captured. Original dataset selection and
dataset list were restored; only synthetic demo models/plans and measured lab
records persist. Desktop/mobile screenshots were visually reviewed.

Browser: Chromium **153.0.8010.12**, using the explicit installed executable.
This bounded review is not a full assistive-technology/WCAG certification or a
Firefox/WebKit audit. Contrast checks do not cover every chart pixel, opacity
blend or unexercised state.

## Actual demo and benchmark evidence

`phase-5-demo.json` is a copy of the actual API-driven demo manifest; its full
evaluation and CSV/JSON plans are under ignored `reports/phase5/`.

- Synthetic XGBoost holdout RMSE: **7,195.26 PKR**, versus baseline **10,415.53**;
  MAE **5,202.99**, WAPE **51.05%**, R² **0.4371**, 1,936 holdout rows. This is
  measured synthetic error, not an accuracy percentage or merchant validation.
- The PKR **1,000,000** scenario used **82,957** actual candidate predictions
  from the accepted saved model. Adjusted estimated revenue was **8,260,574.92
  PKR**, under disclosed simulated response assumptions, not a revenue guarantee.
- PKR **54,321.87** and **500** allocated exactly but withheld unsupported
  revenue/ROAS. Changing a budget does not retrain the model.
- A fresh 10K benchmark completed three repeats per engine with **9/9 correct**
  results. See `phase-5-benchmark.json` and `.csv` for actual observations, setup,
  resources and environment. Times include projected Parquet reads and aggregation;
  setup is separate and OS/JVM caches are not flushed. This is a local smoke run.
- The historical 10K/100K/1M/10M matrix was inspected: all **36** recorded repeats
  were correct. Original October 28 timestamp and evidence remain unchanged.
  Phase 5 does not claim to have rerun the entire matrix.

## Academic acceptance reconciliation

| Required outcome in `agent.md` | Evidence / disposition |
| --- | --- |
| Independent one-command launch | `npm run dev`; observed Next.js + FastAPI startup and live browser/API journeys |
| Required canonical fields generated/imported and validated | Generator/import tests; `data_dictionary.md`; bounded source preview |
| No-key synthetic demo with visible labels | Seeded demo plus reviewed Overview, ML and plan screenshots |
| Advertiser CSV mapping and missing-field warnings | Generic/Meta/Google/TikTok import profiles; fixture/HTTP/browser checks; provider certification is not claimed |
| Correct weighted KPIs and zero denominators | Numeric/HTTP tests, filtered UI versus actual backend totals |
| Bounded 10K/100K/1M/10M generation | Existing chunked Parquet implementation, tests and historical four-scale evidence |
| Real Pandas/local MapReduce/PySpark parity | Fresh 9-repeat run, existing parity tests and historical 36-repeat matrix |
| Measured repeatable benchmark reports and honest failures | Separate setup, repeats, resources, environment, checksums and JSON/CSV exports |
| Actual trained/evaluated/versioned ML without outcome-feature leakage | Native XGBoost tests, chronological splits, sealed evaluation and source-bound artifacts |
| Exact user-entered PKR allocations under constraints | Decimal/cent tests, five changed-budget browser cases and small-budget no-forecast cases |
| Data, evaluation and plan exports with provenance/caveats | HTTP exports and browser download tests; demo evidence files |
| Functional navigation, failures and responsive UI | Seven-route review plus error/retry/empty/keyboard journeys |
| Installation, data, models, benchmarks, tests and integration documentation | README, instructor guide, methods and phase reports; Project 1 stays an independent future host via versioned API/service adapters |
| Secrets, customer uploads, binaries and large runtime files excluded from Git | Runtime directories and `.env.local` ignored; no files committed or staged by this phase |

The root acceptance checklist is reconciled with this evidence. Business-pilot
and production exit checks remain open intentionally.

## Problems found and resolved

The first raw pytest invocation had 143 passes and six failures because the
documented OpenMP environment was missing. Native XGBoost could not load, causing
fallback-related assertions to fail. With the existing bundled library path,
all 149 passed; the serial verification command now applies the same environment
as the dev launcher. No training threshold was weakened.

Playwright's expected browser cache revision was absent. The installed Chromium
was selected via the documented `CHROMIUM_EXECUTABLE` override; no browser package
or lockfile was changed. The Phase 1 test also tried to edit a correctly disabled,
header-detected Purchases definition. It now verifies that detected value instead
of forcing an edit. Stale Data Studio Phase 2 wording, empty-budget copy and runtime-axis tick precision were fixed
after UI review. No unresolved required check failure remains.

## Remaining scope

Local single-user operation without authentication. No calibrated forecast
uncertainty, causal uplift proof, representative real-merchant backtests or profit
validation. Monthly/mixed-grain imports and decimal-comma amounts still need
preprocessing. Fixed campaign-mix and spend-response assumptions remain explicit.
Full screen-reader certification and multi-browser/security reviews remain outside
this academic verification. Phase 6 commerce CSVs, attribution and cost/profit
gates are next; Phases 7–8 read-only connectors and SaaS remain roadmaps. None was
silently implemented as part of Phase 5.

Evidence: `phase-5-browser-results.json`, `phase-5-checks.json`,
`phase-5-demo.json`, `phase-5-benchmark.{json,csv}`, and
`screenshots/phase-5-{overview,data-studio,campaigns,ml-studio,budget-optimizer,big-data-lab,help}-{1440,375}.png`
plus `phase-5-plan-{1440,768,375}.png`.
