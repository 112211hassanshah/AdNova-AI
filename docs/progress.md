# Progress

## Protected single-owner hosting preparation — 2026-11-01

Prepared the user-provided Vercel origin `https://black-stone-8p52.vercel.app`
for a separately hosted Python backend. Added server-side Basic authentication
(username `owner`) on both frontend and backend, constant-time credential checks,
fail-closed hosted configuration and configurable exact write origins. Render is
automatically treated as hosted; only the minimal health endpoint stays public.
No real password or API key was generated, committed or transmitted. No cloud
service, paid disk or provider secret was provisioned. Local defaults unchanged.

Added `docs/hosting.md` with Render startup/storage settings, matching private
password setup, Vercel API origin, smoke checks and limits. This is one protected
shared workspace, not multi-tenant accounts or Phase 7 platform connections.
Updated the workspace badge and backend error to work in both local/hosted use.

Verification: 197 backend tests passed with the project's macOS library environment
and required local socket access; initial restricted run had 9 environment-related
Spark/XGBoost failures, resolved on rerun. Type/lint, Ruff, production build and
format checks passed. Production browser test verified anonymous denial on both
services, authenticated API reads and a same-origin write through the actual
Next rewrite. Reviewed 1440px/375px screenshots with no horizontal overflow.
The default Playwright binary was absent; used already-installed Chromium via
`CHROMIUM_EXECUTABLE`. Evidence: `docs/hosting-browser-results.json` and
`docs/screenshots/hosting-{1440,375}.png`. Browser data/password were disposable
fictional fixtures; no merchant/NVIDIA credentials used. Hosted provider setup and
persistent-disk restart validation remain pending until the user configures them.

## Pre-Phase 7 audit and polish — complete (2026-11-01)

Audited existing import/analytics, actual model training/reload/output, constrained
allocation, commerce and NVIDIA boundaries. Fixed allocation-only lookahead when
no mature observations met the selected cutoff: later records now cannot rank
platforms. Added daily/lag/weekly regressions, later-record invariance, 40 independent
exhaustive comparisons for the actual nonuniform paisa allocator and deterministic
tie checks. Model/forecast policies and thresholds unchanged.

Polished first-use demo/CSV/no-history paths, clickable journey links, optional
training explanation, task-based Help, real-data/fairness/NVIDIA limits, advanced
sampling disclosure and budget-result interpretation. Help works during backend
outages. Added restrained frosted cards/banners with existing lime/charcoal tokens,
opaque accessibility fallbacks and readable chart legends. Visual review caught
and repaired a separate dark-card variant being overridden; added composited
RGB-gradient HTML text contrast checks. No new feature phase or dependency.

Verification: **195 backend tests passed, zero skips**; type/lint, production build,
Ruff and formatting passed. **70 existing browser checks** passed (23 data,
24 weekly-training/budget, 23 commerce), plus **9 polish journey checks** and
**63 route/width reviews** across all nine pages at 375–1440px. Final rendered HTML
text/control contrast audit, reduced motion, mobile focus trap/restoration and
simulated backend-down Help checks passed; no captured JavaScript page errors or
page overflow. Desktop/mobile screenshots reviewed. This is bounded engineering
QA, not a human usability study/full assistive-technology certification.

Fresh labelled 10K seed-42 HTTP demo actually trained/reloaded XGBoost: holdout
RMSE 7,195.26 vs baseline 10,415.53, WAPE 51.1%. The passing policy does not imply
merchant reliability. PKR 1M used 82,957 candidate predictions; 54,321.87 and 500
allocated exactly with unsupported revenue/ROAS withheld. Existing native Spark/
MapReduce correctness tests ran; no new 10M performance claim. QA used a disposable
workspace; original data/selections and credentials were not used for browser QA.
No external NVIDIA request, delegation, live spending or Project 1 access.

Resolved tooling/test issues: initial new audit fixtures duplicated manifest
metadata/imports; corrected and reran the whole suite. Updated a glossary test to
check its own disclosure instead of counting all open Help sections. Restricted
Next build stalled; terminated only its verified process and the local-access
build passed, including a final build after CSS repairs. No required check failed
at completion. Returned localhost:3000 to the normal workspace after QA.

**Conclusion:** real campaign CSVs can support local reporting and reviewed
advisory plans when data/gates allow. No-history users can learn with the demo,
not obtain invented personalized forecasts. Demographic fairness, causal uplift,
calibrated uncertainty, merchant accuracy and production security remain
unverified. NVIDIA explains approved qualitative evidence only; it neither fits
models nor improves their measured accuracy. Merchant export/reference validation
remains pending; Phases 7–8 stay future roadmaps.

Evidence: `polish-audit.md`, `polish-checks.json`, `polish-model-results.json`,
`polish-browser-results.json`, refreshed existing regression JSONs, and
`screenshots/polish-*.png`. Recheck command: `npm run test:e2e:polish` after the
saved HTTP demo is prepared (README documents isolation and prerequisites).

## Phase 6 — software complete; merchant validation pending (2026-10-30)

Implemented `/commerce`: separate immutable Shopify/generic order and line-item
snapshots, optional order/SKU costs, privacy filtering and HMAC order keys,
explicit financial/timezone/currency definitions, evidenced attribution, cost
coverage, reference discrepancies, descriptive contribution and gated profit
planning. Saved comparisons/plans restore and export; source deletion cascades
derived commerce results without removing independent ad/order sources.

