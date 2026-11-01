"use client";

import { useState } from "react";
import { Upload, X } from "lucide-react";
import { api, json, message, number } from "@/lib/data";
import type {
  CommerceMeta,
  CommerceOptions,
  CommerceStage,
  CommerceValidation,
} from "@/lib/commerce";
import { Notice } from "./data-primitives";

const today = () => new Date().toLocaleDateString("en-CA");
const labels: Record<string, string> = {
  order_id: "Order identifier",
  ordered_at: "Order timestamp",
  financial_status: "Financial status",
  gross_item_sales: "Gross merchandise sales",
  discounts: "Order discounts",
  refunded_amount: "Total refunded amount",
  merchandise_refunds: "Verified merchandise refunds",
  shipping_charged: "Shipping charged",
  shipping_refunded: "Shipping refunded",
  tax: "Tax",
  cancelled_at: "Cancellation timestamp",
  sku: "Product SKU",
  quantity: "Sold quantity",
  unit_price: "Unit price",
  line_discount: "Line discount",
  line_item_id: "Line-item identifier",
  refunded_quantity: "Refunded quantity",
  cogs: "Order COGS",
  payment_fees: "Payment fees",
  fulfillment: "Fulfillment / shipping expense",
  packaging: "Packaging",
  other_variable_costs: "Other variable costs",
  unit_cost: "Verified cost per unit",
  effective_from: "Effective from",
  effective_to: "Effective to",
};

