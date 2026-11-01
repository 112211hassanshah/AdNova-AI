# Methods, privacy and current limits

Optional NVIDIA extension (user-authorized after Phase 5): the AI Assistant can
send explicitly approved qualitative report summaries to a hosted model. Numeric
financial values, dates, identifiers and raw rows remain local. The private
server-held credential is stored under ignored `data/ai/` with owner-only file
permissions, or supplied by the launch environment. This is plaintext local
storage, not encrypted secret management. Core calculations/training/allocations
remain local and independent of the API. AI text is fallible and cannot feed the
optimizer. See `nvidia-integration.md` for the exact payload and lifecycle.

Phase 6 adds a separate local CSV commerce workspace, immutable order/cost
snapshots, evidence-supported reconciliation and gated advisory contribution
planning. No commerce data is sent to NVIDIA. Exact financial definitions,
status/refund timing differences, pseudonyms, storage/deletion limits and forecast
policy are in `commerce_data_contract.md` and `phase-6-methodology.md`. Fictional
outcomes establish software behavior; merchant approval/reference validation is
still pending. No live connectors, production security or causal accuracy claimed.

## What is implemented

The campaign workspace has real Python-generated synthetic campaigns, local campaign CSV
preview/mapping/validation, persisted Parquet/catalog metadata, weighted metrics,
server filters/aggregation/pagination, and source-labelled CSV exports. React
renders those responses; it contains no alternative KPI/ML formulas. Trends are
daily up to 120 dates and weekly thereafter, with a visible grain label. Charts
have table alternatives; campaign and preview tables scroll within their cards.

The synthetic process validates software behavior, not real marketing accuracy.
Spend-response assumptions are simulator choices. Observational ROAS cannot
establish causal uplift, and platform reporting may double-claim conversions.
Phase 3 trains and evaluates local XGBoost revenue models against a historical
baseline; failed acceptance gates block prediction. Phase 4 adds source-bound,
constrained advisory optimization and explicit historical-rule planning. All live
connections remain unavailable. Phase 2 adds actual measured Pandas/local
MapReduce/local PySpark experiments; its reproducible method, resource gates
and measured evidence are documented in `phase-2-methodology.md`. ML features,
chronological evaluation, maturity, gates and limitations are documented in
`phase-3-methodology.md`.
Planning context, response shaping, comparisons and limits are documented in
`phase-4-methodology.md`. Model-derived estimates still do not identify causal
spend response; heuristic curves have an explicitly assumed saturation shape.

## Data handling and retention

- Default storage is this repository's root `data/` directory. `ADS_DATA_DIR` may
  select another local directory when set in the launching shell. The backend
  does not automatically read .env files. Root data/models/reports and secrets
  are ignored by Git; source packages named `data` are not ignored.
- Upload filenames are display metadata, never filesystem paths. Server-generated
  IDs control stage and dataset paths. Only canonical campaign fields survive
  commit. No uploaded code or serialized models are executed.
- Recognized personal-data columns are removed before staging or preview. Other
  unmapped fields exist only in the sanitized staged upload and are discarded on
  commit. Do not upload personal customer data in a campaign report.
- Staged previews expire after 24 hours; stale previews are removed on access
  or the next upload. Commit removes the preview immediately. There is no
  background retention scheduler in this local application.
- Saved datasets persist until the user deletes them in Data Studio. Deletion
  removes the catalog entry, dataset folder, derived models/holdout evidence, budget plans and
  clears an affected selection. Commerce comparisons/profit plans using the deleted
  ad source are removed; independent orders remain. Active training for that dataset blocks deletion.
  It does not alter the original file or guarantee forensic erasure/backups.
- CSV exports escape formula-leading text cells; this can add a leading apostrophe
  to a campaign label on spreadsheet import. Exports retain source/synthetic flags.
- The service binds to loopback. Cross-site writes are rejected, and no CORS
  access is granted. This is defense for a local tool, not authentication or
  secure hosted multi-tenant isolation. Files are not encrypted by this app.