Verification: **189 backend tests passed, zero skips**, including **25 commerce
cases**; TypeScript/ESLint, production build, Ruff and formatting passed. **23
commerce browser/outcome checks** and **47 existing data/weekly-ML/budget browser
regressions** passed. Reviewed seven widths and all nine routes desktop/mobile,
with labelled fields, control contrast, reduced motion and dialog focus checks.
No final page overflow or JavaScript page errors. Original source lists/selections
restored after browser QA; no NVIDIA call, dependency, delegation, Project 1 access
or live spending. The dev server remains available at localhost:3000.

Actual hand fixture: 9 lines -> 8 orders (6 eligible); store net PKR 6,400,
platform-reported revenue 12,000, matched subset 5,150, expenses 3,710, spend 1,000,
contribution 1,690. Four matched/one unmatched/one ambiguous/two excluded. Missing
costs/refund splits stay null; reference 6,500 exposes −100 PKR; forecasting blocks.
A separately labelled 90-day simulation actually fits/evaluates a contribution
response (270/90/90 chronological rows) and creates exact 5,000.37 and 7,500.19
plans. Binding YouTube cap, zero allocations, negative profit, missing holdout
support, weekly periods, no domain inference, private staging/exports and
precision boundaries are exercised.

Resolved issues include asynchronous profile/staging cleanup, keyboard focus
return, repeated personal headers, immutable plan restoration, financial units,
conservative refund handling, temporal support and extreme-value precision.
No required check remains failed. **Approved real merchant export/reference
validation remains pending**, so Phase 6 is not declared a completed real merchant
pilot. Forecasts remain advisory, uncalibrated and noncausal; local storage remains
unencrypted. Phases 7–8 are future roadmaps.

Evidence: `docs/phase-6-report.md`, `phase-6-guide.md`,
`commerce_data_contract.md`, `phase-6-methodology.md`, `phase-6-checks.json`,
`phase-6-browser-results.json`, `phase-6-outcomes.json`, and
`screenshots/phase-6-*.png`. README, implementation plan, help and root feature/
presentation contracts updated; original academic reports preserved.

## Optional NVIDIA AI Assistant — complete (2026-10-30)

User explicitly requested NVIDIA integration after Phase 5 and supplied a key.
Added `/ai-assistant`, private server-side credential management, real access
testing and explicitly approved explanations of whole-source performance,
latest completed model evaluation or latest saved budget. Raw rows, identifiers,
dates and numeric financial values stay local; NVIDIA receives previewed
qualitative observations derived by the existing Python services. The numeric
reference is inspectable locally. No financial formula, training or allocation
was moved into the LLM. At that delivery point, Phase 6/7 work was unstarted;
see the later Phase 6 entry above for the current commerce implementation.

The actual NVIDIA connection and synthetic explanation succeeded. The key is
stored only under ignored local `data/ai/`, owner-only permissions, never returned
or bundled. The UI supports replacement/removal; the pasted key should be rotated
in NVIDIA's console. Provider credentials/status are separate from ad connections.
Added bounded requests, no redirects, sanitized validation/provider errors,
source-bound hashes and explicit approval, final-text-only rendering and a gate
that withholds generated numeric claims. Source changes invalidate stale requests.

Verification: **164 backend tests passed, zero skips** (15 new AI cases), and
**17 browser checks passed**, including a real hosted explanation on disposable
synthetic evidence, labelled simulated rate-limit recovery, missing evidence and
empty selection. Reviewed seven widths (375–1440px) and all eight routes at
desktop/mobile; no final page overflow or page-level JavaScript errors. Type/
lint, production build, Ruff and formatting passed; affected AI tests and frontend
checks/build passed after final labels/source-flag fixes. Original dataset selection
and list restored; temporary QA sources removed. Exact-key scan found no copy in
nonignored project files. No dependency, delegation, Project 1 access or spending.

Issues found/resolved: initial live answer repeated numbers and was correctly
withheld; the refined qualitative payload produced a valid final explanation.
Constrained the preview's implicit grid tracks on mobile; gave the report selector
an explicit accessible name; changed a duplicate test fixture seed so stale-hash
rejection is exercised. Corrected the stale workspace phase field from four to five.
No required check remains failed. AI prose still requires review, and this free
hosted prototype is not production/merchant validation or encrypted key storage.

Evidence and setup: `docs/nvidia-integration.md`, `docs/nvidia-report.md`,
`docs/nvidia-checks.json`, `docs/nvidia-browser-results.json`,
`docs/nvidia-live-example.json`, `docs/screenshots/nvidia-assistant-{1440,375}.png`.
README, environment example, implementation plan, help and methods updated.

## Phase 5 — complete (2026-10-30)

Completed the university demo and final acceptance review for Phases 0–5.
Added the instructor walkthrough, reproducible seed-42 HTTP demo with actual
XGBoost fitting/re-evaluation and saved advisory plans, shared macOS Python
runtime setup, sequential verification command and full browser QA command.
Removed the stale million-PKR empty-Overview example, updated Help/footer scope,
added descriptive route titles and retained precision in sub-second lab chart
axis labels. Data Studio now describes large-data generation as available; its
desktop/mobile screenshots were refreshed. Reconciled the academic and design acceptance checklists with the
bounded verification evidence. No new dependencies or forecasting-policy changes.

