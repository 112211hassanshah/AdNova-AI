# Implementation plan

Current milestone: Phase 6 local CSV commerce pilot, implemented with fictional
outcome verification; actual merchant validation remains pending. Phases 0–4
and the October 29 repair work are implemented. The final walkthrough is in
`university-demo.md`; current acceptance evidence is in `phase-5-report.md`.
Older phase-specific notes below describe their original delivery boundaries;
the later repair and Phase 5 reports supersede those historical limitations.

After Phase 5, the user explicitly requested optional NVIDIA explanations.
`ai/` adds a provider adapter and allowlisted, approved qualitative summaries;
`/ai-assistant` supplies private key setup, real status checks and report review.
This optional addition preceded Phase 6 and does not implement advertiser connectors.
See `nvidia-integration.md` for data boundaries and verification.

The user subsequently authorized Phase 6. `commerce/` now owns separate immutable
orders/items/costs, financial normalization, evidence-supported attribution,
reference checks and train-only screened contribution-profit plans. `/commerce`
provides imports, review, export/delete and saved result workflows. No provider
credentials are needed. See `phase-6-guide.md`, `commerce_data_contract.md` and
`phase-6-methodology.md`; merchant validation against approved real reports remains
separate from the fictional fixtures. Phases 7–8 remain roadmaps.

## Pre-Phase 7 polish · November 1

Completed an audit of existing data, model, allocation, commerce and AI boundaries.
Polished first-use links/guidance, advanced-control disclosure, offline Help and
frosted presentation. Fixed allocation-only planning reading later records when
no mature history exists. Full evidence and real-data/fairness limits are in
`polish-audit.md`; no new phase, connector or dependency. Merchant validation is
still pending.

## Scope and document resolution

This empty repository is a standalone Project 2 application. No Project 1 files,
services or data are used. The user's current request is authoritative.
`agent.md` supplies functional/data requirements. `design-2.md` v2 is copied to
`design.md` as the active UI contract. The supplied Downloads AGENTS.md and older
design.md concern an unrelated software-house website; originals are preserved
in `references/source-documents/`, not adopted as this product's instructions.
The Task Management Dashboard image is a moodboard only, not a product asset.

## Structure and dependencies

```text
frontend/app/                       Next.js routes, layout, CSS tokens
frontend/components/                Responsive app shell and interactive views
frontend/lib/                       Typed backend client
backend/src/ads_optimizer/api.py     Versioned FastAPI boundary
backend/src/ads_optimizer/schemas.py Pydantic response/data contracts
backend/src/ads_optimizer/services/  UI-independent application services
backend/tests/                      Service and HTTP tests
scripts/                            Combined launcher and browser checks
docs/                               Plan, progress and data contracts
references/                         User-provided references, originals
data/ models/ reports/              Root runtime directories ignored by Git
```

Frontend: Next.js 16, React 19, TypeScript 5, Tailwind 4, Lucide,
Radix Dialog for accessible focus-managed navigation, self-hosted Geist.
Backend: Python >=3.11, FastAPI/Pydantic, Uvicorn; pytest/httpx and Ruff for QA.
Exact resolved JS versions live in `frontend/package-lock.json`; installed Python
versions are recorded in `requirements.lock.txt` after successful installation.
Do not install heavy analytics/ML dependencies until their phase requires them.
Phase 1: Pandas/NumPy/PyArrow, SQLite catalog, streamed raw CSV upload (no multipart dependency),
Recharts for backend-calculated aggregates, and Prettier for reviewable source.
Phase 2: optional PySpark 4.2.1, compatible Java 17 and psutil; Pandas is pinned
below 3 because Spark currently warns about unsupported Pandas 3 features.
Phase 3: XGBoost/scikit-learn.
Phase 4: SciPy/HiGHS shape-constrained response curves and exact discrete allocation.
Phase 5: reuse installed dependencies; shared macOS Python environment setup,
serial verification, fixed seeded HTTP demo, full browser regression plus final
seven-route/seven-width audit and a fresh 10K benchmark smoke run. No new model
policy, core architecture, commerce implementation or connection is introduced.

