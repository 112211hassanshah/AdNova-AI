# Campaign data contract · Phase 1

All observations belong to workspace `local`. They are daily or weekly campaign + platform
observations with optional audience/device segmentation. `campaign_id` takes
precedence over campaign display name when detecting duplicate observation keys; the
account and known segments are part of that key. Conflicting repeated keys block
import. There is no automatic concatenation or joining of datasets.

| Field | Meaning / normalized representation |
| --- | --- |
| date | ISO YYYY-MM-DD observation/weekly start date; ambiguous formats need confirmation |
| campaign | Required name or identifier; displayed as supplied |
| platform | Facebook, Instagram, Google, TikTok or YouTube; explicit default allowed |
| impressions, clicks | Nullable, finite nonnegative whole counts |
| spend | Nullable advertising cost, converted to PKR and rounded to 2 decimals |
| conversions | Nullable nonnegative numeric actions; fractional attribution accepted |
| revenue | Nullable platform-attributed value, converted to PKR; **not profit** |
| age, gender, city, device | Reported aggregate segments, otherwise `unknown` |
| campaign_id, account_id | Optional stable IDs, otherwise `unknown` |
| conversion_definition | Supplied definition; default `unspecified` |
| attribution_window | Supplied reporting window; default `unspecified` |
| currency, is_synthetic | PKR and a source flag retained in every stored row/export |

Manifest metadata includes ID, workspace, source, original filename, import
profile/time, original currency, explicit FX rate, daily/weekly granularity, date range,
row count, revenue origin, definitions, field coverage, warnings and generator
seed. Source is `synthetic_generator`, `synthetic_csv` or `advertiser_csv`.
Imported synthetic flags cannot be silently relabelled as real. Mixed synthetic
and real flags are rejected. Mixed currencies, mixed daily/weekly periods and monthly reports
are rejected; incompatible attribution definitions warn and gate forecasting.

Each dataset is its own Parquet file and SQLite catalog record. A deterministic
normalized content fingerprint prevents exact repeated imports. Observation-key
overlap with existing compatible-source datasets is warned; sources remain
separate. Preview/aggregate endpoints return bounded results. Picker options
are capped at 1,000 values per dimension; campaign-table pagination can expose
additional campaigns. Current application mode is single user, not tenant security.

## Missing data and formulas

Zeros mean reported zeros; blank metric cells mean null. Negative, nonfinite,
fractional impression/click counts and numbers over supported limits are invalid.
Clicks above impressions block import; conversions above clicks warn because
view-through/fractional definitions may differ. Imported revenue with zero
conversions warns about definitions/lag. The synthetic generator uses purchases
from clicks, so conversions <= clicks and zero conversions imply zero revenue.

Totals and ratios require complete inputs for the selected rows. Partial revenue
is never presented as total revenue. A filter selecting only complete rows can
make that filtered metric available. Coverage retains full numeric precision;
UI percentage display cannot round an incomplete field up to 100%.

- CTR = 100 × sum(clicks) / sum(impressions)
- CPC = sum(spend) / sum(clicks)
- CPA = sum(spend) / sum(conversions)
- Conversion rate = 100 × sum(conversions) / sum(clicks)
- ROAS = sum(revenue) / sum(spend)

Zero denominators and missing inputs return null / **Not available**. Float64
analytics use normalized two-decimal money; this is not an audited accounting
ledger. Cross-platform claimed revenue can overlap; it is not unique store sales.

## Import profiles and limits

Generic, Meta Ads Manager, Google Ads and TikTok Ads Manager profiles offer common
column aliases and fully editable mapping. Export formats vary; suggestions are
not proof of metric meaning. Google `VIDEO`, Meta-wide totals, organic social
engagement and Shopify order totals are not silently assigned to paid YouTube,
Facebook or campaign revenue. Map a known platform or choose a deliberate default.

CSV must be comma-separated UTF-8, <=10 MiB, <=100,000 rows, <=100 named columns
and <=1,000 characters per cell. Phase 1 does not import Parquet. Monetary cells
must be plain numeric values without currency symbols/thousands separators.
There is one currency/rate per import; non-PKR files require verified PKR per unit.
Confirmation is required after validation. Invalid-row exclusion is explicit and
counted; commit revalidates mapping/options against the server's staged file.

## Reproducible synthetic data

Phase 1 generates 100–10,000 rows through the service (UI presets 1,000/10,000),
with seed, 7–366 day range and enabled platforms. Geography is currently fixed to
Pakistan cities; platform weights are fixed and uneven. A campaign/day process
links spend → delivery → clicks → purchases → revenue, with campaign effects,
seasonality, fatigue, noise and spend saturation. Required platform coverage is
ensured even for the small demo. Evaluation-only simulation parameters are stored
separately from campaign columns; they are not model features. The same generator
version, seed and configuration reproduce the same frame, not the UUID/timestamp.

