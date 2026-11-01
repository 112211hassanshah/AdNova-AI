"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import * as Dialog from "@radix-ui/react-dialog";
import {
  ArrowDownToLine,
  ArrowRight,
  ArrowUpRight,
  Calculator,
  ChevronRight,
  RefreshCw,
  ShieldCheck,
  SlidersHorizontal,
  X,
} from "lucide-react";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  api,
  json,
  message,
  money,
  number,
  platforms,
  sourceLabel,
  type Manifest,
} from "@/lib/data";
import type { OptimizerState, Plan, PlanConfig } from "@/lib/optimizer";
import { Loading, Notice, Provenance, RawTable } from "./data-primitives";

const today = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};

function validation(config: PlanConfig, state: OptimizerState) {
  const issues = [];
  if (
    !Number.isFinite(config.budget) ||
    config.budget < 0.01 ||
    config.budget > 100_000_000 ||
    Math.abs(config.budget * 100 - Math.round(config.budget * 100)) > 0.00001
  )
    issues.push(
      "Enter an available budget from Rs. 0.01 to Rs. 100,000,000, with at most two decimals.",
    );
  if (
    config.step !== null &&
    (!Number.isFinite(config.step) ||
      config.step < 0.01 ||
      config.step > 100_000_000)
  )
    issues.push(
      "Use a positive curve sampling interval or leave it automatic.",
    );
  if (!config.platforms.length) issues.push("Enable at least one platform.");
  if (
    config.platforms.some(
      (p) =>
        !Number.isInteger(p.min_percent) ||
        !Number.isInteger(p.max_percent) ||
        p.min_percent < 0 ||
        p.max_percent > 100 ||
        p.min_percent > p.max_percent,
    )
  )
    issues.push(
      "Use whole percentages from 0–100, with a maximum at least as large as the minimum.",
    );
  if (config.platforms.reduce((s, p) => s + p.min_percent, 0) > 100)
    issues.push("Minimum shares cannot total more than 100%.");
  if (config.platforms.reduce((s, p) => s + p.max_percent, 0) < 100)
    issues.push("Maximum shares must cover at least 100% of your budget.");
  const model = state.models.find((m) => m.id === config.model_id);
  if (config.method === "model" && !model?.eligible)
    issues.push(
      "Select an accepted model in ML Studio, or explicitly choose the historical-rule method.",
    );
  const boundary =
    config.method === "model" && model
      ? [model.as_of_date, model.test_end].sort().at(-1)!
      : config.as_of_date;
  if (!config.start_date || config.start_date <= boundary)
    issues.push(
      "Choose a start date after the label as-of date and model history.",
    );
  if (
    !Number.isInteger(config.horizon_days) ||
    config.horizon_days < 1 ||
    config.horizon_days > 30
  )
    issues.push("Choose a horizon of 1–30 days.");
  return issues;
}