## Supported execution and resource limits

Local single-user only, bound to 127.0.0.1. Next proxies `/api/v1/*` to FastAPI;
there is no browser-held service credential. API docs at port 8000 `/docs`.
Node 24.18.0 and bundled Python 3.12.14 are available; system Python 3.9.6 is
too old. Host is Apple arm64 macOS, 10 logical CPUs, approximately 274 GiB free
disk at inspection. RAM inspection was denied by the sandbox; no RAM capacity
is assumed at that initial inspection. Phase 2 now measures RAM via psutil
(16 GiB total on the tested host), uses two local workers by default and reports
current availability per experiment. PySpark 4.2.1 and verified project-local
Temurin Java 17.0.21+9 are installed. No Hadoop environment or cluster is present.
No cluster credentials or advertiser accounts exist. No hosted deployment.

10M generation must stream bounded chunks to partitioned Parquet. Interactive
responses must use server-side aggregates and bounded previews. Long jobs require
backend job records, genuine status, limits and cancellation where implemented.
Never allocate all machine memory or use a full 10M-row browser table.

## Phase-by-phase vertical slices

| Phase | Backend and functional deliverable | UI and test gate |
| --- | --- | --- |
| 0 | Local launch, health, workspace capability contract | Design tokens, responsive shell, navigation, honest empty/loading/error states, source chooser, help; API tests, build and desktop/mobile browser review |
| 1 | Canonical ads/provenance and separate commerce contracts, deterministic generator, safe mapped CSV import/preview/validation, persisted metadata, weighted metrics, filters and exports | Data Studio + Overview + Campaigns, source coverage, missing-data gates; numeric/service/import tests and full demo/import journeys |
| 2 | Bounded chunked 10K–10M Parquet, equivalent Pandas/local map-shuffle-reduce/PySpark workloads, parity and measured repeats/environment | Big Data Lab, honest progress/failure/skip/results; resource gates and engine parity tests |
| 3 | Leakage-safe future-known features, chronological split, baseline vs trained XGBoost, holdout metrics, model registry | ML Studio, real job states and readiness; training/inference/provenance tests |
| 4 | Model-driven response curves with explicit concavity/saturation assumptions, feasible PKR increments, caps/floors, same-budget baselines | Budget Optimizer, constraints/what-if/explanations/export; exact-total and infeasibility tests |
| 5 | Complete university demo and documentation, measured benchmark reports | Remaining polish and end-to-end/responsive/accessibility review; no deferred core UI work |
| 6 | Separate Shopify/generic commerce CSVs, order grain/refunds, evidence-based attribution and cost coverage | Commerce & Attribution, unmatched/ambiguous reporting; profit mode only with adequate data |

Phases 7–8 remain roadmaps: authorized read-only connectors and commercial SaaS.
They are not enabled by adding UI or fictional API responses.

For every phase: discover the user journey and all states; implement services and
styled UI together; test; inspect desktop/mobile; fix; report real vs simulated
work and remaining gaps before proceeding. Work one phase at a time.
When bugs or problems arise, notify the user so they can choose 6 Astra.
Before Spark + MapReduce implementation in Phase 2, remind the user to select
very high reasoning. Do not silently switch settings or begin that work early.

## Safety and integrity gates

Never mix real and synthetic datasets/model results. Missing financial inputs
remain null; weighted rates derive from summed numerators/denominators; zero
denominators return null. No invented attribution, COGS, benchmark timings,
forecasts, trained badges or connected states. All recommendations are advisory.
Phase 1 adds size/type limits, sanitization, CSV formula-injection protection,
duplicate keys, provenance and workspace ownership before accepting uploads.
No optional UI/chart package is installed until there is real data to display.

## Phase 2 implementation decisions

Large synthetic inputs have their own lab catalog, separate from small campaign
reports and selected advertiser data. Data Studio exposes academic generation;
Big Data Lab generates or reuses a verified matching input. This keeps Overview
and campaign import paths bounded without mixing academic and merchant results.

