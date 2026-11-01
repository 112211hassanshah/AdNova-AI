# Budget planning methodology · current October 29 repair

One selected campaign source, backend-owned calculations, recommendations only.
The detailed audit and original formulas are in `critical-ml-planning-report.md`.

## Feasibility and forecasts are separate

A required user budget accepts PKR 0.01–100,000,000 with two decimals. Work in
integer paisa. Percentage floors round up and caps round down; intersect only with
explicit user PKR minimums/maximums. Defaults are 0%/100%. Platform max 0 allows
zero allocation. No real-provider restriction is assumed by the unconnected app.
All amount limits are for the whole selected horizon.

A budget smaller/larger than historical spend remains plannable. Historical
spend support restricts forecasts, not spending feasibility. Infeasible user
limits return precise errors without saving an invalid allocation.

## Automatic selection

Use an accepted source-matched model with verified artifacts and supported
scenario first. Otherwise independently screen a statistical baseline on
chronological validation and holdout partitions. The screen requires baseline
RMSE better than a training-mean predictor per platform, WAPE ≤100% and temporal
sample support; its versioned policy and metrics are recorded. These are
operational criteria, not a confidence interval. Historical mode also requires
that screen. A rejected XGBoost is never silently used as accepted.

If no supported forecast exists, publish an evidence-limited allocation with
null revenue/ROAS/marginal revenue and no forecast comparison or response chart.
Historical priority/diminishing utility are allocation assumptions. Missing or
unresolved label provenance prevents revenue from being a ranking input. The
allocation is useful for a scenario but does not claim revenue optimality.

## Supported forecast contexts

Use training-only representative campaign/segment period rows, positive spending
weights and platform row-spend bounds. Map horizon budget `b` into `b*w/H` per
campaign row for `H` reporting periods. Daily horizons have one period per day;
weekly forecasting requires aligned full weeks, never artificial daily rows.

Positive forecast support remains `H*s_min/min(w)` through `H*s_max/max(w)`.
Enumerate feasible active-platform subsets (at most 31). Inactive platforms have
zero execution and revenue by planning convention; XGBoost is not queried on a
zero-spend pseudo-row. Choose the best adjusted forecast among supported mixes.
If none covers the entered budget, allocation continues with revenue withheld.

## Curve and monetary allocation

Bound curve sampling to 200 intervals (optional interval can coarsen it). Include
exact endpoints. Retain raw model outputs and solve a nonnegative, monotone,
concave minorant with slope constraints for uneven intervals. Diminishing returns
and interpolation are disclosed assumptions, not measured causal saturation or
confidence bounds. A segment-based marginal allocator finishes to any paisa.
Exhaustive small-domain tests verify the interpolated mathematical objective.
Same-budget forecast comparisons use the chosen active-set constraints; this is
not a claim of globally optimal campaign or real-world allocation.

## Persistence and guards

Source selection/deletion and publication share the catalog lock. Immutable
reports retain original inputs, source SHA256, used model ID, policy, support,
baseline assessment, source flags and reasons for missing forecasts. No model
retraining occurs on budget edits. Library/schema/hash mismatches stay errors.
Limits remain 100K source rows, 100 representative rows per platform/period,
200K prediction rows and cooperative 20-second planning checks; these are not
hard OS limits. Evidence-only plans use at most five bounded utility grids.
Latest 50 plans per source are listed; source deletion cascades to its plans.
CSV/JSON exports retain null metrics and provenance. No individual-plan deletion
UI, calibrated uncertainty, provider connection or automatic spending is claimed.
