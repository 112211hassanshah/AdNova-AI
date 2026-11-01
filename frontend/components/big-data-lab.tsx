"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import * as Dialog from "@radix-ui/react-dialog";
import {
  ArrowDownToLine,
  ArrowRight,
  Check,
  ChevronRight,
  Cpu,
  Database,
  FlaskConical,
  Play,
  RefreshCw,
  ShieldCheck,
  Square,
  Trash2,
} from "lucide-react";
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  api,
  compact,
  json,
  message,
  money,
  number,
  platforms,
  type RecordRow,
} from "@/lib/data";
import {
  bytes,
  engineName,
  initialConfig,
  seconds,
  terminal,
  type ExperimentConfig,
  type LabDataset,
  type LabEnvironment,
  type LabJob,
  type LabState,
} from "@/lib/lab";
import { Loading, Notice, RawTable } from "./data-primitives";

function useLab() {
  const [state, setState] = useState<LabState | null>(null);
  const [error, setError] = useState("");
  const refresh = useCallback(async () => {
    try {
      const data = await api<LabState>("/lab");
      setState(data);
      setError("");
    } catch (reason) {
      setError(message(reason));
    }
  }, []);
  useEffect(() => {
    const controller = new AbortController();
    api<LabState>("/lab", { signal: controller.signal })
      .then((data) => {
        setState(data);
        setError("");
      })
      .catch((reason) => {
        if (!controller.signal.aborted) setError(message(reason));
      });
    return () => controller.abort();
  }, []);
  return { state, error, refresh, setState };
}