Verification: **149 backend tests passed, zero skips**, including native XGBoost
and real existing Spark/MapReduce checks. TypeScript/ESLint, Ruff, formatting and
production build passed. Affected frontend checks/build passed again after the
last chart-formatting change. **47 browser regression checks** (23 data/recovery,
24 weekly-training/budget) and **55 final audit checks** passed. All seven routes
reviewed at 1440/1280/1024/768/430/390/375px, desktop/mobile screenshots reviewed,
no final JS/error-level console messages or page overflow. Checks include labels,
titles, main/h1, control-text contrast, reduced motion, keyboard skip link and
mobile dialog focus. The final audit rerun reuses the separately saved passing
regression results, explicitly disclosed in its JSON report.

Actual seeded demo: accepted synthetic XGBoost holdout RMSE 7,195.26 versus
baseline 10,415.53. The million-PKR plan used 82,957 actual candidate predictions;
PKR 54,321.87 and 500 remain exact allocations with unsupported revenue withheld.
Full runtime evidence lives under ignored `reports/phase5/`; a synthetic manifest
copy is in `docs/phase-5-demo.json`. Dataset selection/list restored after QA;
prepared synthetic model/plan versions and measured lab records remain available.

Fresh 10K browser-launched Pandas/local MapReduce/local Spark benchmark: **9/9
correct measured repeats**, saved separately as `docs/phase-5-benchmark.{json,csv}`.
Inspected all **36** correct historical repeats at 10K/100K/1M/10M; those October
28 measurements were preserved and are not claimed as newly rerun.

Problems disclosed and resolved: raw direct pytest first lacked the documented
macOS OpenMP path (143 passed/six failures); the configured rerun and verifier
passed all 149. Playwright's default browser cache revision was absent, so used
the supported installed-Chromium override (153.0.8010.12). Updated a stale test
that tried to edit a correctly locked, header-detected Purchases definition.
The tick-label assertion was checked against the installed Recharts DOM.
No unresolved required-check failure remains.

Evidence: `docs/phase-5-report.md`, `docs/university-demo.md`,
`docs/phase-5-checks.json`, `docs/phase-5-browser-results.json`, demo/benchmark
JSON/CSV, and `docs/screenshots/phase-5-*.png`. README, implementation plan,
methods/limits and root acceptance documentation updated. Project 1 untouched;
no delegation, live connection or spending. Current scope stays local single-user
without authentication. Merchant accuracy, calibrated uncertainty/causal proof,
full assistive-technology certification and production readiness are not claimed.
**Next: Phase 6 optional commerce/Shopify CSV pilot; not started.**

## Critical ML and budget planning repair — complete (2026-10-29)

Inspected the actual original/cleaned/dated/revenue-added Facebook files and
reloaded the saved XGBoost. Reproduced all saved metrics exactly: validation
RMSE 161.551856 vs baseline 163.723097 (1.326% improvement); holdout 104.246128 vs
133.204495 (21.740%). Only the validation 5% gate failed. Threshold unchanged.
The original file has no dates or revenue; the modified file marks both synthetic
and uses revenue = 100 × approved conversions. Each ad ID occurs once. These
modifications do not establish real time-series revenue evidence. Component flags
were previously discarded; new imports preserve them and older affected imports
are gated pending reimport. The prior Shopify-style rate-to-count mapping is also
flagged; new imports reject it.

Reproduced the exact Facebook 13-day 196,017.997–1,221,735.741 range: historical
row bounds divided by representative context weights and multiplied by periods.
Moved this to forecast support only. User constraints now determine feasibility,
with 0%/100% defaults, zero allocations and optional true PKR floors/caps.
Automatic mode tries accepted supported ML, an independently evaluated baseline,
then exact budget allocation with null revenue/ROAS. Historical mode also requires
baseline screening. Rejected ML is never loaded as an accepted forecast. Supported
forecasting considers active-platform subsets; weekly periods remain intact.
ML Studio shows actual RMSE comparisons/change and a usable planning link after
rejection. Original source/model/evaluation records and UI design are preserved.

Verification: **149 backend tests passed**, including the user's current modified
Facebook file, deterministic small-budget/constraint/selection tests and existing
Spark/MapReduce checks; **37 browser checks passed**. Reviewed all seven routes at
desktop/mobile and optimizer at five widths. No final JS errors/page overflow.
TypeScript/ESLint, production build, Ruff and formatting passed. An accepted-model
browser pass found a hidden chart tooltip creating mobile overflow after resize;
contained it and reran successfully. QA sources/models/plans removed and original
workspace selection restored. No dependencies, delegation, Project 1 access or live
spending. No future phase started.

Evidence: `critical-ml-planning-report.md`, `critical-ml-audit.json`,
`critical-planning-browser-results.json`, updated `phase-34-debug-browser-results.json`,
`screenshots/critical-planning-{1440,375}.png`. All synthetic components stay labelled;
source currency, real temporal backtests, calibrated uncertainty and causal response
remain unverified. The 5%/baseline policies are explicit operational screens, not
production certification. Use real timestamped attributed-revenue data before
merchant reliability claims.


## Phase 3–4 debugging — complete (2026-10-29)