export function BudgetOptimizer({ dataset }: { dataset: Manifest | null }) {
  const [state, setState] = useState<OptimizerState | null>(null);
  const [config, setConfig] = useState<PlanConfig | null>(null);
  const [plan, setPlan] = useState<Plan | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [loadError, setLoadError] = useState("");
  const [notice, setNotice] = useState("");
  const [retry, setRetry] = useState(0);
  const alive = useRef(true);
  const requestRef = useRef<AbortController | null>(null);
  useEffect(() => {
    alive.current = true;
    return () => {
      alive.current = false;
      requestRef.current?.abort();
    };
  }, []);
  useEffect(() => {
    if (!dataset) return;
    const controller = new AbortController();
    api<OptimizerState>("/optimizer", { signal: controller.signal })
      .then(async (next) => {
        if (next.dataset_id !== dataset.id)
          throw new Error(
            "The selected dataset changed. Refresh the workspace.",
          );
        setState(next);
        setLoadError("");
        if (next.plans.length) {
          const latest = await api<Plan>(
            `/optimizer/plans/${next.plans[0].id}`,
            {
              signal: controller.signal,
            },
          );
          if (!controller.signal.aborted) {
            setPlan(latest);
            setConfig(latest.config);
          }
          return;
        }
        setConfig(
          (previous) =>
            previous || {
              dataset_id: dataset.id,
              method: "auto",
              model_id: null,
              budget: 0,
              step: null,
              start_date: next.suggested_start,
              horizon_days: 7,
              as_of_date: today(),
              label_lag_days: dataset.is_synthetic ? 0 : 7,
              platforms: platforms
                .filter((p) => dataset.options.platform?.includes(p))
                .map((platform) => ({
                  platform,
                  min_percent: 0,
                  max_percent: 100,
                })),
            },
        );
      })
      .catch((reason) => {
        if (!controller.signal.aborted) setLoadError(message(reason));
      });
    return () => controller.abort();
  }, [dataset, retry]);
  if (!dataset)
    return (
      <section className="card ml-empty">
        <Calculator size={30} />
        <h2>Start with a campaign history.</h2>
        <p>
          Select daily or weekly campaign data, then train a model or choose a
          clearly labelled historical rule.
        </p>
        <Link href="/data-studio" className="button primary">
          Open Data Studio <ArrowRight size={17} />
        </Link>
      </section>
    );
  if (loadError)
    return (
      <section className="card">
        <Notice error text={loadError} />
        <button
          className="button secondary"
          onClick={() => setRetry((r) => r + 1)}
        >
          <RefreshCw size={16} /> Retry Budget Optimizer
        </button>
      </section>
    );
  if (!state || !config)
    return <Loading text="Loading budget planning options…" />;
  const issues = validation(config, state);
  const changed =
    !!plan && JSON.stringify(config) !== JSON.stringify(plan.config);
  const update = (change: Partial<PlanConfig>) => {
    setConfig({ ...config, ...change });
    setError("");
    setNotice("");
  };

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    if (!config || issues.length || busy) return;
    setBusy(true);
    setError("");
    setNotice("");
    const controller = new AbortController();
    requestRef.current = controller;
    try {
      const result = await api<Plan>("/optimizer/plans", {
        ...json(config),
        signal: controller.signal,
      });
      if (!alive.current) return;
      setPlan(result);
      setConfig(result.config);
      setNotice("Budget plan saved. No live ad budgets were changed.");
      const next = await api<OptimizerState>("/optimizer", {
        signal: controller.signal,
      });
      if (alive.current) setState(next);
    } catch (reason) {
      if (alive.current && !controller.signal.aborted)
        setError(message(reason));
    } finally {
      if (alive.current) setBusy(false);
    }
  }
  async function openSaved(id: string) {
    if (!id || busy) return;
    setBusy(true);
    setError("");
    setNotice("");
    const controller = new AbortController();
    requestRef.current = controller;
    try {
      const result = await api<Plan>(`/optimizer/plans/${id}`, {
        signal: controller.signal,
      });
      if (alive.current) {
        setPlan(result);
        setConfig(result.config);
        setNotice("Loaded the saved plan and its original assumptions.");
      }
    } catch (reason) {
      if (alive.current && !controller.signal.aborted)
        setError(message(reason));
    } finally {
      if (alive.current) setBusy(false);
    }
  }
  return (
    <div className="budget-workspace">
      <div className="budget-intro">
        <ShieldCheck size={19} />
        <p>
          Plan, compare, then review.{" "}
          <strong>Recommendations only; no ad budgets are changed.</strong>
        </p>
      </div>
      {notice && <Notice text={notice} />}
      {error && <Notice error text={error} />}
      <div className="budget-layout">
        <section className="card budget-form-card">
          <div className="card-heading">
            <h2>
              <SlidersHorizontal size={20} /> Build your budget plan
            </h2>
            <span className="source-badge">PKR</span>
          </div>
          <p className="section-copy">
            Choose a total, a planning period and limits. The service also
            checks what your history can support.
          </p>
          <form onSubmit={submit} className="budget-form">
            <fieldset disabled={busy}>
              <label className="budget-amount">
                Total budget (PKR)
                <input
                  type="number"
                  min={0.01}
                  max={100000000}
                  step={0.01}
                  required
                  value={config.budget || ""}
                  placeholder="Enter your available budget"
                  onChange={(e) => update({ budget: Number(e.target.value) })}
                />
              </label>
              <p className="form-hint">
                {dataset.date_granularity === "weekly"
                  ? "Weekly history: choose 7, 14, 21 or 28 days. Each week remains one observation."
                  : "Daily history: choose a horizon of 1–30 days."}{" "}
                Budget amounts do not need to match the curve sampling interval.
              </p>
              <div className="form-grid">
                <label>
                  Start date
                  <input
                    type="date"
                    required
                    value={config.start_date}
                    onChange={(e) => update({ start_date: e.target.value })}
                  />
                </label>
                <label>
                  Planning horizon (days)
                  <input
                    type="number"
                    required
                    min={1}
                    max={30}
                    value={config.horizon_days}
                    onChange={(e) =>
                      update({ horizon_days: Number(e.target.value) })
                    }
                  />
                </label>
                <details className="sampling-help">
                  <summary>Advanced: curve sampling</summary>
                  <p className="form-hint">
                    Leave this automatic unless you need to inspect a different
                    curve resolution. It does not set your budget or the final
                    allocation precision.
                  </p>
                  <label>
                    Curve sampling interval (PKR, optional)
                    <input
                      type="number"
                      min={0.01}
                      max={100000000}
                      step={0.01}
                      placeholder="Automatic · up to 200 intervals"
                      value={config.step ?? ""}
                      onChange={(e) =>
                        update({
                          step: e.target.value ? Number(e.target.value) : null,
                        })
                      }
                    />
                  </label>
                </details>
                <label>
                  Objective
                  <input
                    value="Allocate budget · forecast when supported"
                    readOnly
                  />
                </label>
              </div>
              <label>
                Planning method
                <select
                  aria-label="Planning method"
                  value={config.method}
                  onChange={(e) =>
                    update({
                      method: e.target.value as PlanConfig["method"],
                      model_id:
                        e.target.value === "model"
                          ? state.models.find((m) => m.eligible)?.id || null
                          : null,
                    })
                  }
                >
                  <option value="auto">
                    Automatic · model, screened baseline, or allocation only
                  </option>
                  <option value="baseline">
                    Evaluate statistical baseline
                  </option>
                  <option value="evidence">
                    Allocation only · no revenue forecast
                  </option>
                  <option value="model">
                    Accepted ML model + adjusted curves
                  </option>
                  <option value="historical">
                    Historical baseline · evaluate first (no ML)
                  </option>
                </select>
              </label>
              {config.method === "model" ? (
                <>
                  <label>
                    Saved revenue model
                    <select
                      value={config.model_id || ""}
                      onChange={(e) =>
                        update({ model_id: e.target.value || null })
                      }
                    >
                      <option value="">Choose an accepted model</option>
                      {state.models.map((m) => (
                        <option key={m.id} value={m.id} disabled={!m.eligible}>
                          {m.algorithm} · {m.id.slice(0, 8)} ·{" "}
                          {m.eligible ? "passed checks" : "failed checks"}
                        </option>
                      ))}
                    </select>
                  </label>
                  <p className="form-hint">
                    The model’s saved as-of date and maturity controls apply.{" "}
                    <Link className="text-link" href="/ml-studio">
                      Review model checks <ChevronRight size={14} />
                    </Link>
                  </p>
                </>
              ) : (
                <>
                  <p className="budget-method-note">
                    {config.method === "auto"
                      ? "We use an accepted model when supported, then screen a statistical baseline. Otherwise you still receive an allocation with revenue withheld."
                      : config.method === "evidence"
                        ? "Plan your budget using historical priorities and your limits. Revenue and ROAS will be unavailable."
                        : "Baseline errors and scenario support are checked separately from budget feasibility. Revenue is withheld if the baseline fails its own checks."}
                  </p>
                  <div className="form-grid">
                    <label>
                      Label as-of date
                      <input
                        type="date"
                        required
                        value={config.as_of_date}
                        onChange={(e) => update({ as_of_date: e.target.value })}
                      />
                    </label>
                    {!dataset.is_synthetic && (
                      <label>
                        Label maturity lag (days)
                        <input
                          type="number"
                          min={0}
                          max={90}
                          value={config.label_lag_days}
                          onChange={(e) =>
                            update({ label_lag_days: Number(e.target.value) })
                          }
                        />
                      </label>
                    )}
                  </div>
                </>
              )}
              <div className="budget-platform-heading">
                <h3>Platforms & share limits</h3>
                <span>Min / Max %</span>
              </div>
              <p className="form-hint" id="budget-limits-help">
                A zero minimum allows a platform to receive no budget. Set
                actual account or platform restrictions below. Historical spend
                affects forecast support, not your available budget.
              </p>
              <div
                className="budget-platforms"
                aria-describedby="budget-limits-help"
              >
                {platforms.map((platform) => {
                  const limit = config.platforms.find(
                    (p) => p.platform === platform,
                  );
                  const available =
                    dataset.options.platform?.includes(platform);
                  const changeLimit = (change: Partial<typeof limit>) =>
                    update({
                      platforms: config.platforms.map((p) =>
                        p.platform === platform ? { ...p, ...change } : p,
                      ),
                    });
                  return (
                    <div
                      className={`budget-platform ${limit ? "enabled" : ""}`}
                      key={platform}
                    >
                      <label className="budget-platform-toggle">
                        <input
                          type="checkbox"
                          checked={!!limit}
                          disabled={!available}
                          onChange={(e) =>
                            update({
                              platforms: e.target.checked
                                ? [
                                    ...config.platforms,
                                    {
                                      platform,
                                      min_percent: 0,
                                      max_percent: 100,
                                    },
                                  ]
                                : config.platforms.filter(
                                    (p) => p.platform !== platform,
                                  ),
                            })
                          }
                        />
                        {platform}
                        {!available && (
                          <span className="muted"> · no data</span>
                        )}
                      </label>
                      <label>
                        <span className="sr-only">
                          {platform} minimum share (%)
                        </span>
                        <input
                          aria-label={`${platform} minimum share (%)`}
                          type="number"
                          min={0}
                          max={100}
                          required
                          disabled={!limit}
                          value={limit?.min_percent ?? 0}
                          onChange={(e) =>
                            changeLimit({ min_percent: Number(e.target.value) })
                          }
                        />
                      </label>
                      <label>
                        <span className="sr-only">
                          {platform} maximum share (%)
                        </span>
                        <input
                          aria-label={`${platform} maximum share (%)`}
                          type="number"
                          min={0}
                          max={100}
                          required
                          disabled={!limit}
                          value={limit?.max_percent ?? 0}
                          onChange={(e) =>
                            changeLimit({ max_percent: Number(e.target.value) })
                          }
                        />
                      </label>
                    </div>
                  );
                })}
              </div>
            </fieldset>
            <details className="optional-mapping">
              <summary>Actual platform minimums and maximums (PKR)</summary>
              <p className="form-hint">
                Enter restrictions you know apply to this campaign. No provider
                restrictions are assumed.
              </p>
              {config.platforms.map((p) => (
                <div className="form-grid" key={p.platform}>
                  <label>
                    {p.platform} minimum (PKR)
                    <input
                      type="number"
                      min={0}
                      step="0.01"
                      value={p.min_amount ?? 0}
                      onChange={(e) =>
                        update({
                          platforms: config.platforms.map((x) =>
                            x.platform === p.platform
                              ? { ...x, min_amount: Number(e.target.value) }
                              : x,
                          ),
                        })
                      }
                    />
                  </label>
                  <label>
                    {p.platform} maximum (PKR)
                    <input
                      type="number"
                      min={0}
                      step="0.01"
                      placeholder="No amount cap"
                      value={p.max_amount ?? ""}
                      onChange={(e) =>
                        update({
                          platforms: config.platforms.map((x) =>
                            x.platform === p.platform
                              ? {
                                  ...x,
                                  max_amount: e.target.value
                                    ? Number(e.target.value)
                                    : null,
                                }
                              : x,
                          ),
                        })
                      }
                    />
                  </label>
                </div>
              ))}
            </details>
            {!!issues.length && (
              <div
                className="budget-validation"
                id="budget-validation"
                role="status"
              >
                <ul>
                  {issues.map((issue) => (
                    <li key={issue}>{issue}</li>
                  ))}
                </ul>
              </div>
            )}
            <button
              className="button primary budget-submit"
              disabled={busy || !!issues.length}
              aria-describedby={
                issues.length ? "budget-validation" : "budget-limits-help"
              }
              type="submit"
            >
              <Calculator size={18} />
              {busy ? "Calculating supported plan…" : "Generate recommendation"}
            </button>
            {busy && (
              <Loading text="Checking support, scoring curves and saving the plan…" />
            )}
          </form>
        </section>
        <div className="budget-result-column">
          {plan && !changed ? (
            <PlanResult plan={plan} changed={false} />
          ) : (
            <section className="card spotlight lime budget-first-plan">
              <span className="eyebrow">YOUR NEXT ALLOCATION</span>
              <h2>A plan for every rupee.</h2>
              <p>
                Enter the amount you can spend. Compare an allocation with
                equal-share and historical-spend alternatives under the same
                limits.
              </p>
              <ol>
                <li>Set your budget and period.</li>
                <li>Choose a method and platform limits.</li>
                <li>Inspect estimates, support and assumptions.</li>
              </ol>
              <div className="budget-trust-line">
                <ShieldCheck size={19} />
                <span>
                  {sourceLabel(dataset)} · estimates appear only after
                  calculation.
                </span>
              </div>
            </section>
          )}
          <section className="card budget-history">
            <div className="card-heading">
              <h2>Saved plans</h2>
              <span className="source-badge">{state.plans.length}</span>
            </div>
            {state.plans.length ? (
              <>
                <label>
                  Open a saved plan
                  <select
                    disabled={busy}
                    value={plan?.id || ""}
                    onChange={(e) => void openSaved(e.target.value)}
                  >
                    <option value="">Choose a plan</option>
                    {state.plans.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.config.start_date} · {money(p.config.budget)} ·{" "}
                        {p.config.method === "model"
                          ? "ML curves"
                          : p.config.method === "auto"
                            ? "Automatic"
                            : p.config.method === "evidence"
                              ? "Allocation only"
                              : "Baseline"}{" "}
                        · {p.id.slice(0, 6)}
                      </option>
                    ))}
                  </select>
                </label>
                <p className="form-hint">
                  Latest 50 plans for this dataset. Loading restores the saved
                  inputs; generating saves a new version.
                </p>
              </>
            ) : (
              <p className="section-copy">
                Your calculated plans will be saved here. Existing reports and
                models stay intact.
              </p>
            )}
          </section>
        </div>
      </div>
      {changed && (
        <Notice text="Inputs changed. Generate recommendation to calculate this budget; previous estimates are hidden." />
      )}
      {plan && !changed && <PlanDetails plan={plan} />}
    </div>
  );
}

