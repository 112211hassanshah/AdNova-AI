# agent.md — Project 2: AI-Powered Digital Advertising Budget Optimizer (Shopify-Compatible)

Pre-Phase 7 polish/audit: `docs/polish-audit.md` (November 1, 2026).
Allocation-only priorities must use complete, mature observations on/before the
configured cutoff; no fallback to future records. No-history users get a labelled
demo, not invented personalized forecasts. Merchant/demographic/causal fairness
and production reliability are not certified. NVIDIA remains an optional explainer.

Current milestone: Phase 6 local commerce CSV pilot. Implementation and fictional
outcome validation are documented in `docs/phase-6-report.md`; validation against
an approved merchant export/reference is still pending. Phases 7–8 remain future.

User-authorized extension after Phase 5: optional NVIDIA Nemotron report
explanations, with server-held private credentials, explicit per-summary approval,
qualitative-only payloads and no financial computation or optimization by the LLM.
See `docs/nvidia-integration.md`. Commerce financial work remains local and separate
from NVIDIA. No Phase 7 advertiser/store connections exist; the no-key demo remains.

> **Binding instructions for Codex / coding agent.** Build Project 2 as a **standalone**, thoroughly tested university application with a **real-business-ready data architecture**. Do **not** integrate with or alter Project 1 now. A separate `design.md` will be provided; honor it for UI/UX when available. Preserve the academic requirements while preparing for authorized Shopify stores and other small businesses. Never portray synthetic results, unconnected integrations, or unvalidated forecasts as real business performance.

## 1. Mission and boundaries

Build an **AI-Powered Digital Advertising Budget Optimizer**, initially an independent academic application and ultimately a **platform-agnostic marketing analytics product for small businesses, including Shopify stores**. Its primary question is:

> **How should a company allocate its chosen advertising budget across Facebook, Instagram, Google, TikTok, and YouTube to maximize expected advertising-attributed revenue?**

Product principles:

- **University MVP (build first):** synthetic campaign data, advertiser CSV import, correct analytics, 10K–10M Big Data experiments, an actually trained XGBoost model, and constrained revenue-budget recommendations.
- **Small-business pilot (build after core MVP):** Shopify order CSV ingestion, optional product-cost/expense imports, trustworthy reconciliation with ad exports, and profit-aware reporting/optimization when data quality permits.
- **Production integrations (later, separately gated):** authenticated **read-only** Shopify Admin GraphQL and advertising-platform APIs, background synchronization, secure merchant accounts, and monitoring. Do not pretend these are connected in the MVP.
- **Future Project 1 integration:** clean modules/interfaces only; connecting the applications is not part of this build.
- **Provider-neutral:** no Shopify-specific requirement inside the core ML/optimizer; a non-Shopify business must still be able to use campaign CSVs and optional sales CSVs.

The deliverable must cover all requirements from the supplied **"Project 2 — Digital Advertising Budget Optimizer"** assignment:

1. Handle the core fields: `date`, `campaign`, `platform`, `impressions`, `clicks`, `spend`, `conversions`, `revenue`, `age`, `gender`, `city`, `device`.
2. Calculate CTR, CPC, CPA, conversion rate, ROAS, revenue, and campaign performance.
3. Simulate data at **10,000; 100,000; 1,000,000; and 10,000,000 rows** (academic benchmark only; a small store need not have Big Data).
4. Compare **Pandas vs MapReduce vs Apache Spark** on equivalent aggregations.
5. Recommend budget allocations from historical/simulated performance.
6. Add an **actual trained machine learning model** for expected-revenue prediction and use its outputs in budget allocation (an enhancement beyond the assignment's minimum requirements).


### Build order is a strict priority, not a promise of live integration

**Implement and finish Phases 0–5 first.** Phase 6 (CSV-based Shopify business pilot) is the next goal once the academic MVP passes tests. Phases 7–8 are architectural roadmaps, **not** features to fake or silently claim completed. Every milestone must be runnable and clearly state what was actually implemented.

### Strict separation from Project 1

- **Do not import or alter the Project 1 Social Media Content Detective source, database, scraper, or UI.**
- Work in a new root/repository or self-contained `project2_ads/` application.
- Project 1's organic engagement API data **does not contain the ad spend and attributed revenue required for this project**. Do not treat video views, likes, or comments as ad conversions or spend.
- Expose clean interfaces so that a future host dashboard can embed this application as an independent module. **Integration is explicitly out of scope now.**
- Later integration should involve configuration and adapters, **not a rewrite of core analytics or ML**.

## 2. Design contract (`design.md`)

1. At the start, inspect the working directory and read `design.md` **if present**. Treat it as the authority for color palette, typography, spacing, navigation, layouts, interaction patterns, accessibility, motion, and frontend technology where specified.
2. If `design.md` is not present, build a clean and accessible functional UI with a consistent design system, and make styling easy to replace. Do **not** block backend development waiting for it.
3. Default stack, unless `design.md` explicitly chooses another frontend: **Python + Streamlit + Plotly** for a standalone analytical dashboard. Keep all business logic in independent Python services so a future Next.js/React frontend can consume it without rewriting algorithms.
4. No placeholder buttons, charts or tabs: every visible control should work or be clearly labelled a disabled future capability.
5. Label synthetic data, demo metrics, provisional attribution, and simulated forecast results visibly.
6. Architect navigation so a later **Commerce & Attribution** page and **Connections** page can be enabled without redesign. Never show a live Shopify "Connected" status until a verified authenticated connection exists.
7. `design.md` controls presentation, not the integrity of schema, training/evaluation, privacy or budget constraints; if it conflicts with those, implement a safe functional interpretation and document it.

## 3. Data: EXACTLY where the system gets it

Implement **separate, explicit data-source paths**. Paths A and B are required for the university MVP; C is the first business-pilot enhancement; D is optional for later production use. A store's orders and an ad provider's campaign reports are **different datasets**, not interchangeable columns in one table.

### A. Synthetic advertising dataset — DEFAULT; REQUIRED

- Build our **own reproducible data generator** (`seed`, target row count, date range, country/cities, platform mix, output path).
- Generate all assignment-required fields across the five platforms, with Pakistan-relevant cities and PKR currency.
- Make campaigns, audiences, devices, spend, impressions, clicks, conversions and revenue statistically plausible and internally consistent. Example constraints: non-negative metrics; `clicks <= impressions`; `conversions <= clicks` for the chosen click-conversion convention; positive revenue only when revenue-generating conversions occur (unless a documented alternative attribution model applies).
- Do **not** independently sample every metric at random. Use a coherent generative process: platform/campaign/audience/date effects -> spend and delivery/impressions -> clicks -> conversions -> monetary value. Include seasonality, variance/noise, changing performance, fatigue/saturation/diminishing marginal returns, and uneven platform coverage.
- Preserve ground-truth simulation parameters separately for **simulation evaluation only**; do not leak them into training features.
- Support the required sizes: 10K, 100K, 1M, 10M. For large sizes, generate in configurable chunks and write partitioned **Parquet**. Never require a 10M-row DataFrame to fit in RAM.
- Include reasonable distribution checks and deterministic seeded tests; display the synthetic/demo label in UI, exports and reports.

### B. User-provided real campaign data — REQUIRED

- Allow CSV upload first; accept Parquet if practical.
- Support advertising data **exported by authorized advertisers** from:
  - **Meta Ads Manager** (Facebook / Instagram paid campaigns)
  - **Google Ads** (Google campaign channels **and YouTube advertising** where represented)
  - **TikTok Ads Manager**
- Provide CSV mapping/import profiles for differing export column names, plus a manual mapping preview and validation summary.
- Required normalized metrics should be available for analytics. Missing metrics retain null status and disable only dependent reports. Missing `spend` or `revenue` disables revenue optimization; conversion counts are optional for revenue training and planning. Never invent missing values.
- Do not assume every provider/export exposes `age`, `gender`, `city` and `device` in the same report or combination. Represent unavailable attributes as `unknown` and disclose missing coverage.
- Capture provenance: source, original filename/connector, import timestamp, currency, conversion definition, date granularity, attribution setting/window, and `is_synthetic` flag.
- Prevent accidental double-counting when combining platform/account exports; provide clear de-duplication keys and warnings about attribution mismatches.
- Keep source datasets separate. Never silently merge synthetic with real data in a single model or performance result.

### C. Shopify / other small-business sales data — BUSINESS PILOT AFTER MVP

- Implement a **Shopify order CSV** import profile (plus a generic commerce/order CSV mapping). Merchants export orders from the Shopify admin; the app must not require Shopify API credentials for a pilot.
- Shopify order CSVs can include **multiple line-item rows per order**. Deduplicate/normalize without multiplying revenue, refunds or order counts. Keep raw line items separate from canonical orders and document financial-status handling.
- The commercial data source is **orders, sales, returns/refunds, discounts, and optional product costs**, **not** synthetic campaign spend. An orders CSV alone cannot produce ad-platform CTR/CPC/CPA or reveal every order's advertising source.
- Canonical order fields are specified in the **Commerce and attribution** section below. Preserve original currency, source, timezone and financial definitions; do not silently combine gross sales with net sales.
- Add optional CSV mappings for COGS (product/SKU cost), payment/transaction fees, packaging/fulfillment and shipping costs. Missing expenses must stay missing, not be guessed or replaced with zero.
- For **ad-attributed Shopify revenue**, attempt attribution only when verifiable campaign/UTM/click identifiers or compatible trusted report fields exist. Standard exports may omit attribution fields; show **unattributed** rather than inventing channel matches.
- Initially allow **read-only** analytics and recommendations. This app must **never automatically change ad spend or edit Shopify orders**.
- Shopify is **an optional source adapter**; the core engine stays usable for non-Shopify stores with generic sales CSVs, and for ad-only businesses with no order import.

### D. Direct API connectors — OPTIONAL LATER, NOT REQUIRED FOR MVP

After CSV import, reconciliation and local pilot validation work, consider merchant-authorized, **read-only** API connectors to:

- **Shopify Admin GraphQL API:** order/payment/refund/sales aggregates and available customer-journey data; validate actual permitted fields for the selected API version. For typical order access, use `read_orders` and request `read_all_orders` **only if eligible/approved and historical orders are truly needed**. Protected customer data may require separate access/approval; avoid it wherever possible.
- **Meta Marketing API / Ads Insights:** Facebook and Instagram paid metrics.
- **Google Ads API:** paid campaigns, including YouTube Ads where reported.
- **TikTok Business API:** authorized advertiser reporting.

Use the current provider-supported authentication flow, installed-app consent, explicit scopes, short-lived/rotatable encrypted tokens, rate-limit/backoff handling and incremental sync. For an external standalone Shopify app, study the current OAuth authorization-code flow and platform rules; do **not** copy static tokens into a browser, README or committed files. Do not over-request write scopes or personal data. Document installation permissions and disconnect/delete behavior before enabling any live connector.

**No scraping advertiser dashboards, no unauthorized access, no fabricated API responses.** App keys and tokens must be server-side in an appropriate secrets manager (local `.env` only for development), never client code or Git. Connections are opt-in and optional; no accounts or API credentials are needed for university/demo use. YouTube organic Data API metrics are **not a substitute** for paid YouTube advertising results.

**Data acquisition roadmap:**
1. Built-in synthetic generator (available immediately, labelled demo).
2. Authorized advertiser CSVs from Meta / Google / TikTok (first source of real marketing data).
3. Shopify orders CSV or generic store sales CSV (first source of real commerce outcomes).
4. Live read-only APIs after merchant permission, credential handling and integration tests.

Do not depend on unspecified paid datasets. A real ML pilot requires enough **historical, correctly attributed campaign spend and revenue**; Shopify alone does not supply complete competitor/provider-level advertising spend.

### Public/open datasets — OPTIONAL RESEARCH SUPPORT ONLY

Public marketing datasets can support import testing or model experiments **only if** license, source, field definitions, and suitability have been verified. They are not guaranteed to contain campaign spend **and** revenue **and** all demographic/device fields. Do not claim they satisfy the assignment unless validated. Do not fake a "real" dataset by relabeling synthetic data.

## 4. Canonical data model & validation

Minimum canonical schema (with suggested types):

| Column | Type | Meaning |
|---|---|---|
| `date` | date | Campaign observation date |
| `campaign` | string | Campaign name or stable identifier |
| `platform` | enum | `Facebook`, `Instagram`, `Google`, `TikTok`, `YouTube` |
| `impressions` | nonnegative integer | Reported ad impressions |
| `clicks` | nonnegative integer | Reported eligible ad clicks |
| `spend` | nonnegative decimal/float | Advertising cost, **normalized to PKR** |
| `conversions` | nonnegative numeric | Defined conversion actions; may be fractionally attributed by external platforms |
| `revenue` | nonnegative decimal/float | Reported advertising-attributed conversion value, normalized to PKR |
| `age` | string | Age bracket, not personal birthdate |
| `gender` | string | Reported aggregate segment or unknown |
| `city` | string | Aggregate location or unknown |
| `device` | enum/string | Mobile, desktop, tablet, other/unknown |

Recommended extras: `record_id`, `campaign_id`, `account_id`, `source`, `is_synthetic`, `original_currency`, `exchange_rate`, `currency`, `conversion_definition`, `attribution_window`, `date_granularity`, `revenue_quality`, and import batch ID.

- Use correct typing, schema checks and descriptive validation errors.
- Validate money units and exchange rates. Require user-provided rate when conversion is needed and no trusted FX source is configured; never silently assume 1 USD = 1 PKR.
- Handle duplicate imports, missing fields, zero denominators, outliers, mixed date granularity and incompatible attribution windows.
- Treat `revenue` as advertising-platform attributed **revenue, not profit**. Do not equate ROAS with ROI or net margin. Preserve separately sourced Shopify order revenue and an explicit revenue-source selector for any comparisons.
- Report completeness/coverage and source information on every analysis page.

## 5. Commerce data and attribution — SHOPIFY-COMPATIBLE BUSINESS LAYER

**Purpose:** Make the product usable with real merchants later **without pretending Shopify order totals equal ad-attributed campaign revenue**. Implement contracts/schemas in the initial architecture; finish CSV import, reconciliation and UI during the business-pilot phase.

### Keep separate fact tables / datasets

1. `ad_campaign_daily`: canonical ad report observations with platform, campaign/account, spend, impressions, clicks, conversions, **platform-reported attributed revenue**, date, currency, source and attribution window.
2. `commerce_orders`: unique order-level store data with `order_id` (prefer a pseudonymous/internal ID), `store_id`, order timestamp, financial/fulfillment status, original currency, gross item sales, discounts, refunded amounts, net item sales, tax, shipping charged, order source, and attribution identifiers **only when actually provided**.
3. `commerce_order_items` (optional detailed layer): order ID, SKU/product, quantity, line-item amounts, refunded quantity and verified unit/total COGS; maintain order/line-item grain to avoid duplicated order totals.
4. `commerce_costs` (optional): product/SKU COGS and allowable variable expenses such as payment fees, shipping/fulfillment costs and packaging, with dates, coverage and their source.
5. `attribution_links` / `reconciled_performance`: documented, provenance-aware associations of order/channel/campaign when evidence supports them; track unmatched, ambiguous and excluded orders explicitly.

Never join order-line records directly onto repeated ad-report rows and sum money afterward. Build **aggregates at compatible grain** (e.g., store + day + channel/campaign) and preserve reconciliation counts.

### Source-of-truth & attribution rules

- Maintain distinct metrics: **ad-platform reported conversion value** (not unique across platforms), **Shopify net sales** (store ledger view), and **reconciled attributed store revenue** (only the supported subset). Never add these three totals together.
- A campaign/platform match needs evidence such as available UTM tags, campaign IDs, compatible click/referral data, a trustworthy merchant mapping, or explicitly selected platform attribution data. Do not infer a paid channel from a social-network domain or natural-language campaign name alone.
- Support a documented, modest attribution rule (e.g., last known non-direct tagged touch, when signals exist); expose attribution coverage, unmatched orders, ambiguous matches and conversion time lag. Multi-touch attribution, lift and incrementality **are not guaranteed** by this implementation.
- Resolve differences in timezones, date-vs-conversion dates, reporting lag, currency, cancellations, partial refunds, discounts and tax/shipping inclusion. Allow merchant to select the metric definition with a visible explanation.
- Never silently equate **all store revenue** with revenue caused by advertising. A store's organic, direct and returning-customer sales must not be allocated to campaigns without appropriate evidence.
- Data quality should gate optimization. If campaign spend, source-specific revenue or attribution coverage is too weak, display descriptive analytics and a clear **"not enough reliable data for revenue optimization"** warning instead of a confident recommendation.
- Use small, fully documented synthetic **commerce fixtures** for integration tests, visually distinguished from actual Shopify exports. Synthetic commerce joins prove pipeline behavior, not marketing attribution accuracy.

### Business metrics (optional when information is sufficient)

- **Net sales:** use a documented definition, such as merchandise revenue after discounts/returns/refunds and before tax; treat shipping income separately unless explicitly included.
- **Contribution profit after ads** (illustrative): `net sales + eligible shipping income - COGS - payment fees - fulfillment/shipping costs - other documented variable costs - ad spend`.
- **Contribution margin:** contribution profit / eligible net revenue, only when defined and all required cost inputs are sufficiently covered.
- Show **MER (store-wide marketing efficiency = total Shopify net sales / total ad spend)** only as a blended descriptive metric, not campaign-specific ROAS or causal ad effectiveness.
- No invented COGS, fixed profit margins, imaginary refunds or guaranteed returns. Profit optimization must be **disabled** or explicitly labelled partial/assumption-based when costs are missing.

### Merchant privacy and readiness

- Minimize PII. Do not import/store customer names, emails, phones, addresses, IPs or raw click IDs unless strictly required for a justified feature; prefer aggregated summaries and pseudonymous identifiers.
- Support business/store ID namespaces now (even for one local merchant), and design for later tenant isolation. A local single-user Streamlit demo is **not** a secure multi-tenant SaaS.
- Document data retention, deletion/export, import permissions, encryption at rest/in transit for any deployed pilot, and local data location.

## 6. Analytics engine — REQUIRED

Compute metrics from **sums of numerators and denominators**, NOT averages of row-level percentages:

- `CTR (%) = 100 * SUM(clicks) / SUM(impressions)`
- `CPC (PKR) = SUM(spend) / SUM(clicks)`
- `CPA (PKR) = SUM(spend) / SUM(conversions)`
- `Conversion rate (%) = 100 * SUM(conversions) / SUM(clicks)`
- `ROAS (x) = SUM(revenue) / SUM(spend)`
- `Revenue (PKR) = SUM(revenue)`

Return `null`/`N/A` on zero denominators, not infinity or misleading zero. Aggregate by platform, campaign, date, city, age group, gender, and device, where reliable fields exist. Support filters, date windows, comparisons, sorted performance views and CSV export.

When Shopify/generic commerce data is available, add a **separate commerce summary** (unique orders, gross/net sales, refunds, blended MER, attribution coverage and optional contribution margin). Never label commerce-derived revenue as ad-platform reported revenue or vice versa. Provide visible **metric origin** badges/notes: `Ad platform`, `Store orders`, `Reconciled`, or `Synthetic`.

Caution: a platform with high observed ROAS does **not automatically** deserve all incremental budget; historical spending and attribution are confounded, and platform audiences can overlap.

## 7. ML: where we get the model, how it learns, and what it predicts

### Model origin

We are **not downloading a ready-made personalized marketing predictor**. Train a local tabular ML model on the records above:

- **Baseline**: hierarchical/smoothed historical revenue-per-spend estimates (with safeguards for small samples) and a deterministic constrained allocation policy.
- **Primary ML model**: **XGBoost regression** (`xgboost.XGBRegressor`) to estimate *future attributed revenue* for a **planned spend** and known campaign/context features.
- **Fallback**: scikit-learn `HistGradientBoostingRegressor` if XGBoost is unavailable or incompatible. Compare against the baseline before enabling an ML badge.
- Train only on **current selected dataset** (synthetic and real models remain separate); store versioned model artifacts, training metadata, metrics, feature schema, and provenance. Do not load untrusted arbitrary serialized model files.

### Prediction unit and targets

- Start with a defensible observation grain: **campaign x platform x reporting period** (consistently daily or weekly, with reported segments). The generator and importer must preserve unique grain so aggregate targets are comparable.
- `y = attributed_revenue_next_period` or actual same-period `revenue` as the historical training target conditioned on that period's planned/observed `spend` and **pre-period-known** context. Document which is implemented.
- Predict expected revenue for candidate **future budget allocations** across platforms, using only covariates that will actually be known at decision time.
- Candidate safe features: `platform`, planned `spend`, campaign objective/type, day/month/season, pre-existing targeting segments, and properly lagged historical performance.
- **Never use same-period clicks, conversions, revenue, ROAS, CPA, or features derived from the target as inputs to predict that period's revenue.** That would create target leakage and make the optimizer invalid.
- An aggregate budget decision is different from an individual campaign-row prediction: define how the allocation for the horizon is mapped to a repeatable platform-level prediction. Keep that inference contract consistent through training, evaluation and optimization.
- Declare the **training label's source**: platform-reported attributed revenue, cautiously reconciled store-attributed revenue, or synthetic target. Never automatically train on gross Shopify store sales, unknown-source orders or summed platform totals as if those were platform-level causal revenue.
- Business data can be small/noisy. For insufficient history, sparse platform coverage, weak attribution or unresolved revenue definitions, make a transparent **heuristic-only recommendation** or no recommendation; do not force a store-specific model or show misleading validation metrics.

### Training / evaluation workflow

1. Check dataset has enough credible rows, meaningful spend variation, and non-null attributed revenue. If not, show a clear failure or fall back to a labelled heuristic; do not fake trained ML.
2. Prepare a preprocessing pipeline for categorical encoding, missing values and numeric transformations. Preserve the same pipeline in inference.
3. Use **chronological train/validation/test splits**; avoid random splitting of related campaign observations and inspect possible campaign-group leakage.
4. Train a simple baseline first; tune/train XGBoost with fixed seeds and sensible CPU-first settings.
5. Report **MAE, RMSE and WAPE/weighted error** (handle zero denominators) against a holdout set. Include platform-level error. Do not use MAPE as a primary metric when revenue can be zero.
6. Check extrapolation: warn or restrict optimization when candidate spending is far outside spend ranges observed during training.
7. Record dataset ID, row count, date range, feature list, target name, training time, hyperparameters, model version, and test performance. Show these in an **ML Model** dashboard section.
8. Add versioned model persistence and explicit user-triggered **Train Model** / **Evaluate Model** actions. Training must not run on every UI rerender.
9. Use representative training samples/aggregates for ML as needed; **the 10-million-row Big Data requirement is for processing benchmarks, not a mandate to train XGBoost on 10M rows**.
10. For real-business models, validate historical data sufficiency and label quality per store/segment. Start with a global baseline only if permissioned, compatible merchant data actually exists; **never train a cross-merchant model by silently pooling private shops**.
11. Apply conversion lag/return maturity rules before including an observation as a ground-truth label (e.g., later refunds and delayed conversions can change true net sales). Record coverage and data freshness. Use calibrated prediction ranges/uncertainty when possible; otherwise show that uncertainty is not quantified.

### Critical prediction limitations

- Synthetic training/testing validates that the software can learn the **synthetic generator**, not that it predicts real-world campaign revenue accurately.
- Correlation does not prove causal uplift from a budget change. Observational ad data may have selection bias, channel overlap, uncertain attribution and conversion lag; even a strong held-out ML score does not prove budget reallocation will cause the modelled lift.
- Show **"Simulated estimate — not a real-world revenue guarantee"** when synthetic data powers recommendations.
- If available data doesn't identify a spend-response curve reliably, use explicit conservative assumptions and label them; never imply measured causality.

## 8. Budget recommendation algorithm — REQUIRED

### Default scenario

- Budget `B` is entered by the user; no forced or prefilled amount.
- Objective: **maximize predicted advertising-attributed revenue**.
- Platforms: Facebook, Instagram, Google, TikTok, YouTube.
- Baseline constraints: `sum(b_i) = B`, `b_i >= 0`; optional per-platform minimum/maximum limits.
- Default UI controls for the demo: `min_share = 0%` and `max_share = 100%` per enabled platform, adjustable; permit a disabled platform to have a 0% allocation.
- Curve sampling is automatic (up to 200 intervals); an optional interval controls resolution. Allocate exactly to PKR 0.01 independently of sampling. Validate spending feasibility using user constraints; assess observed support separately for forecasts.
- User can restrict/enable platforms, vary caps and minimums, and select objective; **revenue maximization** is the required implemented objective. Conversion maximization is optional.

### Mathematical formulation

Given platform allocations `b_i`, estimated response functions `R_hat_i(b_i | context)`, and constraints:

`maximize SUM_i R_hat_i(b_i | context)`

subject to:

`SUM_i b_i = B`

`min_i <= b_i <= max_i`

`b_i` lies on allowed PKR budget increments when discretized.

### Implementable MVP algorithm

1. Validate dataset, active model/baseline, objective, available spend ranges, and constraint feasibility.
2. Create a **spend-response curve** for each platform across candidate budget levels using the ML model with fixed and documented planning-horizon/context assumptions.
3. Use **plausible diminishing returns**: the synthetic generator should exhibit saturation. A raw XGBoost response curve may be irregular; post-process a transparent grid of predicted values into nonnegative, nondecreasing **concave** curves (nonincreasing marginal revenue), or use an explicitly labelled conservative response function. Avoid hiding the difference between raw model output and adjusted optimizer response.
4. Initialize each platform at its required minimum budget.
5. Allocate the remaining budget along sampled concave response segments by descending **predicted marginal revenue per rupee**, respecting caps and exact paisa totals. Sampling intervals do not restrict valid budget amounts. Optimality is limited to the separable interpolated objective and fixed enabled platforms.
6. Confirm allocations sum to B exactly, every constraint holds, and all predicted outputs are finite/nonnegative. Explain infeasibility clearly instead of returning invalid percentages.
7. Compute expected total revenue, expected ROAS, marginal revenue by channel, source/model version and uncertainty/proxy warnings.
8. Compare against a **same-budget** equal split and a same-budget historical-rule baseline. Explain forecasted gains are **model estimates**, not observed gains.
9. Provide editable **What-if Analysis** (different budget or caps) and export results as CSV/JSON.

**Illustrative numbers only (not a trained recommendation):**

| Platform | Example share | Example allocation |
|---|---:|---:|
| Google | 30% | PKR 300,000 |
| Instagram | 25% | PKR 250,000 |
| Facebook | 20% | PKR 200,000 |
| YouTube | 15% | PKR 150,000 |
| TikTok | 10% | PKR 100,000 |
| **Total** | **100%** | **PKR 1,000,000** |

Never hardcode this example as the optimizer's answer. Actual allocation must depend on data, model, constraints, and selected objective. If real revenue values are missing, disable this revenue optimization and explain how to provide the required field. Never substitute total Shopify store revenue for missing channel-attributed revenue.

## 9. Profit-aware recommendation mode — BUSINESS PILOT, NOT A SUBSTITUTE FOR REVENUE MVP

The assignment's **mandatory objective remains maximization of expected advertising-attributed revenue**. Add a gated **"Maximize predicted contribution profit"** mode for merchants **after** the revenue mode works and data quality is established.

- Required inputs: reliable ad spend, channel/campaign revenue attribution, product-level or credible aggregate COGS, refund adjustments and relevant variable fees/costs for the target period.
- Illustrative objective: `maximize SUM_i [predicted net merchandise revenue_i(b_i) - predicted related variable costs_i(b_i) - b_i]`. Costs and refunds must be estimated at the same time horizon/grain as revenue.
- The same platform min/max, total-budget, increment, feasibility and conservative extrapolation rules apply. If costs are missing, make **profit optimization unavailable**; show ROAS/revenue views only or a conspicuously labelled what-if assumption mode.
- Profit-aware forecasts are not actual store financial statements. Report sensitivity to margin/return assumptions, coverage and downside uncertainty.
- Do not alter ad accounts or spend funds automatically. A recommendation must remain a **review-and-export** outcome.

## 10. Big Data simulation & benchmark — CORE ASSIGNMENT REQUIREMENT

Build **three real processing paths** for the *same normalized dataset* and *same aggregation workload*:

1. **Pandas:** standard in-memory groupby on sizes that fit, plus an explicitly labelled `chunked Pandas` path for larger-than-memory sizes.
2. **MapReduce:** actual map -> shuffle/group -> reduce pipeline (e.g. streaming mapper/reducer scripts with local runner) with count/sum partials. If a Hadoop Streaming environment is installed, offer it as an optional real Hadoop execution mode. **Label local MapReduce as local, not distributed Hadoop.**
3. **Apache Spark:** PySpark DataFrame aggregation, supporting local mode for an easy university demo. Label Spark local mode accurately; do not claim a distributed cluster if none is used.

### Workload and fairness

- For all engines compute platform-level totals: rows, impressions, clicks, spend, conversions, revenue, and **derived weighted CTR, CPC, CPA, CVR and ROAS** after aggregation.
- Use the same dataset, schema, platform mapping, missing-value treatment, currency normalization, grouping and numeric precision.
- Compare correctness to a small trusted reference result; numeric tolerances must be documented.
- Run workloads for **10K, 100K, 1M, and 10M** rows, with safe streaming/partitioning. Record success, skipped (resource limit), or failure honestly. **These are synthetic academic benchmark scales; do not require real shops to hold millions of orders or rows.**
- Time at least **3 repeat runs** per engine/scale where resources allow; report median/p50 and individual run times; optionally show p90.
- Include data-load overhead or exclude it **consistently** and distinguish setup time (especially Spark startup). Document both where possible.
- Capture peak memory where measurable; distinguish process RSS from whole-system memory and note Spark JVM/external subprocess measurement limitations.
- Log environment: CPU, RAM, OS, Python, Pandas/PySpark versions, execution mode, input format and dataset seed.
- Record benchmark runs as structured JSON/CSV. Use an interactive plot/table showing dataset size vs elapsed time, with explicit errors/skips.
- Never fake timing results or present estimated benchmarks as measured values.

## 11. Standalone UI pages — REQUIRED

Build the app as an independent Project 2 dashboard. Exact visual design is controlled by incoming `design.md`.

### Page 1 — Overview

- Synthetic/demo vs uploaded-real data provenance indicator. In the business pilot, separate **ad-platform metrics** from **Shopify/order metrics** and **reconciled metrics**.
- KPI cards: total spend, revenue, impressions, clicks, conversions, CTR, CPC, CPA, CVR, ROAS.
- Platform spend, attributed revenue and ROAS comparison charts; campaign leaderboard and filters.
- Clear empty/loading/error states.

### Page 2 — Data Studio

- **Generate Synthetic Data** form: record count (10K/100K/1M/10M), seed, date range, platforms, generate button, progress and summary.
- **Import Campaign Data**: CSV/Parquet file upload, mapping preview, validation report, detected currency, save/import action and dataset selector. Keep an explicit `ad source` namespace; a Shopify order file cannot be accidentally loaded as an ad campaign report.
- Show field coverage, outliers, source, date range, row count, preview, and safe export.

### Page 3 — Campaign Analytics

- Date, platform, campaign, city, age, gender and device filters (only where coverage supports them).
- Revenue/spend/ROAS and funnel charts; properly aggregated metrics.
- Contextual warnings about missing data and mixed attribution.

### Page 4 — Big Data Lab

- Select dataset scale and engine (Pandas, MapReduce, Spark), run benchmarks, view environment, performance and correctness comparison.
- Progress, cancellation where practical, resource safeguards and recorded results.

### Page 5 — ML Studio

- Dataset and target overview; baseline vs ML model, Train, Evaluate and View Diagnostics.
- Holdout MAE/RMSE/WAPE, coverage/provenance, model version, training parameters, limitation notices.
- Do not report a predictive model as trained until actual fit/evaluation succeeds.

### Page 6 — Budget Optimizer

- PKR budget input (user-entered, no default), select enabled platforms, per-platform minimums/caps, optimization action. Revenue maximization must always be available when its data/model prerequisites are met; profit objective is a separately gated pilot capability.
- Predicted allocation visualization, expected revenue/ROAS, marginal-return curves, baseline comparison, what-if controls and download.
- Synthetic-data disclaimer and inability-to-optimize messages when prerequisites aren't met.

### Business-pilot page — Commerce & Attribution (build after university MVP)

- Shopify order CSV/generic sales CSV importer; mapping/validation for order grain, refunds and currency. Optional product-cost CSV importer.
- Store sales overview with unique orders, net sales, refunds, sample/coverage summaries, and **attribution confidence/coverage** indicators.
- Side-by-side **Store net sales**, **Platform-attributed revenue** and **Reconciled revenue** (do not sum across origins). Show unattributed/mismatched records prominently.
- Optional contribution-profit estimates with explicit cost coverage and user-adjustable documented assumptions; never show an invented actual profit figure.
- Model source selection and required minimum data gate for real-business recommendations. Disabled/empty live-connector status until integration is configured.

UI performance: don't render 10M raw rows. Use sampled previews, server-side aggregations, pagination and cached derived views. Keep charts responsive. Accessibility: keyboard support, readable contrast and descriptive labels.

## 12. Architecture: modular, testable, easy to merge later

Suggested directory structure (adapt to `design.md` stack while keeping separation of concerns):

```text
project2-digital-ads/
├── agent.md                         # this file: full Codex specification
├── AGENTS.md                        # Codex startup pointer
├── design.md                        # supplied separately by user
├── README.md
├── requirements.txt                 # or pyproject.toml with pinned compatible versions
├── .env.example                     # placeholder keys only; no secrets
├── .gitignore
├── app.py                           # standalone frontend entrypoint
├── src/ads_optimizer/
│   ├── config.py
│   ├── schemas.py
│   ├── data/
│   │   ├── synthetic_generator.py
│   │   ├── csv_importer.py
│   │   ├── provider_mappings.py
│   │   ├── commerce_csv_importer.py   # business pilot
│   │   ├── validation.py
│   │   └── repository.py
│   ├── analytics/
│   │   ├── metrics.py
│   │   ├── aggregations.py
│   │   └── commerce_metrics.py      # business pilot
│   ├── commerce/                     # optional independent adapter layer
│   │   ├── schemas.py
│   │   ├── normalize_orders.py
│   │   ├── attribution.py
│   │   └── reconciliation.py
│   ├── integrations/                 # authenticated connectors later
│   │   ├── contracts.py
│   │   └── README.md                # no fake API implementation
│   ├── big_data/
│   │   ├── pandas_engine.py
│   │   ├── mapreduce_mapper.py
│   │   ├── mapreduce_reducer.py
│   │   ├── mapreduce_runner.py
│   │   ├── spark_engine.py
│   │   └── benchmarks.py
│   ├── ml/
│   │   ├── features.py
│   │   ├── baseline.py
│   │   ├── train.py
│   │   ├── evaluate.py
│   │   ├── infer.py
│   │   └── registry.py
│   ├── optimization/
│   │   ├── response_curves.py
│   │   ├── constraints.py
│   │   ├── optimizer.py
│   │   └── profit_objective.py      # gated business pilot
│   └── services/
│       └── application_service.py
├── data/
│   ├── synthetic/                   # gitignored generated datasets
│   ├── imports/                     # gitignored user uploads
│   ├── commerce/                    # gitignored Shopify/order imports
│   └── processed/                   # gitignored Parquet/aggregates
├── models/                          # gitignored trained artifacts + metadata
├── reports/                         # benchmark outputs and demo exports
├── tests/
│   ├── test_generator.py
│   ├── test_importer.py
│   ├── test_metrics.py
│   ├── test_engine_parity.py
│   ├── test_training.py
│   ├── test_optimizer.py
│   ├── test_commerce_normalization.py
│   └── test_attribution.py
└── docs/
    ├── data_dictionary.md
    ├── commerce_data_contract.md
    ├── methods_and_limitations.md
    ├── implementation_plan.md
    └── demo_walkthrough.md
```

Business logic must be independent of frontend session state. Define stable function/service contracts:

- `generate_dataset(config) -> dataset_manifest`
- `import_dataset(file, mapping, options) -> validated_dataset_manifest`
- `summarize_campaigns(dataset_id, filters) -> analytics_result`
- `benchmark_engines(dataset_id, engines, workload) -> benchmark_result`
- `train_revenue_model(dataset_id, config) -> model_record`
- `optimize_budget(model_id, total_budget, constraints, context) -> allocation_result`
- `import_commerce_orders(file, mapping, options) -> commerce_dataset_manifest` **(pilot)**
- `reconcile_commerce(ad_dataset_id, orders_dataset_id, attribution_policy) -> reconciliation_result` **(pilot)**
- `summarize_store_sales(orders_dataset_id, filters) -> commerce_analytics_result` **(pilot)**

Contract requirements: expose the **revenue source**, model provenance, `store_id`/dataset ownership, conversion definition and attribution coverage as first-class fields. Design authenticated read-only provider connector interfaces but do not register a provider as connected until verified end-to-end.

Do not require any Project 1 classes, APIs or DB tables. Future integration should only need an importable service/package or simple versioned API adapter and a navigation entry.

## 13. Implementation order (CODING PLAN)

### Phase 0 — Inspect and plan

- Inspect repository, current tools and availability of `design.md`.
- Write a concise `docs/implementation_plan.md` including chosen dependencies, supported execution modes, and known machine/resource constraints.
- Set up local run, lint/test commands and environment example; do not silently assume Hadoop cluster credentials or live advertising accounts.

### Phase 1 — Data foundation and metrics (first runnable MVP)

- Implement canonical schema, deterministic small synthetic generator, CSV importer/mapping/validation, persisted dataset metadata.
- Implement KPI calculations, filtered aggregations, Overview + Data Studio + Campaign Analytics.
- Create small fixture CSV and tests.

### Phase 2 — Big Data requirements

- Implement chunked generation at 10K/100K/1M/10M and partitioned Parquet storage.
- Implement Pandas, real local map-shuffle-reduce, and PySpark versions of identical workload.
- Implement correctness tests, reproducible measurements and Big Data Lab dashboard.

### Phase 3 — Actual ML training

- Implement leakage-safe features, chronological splits, baseline, XGBoost training and evaluation, model registry and ML Studio.
- Document domain shift, causal limitations, missing data and model acceptance gates.

### Phase 4 — Budget optimization

- Implement response curves, shape/saturation assumptions, budget/cap feasibility checks, PKR step allocation, baseline comparison and Budget Optimizer UI.
- Wire optimizer to **trained model predictions** when a valid model exists; provide explicitly labelled fallback with no fake model badge.

### Phase 5 — QA and university demonstration (mandatory completion gate)

- Read/reconcile `design.md` if supplied after initial scaffolding; implement its design faithfully without breaking business logic.
- Run full tests, build a working seeded demo, document benchmark method/environment and exact commands for instructor demonstration.
- Ensure Project 1 remains untouched and integration is not attempted.
- **Do not hold up the academic deliverable on Shopify account access, live advertising APIs, real customer orders or SaaS infrastructure.**

### Phase 6 — Small-business / Shopify CSV pilot (second deliverable, after MVP)

- Add generic commerce/Shopify order CSV and optional COGS/expenses imports with correct order/line-item/refund handling.
- Add store-sales analytics and **provenance-aware** reconciliation with authorized campaign CSVs; show unmatched and ambiguous attribution.
- Add the optional Commerce & Attribution page and confidence/missing-data gates for real-business forecasting.
- Add profit-aware recommendation mode **only** when reliable attribution and cost data satisfy documented checks.
- Pilot against **merchant-approved, appropriately anonymized** historical exports; validate numbers against the store's own reports and document discrepancies.
- A first pilot can run fully offline with uploaded CSVs. Do not label it production-ready because the dashboard loads real data.

### Phase 7 — Read-only API connections (later; requires credentials, consent, security review)

- Build authenticated Shopify Admin GraphQL connector plus advertiser APIs **one provider at a time** after verifying current API versions/scopes/permissions.
- Use least-privilege credentials, incremental sync, retries/backoff, audits, freshness indicators and merchant-controlled disconnect/deletion.
- Add scheduled sync and monitoring only when an operational backend exists; do not fabricate a successful sync state.
- Start **read-only**. Actual campaign creation, ad-budget changes or spending authorization are **out of scope**.

### Phase 8 — Commercial SaaS (future, not part of this university build)

- Add proper merchant sign-in, authorization, strict multi-tenant isolation, audit trails, encryption/rotation, backups, monitoring, payment/billing only if needed, and privacy/compliance processes.
- Run real-data backtests and small controlled live pilots before claiming the optimizer reliably increases revenue or profit.
- Document hosting, data residency, costs, service availability and support obligations.

## 14. Acceptance criteria / definition of done

Phase 5 academic verification completed October 30, 2026. See
`docs/phase-5-report.md` for acceptance evidence and the bounded accessibility
review; this is not production, merchant-accuracy or full WCAG certification.


The project is complete only when:

- [x] It launches independently with one documented local command.
- [x] All 12 required columns are generated or imported and validated.
- [x] It can use generated data *without any API keys*, with a visible synthetic-data label.
- [x] It can import a real advertiser CSV with mapping and missing-field warnings.
- [x] All KPI formulas are numerically tested, including zero denominators and weighted aggregation.
- [x] Generator supports 10K, 100K, 1M and **10M** rows via bounded-memory strategy.
- [x] Pandas, local MapReduce and PySpark run equivalent workloads; correctness parity is tested.
- [x] Benchmarks report **measured**, repeatable results and flag unsupported resource modes honestly.
- [x] ML is actually trained, evaluated, versioned and used for revenue prediction; no data leakage.
- [x] Optimizer returns feasible allocations totaling exactly **the user-entered PKR budget**, to paisa precision.
- [x] Data/ML/optimizer results can be exported and the dashboard shows provenance and caveats.
- [x] The demo has functional navigation, clear failures and non-broken UI.
- [x] Readme explains installation, how data arrives, how models are trained, how tests/benchmarks are run, limitations and future Project 1 integration contract.
- [x] No credentials, massive datasets, uploaded customer data or model binaries are accidentally committed to Git.

### Business-pilot exit checks (Phase 6; separate from university grade requirements)

The following software capabilities are exercised using explicitly fictional
fixtures, not a completed real merchant pilot.

- [x] Can import an authorized Shopify orders CSV **without double-counting** multi-line-item orders; generic commerce CSVs also work.
- [x] Can correctly handle cancelled/refunded/partially refunded orders and missing COGS/fees without silently fabricating figures.
- [x] Keeps platform-reported revenue, total store sales, and reconciled attributed sales separate; reports match/coverage/unmatched data.
- [x] Can merge only evidence-supported marketing and store datasets, with source, currency, timestamp, timezone and attribution-window transparency.
- [x] Real-data ML training uses valid labels with chronological evaluation; otherwise explicitly falls back or disables optimization.
- [x] Profit view/objective works only when financial cost coverage is adequate and assumptions are shown.
- [x] No personal Shopify customer fields are retained needlessly, and merchant data can be removed/exported.
- [x] All real-business forecasts are **advisory**; no live budget changes are ever executed.

- [ ] Merchant-approved anonymized historical exports reconciled against an equivalent merchant reference; discrepancies documented with actual merchant evidence.

### Production readiness (later, NOT a claim for Phases 1–6)

- [ ] Authenticated merchant consent + read-only API integration works end to end and permissions are documented.
- [ ] Authentication, tenant isolation, secret protection, access control, data retention, auditing, backups and operational monitoring have been independently verified.
- [ ] Recommendations have been evaluated on representative real merchant data and known model limitations are displayed.

## 15. Engineering quality, privacy and honest reporting

- Prefer reusable code, type hints, unit tests, reproducibility, careful error handling and clear dependency management over a flashy but nonfunctional demo.
- Keep heavy operations outside the UI request/render cycle. Use jobs/progress and resource limits for 10M-row generation, training and Spark benchmarking.
- Treat uploaded data as potentially confidential; validate file size/type, sanitize file paths, never run uploaded code, and avoid storing identifiable individual-level records. Parse Shopify exports defensively; treat spreadsheet formulas/CSV cells as untrusted input and prevent CSV formula injection in exports.
- Store provenance and merchant dataset boundaries for every report and model; prevent cross-store data mixing or model leakage. In the pilot, clearly document that single-user local mode is **not** a secure hosted multi-merchant environment.
- Do not guess or populate missing revenue or conversions from organic social engagement. If a dataset cannot support an analysis, say so.
- Do not represent the optimizer as controlling live ad spend. It **recommends allocations only**, no campaign execution/spending APIs. Real businesses must review budget advice and confirm actual allocations in their own ad accounts.
- Clearly distinguish **observed historical metrics**, **ML predicted metrics**, and **synthetic generator truths**.
- Be transparent about CPU/RAM limitations; a safe documented 10M execution mode is preferable to an app that crashes or pretends success.

## 16. Verified documentation pointers (for future implementation research)

These are reference starting points, not linked accounts or an instruction to connect to services without user credentials:

- Google Ads API conversion reporting: https://developers.google.com/google-ads/api/docs/conversions/reporting
- Google Ads API metrics (cost, conversion value etc.): https://developers.google.com/google-ads/api/reference/rpc/v25/Metrics
- Meta Marketing API / Insights: https://developers.facebook.com/docs/marketing-api/insights
- TikTok API for Business reporting: https://business-api.tiktok.com/portal/docs/api-reference/v2.0
- Shopify Admin GraphQL Orders: https://shopify.dev/docs/api/admin-graphql/latest/objects/order
- Shopify order history permission limits & scopes: https://shopify.dev/docs/api/usage/access-scopes
- Shopify customer journey summary (availability varies): https://shopify.dev/docs/api/admin-graphql/latest/objects/customerjourneysummary
- Shopify order CSV export guide and field structure: https://help.shopify.com/en/manual/fulfillment/managing-orders/exporting-orders
- Shopify standalone app authentication: https://shopify.dev/docs/apps/build/authentication-authorization/authenticate-standalone-apps
- Shopify app tokens and token refresh requirements: https://shopify.dev/docs/apps/build/authentication-authorization/access-tokens
- XGBoost Python documentation: https://xgboost.readthedocs.io/en/latest/python/
- Scikit-learn histogram gradient boosting: https://scikit-learn.org/stable/modules/generated/sklearn.ensemble.HistGradientBoostingRegressor.html

Check currently installed library/API versions before implementing connectors; do not assume the above documents imply user authorization.

## 17. Expected behavior from Codex

1. First show the precise proposed folder layout, initial dependencies, and work sequence, then implement actual files.
2. **Do not stop at planning, mock screens or pseudocode**. Build runnable software in measurable phases and test it.
3. Ask the user a question only when a decision **blocks** progress. **Missing Shopify API credentials, other ad-platform credentials, real merchant datasets, or `design.md` do not block the university MVP**. Otherwise choose the documented defaults and proceed. Phase 6 may use an intentionally fictional, labelled Shopify-format fixture until an approved real export exists.
4. Keep `README.md` and test outputs current as you implement features.
5. At the end report: what is working, what is simulated vs real, which engines were actually run, whether ML was actually trained, measured benchmarks, known limitations, and local run commands.

**Success condition:** A separate, professional and technically credible Project 2 that can later be added to Project 1 as a module **and** can evolve into a trustworthy Shopify-compatible / general small-business advertising intelligence tool without redesigning the data and ML foundations. A university prototype is **not** automatically commercially production-ready.


### October 29 Phase 3–4 repair contract (current)

Daily and weekly CSVs are supported without splitting weekly totals. Spend and
attributed revenue plus reporting definitions are required for revenue training;
conversion counts are optional. Model thresholds remain explicit. Heuristic
readiness is separate from supervised training. Budgets accept two decimal places,
with automatic bounded curve sampling independent of exact cent allocation.
Historical examples above are illustrations, never defaults or business limits.
See `docs/phase-34-debug-report.md` for the current behavior and evidence.


### Critical ML/planning repair · current behavior

Historical spending never imposes a mandatory future budget. Default zero floors
allow inactive channels. Actual user/provider restrictions can be entered as PKR
minimums/maximums. Automatic planning uses accepted supported ML, an independently
evaluated baseline, or allocation-only with null revenue/ROAS. Historical mode
cannot bypass baseline evaluation. Preserve component synthetic flags and gate
legacy imports whose flags or rate/count semantics were lost. The 5% XGBoost
policy is unchanged and explicitly operational, not statistically justified by
one split. See `docs/critical-ml-planning-report.md` for the actual source audit.

User-authorized protected hosting extension (November 1, 2026): Vercel frontend
and separately hosted FastAPI may use shared single-owner Basic authentication
over HTTPS. See `docs/hosting.md`. Local use stays unauthenticated by default;
this does not implement multi-user accounts or Phase 7 platform connections.

November 1 hosting update: the user selected Vercel-only hosting with no paid
services. See `docs/vercel.md` for bounded serverless execution, persistent private
Postgres snapshots and hosted lab limits. Preserve the complete local workflow.