Read the supplied repair request and existing contracts; inspected import, ML,
optimizer, APIs, persistence and frontend state. Implemented Phase 3 import/ML
repairs with tests, desktop/mobile browser review and build first, then Phase 4
budget fixes and integration checks. No delegation, rewrite, Project 1 changes,
new dependencies, Phase 2 implementation changes or live spending.

Delivered deterministic confidence-based CSV suggestions with manual ambiguity
resolution, currency/null cleaning, preserved mapping provenance and genuine
weekly periods. Revenue training no longer requires optional conversion counts;
real XGBoost fitting and chronological baseline gates remain, with R² and stronger
source/schema checks. Weekly maturity/inference/planning preserve period units.
Historical readiness is separate from ML readiness. Fresh budget forms are empty,
API budget is required, arbitrary two-decimal amounts flow through exact paisa
allocation on bounded sampled curves, and stale estimates hide until recalculation.
Supported-range/feasibility failures remain explicit.

Validation: **134 backend tests passed**, including existing Spark/MapReduce;
TypeScript/ESLint, production build, Ruff and formatting passed. Actual uploaded
weekly/daily synthetic fixtures train XGBoost. Five requested budget scales,
including PKR 54,321.87, total exactly with changed estimates and unchanged model
artifacts. **24 browser checks**, desktop/mobile screenshots and seven-route review
are recorded in `phase-34-debug-browser-results.json` and `screenshots/debug-*`.
Original workspace dataset selection restored; temporary QA artifacts removed.

Issues caught and corrected: invalid sample values initially hid canonical metric
mappings; TikTok camel-case normalization needed its explicit alias; method select
needed an accessible name; date arithmetic triggered a dependency deprecation.
No outstanding check failures. See `phase-34-debug-report.md` for root causes,
changed files, command results, assumptions and remaining limitations. Model
acceptance is not production validation; uncertainty/causal effects remain
unquantified. No future phase has been started.


## Phase 4 — complete (2026-10-29)

User authorized the Budget Optimizer next, deferring broader real-data/model
improvements. Delivered bounded campaign-day scenario mapping, actual accepted-
model inference, disclosed concave response adjustment, exact constrained PKR
allocation, same-budget comparisons, an explicitly selected historical heuristic,
immutable source-specific plans and CSV/JSON exports. Responsive Budget Optimizer
includes validation/remedies, what-if reruns, saved-input restoration, stale-result
warnings, raw/adjusted charts and table values, and an accessible methodology
dialog. Overview, ML links, help, capabilities and backend/package version updated.
No delegation, Project 1 access, live spending, commerce ingestion or model tuning.

Verification: **119 pytest tests passed (23 Phase 4)**, **55 browser checks passed**,
TypeScript/ESLint, production build, Ruff and formatting passed. Optimizer reviewed
at seven widths (375–1440px), all seven routes at desktop/mobile; no page overflow
or captured error-level browser console messages. Real model/historical plans,
20% Google cap, disabled platform, failure gates, downloads, persistence, keyboard
dialog/table/mobile navigation and source isolation exercised. Original workspace
dataset selection restored; only synthetic demo plan snapshots were saved in QA.

Actual synthetic default plan allocates exactly Rs. 1,000,000 in Rs. 10,000 steps:
Facebook 260K, Google 220K, Instagram 220K, TikTok 150K, YouTube 150K. Its 20,860
campaign-day candidate predictions are real saved-model calls; estimates remain
simulated, without real-business accuracy, confidence or causal uplift claims.

Resolved sandbox preview/Spark/build restrictions through required local execution;
normal isolated package build resolved missing setuptools and refreshed 0.4.0.
Reused locked SciPy for the curve LP. Corrected synthetic effective-lag display
and hundredth-percentage rounding. Full evidence/limits are in
`docs/phase-4-report.md`, `docs/phase-4-methodology.md`,
`docs/phase-4-demo-plan.json`, `docs/phase-4-browser-results.json` and
`docs/screenshots/phase-4-{plan-1440,plan-375,methodology-375,preview}.jpg`.

Limits: fixed representative mix, platform-wide positive-spend support,
assumption-based saturation/shape, no quantified uncertainty or causal/merchant
validation. Requests are bounded synchronous work with cooperative time checks,
not cancellable durable jobs or hard OS limits. Latest 50 plans per source are
listed; no individual-plan deletion UI/automatic retention. Weekly data, commerce
and live connections remain future work. QA-owned preview servers stop after
verification; launch with `npm run dev`. Next is **Phase 5: final university
demonstration and review**; it has not been implemented in this request.

## Phase 3 usability follow-up — guided reporting questions (2026-10-28)

User pointed out that nontechnical users cannot act on reporting-definition errors.
Replaced the dead-end workflow with shared plain-language questions in CSV import
and ML Studio, evidence-based detection, “I’m not sure yet” plus explanatory help,
and an analytics escape route. An explicit Purchases header or mapped rule column
can supply evidence; generic conversion counts, Sales objectives, provider names
and financial values cannot invent a conversion definition/window.

Missing saved-report answers can now be completed in ML Studio without a new
upload. Explicit confirmation creates/selects an immutable source-linked revision,
records evidence, preserves measurements/source flags and retains original model
snapshots. Detected known rules cannot be overwritten. Mixed rules remain blocked;
partial rules need confirmation; CSV remapping clears stale auto-detected values.
Unknown placeholders share the same gate across import and training. Saving
answers checks readiness without automatically training or producing a forecast.

