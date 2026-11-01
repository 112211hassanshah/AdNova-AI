"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowDownToLine,
  ArrowRight,
  BrainCircuit,
  Play,
  RefreshCw,
  ShieldCheck,
  Square,
} from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
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
  sourceLabel,
  type Manifest,
} from "@/lib/data";
import {
  finished,
  type MLState,
  type ModelJob,
  type ModelResult,
  type Readiness,
} from "@/lib/ml";
import { Loading, Notice, Provenance, RawTable } from "./data-primitives";
import { SavedReportingSetup } from "./reporting-questions";

const localToday = () => {
  const date = new Date();
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
};
export function MLStudio({
  dataset,
  refreshWorkspace,
}: {
  dataset: Manifest | null;
  refreshWorkspace: () => Promise<void>;
}) {
  const [state, setState] = useState<MLState | null>(null);
  const [job, setJob] = useState<ModelJob | null>(null);
  const [ready, setReady] = useState<Readiness | null>(null);
  const [seed, setSeed] = useState(42);
  const [asOf, setAsOf] = useState(localToday);
  const [lag, setLag] = useState(7);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [retry, setRetry] = useState(0);
  const config = {
    dataset_id: dataset?.id,
    seed,
    as_of_date: asOf,
    label_lag_days: lag,
  };
  const reload = useCallback(async () => {
    const next = await api<MLState>("/ml");
    setState(next);
    return next;
  }, []);
  useEffect(() => {
    const controller = new AbortController();
    api<MLState>("/ml", { signal: controller.signal })
      .then((next) => {
        setState(next);
        setJob(
          next.jobs.find((j) => !finished(j.status)) || next.jobs[0] || null,
        );
        setError("");
      })
      .catch((reason) => {
        if (!controller.signal.aborted) setError(message(reason));
      });
    return () => controller.abort();
  }, [retry]);
  useEffect(() => {
    if (!dataset) return;
    const controller = new AbortController();
    api<Readiness>("/ml/readiness", {
      ...json({
        dataset_id: dataset.id,
        seed,
        as_of_date: asOf,
        label_lag_days: lag,
      }),
      signal: controller.signal,
    })
      .then(setReady)
      .catch((reason) => {
        if (!controller.signal.aborted) setError(message(reason));
      });
    return () => controller.abort();
  }, [dataset, seed, asOf, lag, retry]);
  const jobId = job?.id;
  const active = !!job && !finished(job.status);
  const backgroundId = state?.active_job?.id;
  useEffect(() => {
    if (!backgroundId || backgroundId === jobId) return;
    let stopped = false;
    let timer: ReturnType<typeof setTimeout>;
    async function pollBackground() {
      try {
        const next = await reload();
        if (!next.active_job) await refreshWorkspace();
        else if (!stopped) timer = setTimeout(pollBackground, 1500);
      } catch (reason) {
        if (!stopped) {
          setError(message(reason));
          timer = setTimeout(pollBackground, 3000);
        }
      }
    }
    timer = setTimeout(pollBackground, 1000);
    return () => {
      stopped = true;
      clearTimeout(timer);
    };
  }, [backgroundId, jobId, reload, refreshWorkspace]);
  useEffect(() => {
    if (!jobId || !active) return;
    const controller = new AbortController();
    let timer: ReturnType<typeof setTimeout>;
    async function poll() {
      try {
        const next = await api<ModelJob>(`/ml/jobs/${jobId}`, {
          signal: controller.signal,
        });
        setJob(next);
        setError("");
        if (finished(next.status)) {
          await reload();
          await refreshWorkspace();
        } else timer = setTimeout(poll, 1000);
      } catch (reason) {
        if (!controller.signal.aborted) {
          setError(message(reason));
          timer = setTimeout(poll, 3000);
        }
      }
    }
    timer = setTimeout(poll, 300);
    return () => {
      controller.abort();
      clearTimeout(timer);
    };
  }, [jobId, active, reload, refreshWorkspace]);
  if (!dataset)
    return (
      <section className="card ml-empty">
        <BrainCircuit size={30} />
        <h2>Give your model a history to learn from.</h2>
        <p>
          Select or generate campaign data first. ML Studio uses one dataset at
          a time.
        </p>
        <Link className="button primary" href="/data-studio">
          Open Data Studio <ArrowRight size={17} />
        </Link>
      </section>
    );
  async function start(event: React.FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError("");
    setNotice("");
    try {
      setJob(await api<ModelJob>("/ml/jobs", json(config)));
      await reload();
    } catch (reason) {
      setError(message(reason));
    } finally {
      setBusy(false);
    }
  }
  async function cancel() {
    if (!job) return;
    setBusy(true);
    try {
      setJob(await api<ModelJob>(`/ml/jobs/${job.id}/cancel`, json({})));
    } catch (reason) {
      setError(message(reason));
    } finally {
      setBusy(false);
    }
  }
  async function evaluate() {
    if (!job) return;
    setBusy(true);
    setNotice("");
    setError("");
    try {
      const result = await api<{ notice: string }>(
        `/ml/models/${job.id}/evaluate`,
        json({}),
      );
      setNotice(result.notice);
    } catch (reason) {
      setError(message(reason));
    } finally {
      setBusy(false);
    }
  }
  const running = active || !!state?.active_job;
  return (
    <div className="ml-studio">
      <div className="ml-intro">
        <div>
          <span className="eyebrow">REVENUE MODELLING</span>
          <h2>Learn. Measure. Then decide.</h2>
          <p>
            Compare a trained model with historical revenue per rupee before
            trusting a forecast.
          </p>
        </div>
        <span className="source-badge">{sourceLabel(dataset)} · PKR</span>
      </div>
      {error && (
        <>
          <Notice error text={error} />
          <button
            className="button secondary"
            onClick={() => setRetry((r) => r + 1)}
          >
            <RefreshCw size={16} /> Retry ML Studio
          </button>
        </>
      )}
      {notice && <Notice text={notice} />}
      {dataset.parent_dataset_id && (
        <Notice text="Your reporting answers are saved with this version of the report. Check training readiness below." />
      )}
      {ready?.reporting_setup?.needs_answers &&
        !ready.reporting_setup.mixed && (
          <SavedReportingSetup
            dataset={dataset}
            setup={ready.reporting_setup}
            onSaved={refreshWorkspace}
          />
        )}
      <div className="ml-setup-grid">
        <section className="card">
          <div className="card-heading">
            <h2>
              <BrainCircuit size={19} /> Train a revenue model
            </h2>
            <span className="source-badge">Local CPU</span>
          </div>
          <p className="section-copy">
            {dataset.name} · {number(dataset.rows)} rows
            <br />
            {dataset.date_start} to {dataset.date_end} ·{" "}
            {dataset.revenue_source.replaceAll("_", " ")}
          </p>
          <form onSubmit={start} className="ml-form">
            <div className="form-grid">
              <label>
                Random seed
                <input
                  type="number"
                  min="0"
                  max="4294967295"
                  required
                  value={seed}
                  onChange={(e) => setSeed(Number(e.target.value))}
                />
              </label>
              <label>
                Labels known as of
                <input
                  type="date"
                  required
                  value={asOf}
                  onChange={(e) => setAsOf(e.target.value)}
                />
              </label>
              {!dataset.is_synthetic && (
                <label>
                  Label maturity lag (days)
                  <input
                    type="number"
                    min="0"
                    max="90"
                    required
                    value={lag}
                    onChange={(e) => setLag(Number(e.target.value))}
                  />
                  <small>
                    Choose the reporting delay needed for your attribution
                    window. This does not verify final labels.
                  </small>
                </label>
              )}
            </div>
            {dataset.is_synthetic && (
              <p className="availability-note">
                Synthetic labels use zero maturity lag. Training learns the
                simulator, which does not establish real-business accuracy.
              </p>
            )}
            {!ready ? (
              <Loading text="Checking training readiness…" />
            ) : ready.ready ? (
              <p className="ml-readiness">
                <ShieldCheck size={17} />{" "}
                {number(ready.coverage?.eligible_rows ?? 0)} mature rows ready
                for chronological evaluation.
              </p>
            ) : ready.reporting_setup?.mixed ? (
              <Notice
                error
                text="This report combines different rules for counting results. Use a separate report for each rule before training."
              />
            ) : ready.reporting_setup?.needs_answers &&
              !ready.reporting_setup.mixed ? (
              ready.reporting_setup.financial_complete ? (
                <p className="section-copy">
                  Answer the two report questions above to check training
                  readiness. You can explore analytics while you’re unsure.
                </p>
              ) : (
                <Notice error text={ready.reasons.join(" ")} />
              )
            ) : (
              <Notice error text={ready.reasons.join(" ")} />
            )}
            <button
              className="button primary"
              disabled={busy || running || !ready?.ready}
            >
              <Play size={16} />
              {busy ? "Starting…" : "Train revenue model"}
            </button>
            {running && !active && (
              <p role="status">
                Another local model run is active. Wait for it to finish.
              </p>
            )}
          </form>
        </section>
        <section className="card dark-card ml-explainer">
          <span className="eyebrow">HOW IT LEARNS</span>
          <h2>
            Tomorrow stays out
            <br />
            of today’s training.
          </h2>
          <p>
            Earlier dates teach the model. Later dates check whether it learned
            something useful.
          </p>
          <ol>
            <li>
              <strong>60% · Train</strong>
              <span>Fit features, baseline and model.</span>
            </li>
            <li>
              <strong>20% · Validate</strong>
              <span>Select from two fixed XGBoost settings.</span>
            </li>
            <li>
              <strong>20% · Test</strong>
              <span>Measure the selected model on untouched dates.</span>
            </li>
          </ol>
          <p className="card-caption">
            Complete reporting periods stay together. Same-period outcomes never
            become prediction inputs.
          </p>
        </section>
      </div>
      {!state && !error && <Loading text="Loading model history…" />}
      {job && (
        <section className="card ml-run">
          <div className="card-heading">
            <h2>
              Model run <span className="ml-version">{job.id.slice(0, 8)}</span>
            </h2>
            <span className="source-badge">
              {job.status} · {job.stage}
            </span>
          </div>
          <p role="status">{job.message}</p>
          <p className="section-copy">
            Started {new Date(job.created_at).toLocaleString()} · seed{" "}
            {job.config.seed}
          </p>
          <div className="button-row">
            {active && (
              <button
                className="button secondary"
                onClick={cancel}
                disabled={busy || job.cancel_requested}
              >
                <Square size={15} />
                {job.cancel_requested ? "Stopping…" : "Cancel training"}
              </button>
            )}
            <a
              className="button secondary"
              href={`/api/v1/ml/jobs/${job.id}/export`}
            >
              <ArrowDownToLine size={16} /> Export evaluation
            </a>
            {job.result && (
              <button
                className="button secondary"
                onClick={evaluate}
                disabled={busy}
              >
                <RefreshCw size={15} /> Evaluate saved model
              </button>
            )}
          </div>
        </section>
      )}
      {job?.result && (
        <ModelResults key={job.id} job={job} result={job.result} />
      )}
      {!!state?.jobs.length && (
        <section className="card">
          <div className="card-heading">
            <h2>Model history</h2>
            <span className="source-badge">This dataset only</span>
          </div>
          <label>
            Inspect a saved run
            <select
              value={job?.id || ""}
              onChange={(e) => {
                setJob(state.jobs.find((j) => j.id === e.target.value) || null);
                setNotice("");
              }}
            >
              {state.jobs.map((j) => (
                <option key={j.id} value={j.id}>
                  {j.id.slice(0, 8)} · {j.status} ·{" "}
                  {new Date(j.created_at).toLocaleString()}
                </option>
              ))}
            </select>
          </label>
          <p className="availability-note">
            Latest 100 runs across the local registry. Artifacts remain on this
            machine.
          </p>
        </section>
      )}
      <Provenance dataset={dataset} />
    </div>
  );
}

