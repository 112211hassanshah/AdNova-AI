# Advertising Budget Optimizer · Project 2

A standalone Next.js/TypeScript + FastAPI/Python application, built one vertical
slice at a time. The rounded light bento UI follows the supplied dashboard
reference and `design-2.md`. Functional requirements live in `agent.md`.

**Pre-Phase 7 polish (November 1):** clickable first-use guidance, clearer forecast/
fairness/NVIDIA explanations, frosted cards and a repaired allocation-only as-of
gate. See [the audit and limits](docs/polish-audit.md). Real merchant validation
remains pending; no connectors were added.

**Current milestone: Phase 6 · Local commerce CSV pilot.** The university MVP
(Phases 0–5) is complete. Generate seeded
synthetic campaigns, preview/map/validate authorized advertising CSVs, save and
select separate datasets, inspect weighted metrics and real charts, apply shared
filters, page/sort breakdowns and export safely. Run actual Pandas, local
MapReduce and local Apache Spark comparisons on bounded 10K–10M Parquet data,
with durable jobs, measured repeats, correctness checks and JSON/CSV reports.
The rounded UI includes genuine empty/loading/error states and source coverage.
ML Studio trains local XGBoost revenue models with chronological evaluation, baseline
comparisons, acceptance gates, versioned artifacts and bounded future predictions.
Budget Optimizer creates saved advisory plans from accepted model predictions or
an explicitly chosen historical-rule heuristic, with exact PKR totals, spend
support, platform limits, same-budget comparisons and CSV/JSON exports.
Commerce & Attribution imports Shopify/generic order CSVs and optional order/SKU
costs, normalizes line items/refunds without multiplying order money, and compares
store sales with a separately selected ad export. Evidence-supported matching,
unmatched/ambiguous outcomes, cost coverage, reference discrepancies and observed
contribution are inspectable. A separate train-only evaluated contribution response
supports exact-budget profit plans only when strict data/evaluation gates pass.

No ad/Shopify account is connected; the app never changes live spending.
The commerce fixtures are explicitly fictional. Actual merchant validation remains
pending an approved anonymized export and comparable store reference. Start with
[Commerce walkthrough](docs/phase-6-guide.md), [data contract](docs/commerce_data_contract.md)
and [forecast methodology](docs/phase-6-methodology.md).

**Optional NVIDIA AI Assistant:** open `/ai-assistant` to configure/test a
server-held key and explain approved qualitative summaries of campaign performance,
model evaluation or a saved plan. Numeric references stay local; XGBoost and the
optimizer still own predictions and allocations. See
[NVIDIA setup and data boundary](docs/nvidia-integration.md). The core university
demo still requires no API keys. No package dependency was added.

Instructor walkthrough and reproducible scenario: [University demo](docs/university-demo.md).
With `npm run dev` running, use `npm run demo` to prepare/select the seeded
synthetic source, actually train/evaluate a model and save advisory plans.
Use `npm run verify` for the sequential checks, then `npm run test:e2e` for the
academic browser regression/review. Run `npm run test:e2e:commerce` for the commerce
financial-outcome and browser checks. No new dependency is needed for Phase 6.

## Setup and run

Requires Node >=20.9 and Python >=3.11 (tested with Node 24 / Python 3.12).
From this repository, create an isolated environment with your Python 3.11+:

```sh
python3.12 -m venv .venv
.venv/bin/python -m pip install -r requirements.lock.txt
.venv/bin/python -m pip install --no-deps -e .
npm --prefix frontend ci
npm run dev
```

In this managed Mac environment, a filesystem service may mark the editable
package’s `.pth` file hidden again after installation. If a direct Python command
cannot import `ads_optimizer`, prefix it with `PYTHONPATH=backend/src`. The launcher,
workers and pytest already configure the source path explicitly.

