# Pre-Phase 7 audit and polish · November 1, 2026

Scope: improve and verify the existing local single-user application. No Phase 7
connector, new product feature, dependency, authentication, live spending, model
threshold relaxation or Project 1 change. No delegation. Real merchant validation
remains pending. This report distinguishes software correctness from business
reliability.

## Findings and changes

- **Temporal defect fixed:** allocation-only planning previously used the entire
  source when no observations met its as-of/maturity cutoff. It could therefore
  rank platforms using later records. It now refuses with an actionable message.
  Daily, lagged and incomplete-week cases are covered, together with invariance
  to later records when mature observations do exist.
- **Navigation:** the journey steps are now working links. Data Studio marks Add
  data as the current step even with a selected report. “Check model” and the
  accompanying note make training optional for allocation-only planning.
- **First visit:** the empty Overview offers demo, campaign-report and no-history
  paths. Data Studio explains how to obtain an authorized campaign export and
  what to do without history. No API key is required to explore the demo.
- **Progressive disclosure:** curve sampling is collapsed as advanced. Budget
  results explain how to interpret the actual forecast/allocation status, zero
  allocations and exact ties. A missing forecast is never labelled zero revenue.
- **Help:** task-based guide, real-data requirements, first-campaign limits,
  fairness, commerce prerequisites and NVIDIA's role. Help remains accessible
  even if the backend is unavailable; its disclosures work without backend data.
- **Visuals:** restrained frosted surfaces, translucent white borders, highlights
  and shadows on the existing white/lime/charcoal system. Blur is limited to
  prominent cards/banners. Controls/data remain readable; forced-colors and
  reduced-transparency modes remove blur and use opaque backgrounds. No new
  animation. All original routes and primary navigation labels are retained.

## Model and output audit

Inspected feature construction, train-only categorical preprocessing, chronological
60/20/20 date splits, validation selection, holdout evaluation, artifact hashes,
inference gates, response adjustment and exact-money optimization. Outcomes,
campaign IDs and simulator truth are excluded from features. Spend and pre-period
platform/age/gender/city/device/calendar context remain inputs. Observed spend is
only a proxy for planned spend. Existing tests check that altering holdout targets
does not change fitted parameters/model artifacts, that rejected/corrupt/mismatched
models cannot be used as accepted forecasts, and that missing/weekly labels retain
their units and maturity rules.

Fresh HTTP demo trained XGBoost on a labelled seed-42 synthetic 10,000-row report,
reloaded it and reproduced holdout evaluation. Holdout: 1,936 rows, RMSE
**7,195.255384** versus **10,415.532597** for the historical baseline; MAE
**5,202.986453**, R² **0.437093**, WAPE **0.510550**. These are campaign-observation
PKR errors in a simulation, not measured merchant accuracy. The approximately
51.1% WAPE is a substantial limitation even though the configured acceptance
policy passed. No thresholds were changed to make the run pass.

The actual PKR 1,000,000 demo plan invoked 82,957 candidate predictions and summed
exactly to its budget. PKR 54,321.87 and PKR 500 also summed exactly; supported
revenue/ROAS forecasts were unavailable and stayed null. Raw evidence is local
under ignored `reports/phase5/`; a compact labelled copy is in
`polish-model-results.json`. These estimates are not actual sales or causal uplift.

New independent audit checks compare the actual segment/paisa allocator against
exhaustive enumeration in 40 seeded small nonuniform concave cases. The objective
agrees with each exhaustive optimum. This verifies the constrained curve problem,
not global business optimality. An exact-tie test documents platform-name order
and invariance to input order. Existing tests cover active-platform subsets,
constraints, zero allocations, unsupported dates/budgets, repeated outputs,
same-budget comparisons and exact displayed percentage totals.

## Is the outcome totally fair?

No blanket fairness claim is justified. The mechanics are reproducible; the same
acceptance policy is applied, platform support/error is inspected, and comparisons
use the same budget and limits. That is a bounded procedural check.

Limitations remain:

- RMSE and WAPE emphasize higher monetary outcomes; unequal platform sample sizes
  and historical selection/attribution bias can affect model choice.
- Demographic fields are predictors. There is no audited demographic fairness
  constraint, counterfactual fairness analysis or protected-group error guarantee.
- Maximizing an estimated response does not seek equal platform shares. Ties use
  deterministic platform-name order and can concentrate spend. User floors/caps
  express actual constraints; they are not automatically inferred provider rules.
- Diminishing returns, representative campaign mix and interpolation are imposed
  planning assumptions. Better fitted error does not prove better causal allocation.