function ModelResults({ job, result }: { job: ModelJob; result: ModelResult }) {
  const eligible = result.acceptance.eligible;
  const chart = result.test.platforms.map((p) => ({
    name: p.platform,
    Model: p.model.rmse,
    Baseline: p.baseline.rmse,
  }));
  return (
    <>
      <section className={`card ml-verdict ${eligible ? "lime-card" : ""}`}>
        <div className="card-heading">
          <h2>
            <ShieldCheck size={20} />
            {eligible
              ? "Passed the model checks."
              : "Trained. Needs stronger evidence."}
          </h2>
          <span className="source-badge">{result.algorithm}</span>
        </div>
        <p>
          {eligible
            ? "This model meets the recorded error and coverage policy on this dataset."
            : "The fit completed, but this model is blocked from future prediction because it failed the acceptance policy."}
        </p>
        <p className="model-boundary">
          Passing these checks is not proof of future returns or demographic
          fairness. Review platform errors below; budget scenarios are screened
          separately.
        </p>
        {result.acceptance.reasons.length > 0 && (
          <ul className="ml-reasons">
            {result.acceptance.reasons.map((r) => (
              <li key={r}>{r}</li>
            ))}
          </ul>
        )}
        <p>
          {eligible ? (
            <Link className="text-link" href="/budget-optimizer">
              Plan a budget with this dataset <ArrowRight size={16} />
            </Link>
          ) : (
            <Link className="text-link" href="/budget-optimizer">
              Plan a budget with baseline evaluation or allocation only{" "}
              <ArrowRight size={16} />
            </Link>
          )}
        </p>
        {job.dataset.is_synthetic && (
          <p>Synthetic estimates · not a real-world revenue guarantee.</p>
        )}
      </section>
      <section className="card">
        <h3>Model versus baseline</h3>
        <p>
          The 5% improvement rule is an operational policy, not a statistical
          significance test.
        </p>
        <RawTable
          label="Actual model evaluation and acceptance"
          rows={(
            [
              ["Validation", result.validation],
              ["Holdout", result.test],
            ] as const
          ).map(([period, evaluation]) => ({
            period,
            model_RMSE: money(evaluation.model.rmse),
            baseline_RMSE: money(evaluation.baseline.rmse),
            RMSE_improvement:
              evaluation.baseline.rmse > 0
                ? `${number((1 - evaluation.model.rmse / evaluation.baseline.rmse) * 100, 2)}%`
                : "Not defined",
            model_WAPE:
              evaluation.model.wape === null
                ? "Not available"
                : `${number(evaluation.model.wape * 100, 1)}%`,
          }))}
        />
        <p>
          Forecast rejection does not prevent a feasible allocation. Budget
          Optimizer evaluates alternatives and withholds unsupported revenue
          estimates.
        </p>
        {job.dataset.import_mapping &&
          (
            job.dataset.import_mapping as { original_columns?: string[] }
          ).original_columns?.some((c) =>
            ["date_is_synthetic", "revenue_is_synthetic"].includes(c),
          ) && (
            <Notice text="This source includes synthetic date/revenue markers. Its scores cannot establish real temporal revenue performance. Older imports need reimporting to retain those markers." />
          )}
      </section>
      <div className="ml-metrics">
        {[
          ["Mean absolute error", "mae"],
          ["Root mean squared error", "rmse"],
          ["Weighted absolute error", "wape"],
        ].map(([label, key]) => (
          <section className="card" key={key}>
            <span className="eyebrow">HOLDOUT · {key.toUpperCase()}</span>
            <h3>{label}</h3>
            <strong>
              {key === "wape"
                ? result.test.model.wape === null
                  ? "Not available"
                  : `${number(result.test.model.wape * 100, 1)}%`
                : money(result.test.model[key as "mae" | "rmse"])}
            </strong>
            <p>
              Baseline:{" "}
              {key === "wape"
                ? result.test.baseline.wape === null
                  ? "Not available"
                  : `${number(result.test.baseline.wape * 100, 1)}%`
                : money(result.test.baseline[key as "mae" | "rmse"])}
            </p>
          </section>
        ))}
      </div>
      <p className="form-hint">
        Holdout R²: {number(result.test.model.r2 ?? null, 3)} · Baseline R²:{" "}
        {number(result.test.baseline.r2 ?? null, 3)}. Undefined for constant
        labels; this is not an accuracy percentage.
      </p>
      <div className="ml-result-grid">
        <section className="card">
          <div className="card-heading">
            <h2>Errors by platform</h2>
            <span className="source-badge">Holdout · PKR</span>
          </div>
          <p className="section-copy">
            Root mean squared error. Lower is better. Compare both methods on
            identical later-date observations.
          </p>
          <div
            className="ml-chart"
            role="img"
            aria-label="Model and baseline holdout RMSE by platform; values in the table below"
          >
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={chart}
                margin={{ left: 10, right: 8, top: 12, bottom: 20 }}
              >
                <CartesianGrid vertical={false} stroke="#e4e5df" />
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 11 }}
                  interval={0}
                  angle={-20}
                  textAnchor="end"
                />
                <YAxis
                  tick={{ fontSize: 11 }}
                  tickFormatter={(v) => number(v)}
                  width={65}
                />
                <Tooltip formatter={(v) => money(Number(v))} />
                <Legend />
                <Bar
                  name="Model"
                  dataKey="Model"
                  fill="#26332d"
                  radius={[4, 4, 0, 0]}
                />
                <Bar
                  name="Baseline"
                  dataKey="Baseline"
                  fill="#a3b176"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <RawTable
            label="Platform holdout errors"
            rows={result.test.platforms.map((p) => ({
              platform: p.platform,
              rows: p.model.rows,
              model_RMSE_PKR: money(p.model.rmse),
              baseline_RMSE_PKR: money(p.baseline.rmse),
              model_WAPE:
                p.model.wape === null
                  ? "Not available"
                  : `${number(p.model.wape * 100, 1)}%`,
            }))}
          />
        </section>
        <section className="card">
          <h2>A fair test over time</h2>
          <div className="ml-splits">
            {Object.entries(result.splits).map(([name, split]) => (
              <div key={name}>
                <span className="eyebrow">{name}</span>
                <strong>{number(split.rows)} rows</strong>
                <span>
                  {split.start}
                  <br />
                  to {split.end}
                </span>
              </div>
            ))}
          </div>
          <p className="availability-note">
            {number(result.coverage.excluded_rows)} rows excluded by maturity or
            missing financial labels. Cutoff: {result.coverage.maturity_cutoff}.
          </p>
          <p className="section-copy">
            {result.campaign_overlap_count} campaign names overlap training and
            test. This checks future dates, rather than generalization to unseen
            campaigns.
          </p>
          <p className="section-copy">
            Fit and evaluation: {number(result.elapsed_seconds, 2)} seconds ·
            uncertainty not quantified.
          </p>
        </section>
      </div>
      {eligible && <PredictionForm job={job} result={result} />}
      <section className="card">
        <details>
          <summary>View diagnostics & methodology</summary>
          <h3>Acceptance policy</h3>
          <p>{result.acceptance.policy}</p>
          <h3>Prediction target</h3>
          <p>{result.target}</p>
          <h3>Inputs known before the period</h3>
          <p>{result.features.join(", ")}</p>
          <h3>Limitations</h3>
          <ul className="ml-reasons">
            {result.limitations.map((text) => (
              <li key={text}>{text}</li>
            ))}
          </ul>
          {result.fallback_reason && <Notice text={result.fallback_reason} />}
          <h3>Validation comparison</h3>
          <RawTable
            label="Validation model comparison"
            rows={[
              { method: result.algorithm, ...result.validation.model },
              {
                method: "Historical smoothed baseline",
                ...result.validation.baseline,
              },
            ]}
          />
          {result.feature_importance.length > 0 && (
            <>
              <h3>Feature importance · predictive association</h3>
              <RawTable
                label="Model feature importance"
                rows={result.feature_importance}
              />
            </>
          )}
          <h3>Versions & parameters</h3>
          <pre className="ml-json">
            {JSON.stringify(
              {
                versions: result.versions,
                parameters: result.parameters,
                input_sha256: job.input_sha256,
                model_id: job.id,
              },
              null,
              2,
            )}
          </pre>
          <p>
            Baseline uses train-only platform revenue per spend, smoothed with
            20 equivalent rows at the global rate. MAE averages absolute errors;
            RMSE weights large errors more heavily; WAPE divides absolute error
            by total actual revenue. WAPE is unavailable when revenue sums to
            zero.
          </p>
        </details>
      </section>
    </>
  );
}

