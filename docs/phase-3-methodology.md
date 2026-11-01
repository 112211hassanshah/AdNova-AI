# Phase 3 methodology

## Input, target and prediction contract

Training uses only the selected saved campaign dataset, at most 100,000 rows.
The 10M-row academic lab is separate. A run snapshots the canonical Parquet,
records its SHA256, and never reads simulator truth. Synthetic and advertiser
models retain separate dataset IDs, source flags and label definitions.

The observation is campaign × platform × daily/weekly reporting period × reported segment. The target is
same-period platform-attributed revenue in PKR. Historical observed spend is a
proxy for the planned spend supplied at inference. Age, gender, city and device
must describe targeting known before the period. Campaign IDs are not features.
The model takes platform, spend, log(1+spend), targeting, weekday, month and cyclic
day-of-year features. Same-period outcomes, derived ratios and lagged outcomes
are excluded. This first model has no learned historical/lagged feature pipeline.

A whole platform budget is not a campaign-row prediction. Phase 4 must define
how a horizon/platform allocation is distributed over repeatable campaign/context
rows before summing predictions. This contract avoids silently substituting a
large platform budget into a model trained on small campaign-period spends.

## Readiness and maturity

Require complete spend and attributed revenue (conversion counts are optional),
known reporting definitions and positive revenue; 300 mature rows, at least
30 distinct dates, 10 distinct spend values and positive train-period spend and
revenue. The chronological partitions need at least 180/60/60 rows. Mixed
attribution/conversion definitions block training. Advertiser imports must name
the attribution window and conversion definition; unknown definitions block.

A user-chosen as-of date and maturity lag exclude recent labels. The default
advertiser lag is seven days; it must be chosen for the report's attribution
window/reporting delay. It does not establish that conversions or refunds are
final. Synthetic labels use zero lag and retain the as-of cutoff. Missing or
non-finite labels are excluded and counts are reported. These are engineering
minimums, not evidence of adequate statistical power for a merchant.

## Split, fitting and baseline

Sort distinct dates, use approximately 60% train, 20% validation and 20% test.
Every row of a date stays in one partition. One-hot categories are learned on
training rows only; unseen categories transform to zeros during evaluation and
are rejected for user predictions. Total encoded categories are bounded to 512.

Fit two XGBoost regressors on the train partition (depth 3 or 5, 180 trees,
learning rate .05, minimum child weight 10, L2 10, histogram training, two threads,
fixed seed). Choose lower validation RMSE. No refit or tuning on test labels.
Clip predictions to nonnegative revenue, and disclose this policy.

If XGBoost cannot import/load its runtime, fit scikit-learn's CPU histogram
regressor (180 iterations, 15 leaves, .05 learning rate, L2 10, fixed seed,
internal random validation disabled). Other fitting errors fail the run.

The baseline is train-only platform revenue/spend, shrunk toward the train-global
rate with prior spend equal to 20 average training-row spends. It predicts
revenue as planned spend × smoothed platform rate. Baseline and model receive the
same chronological holdout. Campaign-name overlap is disclosed: the evaluation
is for later dates, not a campaign-held-out generalization experiment.

## Metrics and acceptance policy v1

MAE and RMSE use PKR per observation. WAPE is sum absolute error divided by sum
absolute actual revenue; a zero denominator yields null, never a fabricated
percentage. Report overall and per-platform errors on validation and test.

Prediction eligibility requires all of:

- Validation and test RMSE each at least 5% lower than the baseline.
- Defined validation/test WAPE at most 100%.
- Every represented platform has at least 20 train, 5 validation and 5 test rows.
- No platform test RMSE exceeds 110% of its baseline RMSE.

These predeclared engineering gates are not confidence bounds or causal proof.
A completed fit can fail them. Failed models remain inspectable, but prediction
is disabled. No budget recommendations are enabled in Phase 3.