- No calibrated uncertainty interval, causal incrementality, cross-channel overlap
  correction, response drift monitoring or prospective merchant result is established.
- Inspecting holdout evidence repeatedly during iterative development can overfit
  decisions to that history. A new unseen time window and prospective controlled
  measurement are needed for merchant validation.

## Can a real advertiser use it now?

**Yes for local reporting and reviewed advisory scenarios with suitable data; no
claim of validated autonomous business optimization.** CSV mapping/validation,
weighted analytics, missing-data gates, model evidence and exact budget allocation
are implemented. A real file is not automatically a fit training source. The prior
Facebook audit already showed that adding assumed dates and revenue to a report
cannot establish real temporal revenue evidence; those flags remain gated.

Revenue fitting needs complete spend/revenue, known reporting definitions, at
least 300 mature rows and 30 distinct dates (30 periods for weekly reports),
180/60/60 split rows, spend variation and platform support. Acceptance then requires
validation and holdout improvement and the existing platform checks. Planning has
additional temporal/spend support. Passing all these operational screens still
does not establish merchant reliability. Missing revenue supports available
analytics and labelled historical allocation only, not a financial forecast.

Commerce additionally requires compatible order/ad provenance, period/timezone/
currency definitions, evidenced attribution and sufficiently complete costs.
Store net sales, platform-reported revenue and matched store revenue are distinct.
Merchant export/reference reconciliation and real chronological evaluation are
still required. No source was relabelled as real for this audit's evidence.

This is unencrypted local storage without authentication, not a secured hosted or
multi-user service. CSV imports are bounded to 10 MiB/100,000 rows, training to
100,000 campaign rows, and campaign demo generation to 10,000 rows. Big Data Lab
inputs remain separate academic experiments. Source selection is explicit; the
app does not silently combine separate advertiser reports or synthetic/real data.

## No CSV / no campaign history

A person with campaigns but no file can obtain an authorized daily/weekly report
from their ad reporting tools and use existing CSV import. Current live connectors
are unavailable. A person with no advertising history can learn every existing
workflow using labelled synthetic data, but cannot obtain a defensible personalized
first-campaign forecast. Orders alone do not supply ad spend/channel attribution.
NVIDIA cannot reconstruct absent evidence. This boundary is now explained in the
empty workspace, Data Studio and Help instead of being left for users to infer.

## NVIDIA audit

Python owns financial calculations, training and allocation. NVIDIA is an optional
qualitative report explainer: the backend derives an allowlisted summary, the user
reviews it, and an explicit approval plus a source-bound hash permits transmission.
Exact numeric references remain local. The current scope is whole-source campaign
performance, latest completed model evaluation or latest saved budget; Overview
filters and commerce comparisons are not silently included.

Provider tests cover consent, stale previews, missing evidence, key permissions,
secret/error redaction, numeric-claim withholding, malformed responses, concurrency,
timeouts and reasoning suppression with simulated responses. The browser audit
checks an actual locally generated summary, the disabled send state without a key,
and approval reset. No credential was copied to the disposable workspace and no
external NVIDIA request was made during this polish. The earlier recorded live
integration success does not imply current provider availability. AI prose remains
fallible; the digit guard does not catch false claims written entirely in words.

## Verification

The restricted production build stalled at compilation with zero compiler output;
stopped only its verified build process and reran with local execution access.
The production build then passed. This did not require a dependency change.

Final counts and evidence are recorded in `polish-checks.json` and
`polish-browser-results.json`. Browser regression results are refreshed in the
existing data, weekly-training/budget and commerce reports. Screenshots use the
`polish-` prefix. This is an engineering/heuristic usability review with automated
journeys and visual inspection; no merchant usability study, full screen-reader
certification or production certification is claimed.

Visual inspection also caught a dark-card variant being overridden by the shared
frosted surface; repaired it. A new gradient/alpha-aware HTML text contrast check
then identified chart legend labels borrowing low-contrast series colors. Labels
now use readable text colors while category swatches keep their chart colors.
The audit checks conservative gradient endpoints and composited backgrounds; SVG
chart text, screen-reader behavior and every tooltip state are outside its scope.

An initial backend run had four failures in newly written audit fixture setup
(duplicate imports/manifest metadata), not product checks; corrected the fixtures
and reran. The existing glossary regression assumed there was only one open
Help disclosure; changed it to verify the specific glossary disclosure, preserving
the interaction assertion. Any additional QA issues/fixes are listed in progress.

Recommended stopping point: polish and current-scope regression complete. Before
Phase 7, validate approved real merchant exports/reference totals and prospectively
measure model usefulness. New connectors do not solve missing evidence or causal
validation.
