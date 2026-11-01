# Phase 3–4 debugging and integration report

2026-10-29. Existing Next.js/FastAPI application repaired in place. No delegation,
Project 1 changes, new dependencies, live spending, or future-phase implementation.

## Root causes

1. Import suggestions used exact aliases only. Unknown separator/case variations
   and ordinary alternative headers were missed; competing aliases could be chosen
   without ambiguity evidence. Weekly exports were deliberately blocked by the old
   daily-only contract. Currency prefixes and grouped thousands failed numeric parsing.
2. Revenue readiness required conversion counts although the model never uses
   them as features or labels. The historical fallback reused the supervised
   300-row/chronological-split gate, blocking useful smaller histories.
3. XGBoost fitting, validation selection, baseline comparison and native persistence
   were already genuine. The audit found missing R² and incomplete schema/source
   verification at direct inference, not a fake training implementation.
4. The API and fresh optimizer form defaulted to PKR 1,000,000. Whole-rupee,
   fixed-step divisibility and 200-increment rules unnecessarily rejected custom
   budgets. Existing results remained visible while edited inputs differed.
5. Period assumptions extended through model maturity, inference contexts and
   descriptions. Weekly support needed consistent period handling throughout,
   rather than relabeling a week boundary as a daily observation.

## Mapping and validation

`schema_mapping.py` centralizes extensible aliases, case/camel-case/separator
normalization, conservative fuzzy suggestions and sampled type checks. Strong
unambiguous matches are selected; competing columns, generic Results and fuzzy
matches require manual choice. The UI shows candidates, rule confidence and
reasons. Confidence is deterministic rule strength, not a calibrated probability.
No header-independent guess silently assigns a numeric column to revenue/spend.

`periods.py` handles ISO dates, safely inferred slash dates, explicit day/month
choices, ISO year-weeks and week boundaries. Weekly totals stay one observation;
week-end dates normalize to week start. Missing years, ambiguous date formats,
mixed/monthly periods and inconsistent weekly start weekdays block import with
readable errors. Paired provider ranges must consistently span one or seven days.

Original sanitized headers, suggestions, chosen mapping and date format persist
with dataset provenance. Duplicate and grain checks remain active. Currency
prefixes and conventional comma-grouped, decimal-dot amounts are accepted;
currency evidence must agree with the declared source. Null markers remain null;
percentages cannot silently become counts or money. Unknown optional fields do
not block supported analytics. Missing spend/revenue prevents revenue modeling.

## ML implementation

XGBoost remains primary: train-only one-hot preprocessing, planned-spend proxy,
log spend, known platform/targeting and calendar context. No same-period outcomes,
simulator truth or campaign identifiers enter features. Existing deterministic
settings compare depth 3/5 candidates using validation RMSE; later test labels
never select the fitted model. The existing sklearn fallback remains available
only for XGBoost import/runtime incompatibility, with its reason recorded.

Complete dates split 60/20/20. Minimums are 300 mature rows, 30 reporting dates,
180/60/60 partition rows, 10 distinct spends and positive revenue. Spend and
revenue plus compatible reporting definitions are required; conversion counts,
impressions and clicks are optional. Weekly maturity is based on period end plus
label lag. Results include genuine MAE, RMSE, WAPE and R² (null for constant labels),
a smoothed training-only baseline, per-platform errors and source coverage.

Successful fitting remains separate from acceptance: at least 5% validation/test
RMSE improvement over the baseline, bounded WAPE and platform support/error gates.
Versioned registry records include dataset/configuration/schema, times, provenance,
metrics, library versions, hashes, preprocessing and native model files. Reload
rejects changed schemas/artifacts/libraries; inference and optimization verify the
selected dataset and source hash. No training is triggered by budget edits.

## Budget implementation

The API requires a budget; fresh UI starts empty. Saved plans restore their own
inputs. Accept PKR 0.01–100,000,000, with two decimals; the ceiling is a technical
bound. The amount flows through form → API → cent-based constraints/allocation →
estimates → persisted results. There is no million-rupee fallback.

Curve sampling and allocation precision are separate. Automatic sampling is
bounded to 200 intervals; an optional interval may coarsen it. Include exact
supported endpoints, score actual model candidates, and fit nonnegative,
nondecreasing concave curves, preserving raw outputs. Unequal intervals use slope
constraints. A segment-based marginal allocator can finish at any paisa, with
exact totals, floors/caps and nonnegative amounts. Intermediate revenue estimates
use disclosed linear interpolation. Exhaustive small-domain tests verify the
allocator against the interpolated objective, not hypothetical business returns.