function PlanResult({ plan, changed }: { plan: Plan; changed: boolean }) {
  return (
    <section
      className="card spotlight lime budget-result"
      aria-label="Saved budget recommendation"
    >
      <div className="card-heading">
        <span className="source-badge">
          {plan.forecast_status === "unavailable"
            ? plan.is_synthetic
              ? "Synthetic data · allocation only"
              : "Allocation only"
            : plan.is_synthetic
              ? "Synthetic estimate"
              : "Advisory estimate"}
        </span>
        <span className="budget-plan-id">Plan {plan.id.slice(0, 8)}</span>
      </div>
      <h2>Your next budget, allocated.</h2>
      <p>
        {plan.config.start_date} to {plan.planning_end} · {plan.method_label}
      </p>
      {changed && (
        <p className="budget-stale" role="status">
          Inputs changed. These results belong to the saved plan below. Generate
          again to calculate your changes.
        </p>
      )}
      <div className="budget-total">
        <span>Total planned spend</span>
        <strong data-testid="plan-budget">{money(plan.totals.budget)}</strong>
        <span>100% allocated · exact to Rs. 0.01</span>
      </div>
      <div className="budget-allocation-list">
        {plan.allocations.map((row, index) => (
          <div key={row.platform} className="budget-allocation">
            <span className="budget-rank">{index + 1}</span>
            <div>
              <strong>{row.platform}</strong>
              <span>{number(row.share_percent, 2)}% of total budget</span>
            </div>
            <strong>{money(row.budget)}</strong>
          </div>
        ))}
      </div>
      <div className="budget-estimates">
        <div>
          <span>Adjusted estimated revenue</span>
          <strong>{money(plan.totals.estimated_revenue)}</strong>
        </div>
        <div>
          <span>Estimated ROAS</span>
          <strong>
            {plan.totals.estimated_roas === null
              ? "Not available"
              : `${number(plan.totals.estimated_roas, 2)}×`}
          </strong>
        </div>
      </div>
      {plan.forecast_status === "unavailable" && (
        <p role="status">
          <strong>Allocation only · revenue forecast unavailable.</strong>
        </p>
      )}
      {!!plan.forecast_reasons?.length && (
        <ul className="warning-list">
          {plan.forecast_reasons.map((reason) => (
            <li key={reason}>{reason}</li>
          ))}
        </ul>
      )}
      <p className="budget-caveat">
        {plan.notice}.{" "}
        {plan.forecast_status !== "unavailable" &&
          "Uncertainty is not quantified. This estimates attributed revenue, not profit."}
      </p>
      <details className="plan-reading-guide">
        <summary>How should I use this plan?</summary>
        <p>
          {plan.forecast_status === "unavailable"
            ? "This is a historical priority allocation under your limits, not a prediction of which platform will earn more. No supported revenue or ROAS forecast is available."
            : "Estimated revenue depends on historical attribution, a fixed campaign mix and assumed response curves. A higher estimate does not prove that moving spend will cause more sales."}
        </p>
        <p>
          Shares need not be equal. Zero allocations are allowed; platform-name
          order resolves exact ties. Review the reasons and your actual account
          limits before making any decision. No live budgets are changed.
        </p>
        <Link className="text-link" href="/help#no-data">
          Data readiness and fairness limits <ArrowUpRight size={15} />
        </Link>
      </details>
      <div className="budget-exports">
        <a
          className="button primary"
          href={`/api/v1/optimizer/plans/${plan.id}/export?format=csv`}
          download
        >
          <ArrowDownToLine size={17} /> Export CSV
        </a>
        <a
          className="button secondary"
          href={`/api/v1/optimizer/plans/${plan.id}/export?format=json`}
          download
        >
          Full JSON report
        </a>
      </div>
    </section>
  );
}

