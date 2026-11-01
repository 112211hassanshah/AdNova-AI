# Commerce CSV data contract · Phase 6

Implemented local single-user pilot. Advertising sources remain in their existing
catalog; orders, items, costs, reconciliations and profit plans are separate
immutable snapshots under `data/commerce/catalog.sqlite`. No Shopify account is
connected. An order export does not supply advertising spend or complete attribution.

## Imports and financial meaning

Four profiles: Shopify orders (line-item grain), generic orders, per-order expenses
and date-effective SKU costs. UTF-8 CSV only, at most 10 MiB / 100,000 rows / 100
columns. Recognized personal columns are removed before staging; repeated personal
headers such as Phone are harmless. Other duplicate headers and malformed rows
are rejected. Mapping, permission, currency/rate, timezone and financial definitions
are explicit. Validation never grants import permission automatically.

Shopify `Name` identifies an order across continuation rows. Repeated nonempty
order fields must agree; line items remain separate. One row per order is required
in generic order grain. Exact repeated rows require an explicit reject/drop/keep
choice; keep is for legitimate indistinguishable items. Duplicate line-item IDs
are rejected. Exact normalized snapshots cannot be saved twice. Overlapping order
snapshots are separate versions and must never be summed.

Financial values use **integer PKR paisa**, calculated with Decimal and half-up
rounding. Preserve original currency, declared PKR-per-unit rate and original order
amounts in original-currency minor units. The source must use two-decimal money;
zero- and three-decimal currency conventions need upstream normalization. Totals
are conservatively bounded to 10^14 combined minor units, below the JavaScript
exact-integer limit with headroom for two-decimal display; extreme FX,
quantity or aggregate values are rejected rather than rounded in the UI. Each
conversion rounds a component independently; an FX reconciliation may differ by
a paisa from converting an already-aggregated total. No exchange rates are fetched.

- Gross merchandise sales: explicit order gross, or complete quantity × unit-price
  lines. Both must agree if supplied.
- Discounts: confirmed order total, or confirmed order total plus line discounts.
  The app cannot determine whether a merchant's order discount already includes
  line discounts. Optional Subtotal definition cross-checks before/after discounts.
- `Refunded Amount` is a total refund, with no assumed merchandise/tax/shipping
  split. Positive refunds need an explicit merchandise refund or a verified
  merchandise-only definition. A known zero total refund implies zero merchandise
  refund. Missing discounts or refund splits keep net sales **null**.
- Merchandise net sales = gross − discounts − merchandise refunds; tax excluded.
  Fully refunded orders with known net must reconcile to zero. Inconsistent totals,
  refunds above merchandise sales, mixed currencies and fractional quantities block.
- Paid, partially refunded and refunded orders are eligible. Canceled, marked test,
  pending, authorized, partially paid, voided and expired orders are excluded.
  Recorded costs on non-test excluded orders still reduce observed contribution.
  Unmarked test transactions cannot be detected; the importer warns when no test
  flag is mapped and the merchant must remove them upstream.
- Shipping income is excluded by default. Optional inclusion requires known
  shipping charged minus shipping refunded. Shipping/fulfillment expense is a
  separate cost. Fees, packaging and other variable costs also remain separate.
- Every missing cost stays null. Explicit zero means a verified absence of cost.
  SKU costs use the order's local date and sold or verified net-refunded quantity.
  Overlapping date ranges and simultaneous SKU/order COGS are rejected.

This is an **order-cohort snapshot**, updated for refunds as of its declared date.
It is not Shopify's event-date sales report or a financial statement. Shopify's
sales reports also use different status eligibility and special gift-card/adjustment
rules; those are not silently replicated. Prepare a comparable reference first.
The importer does not infer gift-card liabilities, exchanges, duties, shipping
discounts, chargebacks or unrecorded costs from an ordinary order CSV.

Current field structure checked against Shopify's official
[order export documentation](https://help.shopify.com/en/manual/fulfillment/managing-orders/exporting-orders).
Shopify describes additional line items on separate rows. Its
[sales report documentation](https://help.shopify.com/en/manual/reports-and-analytics/shopify-reports/report-types/default-reports/sales-report)
places sales reversals on their processing date, unlike this pilot's cohort basis.

## Time, scope and attribution

Store identifier namespaces HMAC order keys. ISO timestamps normalize to the
merchant's IANA timezone; UTC is retained. Naive ambiguous/nonexistent DST times
need an explicit offset. Future orders, future touches and impossible cancellation
timestamps block. Store coverage and snapshot date are explicit; forecasts require
complete-export and refund-completeness declarations.

Select exactly one order snapshot, one authorized ad dataset and compatible cost
snapshots. Confirm the ad source belongs exclusively to this store and its local
dates/timezone are comparable. Synthetic and real sources cannot mix. A recognized
synthetic component marker cannot be removed by changing the manual mapping.

Matching uses a supplied campaign ID, narrowed by supplied platform/account, or
an exact UTM pair mapped to a campaign/account with merchant confirmation.
Conflicting evidence and multiple candidates are ambiguous. A domain or campaign
name alone never establishes a paid channel. Missing evidence is unmatched.
Exclusions retain their outcome. Available touch dates determine calendar-day lag;
touches outside the selected period or attribution window are unmatched. Daily
ads or whole weekly periods may be compared; partial reporting weeks block.

The UI/export keeps three origins distinct: total store merchandise net sales,
platform-reported revenue and the evidence-matched store subset. Never add them.
MER = store merchandise net sales / total selected ad spend, descriptive only.
Contribution = store net + optional verified shipping income − all declared
variable costs − selected ad spend. Any missing required component returns null.
User-provided net/order references display exact discrepancies; they are not fetched
from Shopify and matching them does not establish causal attribution.

## Storage, API and privacy

HMAC-SHA256 pseudonyms use a random local 32-byte key and store namespace. Customer
names, emails, phone/address, notes and recognized payment references are discarded.
Only mapped canonical fields survive commit; order IDs survive only as pseudonyms.
Unknown columns can temporarily exist in the local sanitized stage: use appropriately
anonymized exports, verify mappings and avoid putting personal data in free-text
identifiers or filenames. Email-like and multiline campaign identifiers are rejected.

Commerce directory mode 0700, catalog/staged files/key mode 0600. Staging expires
24 hours later on access/upload; commit/discard removes its stage. Saved snapshots
persist until deleted. Deleting orders cascades costs, comparisons and plans;
deleting costs cascades dependent comparisons/plans; deleting an ad source removes
its comparisons/plans while preserving independent store orders. SQLite deletion
is logical deletion, **not secure forensic erasure**; original CSVs, exports,
backups and the HMAC key remain. Files are not encrypted by the application.
No hosted authentication or tenant isolation is claimed.

API: `/api/v1/commerce`, selection, imports/preview, imports/{token}/validate|commit,
snapshots/{id}, rows, export, campaigns/{ad-id}, reconciliations, profit-plans,
examples/{profile}, demo?variant=pilot|history. Frontend receives manifests and
bounded pages (default 20, maximum 100 rows); source lists expose latest 50 each.
Full exports remain available by ID. Exports label source and synthetic provenance
and escape formula-leading CSV text. Ledger money is paisa; profit-plan results,
curves and allocations are **PKR**. Reference money/differences and evaluation
errors are also explicitly PKR, ratios unitless. Original amounts remain original
minor units. Financial computation and fitting belong exclusively to Python.

The optional NVIDIA Assistant does not receive commerce records or participate in
commerce matching, financial calculations, fitting or allocation.