Durable jobs run in detached local Python coordinator processes so HTTP requests
return immediately and web-server reloads do not lose work. One active job is
enforced by a SQLite partial unique index. Engine sessions use isolated process
groups, measured repeats and a sampled process-tree memory ceiling; cancellation
stops child work, while interrupted-worker recovery removes its incomplete data
and stops a verified orphan engine session. Reports retain software/hardware,
methodology, configuration, source/checksums, repeats and explicit non-successes.

Pandas uses in-memory groupby only under a conservative working-set threshold,
otherwise bounded batches. MapReduce uses real process mappers, keyed partials,
local shuffle/group and reduce. Spark uses DataFrame aggregation in local mode;
neither local path is represented as distributed Hadoop or a Spark cluster.
Only complete, correct repeated measurements get medians or comparison points.
Phase 3 training is not part of this slice.

## Phase 3 implementation decisions

Train only on selected campaign data (maximum 100K), preserving the lab namespace.
Use pre-period targeting, planned/observed spend and calendar features; no outcome
features, campaign IDs or simulator truth. Split complete dates 60/20/20. Train-only
encoding and baseline; validation selects between two fixed CPU XGBoost settings;
test is untouched until final evaluation. Models can train successfully and fail
prediction eligibility. ML Studio includes source/readiness, actual background
jobs, cancellation, persisted evaluation, errors, methodology and campaign-day
predictions. Platform-level allocation remains Phase 4.

Native UBJSON plus JSON preprocessing, or a checksum-verified internal sklearn
fallback, is stored with versioned metadata in `data/ml/`. Source deletion removes
derived artifacts and is blocked during active training. See Phase 3 methodology.

## Phase 4 implementation decisions

Completed the advisory Budget Optimizer with service-owned calculations and a
responsive form/result/compare/methodology UI. Reuse the selected immutable source
and accepted model, verify source/artifact hashes and replay its training-only
split. Per platform, select the training day closest to median daily spend and
retain every row; repeat its observed within-day spend weights over 1–30 future
days. Per-row platform training support determines effective platform floors/caps.

Score each feasible PKR grid point with the actual model. Use SciPy HiGHS to fit
nonnegative, monotone concave values bounded above by the sampled predictions;
expose both raw and adjusted curves. Allocate exact integer PKR increments by
nonincreasing marginal return and test against exhaustive small-grid solutions.
Compare with feasible equal and historical-spend mixes scored on the same curves.
An explicit historical-only method uses train-period smoothed rates and an
assumed saturating curve, without borrowing an ML badge or silently masking errors.

Persist immutable JSON plan records in a separate SQLite store, serialize
publication with source selection/deletion, and cascade source deletion. The
latest 50 reports are listed; exports preserve source flags, model/config/evidence
and caveats. Bound requests to 200 increments, 100 representative rows per
platform/day and 200K scoring rows, with cooperative 20-second checks. Synchronous
planning does not claim durable job progress or cancellation. No live spend,
commerce ingestion, model tuning, weekly-grain support or Phase 5 work is included.


## Phase 3–4 debugging update · 2026-10-29

Completed in-place repair, without a rewrite or delegation. Daily/weekly import
recognition, preserved mapping/period provenance, currency/null cleaning, optional
conversion counts, genuine R², source/schema checks, and separate historical
readiness extend Phase 3. Phase 4 now requires a user budget, allocates exact
paisa on bounded sampled curves, preserves weekly prediction units, and hides
stale results pending explicit recomputation. Current methodology and validation
supersede the original fixed-step/daily-only descriptions above. No dependencies
were added, no Phase 2 implementation changed, and no future phase was started.
See `phase-34-debug-report.md` and the dated progress entry for test evidence.


## Critical repair follow-up · 2026-10-29

Completed actual Facebook provenance/model audit without retuning to artificial
labels. Separate spending feasibility from forecast support. Automatic dispatch
retains accepted model checks, independently screens the baseline, and returns
allocation-only/null money forecasts otherwise. Zero defaults and optional user
amount constraints enable small budgets. Current report and methodology supersede
the earlier hard historical support gate and unvalidated historical forecasts.
149 backend / 37 browser checks and required build/lint gates passed.
