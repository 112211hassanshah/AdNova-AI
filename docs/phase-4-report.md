# Phase 4 completion report

Completed 2026-10-29: source-bound advisory budget allocation, responsive Budget
Optimizer, supported campaign-day scenario mapping, immutable plan history and
CSV/JSON exports. No delegation, Project 1 access, live spending, model retuning,
commerce ingestion or Phase 5 implementation.

## Delivered behavior

- Editable PKR total/step, 1–30 day horizon, enabled platforms and requested
  percentage floors/caps, with immediate form checks and authoritative backend
  support/feasibility checks. Exact-total allocations and displayed 100.00% shares.
- Actual saved-model inference, source/input/artifact/version checks and model
  acceptance gates. Repeatable train-only campaign/segment mix mapping with
  per-row platform spend support; never treat a platform budget as one row.
- Raw/adjusted response curves, disclosed monotonic/diminishing-return assumptions,
  exact discrete allocation, same-budget constrained equal/historical-spend
  comparisons and explanatory methodology/floor/cap details.
- Explicit historical-rule heuristic with assumed saturation and no ML badge.
  Failed/corrupt ML never silently becomes a heuristic. Reporting/history gates
  still apply to the historical method.
- Saved source-specific plans, automatic latest-plan reload, restore-saved-input
  selection, stale-result warnings after editing, what-if reruns and source-labelled
  downloads. Source deletion cascades to plans; existing model/source records are
  not rewritten. Prior workspace dataset selection was restored after browser QA.
- Desktop/mobile rounded dashboard integration; model-to-planner links, Overview
  next step, help/capabilities/version/docs updated to Phase 4. Advanced curve
  table, keyboard/focus-managed methodology dialog and mobile navigation reviewed.

## Actual synthetic demo evidence

Plan `9bd739af30ba41f6a4ca334bc42920d5`, model `8a506eb892c34b228b73b4edd618402e`; XGBoost + adjusted response curves.
Source: Pakistan campaign demo (10,000 synthetic rows, seed
42); planning 2026-10-30–2026-11-05.
Total PKR 1,000,000, step PKR 10,000;
20,860 campaign-day candidate predictions scored.

| Platform | Allocation (PKR) | Share |
| --- | ---: | ---: |
| Facebook | 260,000 | 26.00% |
| Google | 220,000 | 22.00% |
| Instagram | 220,000 | 22.00% |
| TikTok | 150,000 | 15.00% |
| YouTube | 150,000 | 15.00% |
| **Total** | **1,000,000** | **100.00%** |

Adjusted estimated attributed revenue: PKR
8,267,277.11; raw model estimate at the chosen allocation:
PKR 8,560,259.75. These are **synthetic scenario
estimates**, not realized sales, real-business accuracy or causal uplift.

| Same-budget comparator | Adjusted estimated revenue (PKR) | Estimated plan difference (PKR) |
| --- | ---: | ---: |
| Constrained equal split | 8,085,123.47 | 182,153.64 |
| Constrained historical spend mix | 8,039,228.52 | 228,048.59 |

Full evidence: `phase-4-demo-plan.json`. Recorded in-request compute/preparation
elapsed 0.205s is not a controlled performance benchmark and
excludes final SQLite publication, HTTP transfer and rendering. Existing model
holdout metrics are preserved as provenance, not presented as validation of the
new platform allocation/response assumptions.

## Verification

- **119 backend tests passed**, including **23 Phase 4 cases**: real accepted-model
  planning, immutable native model evidence, source/model/hash/date gates,
  financial/reporting/history gates, supported grids, shape/zero/irregular curves,
  exhaustive small-grid optimality, exact totals and share rounding, deterministic
  heuristic, work limits, persistence/source deletion and HTTP/CSV/JSON boundaries.
- **55 browser checks passed** in in-app Chromium through CUA and documented
  Playwright locators. Actual ML and historical plan creation, changed Google cap,
  disabled YouTube, invalid percentages/steps, unsupported-spend remedies,
  downloads, saved reload/source isolation, empty-state recovery and failed-model
  gating were exercised. No captured error-level console messages.
- Budget Optimizer checked at 1440/1280/1024/768/430/390/375px; every application
  route at 1440 and 375px. No page overflow in those checks. Desktop/mobile and
  mobile methodology screenshots visually inspected; dialog focus/Escape,
  mobile drawer and keyboard-focusable response table exercised.
- `npm run check`, `npm run build`, `npm run format:check` and
  `.venv/bin/ruff check backend scripts` passed. New Python files pass Ruff format.
  Spark regression tests passed with loopback/process permissions and the
  documented OpenMP environment.
- Backend/API/editable package version 0.4.0. SciPy 1.18.1 was already installed
  and locked; now declared as a direct dependency. No new model/library version
  was substituted. The package was refreshed locally.

## Resolved issues and current limits

The sandbox blocked preview sockets and two Spark process/socket checks; approved
local execution passed. A sandboxed Turbopack build stalled; stopped only its
identified process and reran with required local worker permissions, then passed.
The no-build-isolation editable refresh lacked setuptools; normal isolated build
obtained its standard backend and installed 0.4.0. Browser review found synthetic
lag display should report effective zero rather than configured seven; corrected
and verified in exported evidence and the mobile methodology panel. The importer,
training policy, source flags and existing reports were not relaxed to make a demo
pass. A browser locator for a select needed its semantic combobox name; native
keyboard/dialog actions and subsequent checks passed.

This v1 repeats a fixed representative training-day mix, uses platform-wide spend
bounds, requires positive platform training spends and imposes a concave response
shape. Context-specific support, future seasonality, uncertainty calibration,
causal effects and real-merchant validation remain unverified. Curves depend on
the scenario's sampled grid/domain; cross-plan changes are not experimental lift.
The historical mode is an assumption-based planning rule, not a trained model.

Bounded synchronous requests have cooperative time checks, without durable jobs,
request cancellation or hard OS memory/time guarantees. No per-plan deletion UI
or automatic retention; latest 50 per source are listed. No full screen-reader,
WCAG certification, Firefox/WebKit audit or secured multi-user deployment claim.
Weekly-grain imports, commerce CSVs, live connections and spending actions remain
outside this phase. Phase 5 final university demonstration/review is next.

Artifacts: `phase-4-methodology.md`, `phase-4-browser-results.json`,
`phase-4-demo-plan.json`, `screenshots/phase-4-plan-1440.jpg`,
`screenshots/phase-4-plan-375.jpg`, `screenshots/phase-4-methodology-375.jpg`,
`screenshots/phase-4-preview.jpg`. Run `npm run dev`, select **Pakistan campaign
demo**, then open **Budget Optimizer** to inspect its saved plans. The QA-owned
preview servers are stopped after verification; no hosted publication is involved.