Inference requires the selected source dataset, a future date after both test end and the label as-of date,
known context categories and platform-specific observed train spend bounds.
Unknown platforms/contexts and out-of-range spend are rejected, not extrapolated.
Unseen combinations of known context categories may still be out of distribution;
no calibrated uncertainty estimate is available. Synthetic predictions say
"Simulated estimate — not a real-world revenue guarantee".

## Persistence, jobs and retention

A SQLite registry publishes completed model metadata atomically. Workers run as
detached local processes, with one active training job, native threads bounded,
a ten-minute deadline and a 2 GiB worker RSS guard checked at training steps.
Guards are cooperative and do not promise a hard OS memory limit. Cancellation
is checked between XGBoost iterations; fallback cancellation waits for its bounded
fit. Interrupted workers are marked on the next registry read and partial
artifacts are removed. Finished/failed workers remove their full input snapshots.

XGBoost uses native UBJSON; preprocessing is JSON. The optional fallback uses a
locally generated joblib file. No model-upload/deserialization endpoint exists;
only catalog IDs, exact dependency versions and registry SHA256 checks permit
loading. This protects against accidental corruption, not a malicious local user
who controls the database and files. Saved holdout Parquet is checksum-verified
before explicit re-evaluation. Evaluate uses the same holdout with fixed model
weights; it creates no new independent evaluation evidence.

Models and holdout evidence live under ignored `data/ml/`. The latest 100 runs
across the registry are discoverable in the UI, filtered to the selected dataset;
older known-ID reports persist. Deleting a source dataset removes derived model
records and files; active training for that source must first finish/cancel.
There is no automatic retention policy. Reports exported by the user are not
removed by source deletion.

## Interpretation and sources

Synthetic scores demonstrate learning the generator. Advertiser scores remain
subject to attribution bias, delayed labels, changing auction conditions and
selection bias; predictive association does not establish causal uplift.
Uncertainty is not quantified. All operations are local single-user and advisory.
Budget allocation is Phase 4, commerce CSVs Phase 6 and live connections later.

Implementation references: [XGBoost model IO](https://xgboost.readthedocs.io/en/stable/tutorials/saving_model.html),
[scikit-learn OneHotEncoder](https://scikit-learn.org/stable/modules/generated/sklearn.preprocessing.OneHotEncoder.html),
[scikit-learn leakage guidance](https://scikit-learn.org/stable/common_pitfalls.html#data-leakage).

On this Mac, XGBoost’s wheel initially failed because its Homebrew OpenMP path
was absent. The development launcher and training-worker environment now reuse
the verified scikit-learn wheel’s bundled `.dylibs/libomp.dylib` via the process
`DYLD_LIBRARY_PATH`. No system directory or dependency binary was modified.
Direct test/Uvicorn commands need that exported path when system OpenMP is absent;
the README gives the command. Import/runtime load failures select the labelled
fallback; actual fitting failures remain failures.


## October 29 debugging update

Weekly inputs retain one row per weekly campaign/segment. Maturity is measured
from period end, then the configured label lag; weekly start dates must share a
weekday, keeping chronological partitions from overlapping. No daily labels are
invented. MAE/RMSE/WAPE now include R² when label variance is positive; constant
labels return null R². Schema-version and feature-list mismatches are rejected on
load; direct inference also verifies the selected source checksum. Real fitting,
train-only encoding, candidate selection on validation, sealed test evaluation,
5% RMSE improvement gate, per-platform checks, native XGBoost persistence and
fallback policy remain intact. Acceptance is not production or causal validation.


## Critical source-provenance and baseline repair

Component synthetic flags are retained; derived revenue targets are explicitly
labelled synthetic. Legacy imports that discarded synthetic markers or mapped
rate columns into amounts/counts need reimport before forecasting. Actual saved
Facebook validation RMSE improved only 1.326%, while holdout improved 21.740%.
Only validation failed the existing 5% policy. The policy remains operational,
not a statistical test. New training reports also store an independently screened
baseline assessment; planner evaluation does not promote a baseline merely because
XGBoost failed. See `critical-ml-planning-report.md` and `critical-ml-audit.json`.
