# Contribution-profit forecasting · Phase 6

This separate pilot fits **contribution before advertising**, not Shopify gross
sales or the existing ad-revenue XGBoost model. It uses only reconciled store
history with complete declared financial evidence. No LLM performs calculations.

## Eligibility and fitting

Before fitting, require compatible synthetic/real provenance, an explicitly
complete export, verified refund snapshot, known net/cost/shipping definitions,
positive known ad spend, daily ad observations, every eligible order unambiguously
matched and known same-day touches. No nonzero excluded-order costs may be
present: observed contribution includes them, but their future incidence is not
modelled. Supplied reference discrepancies must be resolved. Matched order dates
without a corresponding ad-date/platform cell block forecasting.

Aggregate matched order contribution at day/platform grain, separately aggregate
ad spend, then align those aggregates. Empty matched-order cells are zero only
because a complete export was explicitly declared. Missing financial components
stay null. Ignore immature dates: by default require 30 days between observation
and snapshot, with a visible merchant-controlled 0–90-day maturity setting.
This declaration does not prove all late refunds have arrived.

Chronological split: first 60% of distinct dates train, next 20% validation, last
20% holdout. Minimum 30 mature dates and 180/60/60 aggregate rows. Each platform
needs 20 positive training observations, at least three positive spend levels,
and five observations in each evaluation partition. Missing or negative
contribution-before-ads observations block this nonnegative-response pilot.

For each platform, let `s` be daily spend in PKR. Set `r` to the median positive
**training** spend. Fit nonnegative coefficient `a` by least squares on training
only, with response `a × 2s / (1 + s/r)`. This deliberately assumes diminishing
returns and fixed future cost mix. Date cutoffs, coefficients and reference spend
never use validation/holdout targets.

Each platform's validation AND holdout response RMSE must beat the constant
training-mean baseline; WAPE must exist and be ≤100%. Metrics, partitions and
parameters are saved with every immutable plan. These are disclosed operational
screens, not statistical significance, calibrated uncertainty, causal lift or
merchant certification. A rejected fit disables profit forecasting; the ordinary
Budget Optimizer still offers its independently gated ad-only capabilities.

## Exact constrained allocation

Budgets are user-entered, required and limited to two decimals. Plans start after
the verified snapshot and end within the supported 90-day distance from the last
mature observation. Horizon is 1–30 days, with a constant daily spend assumption.

Use the existing exact-paisa constrained allocator. Respect enabled platforms,
share minima/caps and actual PKR floors/ceilings. Every positive platform allocation
must remain within its observed positive **training** daily spend range multiplied
by the horizon. Zero allocation is allowed. Enumerate active subsets of at most
five platforms (31 subsets); use at most 201 response points per platform and
piecewise-linear interpolation between sampled points. This bounded method does
not assert globally optimal allocation on a true causal response curve.

If no subset can fund the exact entered budget within support and limits, refuse
the profit forecast. Do not force a historical minimum budget or fabricate an
estimate outside support. Equal/historical-spend comparisons use the same exact
budget, selected active subset, historical support and user constraints. Their
estimates use the same response assumptions. Estimated contribution after ads =
predicted contribution before ads − exact budget, including negative results.
Profit values have no lower clamp, guarantee or calibrated confidence interval.

The fictional 90-day fixture exercises evaluation and supported allocation. Its
accepted result proves software behavior on a designed simulation, not predictive
accuracy for a real merchant. Source/delete/export boundaries follow
`commerce_data_contract.md`. Policy identifier: `commerce-contribution-v1`.