The lock includes optional PySpark for the complete university experiment.
Spark also needs Java 17, 21 or 25. Set `JAVA_HOME` to a compatible installation,
or place a verified macOS JDK archive under ignored `.runtime/` so its
`*/Contents/Home/bin/java` is discovered. This workspace uses project-local
Temurin 17.0.21+9; no system Java installation was changed. Without Java/PySpark,
Pandas and MapReduce work and Spark is explicitly unavailable. See
`docs/phase-2-methodology.md` for the installed runtime, sources and verification.

The combined launcher starts FastAPI at http://127.0.0.1:8000 and Next.js at
http://127.0.0.1:3000. It stops both on Ctrl+C or an unexpected child exit.
Open the URL printed by Next.js. An occupied port is a startup problem to resolve,
not a signal to run against another backend. The default proxy targets port 8000.
The backend binds only to loopback. API documentation: http://127.0.0.1:8000/docs.
Optional `API_ORIGIN` is server-side; its default is in `.env.example`.
No account, secrets, payment, remote storage or deployment is required for the
core demo. The optional NVIDIA explanation feature needs its own API key and
sends only explicitly approved qualitative summaries to the hosted provider.

## Checks

```sh
.venv/bin/python -m pytest
.venv/bin/ruff check backend scripts
npm run check
npm run build
npm run format:check
```

On macOS, `npm run dev` automatically adds the installed scikit-learn wheel’s
bundled OpenMP library to the backend process path when present. This lets
XGBoost load without a system Homebrew installation. When running Python tests
or Uvicorn directly on a Mac without system OpenMP, first export:

```sh
export DYLD_LIBRARY_PATH="$(.venv/bin/python -c 'import sysconfig; print(sysconfig.get_path("purelib") + "/sklearn/.dylibs")')${DYLD_LIBRARY_PATH:+:$DYLD_LIBRARY_PATH}"
```

Other platforms use their normal XGBoost runtime setup.

Real Spark tests open loopback sockets; process tests inspect local descendants.
They need execution outside a restrictive socket/process sandbox. Optional Spark
tests skip only when its dependency/runtime is absent, not when an installed
engine fails.

Browser verification is documented in `docs/progress.md`; the browser check script
uses Playwright and Chromium. Install the matching browser with
`cd frontend && npx playwright install chromium`, or point `CHROMIUM_EXECUTABLE`
at an existing compatible Chromium executable. Keep the local services running
while executing `npm run test:e2e` from the repository root.

## Try the working journey

1. Open Data Studio, choose Synthetic demo, select 1,000 or 10,000 rows and a seed,
   and generate. No API keys are required; all results remain labelled synthetic.
2. Open Overview, inspect spend/revenue/ROAS and charts. Expand filters to choose
   dates or a platform; selections persist across Overview and Campaigns.
3. In Campaigns, group by platform/campaign/audience, sort, page and inspect chart
   table alternatives. Export uses the current filters and retains provenance.
4. For CSVs, choose the profile/file, inspect the preview, map columns and verify
   currency, date format and attribution definitions. Validate, review any errors,
   explicitly accept exclusions if needed, then confirm and save.
5. Select, preview, export or delete datasets in Data Studio. Source and field
   coverage remain inspectable. The synthetic sample download and committed
   fixture at `backend/tests/fixtures/campaigns.csv` are explicitly simulated.
6. Open Big Data Lab, choose a scale and engines, then **Start benchmark**.
   It generates or reuses matching input, performs at least three measured
   repeats per engine, validates every repeat, and saves reports. Inspect
   repeats, weighted totals, resource measurements, the scale chart and exports.
7. In Data Studio, expand **Academic datasets · 10K to 10M rows** to generate
   large inputs without running engines. These are separate lab datasets;
   they do not replace the selected campaign report or enter Overview.

To reproduce and save the four required scales while local services are running:

```sh
.venv/bin/python scripts/benchmark_phase2.py
```

This writes actual JSON evidence and CSV timings under `docs/phase-2-*`.
Do not run other test or benchmark workloads concurrently when measuring.
Results depend on this machine and its caches; they are not distributed-cluster
performance claims. Details and measured limitations are in the methodology.