function useActiveJob(
  state: LabState | null,
  refresh: () => Promise<void>,
  preferredKind: "generate" | "benchmark",
) {
  const [selected, setSelected] = useState<LabJob | null>(null);
  const [error, setError] = useState("");
  const job =
    selected ||
    state?.jobs.find((j) => !terminal(j.status)) ||
    state?.jobs.find((j) => j.config.kind === preferredKind) ||
    null;
  const active = !!job && !terminal(job.status);
  const jobId = job?.id;
  useEffect(() => {
    if (!jobId || !active) return;
    const controller = new AbortController();
    let timer: ReturnType<typeof setTimeout>;
    async function poll() {
      try {
        const next = await api<LabJob>(`/lab/jobs/${jobId}`, {
          signal: controller.signal,
        });
        setSelected(next);
        setError("");
        if (terminal(next.status)) await refresh();
        else timer = setTimeout(poll, 1200);
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
  }, [jobId, active, refresh]); // Poll state comes from the server, never a simulated timer.
  return { job, setSelected, pollError: error };
}

export function BigDataLab({ dataOnly = false }: { dataOnly?: boolean }) {
  const { state, error, refresh } = useLab();
  const { job, setSelected, pollError } = useActiveJob(
    state,
    refresh,
    dataOnly ? "generate" : "benchmark",
  );
  const [config, setConfig] = useState<ExperimentConfig>({
    ...initialConfig,
    kind: dataOnly ? "generate" : "benchmark",
  });
  const [busy, setBusy] = useState(false);
  const [actionError, setActionError] = useState("");
  const activeJob = state?.jobs.find((j) => !terminal(j.status));
  const running = (job && !terminal(job.status)) || !!activeJob;
  async function start(event: React.FormEvent) {
    event.preventDefault();
    setBusy(true);
    setActionError("");
    try {
      const next = await api<LabJob>("/lab/jobs", json(config));
      setSelected(next);
      await refresh();
    } catch (reason) {
      setActionError(message(reason));
    } finally {
      setBusy(false);
    }
  }
  async function cancel() {
    if (!job) return;
    setBusy(true);
    setActionError("");
    try {
      setSelected(await api<LabJob>(`/lab/jobs/${job.id}/cancel`, json({})));
    } catch (reason) {
      setActionError(message(reason));
    } finally {
      setBusy(false);
    }
  }
  if (!state)
    return error ? (
      <div>
        <Notice text={error} error />
        <button className="button secondary" onClick={refresh}>
          <RefreshCw size={16} />
          Retry lab connection
        </button>
      </div>
    ) : (
      <Loading text="Checking local experiment resources…" />
    );
  return (
    <div className={`lab ${dataOnly ? "lab-data-studio" : ""}`}>
      <div className="lab-intro">
        <span className="source-badge">
          <FlaskConical size={15} />
          Synthetic university experiment
        </span>
        <p>
          {dataOnly
            ? "Generate larger Parquet datasets for Big Data Lab. These stay separate from your campaign reports."
            : "Big Data Lab is for the university experiment, not required for a small merchant’s daily use."}
        </p>
      </div>
      {(error || actionError) && <Notice text={actionError || error} error />}
      <div className="lab-setup-grid">
        <section className="card lab-form-card">
          <div className="card-heading">
            <h2>
              {dataOnly ? "Generate at academic scale" : "Run an experiment"}
            </h2>
            <FlaskConical size={20} />
          </div>
          <p className="section-copy">
            {dataOnly
              ? "Bounded chunks. Saved locally. Always labelled synthetic."
              : "One dataset, the same platform totals, and real measured repeats."}
          </p>
          <form onSubmit={start} className="lab-form">
            <fieldset disabled={busy || !!running}>
              {!dataOnly && (
                <label className="lab-input-select">
                  Experiment input
                  <select
                    aria-label="Experiment input"
                    value={config.dataset_id || ""}
                    onChange={(event) => {
                      const dataset = state.datasets.find(
                        (d) => d.id === event.target.value,
                      );
                      setConfig((c) =>
                        dataset
                          ? { ...c, ...dataset.config, dataset_id: dataset.id }
                          : { ...c, dataset_id: null },
                      );
                    }}
                  >
                    <option value="">
                      Generate or reuse matching synthetic input
                    </option>
                    {state.datasets.map((d) => (
                      <option key={d.id} value={d.id}>
                        {compact(d.rows)} rows · seed {d.config.seed} ·{" "}
                        {d.id.slice(0, 6)}
                      </option>
                    ))}
                  </select>
                </label>
              )}
              <GenerationFields
                config={config}
                setConfig={setConfig}
                disabled={!!config.dataset_id}
              />
              {!dataOnly && (
                <fieldset className="lab-engines">
                  <legend>Processing engines</legend>
                  <div className="lab-engine-choices">
                    {state.environment.engines.map((engine) => (
                      <label
                        key={engine.id}
                        className={`lab-engine-choice ${config.engines.includes(engine.id) ? "selected" : ""}`}
                      >
                        <input
                          type="checkbox"
                          checked={config.engines.includes(engine.id)}
                          onChange={(event) =>
                            setConfig((c) => ({
                              ...c,
                              engines: event.target.checked
                                ? [...c.engines, engine.id]
                                : c.engines.filter((id) => id !== engine.id),
                            }))
                          }
                        />
                        <span>
                          <strong>{engineName(engine.id)}</strong>
                          <small>
                            {engine.id === "pandas"
                              ? "Group & sum"
                              : engine.id === "mapreduce"
                                ? "Map → shuffle → reduce"
                                : "DataFrame · local mode"}
                          </small>
                          <em>
                            {engine.available
                              ? "Available"
                              : "Unavailable · will record a skip"}
                          </em>
                        </span>
                      </label>
                    ))}
                  </div>
                </fieldset>
              )}
              <details className="lab-settings">
                <summary>Resources & experiment settings</summary>
                <div className="form-grid">
                  <label>
                    Memory allowance
                    <select
                      aria-label="Memory allowance"
                      value={config.memory_mib}
                      onChange={(event) =>
                        setConfig((c) => ({
                          ...c,
                          memory_mib: +event.target.value,
                        }))
                      }
                    >
                      {[512, 1024, 2048, 4096].map((n) => (
                        <option key={n} value={n}>
                          {number(n)} MiB
                        </option>
                      ))}
                    </select>
                  </label>
                  <label>
                    Local workers
                    <select
                      aria-label="Local workers"
                      value={config.workers}
                      onChange={(event) =>
                        setConfig((c) => ({
                          ...c,
                          workers: +event.target.value,
                        }))
                      }
                    >
                      {[1, 2, 3, 4].map((n) => (
                        <option key={n} value={n}>
                          {n} {n === 1 ? "worker" : "workers"}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label>
                    Parquet chunk size
                    <select
                      aria-label="Parquet chunk size"
                      disabled={!!config.dataset_id}
                      value={config.chunk_rows}
                      onChange={(event) =>
                        setConfig((c) => ({
                          ...c,
                          chunk_rows: +event.target.value,
                        }))
                      }
                    >
                      {[10000, 50000, 100000].map((n) => (
                        <option key={n} value={n}>
                          {number(n)} rows
                        </option>
                      ))}
                    </select>
                  </label>
                  {!dataOnly && (
                    <label>
                      Measured repeats
                      <input
                        aria-label="Measured repeats"
                        type="number"
                        min={3}
                        max={7}
                        required
                        value={config.repeats}
                        onChange={(event) =>
                          setConfig((c) => ({
                            ...c,
                            repeats: +event.target.value,
                          }))
                        }
                      />
                    </label>
                  )}
                </div>
                <p className="form-hint">
                  One job at a time. Memory is sampled across engine processes,
                  including the Spark JVM. Limits stop affected work; they are
                  not preallocated RAM.
                </p>
              </details>
              {config.rows === 10000000 && (
                <div className="lab-resource-notice" role="note">
                  <Database size={19} />
                  <p>
                    <strong>10 million rows is a resource experiment.</strong>{" "}
                    Generation stays chunked. Allow about 10 GiB of free disk
                    plus a 1 GiB reserve for the conservative safety gate.
                    Pandas will use its chunked path at the default allowance.
                    Cancellation keeps completed data and removes unfinished
                    generation.
                  </p>
                </div>
              )}
              <div className="lab-submit">
                <button
                  type="submit"
                  className="button primary"
                  disabled={!dataOnly && !config.engines.length}
                >
                  <Play size={16} />
                  {busy
                    ? "Starting local job…"
                    : dataOnly
                      ? "Generate lab dataset"
                      : "Start benchmark"}
                </button>
                <span>
                  {dataOnly
                    ? "No campaign data is changed"
                    : `${config.repeats} measured repeats per engine`}
                </span>
              </div>
            </fieldset>
          </form>
          {running && (
            <p className="form-hint" role="status">
              A local job is active. Follow its progress below before starting
              another.
            </p>
          )}
        </section>
        <aside className="card dark lab-context-card">
          <Cpu size={27} />
          <h2>
            {dataOnly
              ? "Large data. Small memory footprint."
              : "Measured, with context."}
          </h2>
          <p>
            Local results describe this machine, this input and this workload.
          </p>
          <dl className="lab-resource-list">
            <div>
              <dt>Logical CPUs</dt>
              <dd>{state.environment.logical_cpus ?? "Unknown"}</dd>
            </div>
            <div>
              <dt>Available RAM now</dt>
              <dd>{bytes(state.environment.ram_available_bytes)}</dd>
            </div>
            <div>
              <dt>Free disk</dt>
              <dd>{bytes(state.environment.disk_free_bytes)}</dd>
            </div>
            <div>
              <dt>Input format</dt>
              <dd>Parquet · Snappy</dd>
            </div>
          </dl>
          <div className="lab-context-foot">
            <ShieldCheck size={18} />
            <p>
              {dataOnly
                ? "Lab datasets are isolated from advertiser CSVs and never selected as merchant results."
                : "Every repeat is checked against reference totals. Failed or skipped runs never become comparison timings."}
            </p>
          </div>
          {dataOnly && (
            <Link href="/big-data-lab" className="text-link light-link">
              Open Big Data Lab <ArrowRight size={16} />
            </Link>
          )}
        </aside>
      </div>
      {job && (
        <RunPanel job={job} busy={busy} cancel={cancel} pollError={pollError} />
      )}
      {!dataOnly && (
        <>
          <History
            state={state}
            selectedId={job?.id}
            onSelect={async (id) => {
              setActionError("");
              try {
                setSelected(await api<LabJob>(`/lab/jobs/${id}`));
              } catch (reason) {
                setActionError(message(reason));
              }
            }}
            disabled={!!running}
          />
          <ScaleComparison jobs={state.jobs} />
        </>
      )}
      <DatasetList
        datasets={state.datasets}
        running={!!running}
        refresh={refresh}
      />
      <Methodology
        environment={job?.environment || state.environment}
        methodology={job?.methodology || state.methodology}
      />
    </div>
  );
}

function GenerationFields({
  config,
  setConfig,
  disabled,
}: {
  config: ExperimentConfig;
  setConfig: React.Dispatch<React.SetStateAction<ExperimentConfig>>;
  disabled: boolean;
}) {
  return (
    <fieldset disabled={disabled}>
      <div className="form-grid lab-core-fields">
        <label>
          Dataset scale
          <select
            aria-label="Dataset scale"
            value={config.rows}
            onChange={(event) =>
              setConfig((c) => ({ ...c, rows: +event.target.value }))
            }
          >
            {[10000, 100000, 1000000, 10000000].map((n) => (
              <option key={n} value={n}>
                {number(n)} rows
              </option>
            ))}
          </select>
        </label>
        <label>
          Experiment seed
          <input
            aria-label="Experiment seed"
            type="number"
            min={0}
            max={4294967295}
            required
            value={config.seed}
            onChange={(event) =>
              setConfig((c) => ({ ...c, seed: +event.target.value }))
            }
          />
        </label>
      </div>
      <details className="lab-generation-settings">
        <summary>Date range & included platforms</summary>
        <div className="form-grid">
          <label>
            Experiment start date
            <input
              aria-label="Experiment start date"
              type="date"
              required
              value={config.start_date}
              onChange={(event) =>
                setConfig((c) => ({ ...c, start_date: event.target.value }))
              }
            />
          </label>
          <label>
            Experiment end date
            <input
              aria-label="Experiment end date"
              type="date"
              required
              value={config.end_date}
              onChange={(event) =>
                setConfig((c) => ({ ...c, end_date: event.target.value }))
              }
            />
          </label>
        </div>
        <fieldset>
          <legend>Included platforms</legend>
          <div className="platform-choices">
            {platforms.map((platform) => (
              <label className="check-pill" key={platform}>
                <input
                  type="checkbox"
                  checked={config.platforms.includes(platform)}
                  onChange={(event) =>
                    setConfig((c) => ({
                      ...c,
                      platforms: event.target.checked
                        ? [...c.platforms, platform]
                        : c.platforms.filter((p) => p !== platform),
                    }))
                  }
                />
                {platform}
              </label>
            ))}
          </div>
        </fieldset>
      </details>
    </fieldset>
  );
}

function Status({ value }: { value: string }) {
  return (
    <span className={`lab-status status-${value}`}>
      {value === "completed" ? <Check size={13} /> : null}
      {value}
    </span>
  );
}

function RunPanel({
  job,
  busy,
  cancel,
  pollError,
}: {
  job: LabJob;
  busy: boolean;
  cancel: () => Promise<void>;
  pollError: string;
}) {
  const active = !terminal(job.status);
  const correctRuns = job.results
    .flatMap((r) => r.runs)
    .filter((r) => r.correct).length;
  return (
    <section
      className="card lab-run-panel"
      aria-label="Experiment progress and results"
    >
      <div className="card-heading">
        <div>
          <p className="eyebrow">
            {job.config.kind === "generate"
              ? "GENERATION JOB"
              : "EXPERIMENT RESULTS"}
          </p>
          <h2>
            {compact(job.config.rows)} rows{" "}
            <span className="lab-heading-seed">/ seed {job.config.seed}</span>
          </h2>
        </div>
        <Status value={job.status} />
      </div>
      <p className="lab-run-context">
        Synthetic · PKR · {job.config.start_date} to {job.config.end_date} ·{" "}
        {job.config.platforms.join(", ")}
      </p>
      <div className="lab-progress-message" role="status" aria-live="polite">
        <strong>{job.message}</strong>
        {active && (
          <span>
            {job.stage === "generating"
              ? `${number(job.generated_rows)} rows written`
              : job.stage === "queued"
                ? "Worker queued"
                : `Stage: ${engineName(job.stage)}`}
          </span>
        )}
      </div>
      {pollError && (
        <Notice
          text={`${pollError} Progress updates will retry automatically.`}
          error
        />
      )}
      <ol className="lab-run-stages" aria-label="Experiment stages">
        {[
          "Input ready",
          ...(job.config.kind === "benchmark"
            ? job.config.engines.map(engineName)
            : []),
        ].map((name, i) => (
          <li key={name}>
            <span>
              {i === 0 ? job.dataset ? <Check size={15} /> : "1" : i + 1}
            </span>
            {name}
            {i < job.config.engines.length && <ChevronRight size={14} />}
          </li>
        ))}
      </ol>
      {!!job.dataset && (
        <div className="lab-result-facts">
          <span>
            <strong>{number(job.dataset.parts)}</strong> Parquet parts
          </span>
          <span>
            <strong>{bytes(job.dataset.bytes)}</strong> on disk
          </span>
          <span>
            <strong>
              {job.generation_seconds == null
                ? "Reused input"
                : seconds(job.generation_seconds)}
            </strong>{" "}
            {job.generation_seconds == null
              ? "checksums verified"
              : "generation, excluded from timings"}
          </span>
          {job.config.kind === "benchmark" && (
            <span>
              <strong>{correctRuns}</strong> correct repeats
            </span>
          )}
        </div>
      )}
      {job.results.length > 0 && (
        <>
          <div
            className="table-scroll"
            role="region"
            aria-label="Measured engine results"
            tabIndex={0}
          >
            <table className="data-table lab-results-table">
              <caption className="sr-only">
                Measured engine results for {number(job.config.rows)} synthetic
                rows. Only complete, correct repeats have a median.
              </caption>
              <thead>
                <tr>
                  <th scope="col">Engine / mode</th>
                  <th scope="col">Status</th>
                  <th scope="col">Median time</th>
                  <th scope="col">Throughput</th>
                  <th scope="col">Setup</th>
                  <th scope="col">Peak tree RSS</th>
                  <th scope="col">Correct repeats</th>
                </tr>
              </thead>
              <tbody>
                {job.results.map((result) => (
                  <tr key={result.engine}>
                    <th scope="row">
                      {engineName(result.engine)}
                      <small>
                        {result.mode || "No execution mode started"}
                      </small>
                    </th>
                    <td>
                      <Status value={result.status} />
                    </td>
                    <td>{seconds(result.median_seconds)}</td>
                    <td>
                      {result.median_rows_per_second == null
                        ? "Not measured"
                        : `${number(result.median_rows_per_second)} rows/s`}
                    </td>
                    <td>{seconds(result.setup_seconds)}</td>
                    <td>{bytes(result.peak_tree_rss_bytes)}</td>
                    <td>
                      {result.runs.filter((r) => r.correct).length} /{" "}
                      {job.config.repeats}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="form-hint">
            Times include reading Parquet and producing weighted platform
            metrics. Setup and generation are separate. OS caches are not
            flushed.
          </p>
          <details className="lab-repeat-details">
            <summary>Individual repeats & engine notes</summary>
            {job.results.map((r) => (
              <div className="lab-repeat-engine" key={r.engine}>
                <h3>{engineName(r.engine)}</h3>
                <p>{r.message}</p>
                {r.runs.length > 0 && (
                  <ul>
                    {r.runs.map((run) => (
                      <li key={run.repeat}>
                        Repeat {run.repeat}
                        <strong>{seconds(run.elapsed_seconds)}</strong>
                        <span>
                          {run.correct
                            ? "Reference matched"
                            : "Correctness failed"}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </details>
          {job.results.some((r) => r.aggregate) && (
            <details className="lab-repeat-details">
              <summary>Inspect platform totals & weighted metrics</summary>
              <p className="form-hint">
                All successful paths must match these values. Rates are
                calculated from totals. Reference counts and sums use exact
                scaled integers.
              </p>
              <div
                className="table-scroll"
                role="region"
                aria-label="Benchmark platform totals"
                tabIndex={0}
              >
                <table className="data-table">
                  <caption className="sr-only">
                    Synthetic platform reference totals in PKR, for the
                    experiment date range and included platforms
                  </caption>
                  <thead>
                    <tr>
                      {[
                        "Platform",
                        "Rows",
                        "Impressions",
                        "Clicks",
                        "Spend (PKR)",
                        "Conversions",
                        "Revenue (PKR)",
                        "CTR",
                        "CPC (PKR)",
                        "CPA (PKR)",
                        "CVR",
                        "ROAS",
                      ].map((t) => (
                        <th key={t} scope="col">
                          {t}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {(job.dataset?.reference || []).map((r) => (
                      <tr key={r.name}>
                        <th scope="row">{r.name}</th>
                        <td>{number(r.rows)}</td>
                        <td>{number(r.impressions)}</td>
                        <td>{number(r.clicks)}</td>
                        <td>{money(r.spend)}</td>
                        <td>{number(r.conversions, 6)}</td>
                        <td>{money(r.revenue)}</td>
                        <td>{number(r.ctr, 3)}%</td>
                        <td>{money(r.cpc)}</td>
                        <td>{money(r.cpa)}</td>
                        <td>{number(r.cvr, 3)}%</td>
                        <td>{number(r.roas, 3)}×</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </details>
          )}
        </>
      )}
      <div className="lab-run-actions">
        {active ? (
          <button
            className="button secondary"
            onClick={cancel}
            disabled={busy || job.cancel_requested}
          >
            <Square size={15} />
            {job.cancel_requested
              ? "Stopping local work…"
              : "Cancel experiment"}
          </button>
        ) : (
          <>
            <a
              className="button secondary"
              href={`/api/v1/lab/jobs/${job.id}/export?format=json`}
            >
              <ArrowDownToLine size={16} />
              JSON report
            </a>
            <a
              className="button secondary"
              href={`/api/v1/lab/jobs/${job.id}/export?format=csv`}
            >
              <ArrowDownToLine size={16} />
              CSV timings
            </a>
          </>
        )}
        <code>Run {job.id.slice(0, 8)}</code>
      </div>
    </section>
  );
}

function History({
  state,
  selectedId,
  onSelect,
  disabled,
}: {
  state: LabState;
  selectedId?: string;
  onSelect: (id: string) => Promise<void>;
  disabled: boolean;
}) {
  const jobs = state.jobs.filter((j) => j.config.kind === "benchmark");
  if (!jobs.length)
    return (
      <section className="card lab-empty">
        <FlaskConical size={27} />
        <div>
          <h2>No benchmarks yet.</h2>
          <p>
            Start with 10,000 rows. Measured results, correctness checks and
            exports will appear here.
          </p>
        </div>
      </section>
    );
  return (
    <section className="card lab-history">
      <div className="card-heading">
        <h2>Saved experiments</h2>
        <span className="muted">Latest {jobs.length}</span>
      </div>
      <label>
        Inspect a saved run
        <select
          aria-label="Inspect a saved run"
          disabled={disabled}
          value={
            selectedId && jobs.some((j) => j.id === selectedId)
              ? selectedId
              : ""
          }
          onChange={(event) => void onSelect(event.target.value)}
        >
          <option value="" disabled>
            Choose an experiment
          </option>
          {jobs.map((j) => (
            <option key={j.id} value={j.id}>
              {number(j.config.rows)} rows · seed {j.config.seed} · {j.status} ·{" "}
              {new Date(j.created_at).toLocaleString()}
            </option>
          ))}
        </select>
      </label>
    </section>
  );
}

function cohortKey(job: LabJob) {
  const c = job.config;
  const env = job.environment;
  return JSON.stringify([
    c.seed,
    c.start_date,
    c.end_date,
    c.platforms,
    c.chunk_rows,
    c.repeats,
    c.workers,
    c.memory_mib,
    job.dataset?.generator_version,
    job.benchmark_version || "early-smoke",
    env?.packages,
    env?.os,
    env?.cpu,
    env?.logical_cpus,
    env?.ram_total_bytes,
    env?.java?.description,
  ]);
}

function ScaleComparison({ jobs }: { jobs: LabJob[] }) {
  const [metric, setMetric] = useState("median_seconds");
  const available = jobs.filter(
    (j) =>
      j.config.kind === "benchmark" &&
      j.results.some((r) => r.median_seconds !== null),
  );
  const groups = Array.from(
    new Map(
      available.map((j) => {
        const c = j.config;
        const key = cohortKey(j);
        return [
          key,
          {
            key,
            label: `Seed ${c.seed} · Pandas ${j.environment?.packages.pandas || "unknown"} · ${c.workers} workers · ${c.memory_mib} MiB${j.benchmark_version ? "" : " · early smoke"}`,
          },
        ];
      }),
    ).values(),
  );
  const [group, setGroup] = useState("");
  const selected = groups.some((g) => g.key === group) ? group : groups[0]?.key;
  const selectedJob = available.find((j) => cohortKey(j) === selected);
  const data = [10000, 100000, 1000000, 10000000].map((scale) => {
    const row: Record<string, number | null> = {
      rows: scale,
      pandas: null,
      mapreduce: null,
      spark: null,
    };
    // Most recent complete, correct engine measurement at each scale in the same config cohort.
    for (const engine of ["pandas", "mapreduce", "spark"]) {
      const job = available.find((j) => {
        const c = j.config;
        return (
          c.rows === scale &&
          cohortKey(j) === selected &&
          j.results.some(
            (r) => r.engine === engine && r.median_seconds !== null,
          )
        );
      });
      const result = job?.results.find((r) => r.engine === engine);
      row[engine] =
        metric === "median_seconds"
          ? (result?.median_seconds ?? null)
          : (result?.median_rows_per_second ?? null);
    }
    return row;
  });
  return (
    <section className="card lab-comparison">
      <div className="card-heading">
        <h2>How processing scales</h2>
        <span className="source-badge">Measured medians</span>
      </div>
      <p className="section-copy">
        Latest complete, correct measurements for matching settings. Empty
        points mean no valid measurement. Pandas execution mode may change with
        scale.
      </p>
      {available.length ? (
        <>
          <p className="form-hint">
            Synthetic · PKR · {selectedJob?.config.start_date} to{" "}
            {selectedJob?.config.end_date} ·{" "}
            {selectedJob?.config.platforms.join(", ")}. Matching seed, dates,
            platforms, chunks, repeats, worker/memory settings and
            software/hardware versions.
          </p>
          <div className="lab-chart-controls">
            <label>
              Comparison settings
              <select
                aria-label="Comparison settings"
                value={selected}
                onChange={(event) => setGroup(event.target.value)}
              >
                {groups.map((g) => (
                  <option key={g.key} value={g.key}>
                    {g.label}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Comparison metric
              <select
                aria-label="Comparison metric"
                value={metric}
                onChange={(event) => setMetric(event.target.value)}
              >
                <option value="median_seconds">Median runtime (seconds)</option>
                <option value="median_rows_per_second">
                  Throughput (rows/second)
                </option>
              </select>
            </label>
          </div>
          <div
            className="chart-wrap"
            role="img"
            aria-label={`Measured ${metric === "median_seconds" ? "runtime" : "throughput"} versus dataset rows. Exact values in the table below.`}
          >
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={data}
                margin={{ top: 20, right: 18, left: 10, bottom: 15 }}
              >
                <CartesianGrid strokeDasharray="3 5" vertical={false} />
                <XAxis
                  dataKey="rows"
                  type="number"
                  scale="log"
                  domain={[10000, 10000000]}
                  ticks={[10000, 100000, 1000000, 10000000]}
                  tickFormatter={compact}
                  label={{
                    value: "Synthetic rows",
                    position: "insideBottom",
                    offset: -10,
                  }}
                />
                <YAxis
                  tickFormatter={(n) =>
                    metric === "median_seconds"
                      ? number(Number(n), 3)
                      : compact(n)
                  }
                  width={64}
                  label={{
                    value: metric === "median_seconds" ? "Seconds" : "Rows/s",
                    angle: -90,
                    position: "insideLeft",
                  }}
                />
                <Tooltip
                  formatter={(value) =>
                    `${number(Number(value), metric === "median_seconds" ? 3 : 0)} ${metric === "median_seconds" ? "s" : "rows/s"}`
                  }
                  labelFormatter={(value) =>
                    `${number(Number(value))} synthetic rows`
                  }
                />
                <Legend verticalAlign="top" />
                {[
                  { id: "pandas", color: "#171A17" },
                  { id: "mapreduce", color: "#527526" },
                  { id: "spark", color: "#946842" },
                ].map((e) => (
                  <Line
                    key={e.id}
                    type="linear"
                    dataKey={e.id}
                    name={engineName(e.id)}
                    stroke={e.color}
                    strokeWidth={2}
                    dot={{ r: 4 }}
                    connectNulls={false}
                    isAnimationActive={false}
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </div>
          <details className="chart-table">
            <summary>Read scale comparison as a table</summary>
            <div
              className="table-scroll"
              role="region"
              aria-label="Scale comparison values"
              tabIndex={0}
            >
              <table className="data-table">
                <caption className="sr-only">
                  Measured{" "}
                  {metric === "median_seconds"
                    ? "median seconds"
                    : "rows per second"}
                  ; synthetic data, PKR, matching experiment configuration
                </caption>
                <thead>
                  <tr>
                    <th scope="col">Rows</th>
                    {["pandas", "mapreduce", "spark"].map((e) => (
                      <th key={e} scope="col">
                        {engineName(e)}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {data.map((r) => (
                    <tr key={r.rows}>
                      <th scope="row">{number(r.rows)}</th>
                      {["pandas", "mapreduce", "spark"].map((e) => (
                        <td key={e}>
                          {r[e] === null
                            ? "Not measured"
                            : number(r[e], metric === "median_seconds" ? 3 : 0)}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </details>
        </>
      ) : (
        <div className="lab-chart-empty">
          <p>Run an experiment to see how time changes with dataset size.</p>
          <span>No illustrative benchmark values.</span>
        </div>
      )}
    </section>
  );
}

function DatasetList({
  datasets,
  running,
  refresh,
}: {
  datasets: LabDataset[];
  running: boolean;
  refresh: () => Promise<void>;
}) {
  const [preview, setPreview] = useState<{
    id: string;
    rows: RecordRow[];
    columns: string[];
  } | null>(null);
  const [busy, setBusy] = useState("");
  const [error, setError] = useState("");
  const [deleting, setDeleting] = useState<LabDataset | null>(null);
  if (!datasets.length) return null;
  return (
    <section className="card lab-datasets">
      <div className="card-heading">
        <h2>Synthetic lab datasets</h2>
        <Database size={19} />
      </div>
      <p className="section-copy">
        Saved Parquet inputs for reproducible experiments. Separate from
        campaign reports; no advertiser data is benchmarked.
      </p>
      {error && <Notice text={error} error />}
      <div className="lab-dataset-list">
        {datasets.map((d) => (
          <div className="lab-dataset" key={d.id}>
            <div>
              <strong>
                {number(d.rows)} rows{" "}
                <span className="muted">/ seed {d.config.seed}</span>
              </strong>
              <p>
                {bytes(d.bytes)} · {d.parts} parts · {d.config.start_date} to{" "}
                {d.config.end_date}
              </p>
              <small>SHA256 {d.sha256.slice(0, 16)}…</small>
            </div>
            <div className="dataset-actions">
              <button
                className="button secondary"
                disabled={!!busy}
                onClick={async () => {
                  setBusy(d.id);
                  setError("");
                  try {
                    const data = await api<{
                      rows: RecordRow[];
                      columns: string[];
                    }>(`/lab/datasets/${d.id}/preview`);
                    setPreview({ id: d.id, ...data });
                  } catch (reason) {
                    setError(message(reason));
                  } finally {
                    setBusy("");
                  }
                }}
              >
                {busy === d.id ? "Loading…" : "Preview 20 rows"}
              </button>
              <button
                className="icon-button"
                aria-label={`Delete ${number(d.rows)} row lab dataset with seed ${d.config.seed}`}
                disabled={running || !!busy}
                onClick={() => setDeleting(d)}
              >
                <Trash2 size={17} />
              </button>
            </div>
          </div>
        ))}
      </div>
      {preview && datasets.some((d) => d.id === preview.id) && (
        <details open className="lab-preview">
          <summary>20-row bounded preview · synthetic · PKR</summary>
          <RawTable
            rows={preview.rows}
            columns={preview.columns}
            label="Synthetic lab dataset preview, first 20 rows"
          />
        </details>
      )}
      <Dialog.Root
        open={!!deleting}
        onOpenChange={(open) => {
          if (!open && !busy) setDeleting(null);
        }}
      >
        <Dialog.Portal>
          <Dialog.Overlay className="drawer-overlay" />
          <Dialog.Content className="confirm-dialog">
            <Dialog.Title>Delete this lab dataset?</Dialog.Title>
            <Dialog.Description>
              The local Parquet input will be removed. Existing experiment
              reports keep their recorded measurements and input checksum.
            </Dialog.Description>
            <div className="dialog-actions">
              <button
                className="button secondary"
                disabled={!!busy}
                onClick={() => setDeleting(null)}
              >
                Keep dataset
              </button>
              <button
                className="button danger-button"
                disabled={!!busy}
                onClick={async () => {
                  if (!deleting) return;
                  setBusy(deleting.id);
                  setError("");
                  try {
                    await api(`/lab/datasets/${deleting.id}`, {
                      method: "DELETE",
                    });
                    if (preview?.id === deleting.id) setPreview(null);
                    setDeleting(null);
                    await refresh();
                  } catch (reason) {
                    setError(message(reason));
                    setDeleting(null);
                  } finally {
                    setBusy("");
                  }
                }}
              >
                {busy ? "Deleting…" : "Delete lab dataset"}
              </button>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </section>
  );
}

function Methodology({
  environment,
  methodology,
}: {
  environment: LabEnvironment;
  methodology: Record<string, string>;
}) {
  return (
    <section className="card lab-methodology">
      <details>
        <summary>
          <ShieldCheck size={18} />
          Machine, method & limitations
        </summary>
        <div className="metadata-grid">
          <div>
            <dt>Operating system</dt>
            <dd>{environment.os}</dd>
          </div>
          <div>
            <dt>CPU / architecture</dt>
            <dd>
              {environment.cpu} · {environment.architecture} ·{" "}
              {environment.logical_cpus ?? "Unknown"} logical CPUs
            </dd>
          </div>
          <div>
            <dt>RAM at experiment start</dt>
            <dd>
              {bytes(environment.ram_total_bytes)} total ·{" "}
              {bytes(environment.ram_available_bytes)} available
            </dd>
          </div>
          <div>
            <dt>Python</dt>
            <dd>{environment.python}</dd>
          </div>
          {Object.entries(environment.packages).map(([name, version]) => (
            <div key={name}>
              <dt>{name}</dt>
              <dd>{version || "Not installed"}</dd>
            </div>
          ))}
          <div>
            <dt>Java</dt>
            <dd>
              {environment.java?.description ||
                "No compatible runtime detected"}
            </dd>
          </div>
          <div>
            <dt>Input</dt>
            <dd>{environment.input_format}</dd>
          </div>
        </div>
        {environment.engines
          .filter((e) => !e.available)
          .map((e) => (
            <p className="field-error" key={e.id}>
              {e.label}: {e.reason}
            </p>
          ))}
        <dl className="lab-method-list">
          {Object.entries(methodology).map(([key, value]) => (
            <div key={key}>
              <dt>{key.replaceAll("_", " ")}</dt>
              <dd>{value}</dd>
            </div>
          ))}
        </dl>
      </details>
    </section>
  );
}
