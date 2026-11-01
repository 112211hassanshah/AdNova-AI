# Phase 6 · local commerce CSV pilot

Implemented and tested October 30, 2026. **Software implementation complete;
merchant validation pending.** No approved real merchant export/reference was
provided. All financial outcome examples below are explicitly fictional.
Phases 7–8 remain future roadmaps; no live account connection or spending exists.

## Delivered behavior

`/commerce` now imports Shopify/generic order CSVs and optional order expenses or
SKU costs. Order and line-item grain stay separate, repeated financial fields
collapse once, and contradictions block saving. Declared discount/refund/subtotal,
status, currency/rate and local timezone definitions remain with immutable
snapshots. Missing financial information remains null. Privacy filtering removes
recognized personal columns and store-namespaced HMAC pseudonyms replace raw order
IDs. Independent commerce and advertising selections preserve the existing
campaign workflow.

Reconciliation requires compatible provenance, store scope, timezones and periods.
Campaign IDs and confirmed exact UTM mappings support matches; conflicting,
unmatched and excluded outcomes remain inspectable. Store net, platform-reported
revenue and matched store revenue are visibly separate. Cost coverage, observed
contribution, optional verified shipping income and supplied reference differences
are calculated in Python. Saved comparisons and contribution-profit plans can be
restored, exported and removed through source dependency deletion.

Profit planning uses a separate train-only fitted contribution response with
chronological validation/holdout screening. It does not relabel ad-revenue XGBoost
or NVIDIA explanations as a profit model. Missing/weak evidence withholds forecasts.
Supported plans obey user limits and exact-paisa totals, permit zero platform
allocations and disclose saturation/fixed-cost-mix assumptions. Comparisons share
the same budget and support. Negative profit is retained. No calibrated confidence
interval, causal uplift or business guarantee is claimed.

Implementation: `backend/src/ads_optimizer/commerce/`, `frontend/components/commerce*.tsx`,
`frontend/lib/commerce.ts`; integration in the API, source deletion, workspace
capabilities/navigation and route metadata. Fixture generator and tests are
`scripts/commerce_fixtures.py`, `backend/tests/test_commerce.py` and
`scripts/browser-phase6.mjs`. No dependency package added; fixture CSVs are included
as package data. Existing university ML/optimizer and NVIDIA data boundaries remain.

## Independently calculated outcome checks

The small pilot has 9 line-item rows, 8 unique orders and 6 eligible orders.
One order is canceled, one pending, one partially refunded and one fully refunded.
A campaign ID is ambiguous across ad accounts; a social domain is intentionally
unmatched; an exact merchant-confirmed UTM pair supplies a separate valid match.

| Outcome | Expected PKR | Actual backend and UI |
|---|---:|---:|
| Eligible gross merchandise sales | 8,300.00 | 8,300.00 |
| Discounts | 400.00 | 400.00 |
| Merchandise refunds | 1,500.00 | 1,500.00 |
| Store merchandise net sales | 6,400.00 | 6,400.00 |
| Platform-reported revenue (separate origin) | 12,000.00 | 12,000.00 |
| Evidence-matched store net sales (subset) | 5,150.00 | 5,150.00 |
| Recorded variable costs, including canceled-order fee | 3,710.00 | 3,710.00 |
| Advertising spend | 1,000.00 | 1,000.00 |
| Observed contribution after ads | 1,690.00 | 1,690.00 |

Match counts: **4 matched, 1 unmatched, 1 ambiguous, 2 excluded**. Blended
merchandise MER is 6.4, descriptive only. Explicitly including PKR 200 verified net
shipping income produces PKR 1,890 contribution. Excluding a marked test order in
an additional fixture removes its sales and costs, producing PKR 740 contribution.

The supplied matching reference returns zero net/order differences. Changing the
reference to PKR 6,500 exposes **−100 PKR**, hides stale figures and blocks profit
forecasting. Removing expense evidence makes cost/contribution null. Positive
unallocated refunds leave net sales unknown. These are actual checks, not mocked
success states. The small pilot correctly **cannot** forecast contribution profit.

## Evaluated fictional history

A separate reproducible 90-day fixture passes through the actual import and
reconciliation code: 450 day/platform observations, all five platforms, with
explicit costs. Chronological split: 270 training rows (July 1–August 23), 90
validation rows (August 24–September 10), 90 holdout rows (September 11–28).
Every platform beats its constant train-mean baseline in validation and holdout.