Observed platform spend ranges constrain the repeated campaign/segment context.
Weekly data uses whole weeks (7/14/21/28 days) on the same week-start weekday;
there is no daily expansion. Unsupported/infeasible budgets get explanatory
errors. Same-budget equal/historical-share comparisons use identical constraints.
Old v1 saved reports remain readable with their original policy disclosed.

The explicit historical heuristic now uses all mature history, requiring 20 rows,
4 reporting dates, 3 distinct spends, positive spend/revenue, and per-platform
5-row/4-date/3-spend support. Saturation is assumed and labelled; no ML badge is
borrowed. Unsupported conversion predictions are omitted. Changing any plan input
hides old estimates until Generate recommendation recalculates and saves a new
report. No provider spending is changed.

## Files changed

| Area | Files |
| --- | --- |
| Import | `backend/src/ads_optimizer/data/{schema_mapping,periods,csv_importer,reporting,repository}.py`, `domain.py` |
| Analytics | `backend/src/ads_optimizer/analytics/metrics.py` (weekly trend label) |
| ML | `backend/src/ads_optimizer/ml/{service,evaluate,train,infer}.py` |
| Optimization | `backend/src/ads_optimizer/optimization/{contracts,allocate,service}.py` |
| UI/contracts | `frontend/components/{data-studio,ml-studio,budget-optimizer}.tsx`, `frontend/lib/{data,ml,optimizer}.ts` |
| Tests | `backend/tests/{test_data,test_ml,test_optimization,test_schema_recognition,test_budget_workflow}.py`, `backend/tests/fixtures/{weekly_training,daily_budget_training}.csv` |
| Browser QA | `scripts/browser-phase34-debug.mjs`, `docs/phase-34-debug-browser-results.json`, `docs/screenshots/debug-*.png` |
| Documentation | `README.md`, `agent.md`, `design.md`, `docs/{progress,implementation_plan,data_dictionary,methods_and_limitations,phase-3-methodology,phase-4-methodology}.md`, this report |

## Verification

- Full backend suite: **134 passed**, including real existing Spark/MapReduce
  regression tests. Final run has no warnings.
- `npm run check`: passed TypeScript and ESLint.
- `npm run build`: passed production build of all application routes.
- `.venv/bin/ruff check backend scripts`: passed.
- `npm run format:check`: passed.
- Browser workflow: **24 checks passed**. Weekly upload/mapping/validation → actual XGBoost fit; then a
  separate labelled synthetic daily CSV → actual fit → model-backed plans for
  **10,000; 50,000; 100,000; 1,000,000; 54,321.87 PKR**. Exact cent totals, changed
  estimates, unchanged model IDs, hidden stale results, explicit heuristic,
  zero/unsupported budget handling and responsive layouts checked.
- API tests exercise the same five amounts after an actual uploaded-data worker
  fit, verify stored model hash unchanged, and reject incompatible schemas. Other
  tests cover corrupt/mismatched/failed models, infeasible support, missing revenue,
  small histories, period maturity/splits and exact monetary comparisons.
- Desktop/mobile screenshots reviewed; optimizer checked at 1440/1024/768/390/375px.
  All seven routes checked at desktop/mobile. No page overflow or captured page
  JavaScript errors. Temporary datasets/models/plans removed and original dataset
  selection restored. See the browser JSON for individual assertions.

The first development checks exposed old weekly-rejection assertions, a mapping
issue hiding invalid sample values, a TikTok camel-case alias gap, a missing
accessible selector label and a Pandas/NumPy timedelta warning. Each was corrected
and retested. Direct macOS XGBoost tests use the documented bundled OpenMP path;
normal dev/training workers already configure it. Local socket/process checks and
production build required the permitted execution environment. No unresolved
check failure remains.

## Remaining limitations

All integration fixtures are explicitly synthetic. These runs prove software
behavior, not merchant predictive accuracy, causal lift or guaranteed profit.
Uncertainty is not calibrated. Spend support is platform-wide; sparse ranges,
future context shifts, attribution overlap and fixed campaign mixes remain risks.
Curves impose/interpolate a planning shape rather than establish causal returns.
Campaign selection and campaign-specific bounds are not separate optimization
variables. Monthly/mixed-grain data and decimal-comma currency need preprocessing.
Very small or incomplete histories may support analytics only. Accepted models
are eligible under local validation policy, not certified production-ready.

Current scope remains local single-user use without authentication. No live
connections, commerce attribution, automatic spending or new paid services.