function PlanDetails({ plan }: { plan: Plan }) {
  return (
    <div className="budget-details">
      {plan.comparisons.length > 0 && (
        <section className="card budget-comparisons">
          <div className="card-heading">
            <h2>Compare the same budget</h2>
            <span className="source-badge">Estimated · PKR</span>
          </div>
          <p className="section-copy">
            All options use {money(plan.config.budget)}, the same horizon,
            effective limits and adjusted curves. Equal and historical shares
            are moved to the nearest feasible grid allocation.
          </p>
          <div className="budget-comparison-grid">
            {plan.comparisons.map((row) => (
              <div key={row.name}>
                <h3>{row.name}</h3>
                <strong>{money(row.estimated_revenue)}</strong>
                <span>Adjusted estimated revenue</span>
                <p>
                  Plan difference: <b>{money(row.estimated_difference)}</b>
                </p>
                <details>
                  <summary>View comparison allocation</summary>
                  <ul>
                    {row.allocations.map((a) => (
                      <li key={a.platform}>
                        {a.platform}: {money(a.budget)}
                      </li>
                    ))}
                  </ul>
                </details>
              </div>
            ))}
          </div>
          <p className="form-hint">
            These differences are calculated estimates, not measured increases
            in sales. Allocation rank reflects budget size, not proven platform
            quality.
          </p>
        </section>
      )}
      <section className="card budget-support">
        <div className="card-heading">
          <h2>Why these allocations?</h2>
          <MethodDrawer plan={plan} />
        </div>
        <p className="section-copy">
          User constraints determine feasibility. Forecast support is assessed
          separately; unsupported scenarios still allow allocation without
          revenue estimates.
        </p>
        <div className="budget-reasons">
          {plan.allocations.map((row) => (
            <article key={row.platform}>
              <div>
                <h3>{row.platform}</h3>
                <strong>{money(row.budget)}</strong>
              </div>
              <p>{row.reason}</p>
              <dl>
                <div>
                  <dt>Effective range</dt>
                  <dd>
                    {money(row.effective_min)} – {money(row.effective_max)}
                  </dd>
                </div>
                <div>
                  <dt>Requested shares</dt>
                  <dd>
                    {row.requested_min_percent}% – {row.requested_max_percent}%
                  </dd>
                </div>
                <div>
                  <dt>
                    Next up to{" "}
                    {money(plan.curve_sample_step ?? plan.config.step)}
                  </dt>
                  <dd>
                    {row.next_step_revenue === null
                      ? plan.forecast_status === "unavailable"
                        ? "Revenue unavailable"
                        : "At cap"
                      : `${money(row.next_step_revenue)} estimated revenue`}
                  </dd>
                </div>
              </dl>
            </article>
          ))}
        </div>
      </section>
      <ResponseCurves plan={plan} />
      <section className="card">
        <h2>Source & planning context</h2>
        <p className="section-copy">
          {plan.dataset.name} · {sourceLabel(plan.dataset)} · PKR · reference
          history {plan.training_period.start} to {plan.training_period.end}.
          Planning inputs are separate from Overview’s analytics filters.
        </p>
        <Provenance dataset={plan.dataset} />
      </section>
    </div>
  );
}