Verification: **96 pytest tests passed** (15 new guided-setup cases), **17 browser
checks passed**, TypeScript/ESLint, production build, Ruff and formatting passed.
Reviewed the question panel at desktop/mobile and checked seven widths
(375–1440px) without page overflow/captured page-level JS errors. Test fixtures were
synthetic/disposable and the prior workspace selection was restored. No answers
or source flags were assigned to the user's existing reports.

Evidence and lifecycle details: `docs/reporting-setup-guide.md`,
`docs/reporting-setup-browser-results.json`,
`docs/screenshots/reporting-questions-{1440,375}.png`.
Limits: file/user-stated definitions are not provider-verified; no missing rule is
recoverable from aggregate money alone. Revisions have separate retention/delete
lifecycles. Weekly-data support, allocation and live connections remain outside
this change. No delegation or Project 1 changes.

## Import follow-up — provider/channel mapping and weekly exports (2026-10-28)

Reproduced the user's supplied 96-row `sample_marketing_campaigns_pkr.csv`:
manual platform mapping to `ad_platform` accepted Google Ads (48 rows) but
rejected Meta Ads/TikTok Ads (48). The provider column also combines Google with
YouTube and Meta with Facebook/Instagram; it cannot identify canonical platforms.

Corrected suggestions to use `channel` when `ad_platform` and `channel` coexist,
recognize `spend_pkr`/`revenue_pkr`, and normalize explicit Google Search/Display
and TikTok Ads labels. Meta Ads stays ambiguous without channel evidence. Added
validation against misclassifying channel-specific rows under a broad provider,
and enforced PKR units declared in mapped metric headers.

The supplied file contains weekly boundaries/totals, not daily observations.
The old importer could accept a manually mapped week boundary as a daily date.
Added preview warnings and blocking weekly/monthly boundary / multi-day provider
period checks. Weekly totals are never spread across invented daily rows; a real
daily-date export remains supported. The user's file now normalizes all 96 rows
without platform errors (Google 32; Facebook/Instagram/TikTok/YouTube 16 each),
with every spend/revenue value preserved. Saving remains blocked by the explicit
unsupported weekly-grain explanation. No original CSV or saved dataset changed.

Verification: **81 pytest tests passed**, including six new mapping/ambiguity/
currency/period regressions; Ruff, npm check/build/format passed. **Nine browser
checks** used the actual supplied file at desktop/mobile, verified suggestions,
zero platform errors, weekly import blocking, no page overflow and no captured
page-level JS errors. Successful test preview was discarded. Browser evidence:
`docs/import-mapping-browser-results.json` and
`docs/screenshots/import-mapping-weekly-{1440,375}.png`.
The first browser evidence read hit Chrome response-cache eviction; switched the
test to pass through/capture actual server responses before eviction, then passed.

Current limitation: daily campaign data only. The 96 weekly observations also do
not meet the current daily ML history/row gates. User must supply a daily export
for this workflow; separate weekly-grain support is not implemented in this fix.

## Phase 3 follow-up — custom CSV readiness message (2026-10-28)

User reported custom CSV training blocked with a missing-financial-fields message.
Inspected `test_1`: all 595 rows have spend/conversions/revenue, but both conversion
and attribution definitions were imported as unspecified. The saved readiness flag
covers both financial completeness and reporting definitions; the ML service had
incorrectly interpreted every false flag as missing financial fields.

Corrected the diagnostic to name actual incomplete columns or missing reporting
definitions separately, preserving the training gate. Added regression coverage
for complete financials with unknown definitions and an actually missing revenue
column. **75 backend tests passed; Ruff passed.** Desktop/mobile verification is
recorded in `phase-3-readiness-fix-browser-results.json`, with screenshots under
`docs/screenshots/phase-3-reporting-definitions-{1440,375}.png`.

No dataset, reporting definition or source flag was changed. Asked the user for
actual conversion/attribution definitions and whether the CSV is generated test
data. Their screenshot's as-of date/lag retains 395 rows through 2026-09-17;
that cutoff is distinct from the current unspecified-definition blocker.

## Phase 3 — complete (2026-10-28)

Delivered actual chronological XGBoost revenue training, train-only features and
baseline, validation model selection, sealed holdout evaluation, model registry,
source-bound guarded inference and responsive ML Studio. No delegation or
Project 1 access. No Phase 4 allocation, commerce ingestion or live connection.

Verification: **73 pytest tests passed (17 Phase 3)**, **35 browser checks passed**,
TypeScript/ESLint, production build, Ruff and formatting passed. ML Studio reviewed
at seven widths (375–1440px), all seven routes at desktop/mobile, screenshots and
in-app mobile results inspected. No page overflow/captured page-level JS errors.

The saved 10K seed-42 synthetic demo trained XGBoost successfully and passed the
v1 model gates. Holdout: 1,936 rows; MAE Rs. 5,202.99, RMSE Rs. 7,195.26,
WAPE 51.1%; baseline Rs. 7,582.80 / Rs. 10,415.53 / 74.4%. These are synthetic
per-observation errors, not real-business forecasts or causal evidence.