Phase 2 academic inputs live separately under `data/benchmarks/datasets/`.
The batched-v1 generator uses fixed 10,000-row logical blocks with deterministic
NumPy SeedSequence([seed, block_index]) seeds, unique batch campaign IDs and the
same coherent simulator. Physical Parquet chunks are 10K/50K/100K rows, separate
from logical simulation blocks; changing chunk size preserves row contents.
Small campaign datasets retain the original Phase 1 generator behavior.

Each lab manifest records config, simulator version, row/part counts, actual
disk bytes, file SHA256 digests and trusted platform aggregates. Evaluation-only
truth remains in a separate file. Benchmark paths project platform plus the five
metric columns; sums use integer paisa for money and millionths for conversions.
Missing metric coverage propagates null totals, and zero denominators yield null.
Reference row counts and unit sums must match exactly in every repeat. Derived
float rates use absolute and relative tolerances of 1e-9.

## Phase 3 model records

`data/ml/registry.sqlite` stores source-bound run snapshots, model versions and
metrics. Run folders contain native XGBoost UBJSON (or an internal sklearn
fallback), JSON preprocessing and a sealed holdout Parquet with registry SHA256
checksums. Full input snapshots are temporary and removed when workers finish.
Deleting a source campaign dataset removes its derived model/holdout records.

Prediction grain is campaign × platform × day × reported segment. Target is
same-period attributed revenue in PKR; observed spend is a proxy for planned
spend. Features are platform, planned spend/log spend, pre-period targeting and
calendar values. Same-period outcomes, campaign IDs and simulator truth do not
enter features. See `phase-3-methodology.md` for split dates, maturity rules,
acceptance gates, inference ranges and source separation.

## Reporting setup provenance

Dataset manifests optionally include `parent_dataset_id` (an immutable reporting
revision's source) and `reporting_evidence` (file column evidence or a timestamped
user assertion per definition). Legacy manifests default to null/empty evidence.
These are provenance, not model features. Clearing up reporting rules creates a
separate selected dataset revision, retaining measurements and source flags.
Original model snapshots remain bound to the original dataset. See
`reporting-setup-guide.md` for the user journey and lifecycle.

## Phase 4 advisory budget plans

`data/optimization/plans.sqlite` contains immutable `plans(id, dataset_id, report)`
records. Report fields include source manifest/SHA256, source/synthetic/revenue
flags, selected method/model ID, model acceptance/test/hash/version evidence,
planning dates, as-of/configured/effective lag, exact integer PKR budget/step,
requested share limits, effective spend bounds, allocations and comparison plans.

`contexts` records each platform's representative training date, row count,
observed campaign-day spend bounds, reference budget and targeting/spend weights.
`curves` preserves every supported sampled budget with raw and adjusted estimated
revenue. `share_percent` uses largest-remainder hundredths so displayed shares
sum to 100.00%; PKR allocation amounts remain the authoritative exact totals.
Estimated revenue remains floating-point PKR, not profit or realized sales.

The UI lists the latest 50 plans per selected dataset. Known IDs remain readable
while their source exists and is selected. Source deletion cascades to its local
plans; downloaded exports have a separate lifecycle. No per-plan delete UI,
automatic retention or spending-execution endpoint is provided.

API: `GET /api/v1/optimizer`, `POST /api/v1/optimizer/plans`,
`GET /api/v1/optimizer/plans/{id}` and
`GET /api/v1/optimizer/plans/{id}/export?format=csv|json`.


Mapping provenance records original (sanitized) column names, all suggestion
candidates with deterministic confidence scores/reasons, selected columns and
date format. Scores express rule strength, not calibrated probabilities.
`schema_mapping.py:ALIASES` is the extensible alias dictionary. Currency prefixes
and grouped thousands use decimal-dot formatting; decimal commas/percentage
counts require correction. Missing conversions do not block revenue modeling;
missing spend/revenue or reporting definitions do. Null markers include NaN/N/A.


Component flags `date_is_synthetic` and `revenue_is_synthetic` are preserved in
canonical rows and aggregated into manifest `provenance_flags`. Any synthetic
component labels the source as simulation; false markers are also retained so
legacy lost-marker cases can be distinguished. Revenue is never manufactured
from conversion counts. Mapped rate/percentage headers cannot become amount/count
fields even if individual numeric cells omit a percent symbol.
