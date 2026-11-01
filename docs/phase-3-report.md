# Phase 3 completion report

Completed 2026-10-28: actual local revenue-model training, chronological evaluation,
versioned persistence, guarded inference and responsive ML Studio. Project 1 was
not accessed or changed; no delegation was used. Phase 4 has not started.

## What works

- Selected-dataset readiness, maturity cutoff/lag, explicit financial-label and
  attribution definitions, bounded 100K-row training and immutable SHA256 input snapshots.
- Train-only categorical encoding, spend/calendar/known-targeting features,
  chronological complete-date train/validation/test partitions, a smoothed
  historical revenue-per-spend baseline and real fixed-seed CPU XGBoost fitting.
- Validation selects between two fixed XGBoost settings. Test labels do not
  influence fitting/selection. Runtime/import failure supports a labelled sklearn
  histogram-regressor fallback; fit errors fail honestly.
- Durable background jobs, single-active-run guard, status, cooperative
  cancellation, interrupted-worker recovery and partial artifact cleanup.
- Native UBJSON/JSON artifacts, metadata/version/hash validation, sealed holdout
  re-evaluation, model history and actual JSON evaluation export.
- Overall/platform MAE, RMSE and WAPE, acceptance/readiness explanations,
  platform error chart with accessible table, split/source/coverage diagnostics.
- Source-bound future campaign-day predictions only for accepted models, known
  context categories and train-supported platform spend. Unknown contexts,
  extrapolated spends and dates before the historical/as-of boundary are rejected.
- Deleting a source dataset removes its derived models and holdout evidence;
  active training for that dataset blocks deletion. Overview reflects actual
  model status. Recommendations remain unavailable until Phase 4.

## Measured synthetic demo

Dataset: Pakistan campaign demo; 10,000 synthetic rows; generator seed 42;
training seed 42; PKR; historical range 2026-01-01–2026-03-31.
Model version: `4740cb0d2a1646ea9739e5564ccfc253`. Algorithm: XGBoost.

| Partition | Rows | First date | Last date |
| --- | ---: | --- | --- |
| train | 6,048 | 2026-01-01 | 2026-02-23 |
| validation | 2,016 | 2026-02-24 | 2026-03-13 |
| test | 1,936 | 2026-03-14 | 2026-03-31 |

| Holdout metric | XGBoost | Historical baseline |
| --- | ---: | ---: |
| MAE (PKR / observation) | 5,202.99 | 7,582.80 |
| RMSE (PKR / observation) | 7,195.26 | 10,415.53 |
| WAPE | 51.1% | 74.4% |

The demo passed the predeclared v1 error/coverage gates. Its 112
campaign names overlap train and test: this evaluates later dates, not unseen
campaigns. Synthetic scores demonstrate learning the simulator and do not
establish real merchant accuracy, causal uplift or guaranteed revenue.
Uncertainty is not quantified. Fit/evaluation elapsed 0.24s
excludes worker launch, input preparation and final holdout persistence; it is
not a controlled performance benchmark.

## Verification

- **73 backend tests passed**, including 17 Phase 3 tests for actual native
  fit/reload, test-label isolation, train-only features/encoding, maturity,
  baseline/zero denominator math, failed gates, source/context/date/spend guards,
  corruption, fallback, real background workers/cancellation, stale recovery,
  late cancellation and source deletion. Existing Spark/MapReduce tests passed.
- **35 browser checks passed**, including actual UI training, sealed re-evaluation,
  JSON download, prediction, insufficient-history blocks, reload/history,
  Overview model state, outage/retry and responsive checks.
- ML Studio checked at 1440/1280/1024/768/430/390/375px; all seven routes at
  desktop/mobile. No page overflow in those checks. Desktop/mobile screenshots
  visually inspected, including an in-app browser review of mobile result cards.
  No captured browser page-level JavaScript errors.
- `npm run check`, `npm run build`, `npm run format:check` and
  `.venv/bin/ruff check backend scripts` passed. Full pytest ran with this Mac's
  bundled OpenMP directory on its process library path (README instructions).

## Environment issues resolved

The initial pip download timed out and subsequent transfers were slow. Downloaded
bounded parallel ranges from official PyPI, verified official SHA256 hashes for
XGBoost/scikit-learn/SciPy wheels and installed locally. The committed lock uses
portable registry version pins, not temporary wheel paths. Dependencies:
XGBoost 3.4.1, scikit-learn 1.9.1,
SciPy 1.18.1; editable package 0.3.0.

The Mac XGBoost wheel required OpenMP at an absent Homebrew path. The development
launcher and training worker now reuse the installed scikit-learn wheel's bundled
OpenMP via the process library path. No dependency binary/system directory was
changed. Direct Python tests/Uvicorn require the README's exported path when
system OpenMP is absent. Corrected fallback handling for native import errors.
The managed environment marked the refreshed editable-package `.pth` hidden;
cleared that flag and verified direct package import once. The managed environment
reapplies it between operations; direct Python CLI commands here should use
`PYTHONPATH=backend/src`. The launcher, pytest and workers already use explicit
source paths and are unaffected. Initial sandbox build
stalled; the required production build passed with local process/socket access.

## Limits and evidence

Local single-user operation; no authentication, live accounts or spending actions.
Models train on one bounded campaign report, not 10M lab inputs. Maturity lag is
user-specified and does not verify final attribution. Known category combinations
may still be out of distribution. Gates are engineering policy, not calibrated
confidence bounds. Cooperative RSS/deadline/cancel guards are not hard OS limits;
fallback cancellation waits for its bounded fit. Latest 100 registry runs are
listed; no automatic retention. Full assistive-technology certification and
WebKit/Firefox validation were not performed. Existing npm peer warnings remain.

Evidence: [demo evaluation](phase-3-demo-evaluation.json),
[browser results](phase-3-browser-results.json),
[methodology](phase-3-methodology.md), [progress](progress.md),
[desktop](screenshots/phase-3-studio-1440.png),
[mobile](screenshots/phase-3-studio-375.png),
[diagnostics](screenshots/phase-3-diagnostics-1440.png).

Next: Phase 4 response curves, feasibility/PKR step allocation, same-budget
comparisons and advisory Budget Optimizer using eligible model predictions.
