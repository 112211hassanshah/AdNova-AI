# Critical ML and small-budget planning repair

2026-10-29. Existing application repaired in place; no model settings changed,
delegation, new dependency, Project 1 access or live spending.

## Findings from the actual Facebook run

Reloaded registered XGBoost `0a07b09ec5924743941e6cb657488842` and its saved
preprocessor. Recomputed both validation and sealed holdout scores **exactly**.
The original source, model, thresholds and evaluation records were preserved.
Machine-readable evidence is in [critical-ml-audit.json](critical-ml-audit.json).

| Original run | XGBoost RMSE | Baseline RMSE | RMSE improvement |
| --- | ---: | ---: | ---: |
| Validation, 211 rows | 161.551856 | 163.723097 | **1.326167%** |
| Holdout, 218 rows | 104.246128 | 133.204495 | **21.739783%** |

Only the validation ≥5% gate failed. Holdout and platform-specific gates did not
fail in this run. Validation MAE is 91.903 versus baseline 91.496; the small RMSE
improvement does not imply uniformly lower errors. Model WAPE is 90.61% on
validation and 90.86% on holdout. These scores are not accuracy percentages.
Numbers use the currency declared at import; the original file does not declare
its currency, so its PKR interpretation has not been independently verified.

### The label/calendar provenance changes are material

Inspected the actual local original, cleaned, dated and revenue-added files in
Downloads, rather than assuming this was Shopify revenue history:

- Original `Facebook_Ad_Campaigns.csv`: 1,143 rows, 11 columns; ad/campaign IDs,
  age, gender, interest, impressions, clicks, spending and conversion counts.
  **No date or revenue column.** This structure matches the public
  [Sales Conversion Optimization dataset](https://www.kaggle.com/datasets/loveall/clicks-conversion-tracking);
  source identity is inferred from matching structure, while the local file was
  directly inspected. License and original monetary units were not verified.
- Modified `Facebook_Ad_Campaigns_with_revenue.csv`: every row declares
  `date_is_synthetic=1` and `revenue_is_synthetic=1`. Every revenue value equals
  **100 × approved_conversions**. This is an added assumed purchase value,
  not an observed attributed revenue ledger.
- All 1,143 ad IDs are unique; there are only 3 internal campaign IDs. Synthetic
  dates distribute these cross-sectional observations across 180 days. This does
  not create repeated real daily observations or a genuine temporal backtest.
- Approved versus total conversion columns are distinct. The file alone cannot
  verify the user's purchases/7-day-click declarations or recover real dates,
  prices, currency conversion or attribution settings.
- The importer previously ignored component synthetic markers. Consequently the
  saved dataset and model were labelled advertiser data despite the file's
  explicit simulation evidence. Older imports cannot recover discarded flag
  values from canonical rows, so they now require reimport before forecasting.
- The earlier 540-row Shopify-style import also mapped `conversion_rate_pct` into
  the conversion count. This did not enter revenue-model features, but it can
  corrupt CPA/conversion reporting. New imports reject rate-to-count mappings;
  affected older imports receive a review gate. Use Orders, not conversion rate.

The small XGBoost advantage is the measured reason for the original rejection.
The synthetic labels/calendar are a separate reason that even improved scores
would not establish real merchant revenue forecasting. No target was fabricated
by this repair, and no threshold was lowered to force acceptance.

## Existing training workflow and decisions

`ml/features.py`, `ml/service.py`, `ml/train.py`, `ml/evaluate.py`:

1. The target is the CSV's mapped same-period revenue, normalized according to the
   declared currency/FX rate. The pipeline does not derive revenue from clicks or
   conversions. In this file the artificial revenue was supplied before import.
2. Features are spend, log(1+spend), platform, age/gender/city/device, weekday,
   month and cyclic year-day. Future spend/targeting/calendar must be known when
   predicting. Current-period clicks, conversions, revenue, ratios, campaign IDs
   and simulator truth are excluded. This is associative, not causal modeling.
3. Baseline is training-only revenue/spend, with platform rates smoothed using a
   global-rate prior equivalent to 20 average training spends. For Facebook-only
   data the platform rate reduces to the global Facebook rate. Single-platform
   training is supported; extra platforms are not invented.
4. Complete dates split approximately 60/20/20. Original run: 683 train rows
   May 2–August 13; 211 validation rows August 14–September 17; 218 holdout rows
   September 18–October 22. With as-of October 29 and seven-day label lag, 31
   recent rows were excluded. Weekly maturity uses period end plus label lag.
5. Training requires 300 mature rows, 30 dates, at least 180/60/60 partition rows,
   spend variation and positive revenue. Platform acceptance uses 20/5/5 rows.
   These are engineering guardrails, not demonstrated statistical sufficiency.
6. XGBoost fits two CPU configurations (depth 3/5, 180 trees, learning rate .05,
   min child weight 10, L2 10, seed 42 by default). Validation selects settings;
   holdout labels never select the fitted model. No complexity tuning is justified
   as a remedy for missing real labels/calendar, so these settings were retained.
7. The ≥5% RMSE improvement requirement is an **operational heuristic**, not a
   significance test or a proven merchant decision threshold. It remains unchanged.
   A defensible replacement needs predeclared business error costs, representative
   real time periods, rolling backtests and paired date-block uncertainty analysis.
   One artificial-calendar split is insufficient grounds to lower it.

## Budget error: exact cause and correction

`representative_contexts()` chooses the platform's training date nearest median
period spend, retains its campaign/segment rows and their spending weights, and
repeats that mix across the requested horizon. For row bounds `s_min`, `s_max`,
row-weight extrema `w_min`, `w_max` and number of periods `H`, the old range was:

```
lower = H * s_min / w_min
upper = H * s_max / w_max
```

Reproduced the reported synthetic Facebook case exactly: 28 context rows on
2026-01-02, row spends 132.42–7,079.17, weights
0.008782152781–0.075326608599, H=13. Result:
**196,017.997284–1,221,735.741353 PKR**.

`effective_limits()` intersected that forecast range with user caps/floors and
raised the misleading “no supported budget increment” error. It was a historical
support restriction, not a provider minimum or an inevitable rounding limit.
H=13 comes from `config.horizon_days`; the API/form defaults to 7. Failed requests
were not persisted, so the exact interaction that selected 13 days is unavailable.
The approximately 107K case is consistent with this mechanism, but its exact
request is unavailable; it was not claimed as separately reproduced.

Corrected separation:

- `effective_limits()` now applies only user percentage/PKR constraints. No
  advertising-provider restrictions are invented. Missing known restrictions can
  be entered explicitly as total-horizon minimum/maximum amounts.
- Historical ranges live in `forecast_limits()`. They govern **forecast support**,
  never whether an otherwise feasible budget can be allocated.
- Defaults are 0%/100%; zero allocations are allowed. Supported forecasting
  evaluates up to 31 nonempty active-platform subsets with positive support for
  active rows and zero execution for inactive platforms. It never sends the
  entire platform budget as one campaign row or queries XGBoost at zero spend.
- PKR 500/5,000/custom decimals can be allocated. A small budget may concentrate
  on one historical priority unless user caps/floors require otherwise. Exact
  integer-paisa totals and monetary rounding are retained.
- Weekly forecasts use whole aligned weeks; partial-week allocation remains
  possible with the forecast withheld. Long/unsupported horizons similarly need
  no invented revenue estimate.

## Forecast hierarchy

`optimization/planning.py` preserves the service/API entry point and separates
selection from curve/allocation services:

1. **Accepted source-matched model:** use actual saved-model predictions only
   inside supported positive spending domains, retaining checksums/schema/version
   checks. Rejected artifacts are never loaded by automatic forecasting. Explicit
   rejected-model requests remain rejected; automatic mode remains usable.
2. **Independently screened statistical baseline:** `ml/baseline.py` uses the same
   chronological partitions, training-only rates and a train-mean reference. Its
   own policy requires adequate per-platform rows, WAPE ≤100% on validation/test,
   and per-platform RMSE better than train-mean predictions in both partitions.
   This is a transparent operational screen, not calibrated confidence. Saturation
   after that screen remains an assumption, not a measured causal response.
   Historical mode also goes through this screen; it cannot bypass it.
3. **Evidence-limited allocation:** if labels, provenance, evaluation or scenario
   support fail, still allocate within user constraints. Historical priority with
   diminishing utility guides allocation; revenue is excluded from ranking when
   provenance/labels are unresolved. Return **null revenue, ROAS and marginal
   revenue**, no response-forecast chart, no claimed forecast gain and no ML badge.
   This is an allocation scenario, not a predicted-revenue optimum.

For the original Facebook partitions, the independently evaluated baseline fails
its holdout WAPE screen (103.50%). It is not promoted just because XGBoost failed.
A real reimport retains the synthetic markers and is labelled simulation; old
imports with lost markers are gated pending reimport. Original saved evaluations
remain inspectable. Model and baseline curves still disclose nonnegative,
monotone, concave adjustment and interpolation assumptions.

## UI and persistence

Rounded layout/navigation preserved. ML Studio shows validation/holdout model
and baseline RMSE, percentage change, acceptance and a planning link even after
model rejection. The optimizer defaults to Automatic and distinguishes model,
baseline and allocation-only outcomes. Unavailable money metrics render “Not
available”; no artificial confidence or future-revenue numbers are supplied.
User caps/floors, source/model association, original configuration, reasons and
baseline assessments persist in immutable plan reports. Budget edits hide stale
results. Existing v1/v2 reports remain readable under their original policies.

## Verification and limits

- **149 backend tests passed**, including actual local modified-Facebook import,
  real XGBoost fitting and existing Spark/MapReduce regressions. No skips in this
  environment. The local-file case is optional on other machines.
- **37 browser checks passed**: 13 focused Facebook/provenance/small-budget checks
  plus 24 existing upload/training/accepted-model/weekly/responsive checks. All
  seven routes reviewed at desktop/mobile; optimizer also at 1024/768/390px.
  No captured JavaScript errors or final page overflow. A hidden Recharts tooltip
  caused mobile overflow after resize; chart containment fixed it and retesting
  passed. The existing script now expects unsupported large budgets to retain
  allocation with revenue withheld, rather than an obsolete rejection.
- `npm run check`, `npm run build`, `.venv/bin/ruff check backend scripts` and
  `npm run format:check` passed. No failed or unrun required check remains.
- The saved Facebook model's validation/holdout metrics were reproduced exactly
  from its native artifact and recorded preprocessing. Original records/hashes
  were not modified.


See `critical-planning-browser-results.json`, `phase-34-debug-browser-results.json`,
`critical-ml-audit.json` and `screenshots/critical-planning-{1440,375}.png`.
Regression tests cover the current local Facebook CSV (not redistributed),
rejected model dispatch, baseline acceptance/rejection, missing labels, short and
weekly history, exact 196K/1.22M context reproduction, 500/5,000/10,000/25,000/
100,000/1,000,000/custom budgets, zero shares and genuine user amount limits.

No source/model/user selection was overwritten; disposable browser QA sources and
derived artifacts are removed. No paid API/dependency was introduced. Current
scope remains local single-user use without authentication or live spending.

Before merchant deployment: acquire real timestamped attributed revenue, verify
currency/event/window definitions, validate repeated campaign/segment grains,
run rolling time backtests with uncertainty and baseline/business-cost criteria,
and evaluate spend-response/causal assumptions with controlled evidence. The
current fallback improves planning access without certifying forecast reliability.


## Changed implementation files

- `data/provenance.py`, `data/csv_importer.py`, `data/schema_mapping.py`, `domain.py`:
  synthetic component preservation, legacy review and rate/count safeguards.
- `ml/baseline.py`, `ml/service.py`, `ml/infer.py`, `ml/train.py`: independent
  baseline evaluation, provenance gates and transparent target/assessment metadata.
- `optimization/planning.py`, `optimization/service.py`, `optimization/contracts.py`:
  forecast dispatch, evidence-limited allocation, monetary user limits and
  supported active-platform subsets. Existing cent allocation/curve utilities reused.
- `frontend/components/{ml-studio,budget-optimizer}.tsx`, `frontend/lib/{data,optimizer}.ts`,
  `frontend/app/globals.css`: real metric comparisons, accessible planning paths,
  nullable forecasts, explicit limits, saved-state normalization and tooltip containment.
- `backend/tests/{test_critical_planning,test_optimization,test_budget_workflow,test_schema_recognition}.py`,
  `scripts/browser-critical-planning.mjs`, `scripts/browser-phase34-debug.mjs`:
  regression/real-file/browser checks. Docs, active contracts and progress updated.