Added immutable input checksums, maturity/as-of controls, whole-date 60/20/20
splits, native artifacts/JSON preprocessing, model/hash/version/provenance checks,
explicit saved-model evaluation/export, platform diagnostics, acceptance gates,
campaign-day inference bounds, persistent jobs/cancellation/stale recovery and
source deletion of derived artifacts. Failed quality gates do not fake success;
fit status and prediction eligibility remain separate. Budget actions stay gated.

Issues resolved: network timeout/slow pip transfers (official SHA256-verified
wheel range downloads); missing Mac OpenMP path (reuse sklearn's bundled runtime
in launcher/worker); native import fallback errors; production build sandbox
restriction; refreshed editable-package hidden `.pth` flag (the managed environment reapplies
it; use `PYTHONPATH=backend/src` for direct CLI imports).
Review also fixed stale UI polling, recovery/publication and late-cancel races.
No system installation or dependency binary was modified. Direct Mac test commands
need the documented OpenMP process path when a system runtime is absent.

Artifacts: `docs/phase-3-report.md`, `docs/phase-3-methodology.md`,
`docs/phase-3-demo-evaluation.json`, `docs/phase-3-browser-results.json`,
`docs/screenshots/phase-3-{studio-1440,studio-375,diagnostics-1440,insufficient-1440}.png`.
Updated README, implementation plan, methods/limits, dependencies and browser script.

Limits: selected campaign report <=100K rows; no uncertainty calibration or causal
claims; campaign overlap disclosed; maturity is configurable, not verified finality;
cooperative resource/cancellation checks; latest 100 runs in UI; no automatic
retention or full assistive-technology/browser-engine certification. The evaluated
demo remains selected and local servers are running for review. Next is Phase 4.

## Phase 2 — complete (2026-10-28)

User approved Phase 1 and requested the next phase after increasing reasoning.
Repeated the required very-high-reasoning reminder; no model settings changed.
No delegation or Project 1 access. Completed one Phase 2 vertical slice only.

Implemented isolated lab datasets/jobs, bounded deterministic Parquet
generation, Pandas/in-memory-or-chunked, local process map/shuffle/reduce and
local PySpark aggregation, correctness gates and measured repeats. Added the
responsive lab interface and Data Studio academic-data entry point.

Environment: installed optional PySpark and psutil in the project virtualenv;
downloaded official Temurin Java 17 into ignored .runtime and verified SHA256.
First real 10K smoke run passed three repeats in each engine. It exposed a Spark
warning about Pandas 3 support; aligned the supported dependency range to Pandas
2.3 before final measurement. Java, process monitoring and resource gates now
report measured local availability.

Delivered:

- Data Studio academic generator and Big Data Lab for 10K/100K/1M/10M synthetic
  rows, configured seed/dates/platforms, bounded physical Parquet chunks, unique
  campaign/day identities, simulation truth separation and file checksums.
- A separate lab namespace: large inputs never enter Overview's small-data read
  path or silently replace/combine advertiser reports. Saved inputs support
  checksum-verified reuse, bounded 20-row previews and confirmed deletion.
- Real in-memory/chunked Pandas, local process map/shuffle/reduce and local[2]
  PySpark DataFrame workloads. Same projected fields, null semantics, exact
  integer monetary/conversion sums and post-aggregation weighted rates.
- Persistent SQLite jobs, a single active-job guard, genuine progress,
  cancellation, resource/deadline checks and interrupted-worker recovery.
  Local engine process groups are cleaned up even after a runner exits.
- Measured repeats, medians, throughput, separate setup/generation, sampled
  process-tree RSS and actual environment. Failed/unavailable/skipped engines
  never get fabricated comparison times. JSON/CSV exports and saved-run views.
- Responsive lab forms/results, scale/throughput chart and accessible table,
  platform totals, method/environment disclosure, keyboard access and recoverable
  validation. Comparisons group matching configuration/software/hardware.

Verification:

- **56 pytest tests passed**, including real Spark/MapReduce parity, a hand-
  calculated missing/fractional/zero fixture, deterministic chunk boundaries,
  persistent workers/reports, limits, isolation, deletion, stale-worker recovery,
  live Spark cancellation and an exited runner's orphan process group.
- **36 browser checks passed** in the in-app Chromium browser using CUA and
  Playwright locator assertions. Ran an actual saved-input three-engine job,
  downloaded its nine CSV repeats and a complete JSON report, generated an
  academic input from Data Studio, validated dates/required engines, inspected
  saved 10M weighted totals/scale charts and bounded previews, exercised deletion
  confirmation, table keyboard scrolling, mobile drawer focus and skip link.
- Lab checked at 1440/1280/1024/768/430/390/375px; all seven routes at 1440 and
  375px. Expanded academic Data Studio also checked on mobile. No horizontal
  page overflow; long tables remain within labelled scroll regions. No captured
  uncaught JavaScript/hydration errors. Desktop/mobile screenshots reviewed.
- `npm run check`, `npm run build`, `npm run format:check` and
  `.venv/bin/ruff check backend scripts` passed.
- Final recorded matrix: **all 36 repeats passed** across all four scales and
  three engines. Measured separately from test/build workloads. At 10M, Pandas
  used chunks; no 10M-row DataFrame/browser table was created. Actual Parquet
  size was about 201 MiB. Exact individual observations are in the JSON/CSV.