For exports with both provider and channel, map **channel → platform** so
Facebook/Instagram and Google/YouTube remain separate. Generic suggestions also
recognize `spend_pkr` and `revenue_pkr`; precomputed CTR/CPC/ROAS columns are not
used instead of the app's weighted calculations. Meta Ads by itself is ambiguous.

Campaign imports accept **daily or weekly observations**, consistently within each
file. Header aliases, separator/case normalization and sample-value checks select
strong matches; ambiguous/fuzzy candidates require manual selection. Inspect the
mapping confidence and preview before confirming. Extend `data/schema_mapping.py`
for new aliases. ISO weeks (`2026-W43`) and week boundaries remain weekly; week-end
dates normalize to the period start. Ambiguous slash dates need an explicit format;
week numbers without a year and monthly/mixed reporting periods are blocked.
Original headers, suggestions and final mappings are persisted in the manifest.
Conventional currency prefixes/grouped thousands are accepted; decimal commas and
percentages mapped to counts/money require correction. Nulls stay null.

The interactive campaign generator is limited to 10,000 rows, imports to UTF-8 CSV <=10 MiB /
100,000 rows. Blank financial inputs stay missing; incomplete totals/ratios show
Not available. Non-PKR data requires a verified PKR-per-unit rate. Exact duplicate
rows are counted and removed only with the selected policy; conflicting observation
keys block import. Repeated datasets are blocked and overlapping reports warned.

## Train and inspect a model

Open ML Studio after selecting a saved campaign dataset. If reporting rules are
missing, answer the two plain-language questions or choose “I’m not sure yet”
and keep using analytics. The app detects explicit rules found in CSV columns;
it does not guess missing attribution settings. Saved-report answers create a
new source-linked version without another upload. See
`docs/reporting-setup-guide.md` for evidence, versioning and retention.

Choose the as-of date,
seed and, for advertiser data, a label-maturity lag appropriate to its attribution
window. Review readiness, then choose **Train revenue model**. Earlier complete
dates train the model, middle dates select its settings, and later dates measure
holdout error against a train-only historical baseline.

A completed fit can fail acceptance checks. The result shows the reasons, measured
MAE/RMSE/R²/WAPE, platform errors, split dates, model version and provenance.
**Evaluate saved model** reloads its verified artifacts and re-measures the same
holdout; **Export evaluation** downloads its report. Accepted models expose a
campaign-period prediction check within historical spend ranges, clearly labelled
when synthetic. This does not allocate a platform budget or change live spending.

Models and holdout evidence persist under ignored `data/ml/`; deleting their
source dataset removes them. Finish/cancel active training before source deletion.
No external model files can be uploaded. See `docs/phase-3-methodology.md` for
the feature contract, thresholds, persistence/fallback policy and limitations.

Run the Phase 3 browser journey with services running:

```sh
node scripts/browser-phase3.mjs
```

## Plan and compare a budget

1. Select a saved source and open Budget Optimizer. Enter your available PKR
   amount (0.01–100,000,000); there is no default spending amount.
2. Automatic mode tries an accepted source-matched model, an independently
   screened historical baseline, then allocation only. A failed ML model does
   not block feasible budget planning. Historical mode also evaluates its baseline.
3. Platforms default to 0% minimum and 100% maximum. Enter share caps or actual
   account/platform minimum/maximum PKR amounts when known. A zero allocation or
   concentration on one channel is allowed. The app assumes no provider limits.
4. Historical spend is forecast evidence, not a required future budget. PKR 500
   and 5,000 can be allocated even when forecasts are unsupported. Unsupported
   revenue/ROAS return Not available, never invented estimates.
5. Inspect the method, source, user limits, forecast reasons and any genuine
   evaluation/response evidence. Weekly forecasts preserve whole reporting weeks;
   other feasible scenarios can still use allocation only. Change inputs and
   generate again; previous estimates are hidden until recalculated.