function MethodDrawer({ plan }: { plan: Plan }) {
  const cents = [
    "campaign-period-cent-plan-v2",
    "planning-evidence-v3",
  ].includes(plan.policy);
  return (
    <Dialog.Root>
      <Dialog.Trigger className="button secondary">
        <ShieldCheck size={16} /> How we calculated this
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="drawer-overlay" />
        <Dialog.Content className="budget-method-drawer">
          <Dialog.Close
            className="icon-button drawer-close"
            aria-label="Close methodology"
          >
            <X size={20} />
          </Dialog.Close>
          <Dialog.Title>Assumptions & methodology</Dialog.Title>
          <Dialog.Description>
            Inspect the source, campaign-period mapping and response assumptions
            behind this saved plan.
          </Dialog.Description>
          <dl className="metadata-grid">
            <div>
              <dt>Method</dt>
              <dd>{plan.method_label}</dd>
            </div>
            <div>
              <dt>Model version</dt>
              <dd>{plan.model_id || "No ML model"}</dd>
            </div>
            <div>
              <dt>Planning period</dt>
              <dd>
                {plan.config.start_date} to {plan.planning_end}
              </dd>
            </div>
            <div>
              <dt>Label as-of / lag</dt>
              <dd>
                {plan.training_controls.as_of_date} /{" "}
                {plan.training_controls.label_lag_days} days
              </dd>
            </div>
            <div>
              <dt>Revenue source</dt>
              <dd>{plan.dataset.revenue_source.replaceAll("_", " ")}</dd>
            </div>
            <div>
              <dt>Uncertainty</dt>
              <dd>{plan.uncertainty}</dd>
            </div>
          </dl>
          <h3>From a platform budget to period predictions</h3>
          <p>
            For each platform, use the reference date closest to its median
            period spend. Model plans use training history; current historical
            plans use all mature records. Retain every campaign/segment row on
            that date. Divide the platform budget equally across the horizon,
            then distribute each period’s spend using that representative
            period’s spend proportions. Targeting stays fixed; calendar dates
            advance.
          </p>
          {plan.forecast_status === "unavailable" && (
            <p>
              Revenue was withheld. Allocation used historical priorities and
              diminishing-utility assumptions, not a predicted revenue
              objective. No causal or statistical confidence is claimed.
            </p>
          )}
          <h3>From raw estimates to planning curves</h3>
          <p>
            {plan.forecast_status === "unavailable"
              ? "No revenue response curve was published for this allocation."
              : plan.model_id
                ? "The saved model scores every supported candidate budget. A constrained curve fit selects nonnegative, nondecreasing values with diminishing marginal returns, never above the sampled raw estimates."
                : "A smoothed revenue/spend rate from the recorded reference history and the representative budget define an assumed saturation curve: R(b) = 2 × rate × b / (1 + b/reference budget). This is a heuristic, not a learned response."}{" "}
            Raw and adjusted values are retained in the chart, table and JSON.
          </p>
          <h3>Allocation and comparisons</h3>
          <p>
            {plan.forecast_status === "unavailable"
              ? "User floors/caps are applied to exact paisa amounts. Historical priorities and assumed diminishing utility guide the allocation; this is not revenue optimization."
              : cents
                ? "Round floors up and caps down to Rs. 0.01. Allocate along sampled segments by marginal revenue. Estimates between samples use linear interpolation; allocation totals are exact to the paisa. This maximizes the separable interpolated objective for these enabled platforms."
                : "This saved v1 plan rounded floors/caps to its configured PKR step, then assigned whole steps by marginal revenue on that discrete grid."}{" "}
            Neither policy establishes the best real-world budget.
          </p>
          <h3>Context evidence</h3>
          <ul className="warning-list">
            {plan.contexts.map((c) => (
              <li key={c.platform}>
                {c.platform}: {c.campaign_segment_rows_per_day} campaign/segment
                rows per reporting period, from {c.representative_date}; row
                spend support {money(c.campaign_day_spend_min)}–
                {money(c.campaign_day_spend_max)}.
              </li>
            ))}
          </ul>
          <h3>Limits to keep in mind</h3>
          <ul className="warning-list">
            {plan.limitations.map((l) => (
              <li key={l}>{l}</li>
            ))}
          </ul>
          <p className="form-hint">
            Policy {plan.policy} · {number(plan.prediction_rows)} model-scored
            rows · source checksum {plan.source_sha256}
          </p>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

function ResponseCurves({ plan }: { plan: Plan }) {
  const [platform, setPlatform] = useState(plan.curves[0]?.platform || "");
  const curve =
    plan.curves.find((c) => c.platform === platform) || plan.curves[0];
  if (!curve) return null;
  return (
    <section className="card budget-curves">
      <div className="card-heading">
        <h2>See the response assumption</h2>
        <label>
          <span className="sr-only">Response curve platform</span>
          <select
            aria-label="Response curve platform"
            value={curve.platform}
            onChange={(e) => setPlatform(e.target.value)}
          >
            {plan.curves.map((c) => (
              <option key={c.platform}>{c.platform}</option>
            ))}
          </select>
        </label>
      </div>
      <p className="section-copy">
        {curve.platform} · {plan.config.horizon_days} days · PKR. Solid lime:
        adjusted estimate used for allocation. Dashed charcoal: raw{" "}
        {plan.model_id ? "model" : "heuristic"} estimate. Diminishing returns
        are imposed assumptions; the curve is not a confidence interval.
      </p>
      <div
        className="budget-curve-chart"
        role="img"
        aria-label={`${curve.platform} raw and adjusted estimated revenue against supported platform budget. Exact values in the table below.`}
      >
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={curve.points}
            margin={{ top: 15, right: 12, bottom: 25, left: 8 }}
          >
            <CartesianGrid
              strokeDasharray="3 5"
              vertical={false}
              stroke="#e4e6df"
            />
            <XAxis
              dataKey="budget"
              type="number"
              domain={["dataMin", "dataMax"]}
              tickFormatter={(v) => `${number(v / 1000)}k`}
              label={{
                value: "Platform budget (PKR)",
                position: "insideBottom",
                offset: -18,
              }}
              tick={{ fontSize: 11 }}
            />
            <YAxis
              tickFormatter={(v) => `${number(v / 1000)}k`}
              width={65}
              tick={{ fontSize: 11 }}
            />
            <Tooltip
              formatter={(value, name) => [money(Number(value)), name]}
              labelFormatter={(value) => `Budget: ${money(Number(value))}`}
            />
            <Line
              dataKey="raw_revenue"
              name="Raw estimated revenue"
              stroke="#4b514c"
              strokeWidth={2}
              strokeDasharray="5 5"
              dot={false}
              isAnimationActive={false}
            />
            <Line
              dataKey="adjusted_revenue"
              name="Adjusted estimated revenue"
              stroke="#577715"
              strokeWidth={3}
              dot={false}
              isAnimationActive={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
      <details>
        <summary>View response curve values</summary>
        <RawTable
          label={`${curve.platform} response curve values in PKR`}
          rows={curve.points.map((p) => ({
            budget_pkr: p.budget,
            raw_estimated_revenue_pkr: p.raw_revenue,
            adjusted_estimated_revenue_pkr: p.adjusted_revenue,
          }))}
        />
      </details>
    </section>
  );
}