- Browser cancellation stopped a real new-seed 10M generation after 2M rows;
  its incomplete input was removed and the form re-enabled. No active lab jobs
  or incomplete input folders remained at final inspection. Local servers stay
  running for review; backend version is 0.2.0.

Issues resolved/disclosed: missing Java/PySpark; Spark's Pandas-3 compatibility
warning; restrictive sandbox socket/process access for Spark tests; denied
process inspection now leaves memory unknown rather than failing work; test
float equality corrected to tolerance; mapper startup moved fully into setup;
stale-worker/deletion races and orphan cleanup hardened. Pandas-2 importer
downcast warnings were removed with explicit blank masking and regression tests.
CUA date fill alone changed DOM values without committing React changes;
native keyboard editing worked and was used for actual validation checks.

Artifacts:

- `docs/phase-2-report.md`, `docs/phase-2-methodology.md`
- `docs/phase-2-benchmark-measurements.json`, `docs/phase-2-benchmark-timings.csv`
- `docs/phase-2-browser-results.json`
- `docs/screenshots/phase-2-lab-1440.jpg`, `phase-2-lab-375.jpg`
- `docs/screenshots/phase-2-results-1440.jpg`, `phase-2-results-390.jpg`
- `docs/screenshots/phase-2-scale-chart-1440.jpg`, `phase-2-data-studio-390.jpg`
- Updated README, implementation plan, data dictionary, limitations and locks.

Limits: synthetic academic inputs; local execution only, no Hadoop/cluster;
sampled RSS can miss short peaks/count shared pages twice; fixed engine order
and warm OS/JVM caches affect timings. The UI lists the latest 30 jobs; older
known-ID reports remain stored. No automatic lab retention or raw large-input
download. Full screen-reader/WCAG certification and WebKit/Firefox review remain
unperformed. Existing npm transitive ESLint peer-range warnings remain documented.
No ML training, budget recommendation, commerce ingestion or live connection is
claimed. Next is **Phase 3: actual chronological ML training/evaluation and ML
Studio**, not started in this Phase 2 request.

## Phase 0 — complete (2026-10-28)

Read all supplied instructions thoroughly. Resolved the mismatch between the old
software-house documents and the current advertising optimizer request. Preserved
original references and installed active project-specific startup instructions.

Implemented a real FastAPI health/capability API and UI-independent service,
Next.js routes and typed client, responsive rounded bento shell, focus-managed
Radix mobile drawer, first-run Overview/Data Studio, readiness screens and help.
No metrics, fake charts, mock model or connector is presented as functional.

Environment issues: sandbox registry DNS failure on initial dependency install;
retried installation with network permission. System Python is 3.9; created a
Python 3.12 virtual environment. RAM and process inspection are sandbox-denied;
resource limits remain unknown rather than assumed. User notified.

Verification:

- Backend: 3 API tests passed (empty state, OpenAPI/health, unsupported actions).
- TypeScript + ESLint 10: passed without warnings. Ruff: passed.
- Production Next.js build: passed; all seven application routes generated.
- Playwright: 27 checks passed, with zero browser JavaScript errors.
- Overview checked at 1440, 1280, 1024, 768, 430, 390 and 375px; every route
  checked at 1440 and 375px. No horizontal overflow in those checks.
- Verified source selection explanations and disabled future actions, drawer
  focus/Escape/navigation, help glossary, skip link, real loading, simulated HTTP
  outage and recovery via retry, and unknown-route recovery.
- Reviewed desktop and mobile screenshots against the supplied reference.
  Fixed a missing space at the mobile heading break, increased small metadata,
  and simplified the mobile header to prevent awkward status wrapping.
- Verified `npm run dev` starts both services on fixed loopback ports, and its
  shutdown stops the frontend/backend. Preview stopped after QA.

Artifacts:

- `docs/screenshots/phase-0-overview-1440.png`
- `docs/screenshots/phase-0-overview-390.png`
- `docs/screenshots/phase-0-data-studio-375.png`
- `docs/browser-check-results.json`

Other issues resolved: existing npm cache permissions (isolated temporary cache);
macOS hidden flag on an editable-package .pth (cleared, plus explicit source paths
for launcher/tests); sandbox port/build worker restrictions (permitted local
execution); installed Chromium revision differed from Playwright's default
(explicit CHROMIUM_EXECUTABLE). The first browser-test failure was an overly broad
alert selector including Next.js's route announcement, not a recovery failure.
Screenshot paths initially used a URL-encoded directory; fixed with fileURLToPath,
moved the generated files to this workspace and removed the accidental empty
folders. All problems were disclosed during implementation.

Implemented scope is the foundation only. No datasets are generated or imported;
no analytics engines have run, no measured benchmarks exist, no ML model is
trained and no recommendation is produced. Upload/generate controls are visibly
disabled with Phase 1 explanations. No live integrations, authentication or
multi-tenant security. Full assistive-technology/WCAG certification has not been
performed; the keyboard, contrast-token and responsive checks are a starting gate.

At Phase 0 completion, Phase 1 had not started. Before Phase 2 Spark/MapReduce, remind the user to set
very high reasoning. Report problems promptly for their optional Astra switch.

## Phase 1 — complete (2026-10-28)