## Resources and verification boundaries

Campaign generation is capped at 10,000 rows; imports at 100,000 rows / 10 MiB.
These small tasks run in backend worker threads and read their bounded data into
memory. Separate synthetic academic datasets support 10K, 100K, 1M and 10M rows
through durable SQLite jobs and bounded Parquet chunks. The lab never calls the
small campaign repository's whole-data read. Pandas switches to chunks when the
conservative working-set gate requires it; MapReduce and Spark read partitions.
The browser receives aggregates and 20-row lab previews, not a giant dataset.

Budget planning reads at most 100K source rows and scores at most 200K bounded
campaign-period candidates across at most 200 curve sampling intervals. It serializes local
source writes while constructing/publishing an immutable report. A cooperative
20-second deadline is checked between stages; it cannot interrupt a native model
or solver call and is not a hard OS resource limit. Leaving the page does not
promise to cancel an already received request. Saved plans live under
`data/optimization/plans.sqlite`, with the latest 50 per source exposed in the UI.
No automatic retention or per-plan deletion UI is provided. Source deletion
removes its local plans; already exported files remain with the user.

Experiment records and local logs persist under `data/benchmarks/jobs/` until
the user removes them outside the app. Dataset deletion removes only its Parquet
input; recorded results/checksums remain. There is no automatic lab retention
scheduler or raw large-file download. JSON/CSV report exports are implemented.
Jobs survive web-server reloads. Cancel an active experiment in the app before
closing the local service if you want computation to stop immediately.

Unit/HTTP tests cover numeric integrity and import gates. Chromium checks cover
the main journeys and responsive widths. No screen-reader audit, full WCAG
certification, WebKit/Firefox validation, production security review, external
provider export certification or merchant-data validation has been performed.

Tooling: npm emits peer-range warnings because several transitive Next ESLint
plugins still declare support only through ESLint 9 while the configured linter
is ESLint 10. The installed combination passes the configured checks; the warning
is retained as a tooling limitation rather than hidden with force flags. Optional
native install-script notices also remain; no unneeded scripts were approved.

## Import mapping and reporting periods

When a provider export includes `ad_platform` and `channel`, channel identifies
the canonical platform; Meta Ads combines Facebook/Instagram and Google Ads can
include YouTube. Explicit Google Search/Display map to Google. The importer does
not guess a Facebook/Instagram split from Meta alone. PKR metric headers preserve
their units and cannot silently be declared USD.

Campaign, model and planning grain can be daily or weekly, consistently per
source. ISO weeks require a year; ambiguous date formats require confirmation.
Week-end dates normalize to period starts; no weekly spend/revenue is interpolated
into invented daily observations. Monthly/mixed/overlapping periods remain blocked.
Model prediction uncertainty is uncalibrated; cent-exact allocations use disclosed
piecewise-linear response assumptions. Small budgets can be outside historical
forecast support; their allocations remain feasible under user constraints while
revenue/ROAS are withheld.


Current critical repair: original Facebook data had no dates/revenue; the local
modified file's dates and revenue are explicitly synthetic (revenue = 100 ×
approved conversions). Old imports lost these markers and now need review.
The statistical baseline has its own chronological screen; both model and
baseline failure still permit a labelled allocation with no forecast. The local
actual-data test is not redistributed and is optional on other machines.

Phase 5 provides a fixed seeded academic scenario and a complete local verification
command; see `university-demo.md` and `phase-5-report.md`. Its accessibility review
checks visible form labels, main/heading structure, descriptive route titles,
control text contrast on opaque surfaces, skip navigation, mobile-dialog focus and
reduced-motion CSS, alongside responsive screenshots and existing chart tables.
This is a bounded Chromium review, not a full WCAG or screen-reader certification.
The historical four-scale benchmark remains dated October 28; a separate Phase 5
10K smoke benchmark records fresh timings without overwriting that matrix.
