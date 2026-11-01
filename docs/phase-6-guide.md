# Run and review the commerce pilot

Start `npm run dev` and open <http://localhost:3000/commerce>.
No API key, merchant account connection or new dependency is required.

1. Choose **Try fictional commerce pilot** to inspect the small hand-calculated
   dataset, including line items, refunds, a cancellation, unresolved attribution
   and withheld forecasting. Download examples to inspect their actual columns.
2. For your own approved export, expand **Import orders or optional costs**.
   Select Shopify line items or generic orders. Confirm mappings, store namespace,
   timezone, original currency and any verified PKR conversion rate. Review
   discount, subtotal, refund and row-grain definitions. Enter snapshot and coverage
   dates; only declare completeness after checking the export. Validate, review
   warnings and confirm permission to save.
3. Import optional per-order expenses or date-effective SKU costs into that
   selected order snapshot. Include explicit zeroes only when expenses are known
   to be zero. Choose a verified sold/net-refunded COGS basis; avoid overlapping
   sources. Unrecorded costs keep contribution unavailable.
4. Import the merchant's separate advertiser CSV in **Data Studio**. Back in
   Commerce choose it without changing your normal campaign selection. Select
   costs and comparable dates, verify store scope/timezones and add only supported
   exact UTM mappings. Optional reference net sales and eligible order count must
   use the same order-cohort definitions. Save the comparison.
5. Review the three revenue origins, attribution outcomes, cost coverage,
   contribution and reference differences. Use the outcome filter to investigate
   unmatched, ambiguous and excluded orders. Never add the three revenue totals.
6. **Try complete fictional history** exercises the accepted path with 450 actual
   synthetic imports. Enter PKR 5,000.37, start 2026-10-31 and a seven-day horizon.
   Generate a contribution plan, inspect the chronological evaluation and change
   budget/constraints to review new outcomes. PKR 500 is deliberately unsupported
   by this fixture's training spend and must withhold estimated profit.
7. Restore saved comparisons, export source-labelled JSON/CSV, or delete selected
   snapshots and dependent results with the review dialog. Original files remain
   on your computer. There is no live order editing or ad spending.

Normal Shopify exports may not include merchandise-only refunds, attribution
signals, SKU costs or expense coverage. Missing evidence is an honest blocked
state. This pilot's paid-order cohort is not a drop-in replica of Shopify's sales
report: refund-event timing, pending/canceled orders, gift cards and adjustments
can differ. Prepare an equivalent anonymized merchant ledger/reference before
claiming report agreement. Read `commerce_data_contract.md` and
`phase-6-methodology.md` for exact definitions and limitations.

Reproduce checks:

```sh
npm run verify
npm run test:e2e:commerce
```

The browser script imports fictional files through real forms, checks hand totals,
actual evaluation and constrained plans, exports and failures, then removes its
own QA snapshots and restores original ad/commerce selections. It requires the
local dev server and an installed Playwright Chromium; `CHROMIUM_EXECUTABLE` can
select an existing installation. It does not call NVIDIA. The verifier supplies
the documented macOS native-library path for Python and runs checks serially.