| Platform | Holdout response RMSE, PKR | Train-mean baseline RMSE, PKR |
|---|---:|---:|
| Facebook | 5.76 | 67.29 |
| Google | 9.10 | 101.31 |
| Instagram | 17.90 | 80.31 |
| TikTok | 12.76 | 132.06 |
| YouTube | 21.13 | 123.12 |

Actual seven-day plan, starting October 31: **PKR 5,000.37 exactly**; simulated
contribution after ads PKR 9,001.45. This is a designed simulation result and does
not establish merchant predictive accuracy.

Changing to **PKR 7,500.19** with a **20% YouTube share cap** removes YouTube from
positive-spend support: its permitted amount is below the observed minimum, so it
receives zero. Facebook 1,467.69 + Google 1,982.00 + Instagram 1,775.99 + TikTok
2,274.51 + YouTube 0 = **7,500.19**. Simulated contribution after ads is PKR 9,102.74.
All equal/historical comparisons retain the same exact budget. Saved plans restore
their original amount, limits and source-bound results. PKR 500 is refused as
unsupported; ordinary budget allocation remains a separate available feature.

Additional backend checks prove that modifying holdout targets does not alter
training parameters, removing a platform's holdout support blocks acceptance,
loss-making after-ad plans remain negative, overlapping SKU/order costs block,
whole weekly reports compare descriptively and partial reporting weeks refuse.

## Verification and review

- **189 backend tests passed, zero skips**, including **25 commerce cases** and
  existing native XGBoost, exact allocation, local MapReduce and Spark tests.
- `npm run check`, `npm run build`, `.venv/bin/python -m pytest`,
  `.venv/bin/ruff check backend scripts`, Prettier and Ruff formatting passed.
  `npm run verify` supplies the documented macOS native-library environment.
- **23 commerce browser/outcome checks passed** through actual forms/API responses,
  including imports, manual mapping, reference/cost changes, actual fit/plans,
  saved-plan restore, exports, unsupported budgets and labelled simulated 503 retry.
- **47 existing browser regression checks passed again**: 23 ad data/analytics/
  recovery checks and 24 weekly XGBoost/budget checks, including five entered
  amounts and unsupported revenue withholding.
- Commerce reviewed at **1440/1280/1024/768/430/390/375px**, all nine routes checked
  at desktop/mobile. No final page overflow or JavaScript page errors. Visible
  form names, one main/h1, control text contrast, reduced-motion setting and
  deletion-dialog focus containment/restoration checked. This is bounded review,
  not full screen-reader/WCAG certification.
- Reviewed desktop/mobile screenshots, including readable mobile header/result
  crops. Browser scripts removed their temporary source snapshots and restored
  original selections. No real commerce record or NVIDIA request was used.

Issues found and fixed: asynchronous importer profile selection/stage cleanup
race; missing dialog return focus; unstable saved-plan selector name; safe removal
of repeated personal headers; incomplete-platform holdout screening; exact
historical support bounds; unallocated refund semantics; cost lookup/overlap
scaling; atomic private HMAC key initialization; explicit JSON plan currency;
synthetic markers surviving manual mapping; extreme-value overflow guard with
headroom for exact paisa display. No required check remains failed.

## Evidence and remaining boundary

`phase-6-checks.json`, `phase-6-browser-results.json`, `phase-6-outcomes.json`,
`phase-1-browser-results.json`, `phase-34-debug-browser-results.json`, and
`screenshots/phase-6-*.png`. Raw verifier results are ignored under
`reports/phase6/checks.json`. Run instructions: `phase-6-guide.md`; financial/storage
contract: `commerce_data_contract.md`; forecast rules: `phase-6-methodology.md`.
README, progress, implementation plan, help and root contracts updated.

**Remaining merchant gate:** obtain an approved anonymized historical order/cost
export and the same merchant's authorized ad report, confirm order-cohort
financial/status/currency/timezone definitions, reconcile against an equivalent
reference, investigate differences and perform real chronological evaluation before
claiming merchant reliability. A stock Shopify sales-over-time report is not an
automatic equivalent: event dates, statuses, gift cards and adjustments differ.

This remains an unencrypted, local single-user pilot without authentication.
Logical SQLite deletion is not forensic erasure. No API connectors, hosted
security, spending, new dependencies, delegation or Project 1 access.