function PredictionForm({
  job,
  result,
}: {
  job: ModelJob;
  result: ModelResult;
}) {
  const firstPlatform = Object.keys(result.spend_ranges)[0];
  const [platform, setPlatform] = useState(firstPlatform);
  const [spend, setSpend] = useState(
    Math.round(
      (result.spend_ranges[firstPlatform].min +
        result.spend_ranges[firstPlatform].max) /
        2,
    ),
  );
  const decisionDate = [result.splits.test.end, job.config.as_of_date]
    .sort()
    .at(-1);
  const nextDate = new Date(`${decisionDate}T12:00:00Z`);
  nextDate.setUTCDate(nextDate.getUTCDate() + 1);
  if (job.dataset.date_granularity === "weekly") {
    const weekday = new Date(`${job.dataset.date_start}T12:00:00Z`).getUTCDay();
    nextDate.setUTCDate(
      nextDate.getUTCDate() + ((weekday - nextDate.getUTCDay() + 7) % 7),
    );
  }
  const [date, setDate] = useState(nextDate.toISOString().slice(0, 10));
  const [context, setContext] = useState(
    Object.fromEntries(
      ["age", "gender", "city", "device"].map((key, i) => [
        key,
        result.categories[i + 1][0],
      ]),
    ),
  );
  const [prediction, setPrediction] = useState<{
    predicted_revenue: number;
    notice: string;
  } | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError("");
    setPrediction(null);
    try {
      setPrediction(
        await api(
          `/ml/models/${job.id}/predict`,
          json({ date, platform, spend, ...context }),
        ),
      );
    } catch (reason) {
      setError(message(reason));
    } finally {
      setBusy(false);
    }
  }
  return (
    <section className="card">
      <div className="card-heading">
        <h2>Try a campaign-period estimate</h2>
        <span className="source-badge">
          {job.dataset.is_synthetic ? "Simulated" : "Model-predicted"}
        </span>
      </div>
      <p className="section-copy">
        One campaign, one reported segment, one future{" "}
        {job.dataset.date_granularity === "weekly" ? "week" : "day"}. This is a
        prediction check. For a platform-level plan, open Budget Optimizer and
        review its campaign-period mapping and spend-support limits.
      </p>
      <form onSubmit={submit}>
        <div className="ml-predict-grid">
          <label>
            Prediction date
            <input
              type="date"
              min={nextDate.toISOString().slice(0, 10)}
              value={date}
              required
              onChange={(e) => {
                setDate(e.target.value);
                setPrediction(null);
              }}
            />
          </label>
          <label>
            Platform
            <select
              value={platform}
              onChange={(e) => {
                setPlatform(e.target.value);
                setPrediction(null);
              }}
            >
              {Object.keys(result.spend_ranges).map((p) => (
                <option key={p}>{p}</option>
              ))}
            </select>
          </label>
          <label>
            Planned spend (PKR)
            <input
              type="number"
              step="0.01"
              min={result.spend_ranges[platform].min}
              max={result.spend_ranges[platform].max}
              value={spend}
              required
              onChange={(e) => {
                setSpend(Number(e.target.value));
                setPrediction(null);
              }}
            />
            <small>
              Supported: {money(result.spend_ranges[platform].min)}–
              {money(result.spend_ranges[platform].max)}
            </small>
          </label>
          {["age", "gender", "city", "device"].map((key, i) => (
            <label key={key}>
              {key}
              <select
                value={context[key]}
                onChange={(e) => {
                  setContext({ ...context, [key]: e.target.value });
                  setPrediction(null);
                }}
              >
                {result.categories[i + 1].map((value) => (
                  <option key={value}>{value}</option>
                ))}
              </select>
            </label>
          ))}
        </div>
        <button className="button secondary" disabled={busy}>
          <Play size={15} />
          {busy ? "Predicting…" : "Estimate revenue"}
        </button>
      </form>
      {error && <Notice error text={error} />}
      {prediction && (
        <div className="ml-prediction" role="status">
          <span>Estimated attributed revenue</span>
          <strong>{money(prediction.predicted_revenue)}</strong>
          <p>{prediction.notice} · uncertainty not quantified.</p>
        </div>
      )}
    </section>
  );
}