6. Export the source-labelled CSV/JSON. Reports persist without retraining models.
   Latest 50 per source are listed; source deletion removes its derived plans.

The baseline has its own chronological error/support screen; passing is not
production or causal validation. Curves impose diminishing returns and interpolate
sampled predictions. Allocation-only priorities are explicitly heuristic and
have no revenue objective claim. All allocations total exactly to paisa precision.

CSV imports preserve `date_is_synthetic` and `revenue_is_synthetic` markers. A file
with assumed dates or purchase-value-derived revenue is a simulation. Older
imports that discarded these markers must be reimported before forecasting;
original saved metrics remain inspectable. Rate columns cannot be mapped as counts.

Read `docs/critical-ml-planning-report.md` and `docs/phase-4-methodology.md` for the
actual Facebook metrics, provenance audit, budget restriction and current policy.
No dependencies were added. Regression browser checks (local services required):

```sh
node scripts/browser-critical-planning.mjs
node scripts/browser-phase34-debug.mjs
```

The critical browser script uses the user's local modified Facebook CSV; it is
not redistributed as a repository fixture. Backend tests skip that optional case
when the file is unavailable. All fixtures remain labelled appropriately.

## Data and model policy

The campaign workspace accepts clearly labelled reproducible synthetic campaigns or authorized
advertiser CSVs, with preview, explicit mapping and validation. Metrics and future model
predictions belong in Python services. Sources retain separate provenance and
workspace namespaces. Missing revenue blocks revenue optimization. Phase 2
measures Pandas/local MapReduce/Spark on equivalent synthetic workloads, with
recorded correctness and measured timings. Phase 3 trains and evaluates local
models; Phase 4 uses eligible predictions in advisory allocations. Phase 5 supplies
the reproducible university demo and final acceptance review. Phase 6 implements
the separate CSV commerce pilot with missing-data gates and advisory contribution
planning. Store revenue, platform-reported revenue and matched store revenue remain
distinct. Live connectors (Phase 7) and SaaS (Phase 8) are future scope. Project 1 is untouched and not imported. A future integration can consume
the independent service package or versioned API.

Runtime `data/`, `models/`, `reports/`, secrets and binaries are ignored by Git.
This is a local single-user development application, not a secured hosted service.
See `docs/data_dictionary.md`, `docs/methods_and_limitations.md` and
`docs/implementation_plan.md` for definitions, retention, resources and limitations.
The SQLite catalog and Parquet files live under root `data/` by default; configure
`ADS_DATA_DIR` in your launching shell if needed. Delete/export is implemented in
Data Studio; commerce snapshots have separate export/delete controls in Commerce.
Commerce files/key are under `data/commerce/` and are not encrypted. See the commerce
data contract for dependency deletion and logical-erasure limits. Recognized personal fields are discarded before staging. Remaining
sanitized previews expire after 24 hours/on the next upload; commit removes them.

Npm currently reports transitive ESLint peer-range warnings; the installed
configuration passes its checks. This is documented in methods/limitations.

## Recheck the polish

With both local services running, prepare the labelled model demo with
`.venv/bin/python scripts/demo_phase5.py --restore-selection`, then run
`npm run test:e2e:polish`. Use `CHROMIUM_EXECUTABLE` if needed. The audit selects
the saved demo, exercises first-use generation, seven responsive widths and
NVIDIA approval without sending an external request, removes its temporary demo
and restores campaign selection. It saves `docs/polish-browser-results.json`.
For isolation, launch services with a disposable `ADS_DATA_DIR`; do not run
browser scripts concurrently because they intentionally change workspace selection.
The model-demo command saves labelled demo data/models/plans, so use a disposable
workspace when those artifacts are unwanted.

## Protected hosting

For the user-authorized Vercel-only Next.js + FastAPI deployment, follow [docs/vercel.md](docs/vercel.md). Hosted mode requires private access settings and persistent storage; the default launcher remains local.