Delivered the data/metrics vertical slice with its backend and styled interfaces
together. Project 1 remains untouched.

Working functionality:

- Deterministic Pakistan campaign/day generator (UI 1K/10K presets, seed, dates,
  enabled platforms) with coherent funnel, seasonality/fatigue/saturation and
  separate evaluation-only simulator parameters. Default required platform
  coverage is ensured. All generated results stay visibly synthetic.
- Isolated Parquet datasets and SQLite manifests/selection, ownership namespace,
  field coverage, original currency/rate, import profile and source definitions.
  Selection survives navigation and restart. No source concatenation.
- Streamed CSV upload, sanitized preview, common Meta/Google/TikTok/generic mapping
  suggestions, editable mapping, explicit date/currency/default platform choices,
  numeric/duplicate/grain checks, invalid-row review/exclusion and final confirmation.
  Commit revalidates. Missing metrics remain null; synthetic flags are preserved.
- Exact duplicate imports blocked; daily-key overlap with existing reports warned;
  stable campaign IDs preferred for duplicate identity. Personal-data headers
  recognized by the importer are removed before staging. Orders CSVs are rejected.
- Weighted CTR/CPC/CPA/CVR/ROAS, sums, server-side filters, date trends, platform
  comparisons, campaign/audience grouping, sortable/paginated performance tables,
  bounded raw previews and safe source-labelled CSV exports.
- Rounded Data Studio, Overview and Campaigns, source/coverage details, accessible
  chart tables, persistent shared filters, explicit empty/loading/error/retry
  states, deletion confirmation and mobile navigation. Overview's filters and
  optional import columns use progressive disclosure.
- Separate commerce order/item/cost/attribution contracts only; no pilot importer.

Verification:

- 28 pytest unit/HTTP tests passed. Cases include generator determinism/coherence,
  weighted ratios/zero denominators, missing/partial metrics, exact coverage,
  currency/rate validation, duplicate identity and overlap, invalid exclusions,
  provenance, order-file rejection, fractional conversions, daily granularity,
  size/path guards, HTTP import confirmation, export safety and persistent storage.
- 23 Playwright journey/recovery checks passed with no JavaScript runtime errors.
  Generated/saved 10,000 rows, used real API metrics, imported synthetic missing-
  revenue and invalid-row fixtures, validated manual mapping/confirmation, exercised
  sorting/grouping/pagination/filter persistence/downloads/selection/deletion,
  checked invalid dates/empty results, keyboard help/skip navigation, loading,
  workspace and analytics outages/retry, and unknown-route recovery.
- Overview/Data Studio/Campaigns checked at 1440, 1280, 1024, 768, 430, 390 and
  375px with no horizontal page overflow. Raw/performance tables scroll inside
  labeled keyboard-accessible regions. Reviewed desktop/mobile screenshots.
- TypeScript + ESLint, Ruff and Prettier checks passed. Next.js production build
  passed with all application routes generated. The dev server remains running
  at http://127.0.0.1:3000 as requested; backend is port 8000, version 0.1.0.
- A saved 10,000-row synthetic demo remains selected for inspection. Browser QA
  removes its temporary import fixtures and restores the previous selection.

Issues encountered and corrected (disclosed during work):

- Root runtime ignore patterns previously also hid source folders named `data`;
  anchored the runtime exclusions at the repository root.
- Implicit select labels included option text, breaking exact accessible-name
  lookup; added explicit accessible control names.
- Coverage rounding could hide a single missing value in a large file; retained
  full precision for gates and prevented display rounding up to 100%.
- Duplicate keys previously included both display names and IDs; now stable IDs
  take precedence, including renamed campaigns.
- Switching imported currency back to PKR now clears a stale foreign-currency
  exchange rate. Excluded-invalid-row messages reflect the user's actual choice.
- Source files were formatted for reviewability. Recognized current lint-plugin
  peer-range warnings remain documented: npm warns about ESLint 10 compatibility
  ranges, while the configured lint/build checks pass. No force suppression.

Artifacts:

- `docs/phase-1-browser-results.json`
- `docs/screenshots/phase-1-overview-1440.png`
- `docs/screenshots/phase-1-overview-390.png`
- `docs/screenshots/phase-1-campaigns-1440.png`
- `docs/screenshots/phase-1-campaigns-390.png`
- `docs/screenshots/phase-1-data-studio-390.png`
- `docs/screenshots/phase-1-import-validation-1440.png`
- `docs/data_dictionary.md`, `docs/commerce_data_contract.md`,
  `docs/methods_and_limitations.md`, updated README and dependency locks.

Limits: small synchronous backend worker-thread tasks only; generation <=10K,
CSV <=100K rows/10 MiB, fixed Pakistan geography/uneven platform weights, no
Parquet import, no full screen-reader/WCAG or external merchant-data audit.
Pandas is used for current analytics, but **no engine comparison benchmarks were
run**, no ML was trained and no budget recommendation is produced. No live
connections, commerce ingestion, authentication or multi-tenant security.

Next is Phase 2: bounded large-data generation and actual Pandas / local
MapReduce / PySpark parity and measured experiments with Big Data Lab UI.
**Before starting Spark + MapReduce implementation, remind the user to change
reasoning to very high.** Do not begin Phase 2 as part of this Phase 1 request.