export function CommerceImport({
  selected,
  onSaved,
}: {
  selected: CommerceMeta | null;
  onSaved: (meta: CommerceMeta) => Promise<void>;
}) {
  const [profile, setProfile] = useState("shopify");
  const [stage, setStage] = useState<CommerceStage | null>(null);
  const [config, setConfig] = useState<CommerceOptions>({
    name: "Imported store orders",
    store_id: selected?.store_id || "my-store",
    mapping: {},
    timezone: "Asia/Karachi",
    original_currency: "PKR",
    exchange_rate: null,
    is_synthetic: false,
    duplicate_policy: "reject",
    order_grain: "line_items",
    discount_basis: "order_total",
    refund_basis: "unallocated",
    subtotal_basis: "unknown",
    snapshot_as_of: today(),
    period_start: null,
    period_end: null,
    complete_export: false,
    refunds_verified: false,
    order_batch_id: selected?.id || null,
    cogs_basis: "sold_quantity",
  });
  const [report, setReport] = useState<CommerceValidation | null>(null);
  const [approved, setApproved] = useState(false);
  const [busy, setBusy] = useState("");
  const [error, setError] = useState("");
  const costs = ["expenses", "sku_costs"].includes(profile);
  function change(update: Partial<CommerceOptions>) {
    setConfig((value) => ({ ...value, ...update }));
    setReport(null);
    setApproved(false);
    setError("");
  }
  async function discard() {
    const previous = stage;
    setStage(null);
    setReport(null);
    setApproved(false);
    if (previous)
      await api(`/commerce/imports/${previous.token}`, { method: "DELETE" });
  }
  async function upload(file: File) {
    setBusy("upload");
    setError("");
    setReport(null);
    setApproved(false);
    try {
      if (stage)
        await api(`/commerce/imports/${stage.token}`, { method: "DELETE" });
      const next = await api<CommerceStage>(
        `/commerce/imports/preview?profile=${profile}&filename=${encodeURIComponent(file.name)}`,
        { method: "POST", body: file, headers: { "Content-Type": "text/csv" } },
      );
      setStage(next);
      setConfig((value) => ({
        ...value,
        mapping: next.suggested_mapping,
        name: file.name.replace(/\.csv$/i, "").slice(0, 100),
        order_grain: profile === "generic" ? "orders" : "line_items",
        store_id: costs && selected ? selected.store_id : value.store_id,
        order_batch_id: costs ? selected?.id || null : null,
      }));
    } catch (reason) {
      setStage(null);
      setError(message(reason));
    } finally {
      setBusy("");
    }
  }
  const fields =
    profile === "expenses"
      ? [
          "order_id",
          "cogs",
          "payment_fees",
          "fulfillment",
          "packaging",
          "other_variable_costs",
          "currency",
          "is_synthetic",
        ]
      : profile === "sku_costs"
        ? [
            "sku",
            "unit_cost",
            "effective_from",
            "effective_to",
            "currency",
            "is_synthetic",
          ]
        : [
            "order_id",
            "ordered_at",
            "financial_status",
            ...(profile === "generic"
              ? ["gross_item_sales"]
              : ["sku", "quantity", "unit_price"]),
            "discounts",
            "refunded_amount",
            "merchandise_refunds",
          ];
  const mapField = (field: string) => (
    <label key={field}>
      {labels[field] || field.replaceAll("_", " ")}
      <select
        aria-label={`Map commerce ${field}`}
        value={config.mapping[field] || ""}
        disabled={!!busy}
        onChange={(event) => {
          const mapping = { ...config.mapping };
          if (event.target.value) mapping[field] = event.target.value;
          else delete mapping[field];
          change({ mapping });
        }}
      >
        <option value="">Not available / not mapped</option>
        {stage?.headers.map((header) => (
          <option key={header} value={header}>
            {header}
          </option>
        ))}
      </select>
    </label>
  );
  return (
    <section className="card commerce-import">
      <div className="card-heading">
        <h2>
          <Upload size={18} /> Import commerce CSV
        </h2>
        <span className="source-badge">Local file</span>
      </div>
      <p>
        Orders and product costs have their own workspace. Tax and shipping are
        separate from merchandise net sales. Missing costs stay missing.
      </p>
      <div className="form-grid">
        <label>
          Commerce file type
          <select
            aria-label="Commerce file type"
            value={profile}
            disabled={!!busy}
            onChange={(event) => {
              const nextProfile = event.target.value;
              void discard().catch((reason) => setError(message(reason)));
              setProfile(nextProfile);
              setConfig((value) => ({
                ...value,
                order_grain:
                  nextProfile === "generic" ? "orders" : "line_items",
                order_batch_id: selected?.id || null,
              }));
            }}
          >
            <option value="shopify">Shopify order export · line items</option>
            <option value="generic">Generic order CSV</option>
            <option value="expenses">Per-order costs and expenses</option>
            <option value="sku_costs">Product / SKU costs</option>
          </select>
        </label>
        <a
          className="button secondary"
          href={`/api/v1/commerce/examples/${profile}`}
          download
        >
          Download fictional example
        </a>
      </div>
      {costs && (
        <p className="form-hint">
          Costs will belong to{" "}
          {selected
            ? `${selected.name} · ${selected.store_id}`
            : "an orders snapshot you must select first"}
          . Select explicit zeroes where a category truly has no cost.
        </p>
      )}
      <label className="commerce-upload">
        Choose a UTF-8 CSV
        <input
          aria-label="Commerce CSV file"
          type="file"
          accept=".csv,text/csv"
          disabled={!!busy || (costs && !selected)}
          onChange={(event) => {
            const file = event.target.files?.[0];
            if (file) void upload(file);
            event.target.value = "";
          }}
        />
      </label>
      {busy === "upload" && (
        <p role="status">Reading and sanitizing the local CSV…</p>
      )}
      {error && <Notice error text={error} />}
      {stage && (
        <>
          <div className="notice" role="status">
            <p>
              {number(stage.input_rows)} source rows · {stage.removed_columns}{" "}
              personal columns removed. Raw order identifiers are pseudonymized
              on saving.
            </p>
          </div>
          <div className="form-grid">{fields.map(mapField)}</div>
          {!costs && (
            <details>
              <summary>
                Optional order, shipping and attribution columns
              </summary>
              <div className="form-grid">
                {stage.fields
                  .filter(
                    (field) =>
                      !fields.includes(field) &&
                      ![
                        "cogs",
                        "payment_fees",
                        "fulfillment",
                        "packaging",
                        "other_variable_costs",
                        "unit_cost",
                        "effective_from",
                        "effective_to",
                      ].includes(field),
                  )
                  .map(mapField)}
              </div>
            </details>
          )}
          <div className="form-grid">
            <label>
              Snapshot name
              <input
                value={config.name}
                maxLength={100}
                disabled={!!busy}
                onChange={(event) => change({ name: event.target.value })}
              />
            </label>
            <label>
              Store identifier
              <input
                value={config.store_id}
                disabled={!!busy || costs}
                pattern="[A-Za-z0-9_-]+"
                onChange={(event) => change({ store_id: event.target.value })}
              />
            </label>
            <label>
              Store timezone
              <input
                value={config.timezone}
                disabled={!!busy}
                onChange={(event) => change({ timezone: event.target.value })}
              />
            </label>
            <label>
              Original currency
              <input
                value={config.original_currency}
                maxLength={3}
                disabled={!!busy}
                onChange={(event) => {
                  const currency = event.target.value.toUpperCase();
                  change({
                    original_currency: currency,
                    exchange_rate:
                      currency === "PKR" ? null : config.exchange_rate,
                  });
                }}
              />
            </label>
            {config.original_currency !== "PKR" && (
              <label>
                Verified PKR per original currency unit
                <input
                  type="number"
                  min="0.000001"
                  step="any"
                  value={config.exchange_rate ?? ""}
                  onChange={(event) =>
                    change({
                      exchange_rate: event.target.value
                        ? Number(event.target.value)
                        : null,
                    })
                  }
                />
              </label>
            )}
            {!costs && (
              <>
                <label>
                  Row grain
                  <select
                    aria-label="Commerce row grain"
                    value={config.order_grain}
                    onChange={(event) =>
                      change({ order_grain: event.target.value })
                    }
                  >
                    <option value="line_items">
                      Multiple line items per order
                    </option>
                    <option value="orders">One row per order</option>
                  </select>
                </label>
                <label>
                  Discount definition
                  <select
                    aria-label="Commerce discount definition"
                    value={config.discount_basis}
                    onChange={(event) =>
                      change({ discount_basis: event.target.value })
                    }
                  >
                    <option value="order_total">
                      Order discount includes all discounts
                    </option>
                    <option value="order_plus_line">
                      Add order and line discounts
                    </option>
                  </select>
                </label>
                <label>
                  Refund definition
                  <select
                    aria-label="Commerce refund definition"
                    value={config.refund_basis}
                    onChange={(event) =>
                      change({ refund_basis: event.target.value })
                    }
                  >
                    <option value="unallocated">
                      Total refund may include tax/shipping
                    </option>
                    <option value="merchandise_only">
                      I verified total refund is merchandise only
                    </option>
                  </select>
                </label>
                <label>
                  Subtotal reference meaning
                  <select
                    aria-label="Commerce subtotal definition"
                    value={config.subtotal_basis}
                    onChange={(event) =>
                      change({ subtotal_basis: event.target.value })
                    }
                  >
                    <option value="unknown">
                      Not verified · do not use as a check
                    </option>
                    <option value="before_discounts">Before discounts</option>
                    <option value="after_discounts">
                      After discounts, before refunds
                    </option>
                  </select>
                </label>
                <label>
                  Snapshot as-of date
                  <input
                    type="date"
                    value={config.snapshot_as_of}
                    onChange={(event) =>
                      change({ snapshot_as_of: event.target.value })
                    }
                  />
                </label>
                <label>
                  Export coverage start
                  <input
                    type="date"
                    value={config.period_start || ""}
                    onChange={(event) =>
                      change({ period_start: event.target.value || null })
                    }
                  />
                </label>
                <label>
                  Export coverage end
                  <input
                    type="date"
                    value={config.period_end || ""}
                    onChange={(event) =>
                      change({ period_end: event.target.value || null })
                    }
                  />
                </label>
              </>
            )}
            {profile === "sku_costs" && (
              <label>
                COGS quantity basis
                <select
                  aria-label="COGS quantity basis"
                  value={config.cogs_basis}
                  onChange={(event) =>
                    change({ cogs_basis: event.target.value })
                  }
                >
                  <option value="sold_quantity">
                    Sold quantity · no return-cost recovery assumed
                  </option>
                  <option value="net_refunded_quantity">
                    Sold minus explicitly refunded quantity
                  </option>
                </select>
              </label>
            )}
            <label>
              Identical-row policy
              <select
                aria-label="Commerce duplicate policy"
                value={config.duplicate_policy}
                onChange={(event) =>
                  change({ duplicate_policy: event.target.value })
                }
              >
                <option value="reject">Reject until reviewed</option>
                <option value="drop">Drop exact duplicates after review</option>
                <option value="keep">
                  Keep confirmed legitimate repeated lines
                </option>
              </select>
            </label>
          </div>
          <label className="commerce-check">
            <input
              type="checkbox"
              checked={config.is_synthetic}
              onChange={(event) =>
                change({ is_synthetic: event.target.checked })
              }
            />{" "}
            This file is fictional / synthetic (file markers are always
            preserved)
          </label>
          {!costs && (
            <>
              <label className="commerce-check">
                <input
                  type="checkbox"
                  checked={config.complete_export}
                  onChange={(event) =>
                    change({ complete_export: event.target.checked })
                  }
                />{" "}
                This contains all store orders in the explicit coverage window
              </label>
              <label className="commerce-check">
                <input
                  type="checkbox"
                  checked={config.refunds_verified}
                  onChange={(event) =>
                    change({ refunds_verified: event.target.checked })
                  }
                />{" "}
                I verified refund completeness at the snapshot date
              </label>
              <p className="form-hint">
                Totals are an order-cohort snapshot. Refunds reduce the original
                order date, not the date a refund was paid. Unsettled, cancelled
                and marked test orders are excluded from sales. Remove unmarked
                test transactions before importing.
              </p>
            </>
          )}
          <div className="button-row">
            <button
              className="button primary"
              disabled={!!busy}
              onClick={async () => {
                setBusy("validate");
                setError("");
                try {
                  setReport(
                    await api<CommerceValidation>(
                      `/commerce/imports/${stage.token}/validate`,
                      json(config),
                    ),
                  );
                  setApproved(false);
                } catch (reason) {
                  setError(message(reason));
                } finally {
                  setBusy("");
                }
              }}
            >
              {busy === "validate" ? "Validating…" : "Validate commerce import"}
            </button>
            <button
              className="button secondary"
              disabled={!!busy}
              onClick={() =>
                void discard().catch((reason) => setError(message(reason)))
              }
            >
              <X size={15} />
              Discard preview
            </button>
          </div>
          {report && (
            <div
              className="commerce-validation"
              role="region"
              aria-label="Commerce validation report"
            >
              <h3>
                {report.can_import
                  ? "Ready for commerce review"
                  : "Commerce file needs attention"}
              </h3>
              {report.can_import && (
                <p>
                  {report.orders} unique orders · {report.line_items} line items
                  · {report.cost_rows} cost rows ·{" "}
                  {report.is_synthetic ? "Synthetic" : "Imported"}
                </p>
              )}
              {report.errors.map((text) => (
                <Notice error key={text} text={text} />
              ))}
              {report.warnings.map((text) => (
                <p key={text}>{text}</p>
              ))}
              {report.can_import && (
                <>
                  <label className="commerce-check">
                    <input
                      type="checkbox"
                      checked={approved}
                      onChange={(event) => setApproved(event.target.checked)}
                    />{" "}
                    I have permission and reviewed the definitions and
                    validation
                  </label>
                  <button
                    className="button primary"
                    disabled={!approved || !!busy}
                    onClick={async () => {
                      setBusy("save");
                      setError("");
                      try {
                        const saved = await api<CommerceMeta>(
                          `/commerce/imports/${stage.token}/commit`,
                          json({ ...config, confirmed: true }),
                        );
                        setStage(null);
                        setReport(null);
                        setApproved(false);
                        await onSaved(saved);
                      } catch (reason) {
                        setError(message(reason));
                      } finally {
                        setBusy("");
                      }
                    }}
                  >
                    {busy === "save"
                      ? "Saving…"
                      : "Confirm and save commerce snapshot"}
                  </button>
                </>
              )}
            </div>
          )}
        </>
      )}
    </section>
  );
}
