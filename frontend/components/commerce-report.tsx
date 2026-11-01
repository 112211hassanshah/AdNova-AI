"use client";

import { useEffect, useState } from "react";
import { ArrowDownToLine, Calculator, ShieldCheck } from "lucide-react";
import {
  api,
  json,
  message,
  money,
  number,
  coveragePercent,
  type RecordRow,
} from "@/lib/data";
import {
  paisa,
  type CommerceReport,
  type CommerceState,
  type CommerceMeta,
  type ProfitPlan,
} from "@/lib/commerce";
import { Loading, Notice, RawTable } from "./data-primitives";

const pct = (value: number | null) =>
  value === null ? "Not available" : coveragePercent(value);

export function CommerceResults({ report }: { report: CommerceReport }) {
  const [status, setStatus] = useState("all");
  const [page, setPage] = useState(1);
  const [rows, setRows] = useState<{ rows: RecordRow[]; total: number } | null>(
    null,
  );
  const [error, setError] = useState("");
  const [retry, setRetry] = useState(0);
  useEffect(() => {
    const controller = new AbortController();
    api<{ rows: RecordRow[]; total: number }>(
      `/commerce/snapshots/${report.manifest.id}/rows?table=links&status=${status}&page=${page}`,
      { signal: controller.signal },
    )
      .then(setRows)
      .catch((reason) => {
        if (!controller.signal.aborted) setError(message(reason));
      });
    return () => controller.abort();
  }, [report.manifest.id, status, page, retry]);
  return (
    <div className="commerce-results">
      <div className="commerce-context">
        <span>
          {report.manifest.is_synthetic
            ? "Fictional / synthetic"
            : "Imported store snapshot"}{" "}
          · {report.manifest.store_id} · PKR · {report.config.start_date} to{" "}
          {report.config.end_date}
        </span>
        <div className="button-row">
          <a
            className="button secondary"
            href={`/api/v1/commerce/snapshots/${report.manifest.id}/export`}
            download
          >
            <ArrowDownToLine size={15} />
            Reconciliation JSON
          </a>
          <a
            className="button secondary"
            href={`/api/v1/commerce/snapshots/${report.manifest.id}/export?format=csv&table=links`}
            download
          >
            Attribution CSV
          </a>
        </div>
      </div>
      <div className="notice">
        <ShieldCheck size={19} />
        <p>{report.notice}</p>
      </div>
      <div className="commerce-three">
        {[
          [
            "Store merchandise net sales",
            report.store.net_sales,
            "Store orders · after discounts and merchandise refunds",
            "commerce-store-net",
          ],
          [
            "Platform-reported revenue",
            report.advertising.platform_reported_revenue,
            "Ad platform · may overlap across providers",
            "commerce-ad-revenue",
          ],
          [
            "Evidence-matched store sales",
            report.attribution.matched_net_sales,
            "Reconciled subset · observational, not causal",
            "commerce-matched-net",
          ],
        ].map(([title, value, caption, testid]) => (
          <section className="card metric" key={String(title)}>
            <h2>{title}</h2>
            <strong className="live-metric-value" data-testid={String(testid)}>
              {paisa(value as number | null)}
            </strong>
            <p>{caption}</p>
          </section>
        ))}
      </div>
      <div className="commerce-two">
        <section className="card dark commerce-quality">
          <h2>Attribution quality</h2>
          <p>
            Every order keeps its outcome. A domain or campaign name alone never
            establishes a paid match.
          </p>
          <div className="commerce-counts">
            {["matched", "unmatched", "ambiguous", "excluded"].map((key) => (
              <div key={key}>
                <strong data-testid={`commerce-${key}`}>
                  {
                    report.attribution[
                      key as "matched" | "unmatched" | "ambiguous" | "excluded"
                    ]
                  }
                </strong>
                <span>{key}</span>
              </div>
            ))}
          </div>
          <p>
            {pct(report.attribution.order_coverage)} of eligible orders matched
            · {report.attribution.unknown_lag_orders} matched orders have
            unknown conversion lag.
          </p>
        </section>
        <section className="card commerce-ledger">
          <h2>What is in this snapshot?</h2>
          <dl className="commerce-dl">
            <div>
              <dt>Unique / eligible orders</dt>
              <dd>
                {report.store.unique_orders} / {report.store.eligible_orders}
              </dd>
            </div>
            <div>
              <dt>Gross merchandise sales</dt>
              <dd>{paisa(report.store.gross_sales)}</dd>
            </div>
            <div>
              <dt>Discounts</dt>
              <dd>{paisa(report.store.discounts)}</dd>
            </div>
            <div>
              <dt>Merchandise refunds</dt>
              <dd>{paisa(report.store.merchandise_refunds)}</dd>
            </div>
            <div>
              <dt>Net-sales completeness</dt>
              <dd>{pct(report.store.net_sales_coverage)}</dd>
            </div>
            <div>
              <dt>Advertising spend</dt>
              <dd>{paisa(report.advertising.spend)}</dd>
            </div>
            <div>
              <dt>Blended merchandise MER</dt>
              <dd>
                {report.profit.merchandise_mer === null
                  ? "Not available"
                  : `${number(report.profit.merchandise_mer, 2)}×`}
              </dd>
            </div>
          </dl>
          <p className="form-hint">
            MER is store net sales divided by all compared ad spend. It is a
            blended description, not campaign ROAS or causal return.
          </p>
        </section>
      </div>
      <section className="card commerce-costs">
        <div className="card-heading">
          <h2>Contribution after advertising</h2>
          <span className="source-badge">
            Observed snapshot · not a forecast
          </span>
        </div>
        <strong
          className="live-metric-value"
          data-testid="commerce-contribution"
        >
          {paisa(report.profit.contribution_after_ads)}
        </strong>
        <p>
          Merchandise net sales +{" "}
          {report.config.include_shipping_income
            ? "verified net shipping income"
            : "no shipping income"}{" "}
          − declared variable costs − ad spend. Tax excluded. Non-test
          cancelled/unsettled order costs are included when supplied.
        </p>
        <div
          className="table-scroll"
          role="region"
          aria-label="Commerce cost coverage"
          tabIndex={0}
        >
          <table className="data-table">
            <caption className="sr-only">
              Recorded variable costs and order coverage
            </caption>
            <thead>
              <tr>
                <th scope="col">Cost category</th>
                <th scope="col">Recorded total (PKR)</th>
                <th scope="col">Order coverage</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(report.costs.totals).map(([key, value]) => (
                <tr key={key}>
                  <th scope="row">{key.replaceAll("_", " ")}</th>
                  <td>{paisa(value)}</td>
                  <td>{pct(report.costs.coverage[key])}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="form-hint">
          Unavailable totals contain missing entries. A supplied zero is
          different from a missing expense. This contribution view is not a
          complete financial statement.
        </p>
      </section>
      {(report.reference.provided_net_sales !== null ||
        report.reference.provided_eligible_orders !== null) && (
        <section className="card">
          <h2>Compare with your reference</h2>
          <p>{report.reference.origin}</p>
          <dl className="commerce-dl">
            <div>
              <dt>Net sales difference (app − reference)</dt>
              <dd>
                {report.reference.net_sales_difference === null
                  ? "Not available"
                  : money(report.reference.net_sales_difference)}
              </dd>
            </div>
            <div>
              <dt>Eligible order count difference</dt>
              <dd>
                {report.reference.order_count_difference ?? "Not provided"}
              </dd>
            </div>
          </dl>
          <p className="form-hint">
            A matching reference does not verify attribution. Use the same
            order-cohort definition, currency, timezone and snapshot date.
          </p>
        </section>
      )}
      <section className="card">
        <div className="card-heading">
          <h2>Order attribution review</h2>
          <label>
            Show outcomes
            <select
              aria-label="Show commerce attribution outcomes"
              value={status}
              onChange={(event) => {
                setStatus(event.target.value);
                setPage(1);
                setRows(null);
                setError("");
              }}
            >
              {["all", "matched", "unmatched", "ambiguous", "excluded"].map(
                (value) => (
                  <option key={value} value={value}>
                    {value}
                  </option>
                ),
              )}
            </select>
          </label>
        </div>
        {error ? (
          <>
            <Notice error text={error} />
            <button
              className="button secondary"
              onClick={() => {
                setError("");
                setRetry((v) => v + 1);
              }}
            >
              Retry attribution rows
            </button>
          </>
        ) : !rows ? (
          <Loading text="Loading pseudonymous order outcomes…" />
        ) : (
          <>
            <RawTable
              label="Pseudonymous commerce attribution"
              rows={rows.rows.map((row) => ({
                ...row,
                order_key: `${String(row.order_key).slice(0, 12)}…`,
                net_sales: paisa(row.net_sales as number | null),
              }))}
            />
            <div className="pagination">
              <span>
                Page {page} · {rows.total} outcomes
              </span>
              <div className="button-row">
                <button
                  className="button secondary"
                  disabled={page <= 1}
                  onClick={() => {
                    setRows(null);
                    setPage((v) => v - 1);
                  }}
                >
                  Previous outcomes
                </button>
                <button
                  className="button secondary"
                  disabled={page * 20 >= rows.total}
                  onClick={() => {
                    setRows(null);
                    setPage((v) => v + 1);
                  }}
                >
                  Next outcomes
                </button>
              </div>
            </div>
          </>
        )}
      </section>
      <ProfitPlanner key={report.manifest.id} report={report} />
    </div>
  );
}

function ProfitPlanner({ report }: { report: CommerceReport }) {
  const [amount, setAmount] = useState("");
  const next = new Date();
  next.setDate(next.getDate() + 1);
  const [start, setStart] = useState(next.toLocaleDateString("en-CA"));
  const [horizon, setHorizon] = useState(7);
  const [limits, setLimits] = useState(
    Object.keys(report.assessment.parameters || {})
      .sort()
      .map((platform) => ({
        platform,
        min_percent: 0,
        max_percent: 100,
        min_amount: 0,
        max_amount: null as number | null,
        enabled: true,
      })),
  );
  const [plan, setPlan] = useState<ProfitPlan | null>(null);
  const [savedPlans, setSavedPlans] = useState<CommerceMeta[]>([]);
  const [savedId, setSavedId] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  useEffect(() => {
    const controller = new AbortController();
    api<CommerceState>("/commerce", { signal: controller.signal })
      .then((value) =>
        setSavedPlans(
          value.profit_plan.filter((meta) =>
            meta.dependencies?.includes(report.manifest.id),
          ),
        ),
      )
      .catch((reason) => {
        if (!controller.signal.aborted) setError(message(reason));
      });
    return () => controller.abort();
  }, [report.manifest.id]);
  const changed = () => {
    setPlan(null);
    setSavedId("");
    setError("");
  };
  return (
    <section className="card commerce-profit-plan">
      <div className="card-heading">
        <h2>
          <Calculator size={18} /> Plan for contribution profit
        </h2>
        <span className="source-badge">Separate commerce method</span>
      </div>
      <p>
        A train-only fitted contribution response with assumed diminishing
        returns. It uses this reconciled store history, not the ad-revenue
        XGBoost model.
      </p>
      {!report.assessment.eligible ? (
        <>
          <Notice text="Not enough reliable data for a contribution-profit forecast." />
          <ul className="commerce-reasons">
            {report.assessment.reasons.map((reason) => (
              <li key={reason}>{reason}</li>
            ))}
          </ul>
          <button className="button secondary" disabled>
            Contribution-profit forecast unavailable
          </button>
        </>
      ) : (
        <>
          <Notice text="This commerce response passed its chronological operational checks. It is not a calibrated or causal business guarantee." />
          {!!savedPlans.length && (
            <div className="form-grid">
              <label>
                Saved contribution-profit plan
                <select
                  aria-label="Saved contribution-profit plan"
                  value={savedId}
                  disabled={busy}
                  onChange={(event) => {
                    setSavedId(event.target.value);
                    setPlan(null);
                    setError("");
                  }}
                >
                  <option value="">Choose a saved version</option>
                  {savedPlans.map((meta) => (
                    <option key={meta.id} value={meta.id}>
                      {meta.created_at.slice(0, 19)} · {meta.id.slice(0, 8)}
                    </option>
                  ))}
                </select>
              </label>
              <button
                className="button secondary"
                disabled={busy || !savedId}
                onClick={async () => {
                  setBusy(true);
                  setError("");
                  setPlan(null);
                  try {
                    const restored = await api<ProfitPlan>(
                      `/commerce/snapshots/${savedId}`,
                    );
                    setAmount(restored.config.budget);
                    setStart(restored.config.start_date);
                    setHorizon(restored.config.horizon_days);
                    setLimits((old) =>
                      old.map((row) => {
                        const saved = restored.config.platforms.find(
                          (entry) => entry.platform === row.platform,
                        );
                        return saved
                          ? {
                              ...row,
                              ...saved,
                              min_amount: saved.min_amount ?? 0,
                              max_amount: saved.max_amount ?? null,
                              enabled: true,
                            }
                          : { ...row, enabled: false };
                      }),
                    );
                    setPlan(restored);
                  } catch (reason) {
                    setError(message(reason));
                  } finally {
                    setBusy(false);
                  }
                }}
              >
                Restore saved profit plan
              </button>
            </div>
          )}
          <div className="form-grid">
            <label>
              Profit-plan budget (PKR)
              <input
                type="number"
                min="0.01"
                max="100000000"
                step="0.01"
                value={amount}
                placeholder="Enter your available amount"
                disabled={busy}
                onChange={(event) => {
                  setAmount(event.target.value);
                  changed();
                }}
              />
            </label>
            <label>
              Profit-plan start date
              <input
                type="date"
                value={start}
                disabled={busy}
                onChange={(event) => {
                  setStart(event.target.value);
                  changed();
                }}
              />
            </label>
            <label>
              Profit-plan horizon (days)
              <input
                type="number"
                min={1}
                max={30}
                value={horizon}
                disabled={busy}
                onChange={(event) => {
                  setHorizon(Number(event.target.value));
                  changed();
                }}
              />
            </label>
          </div>
          <details>
            <summary>
              Enabled platforms, share limits and actual account restrictions
            </summary>
            <div className="commerce-limits">
              {limits.map((limit, index) => (
                <div key={limit.platform} className="commerce-limit">
                  <label className="commerce-check">
                    <input
                      type="checkbox"
                      checked={limit.enabled}
                      disabled={busy}
                      onChange={(event) => {
                        setLimits((old) =>
                          old.map((row, i) =>
                            i === index
                              ? { ...row, enabled: event.target.checked }
                              : row,
                          ),
                        );
                        changed();
                      }}
                    />
                    {limit.platform}
                  </label>
                  {[
                    "min_percent",
                    "max_percent",
                    "min_amount",
                    "max_amount",
                  ].map((field) => (
                    <label key={field}>
                      {field === "min_percent"
                        ? "Minimum share (%)"
                        : field === "max_percent"
                          ? "Maximum share (%)"
                          : field === "min_amount"
                            ? "Minimum (PKR)"
                            : "Maximum (PKR), optional"}
                      <input
                        aria-label={`Commerce ${limit.platform} ${field}`}
                        type="number"
                        min={0}
                        max={field.includes("percent") ? 100 : 100000000}
                        step={field.includes("percent") ? 1 : "0.01"}
                        disabled={!limit.enabled || busy}
                        value={
                          (limit[field as keyof typeof limit] as
                            string | number) ?? ""
                        }
                        onChange={(event) => {
                          const value =
                            event.target.value === "" && field === "max_amount"
                              ? null
                              : Number(event.target.value);
                          setLimits((old) =>
                            old.map((row, i) =>
                              i === index ? { ...row, [field]: value } : row,
                            ),
                          );
                          changed();
                        }}
                      />
                    </label>
                  ))}
                </div>
              ))}
            </div>
          </details>
          {error && <Notice error text={error} />}
          <button
            className="button primary"
            disabled={
              busy ||
              !amount ||
              Number(amount) <= 0 ||
              !limits.some((row) => row.enabled)
            }
            onClick={async () => {
              setBusy(true);
              setError("");
              setPlan(null);
              try {
                const saved = await api<ProfitPlan>(
                  "/commerce/profit-plans",
                  json({
                    reconciliation_id: report.manifest.id,
                    budget: amount,
                    start_date: start,
                    horizon_days: horizon,
                    platforms: limits
                      .filter((row) => row.enabled)
                      .map((row) => ({
                        platform: row.platform,
                        min_percent: row.min_percent,
                        max_percent: row.max_percent,
                        min_amount: row.min_amount,
                        max_amount: row.max_amount,
                      })),
                  }),
                );
                setPlan(saved);
                setSavedId(saved.manifest.id);
                setSavedPlans((old) => [
                  saved.manifest,
                  ...old.filter((meta) => meta.id !== saved.manifest.id),
                ]);
              } catch (reason) {
                setError(message(reason));
              } finally {
                setBusy(false);
              }
            }}
          >
            {busy
              ? "Evaluating and planning…"
              : "Generate contribution-profit plan"}
          </button>
        </>
      )}
      {plan && (
        <div className="commerce-plan-result">
          <div className="commerce-plan-head">
            <span className="source-badge">
              {plan.manifest.is_synthetic
                ? "Simulated estimate"
                : "Advisory estimate"}
            </span>
            <h3>Your available budget, allocated exactly</h3>
            <strong
              className="live-metric-value"
              data-testid="commerce-plan-budget"
            >
              {money(plan.result.budget)}
            </strong>
            <p>
              Estimated contribution after ads:{" "}
              <strong data-testid="commerce-plan-profit">
                {money(plan.result.estimated_contribution_profit)}
              </strong>
            </p>
            <p>{plan.notice}</p>
            <div className="button-row">
              <a
                className="button primary"
                href={`/api/v1/commerce/snapshots/${plan.manifest.id}/export?format=csv`}
                download
              >
                Export profit allocation CSV
              </a>
              <a
                className="button secondary"
                href={`/api/v1/commerce/snapshots/${plan.manifest.id}/export`}
                download
              >
                Full profit-plan JSON
              </a>
            </div>
          </div>
          <RawTable
            label="Contribution-profit allocations in PKR"
            rows={plan.result.allocations.map((row) => ({ ...row }))}
          />
          <h3>Compare the same budget</h3>
          <div className="commerce-two">
            {plan.comparisons.map((item) => (
              <div className="commerce-comparison" key={item.name}>
                <strong>{item.name}</strong>
                <p>
                  Estimated contribution profit:{" "}
                  {money(item.estimated_contribution_profit)}
                </p>
                <p>Allocated budget: {money(item.budget)}</p>
              </div>
            ))}
          </div>
        </div>
      )}
      <details>
        <summary>Read contribution-response evaluation and limitations</summary>
        <p>
          Minimum history, complete cost categories, evidenced same-day matches,
          refund completeness and maturity are required.
          Train/validation/holdout dates stay separate. The fixed concave shape
          and future cost mix are assumptions; uncertainty is not quantified.
        </p>
        <pre
          className="commerce-diagnostics"
          tabIndex={0}
          aria-label="Commerce response diagnostics"
        >
          {JSON.stringify(report.assessment, null, 2)}
        </pre>
      </details>
    </section>
  );
}
