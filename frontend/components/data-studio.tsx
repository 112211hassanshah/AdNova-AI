"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import * as Dialog from "@radix-ui/react-dialog";
import {
  ArrowDownToLine,
  ArrowRight,
  Check,
  Database,
  ShieldCheck,
  Sparkles,
  Trash2,
  Upload,
  X,
} from "lucide-react";
import {
  api,
  json,
  message,
  number,
  platforms,
  sourceLabel,
  type ImportOptions,
  type Manifest,
  type Report,
  type Stage,
} from "@/lib/data";
import type { WorkspaceState } from "@/lib/api";
import { BigDataLab } from "./big-data-lab";
import { ReportingQuestions } from "./reporting-questions";
import { hasAnswer, hintsForMapping } from "@/lib/reporting";
import {
  Coverage,
  DatasetPreview,
  Loading,
  Notice,
  RawTable,
} from "./data-primitives";

const fields = [
  "date",
  "campaign",
  "platform",
  "impressions",
  "clicks",
  "spend",
  "conversions",
  "revenue",
  "age",
  "gender",
  "city",
  "device",
  "campaign_id",
  "account_id",
  "conversion_definition",
  "attribution_window",
];
const initialOptions: ImportOptions = {
  name: "Imported campaigns",
  mapping: {},
  default_platform: null,
  original_currency: "PKR",
  exchange_rate: null,
  date_format: "auto",
  date_granularity: "auto",
  conversion_definition: "unspecified",
  attribution_window: "unspecified",
  is_synthetic: false,
  exclude_invalid: false,
  drop_duplicates: true,
  confirmed: false,
};

export function DataStudio({
  state,
  refresh,
}: {
  state: WorkspaceState;
  refresh: () => Promise<void>;
}) {
  const [source, setSource] = useState<"demo" | "csv">("demo");
  const [success, setSuccess] = useState("");
  async function saved(dataset: Manifest) {
    await refresh();
    setSuccess(
      `${dataset.name} saved · ${number(dataset.rows)} rows · ${sourceLabel(dataset)}. You can now review its performance.`,
    );
  }
  return (
    <div className="phase-one-studio">
      {success && (
        <div className="saved-notice">
          <Notice text={success} />
          <Link className="button primary" href="/">
            Review performance <ArrowRight size={17} />
          </Link>
        </div>
      )}
      <div className="studio-grid">
        <section className="card studio-main" id="add-campaign-data">
          <div className="card-heading">
            <h2>Add campaign data</h2>
            <Database size={20} />
          </div>
          <p>Start with sample data or bring your own campaign report.</p>
          <details className="getting-data">
            <summary>No CSV yet? Start here.</summary>
            <p>
              Already advertising? Download a daily or weekly campaign report
              from your authorized ad account. Include date, campaign,
              platform/channel and spend; add attributed revenue if available.
              Map the columns and check definitions before saving.
            </p>
            <p>
              New advertiser? Use the demo below to learn. Simulated results
              cannot recommend a first campaign for your business. No API key is
              needed.
            </p>
            <Link className="text-link" href="/help#no-data">
              Which data do I need? <ArrowRight size={15} />
            </Link>
          </details>
          <div
            className="source-choices"
            role="group"
            aria-label="Dataset source"
          >
            <button
              onClick={() => setSource("demo")}
              aria-pressed={source === "demo"}
              className={`source-choice ${source === "demo" ? "selected" : ""}`}
            >
              <Sparkles size={22} />
              <strong>Try a synthetic demo</strong>
              <span>Reproducible campaigns. No account needed.</span>
              {source === "demo" && (
                <Check className="choice-check" size={17} />
              )}
            </button>
            <button
              onClick={() => setSource("csv")}
              aria-pressed={source === "csv"}
              className={`source-choice ${source === "csv" ? "selected" : ""}`}
            >
              <Upload size={22} />
              <strong>Bring an advertising CSV</strong>
              <span>Preview, map, validate, then save.</span>
              {source === "csv" && <Check className="choice-check" size={17} />}
            </button>
          </div>
          {source === "demo" ? (
            <Generator onSaved={saved} />
          ) : (
            <Importer onSaved={saved} />
          )}
        </section>
        <aside className="card dark studio-aside">
          <ShieldCheck size={28} />
          <h2>Every number has a source.</h2>
          <ul>
            <li>Demo data and real uploads stay in separate datasets.</li>
            <li>
              Missing revenue stays missing. It cannot power revenue
              recommendations.
            </li>
            <li>Import store orders and costs separately in Commerce.</li>
          </ul>
          <Link className="text-link light-link" href="/help">
            Data principles <ArrowRight size={16} />
          </Link>
        </aside>
      </div>
      <SavedDatasets state={state} refresh={refresh} />
      {state.selected_dataset && (
        <DatasetPreview
          key={state.selected_dataset.id}
          dataset={state.selected_dataset}
        />
      )}
      <details className="large-data-disclosure">
        <summary>
          <Database size={18} />
          Academic datasets · 10K to 10M rows
        </summary>
        <BigDataLab dataOnly />
      </details>
    </div>
  );
}

function Generator({
  onSaved,
}: {
  onSaved: (dataset: Manifest) => Promise<void>;
}) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [enabled, setEnabled] = useState(platforms);
  return (
    <form
      className="data-form"
      onSubmit={async (event) => {
        event.preventDefault();
        setBusy(true);
        setError("");
        const form = new FormData(event.currentTarget);
        try {
          const dataset = await api<Manifest>(
            "/datasets/generate",
            json({
              name: form.get("name"),
              rows: Number(form.get("rows")),
              seed: Number(form.get("seed")),
              start_date: form.get("start_date"),
              end_date: form.get("end_date"),
              platforms: enabled,
            }),
          );
          await onSaved(dataset);
        } catch (reason) {
          setError(message(reason));
        } finally {
          setBusy(false);
        }
      }}
    >
      <span className="source-badge">Synthetic · demo only</span>
      <h3>Explore with a reproducible demo.</h3>
      <p className="section-copy">
        Pakistan-focused campaigns with a spend-driven funnel, seasonality and
        diminishing returns. These are simulated business outcomes.
      </p>
      <fieldset disabled={busy}>
        <div className="form-grid">
          <label>
            Dataset name
            <input
              name="name"
              defaultValue="Pakistan campaign demo"
              required
              maxLength={100}
            />
          </label>
          <label>
            Record count
            <select aria-label="Record count" name="rows" defaultValue="10000">
              <option value="1000">1,000 · quick sample</option>
              <option value="10000">10,000 · standard demo</option>
            </select>
          </label>
          <label>
            Random seed
            <input
              type="number"
              name="seed"
              defaultValue={42}
              min={0}
              max={4294967295}
              required
            />
          </label>
          <div className="form-hint">
            The same seed and settings reproduce the same rows.
          </div>
          <label>
            Start date
            <input
              type="date"
              name="start_date"
              defaultValue="2026-01-01"
              required
            />
          </label>
          <label>
            End date
            <input
              type="date"
              name="end_date"
              defaultValue="2026-03-31"
              required
            />
          </label>
        </div>
        <div className="field-label">Platforms</div>
        <div className="platform-choices">
          {platforms.map((platform) => (
            <label key={platform} className="check-pill">
              <input
                type="checkbox"
                checked={enabled.includes(platform)}
                onChange={() =>
                  setEnabled((current) =>
                    current.includes(platform)
                      ? current.filter((value) => value !== platform)
                      : [...current, platform],
                  )
                }
              />
              {platform}
            </label>
          ))}
        </div>
        <p className="form-hint">
          Use 7–366 days. Generate larger academic datasets below or in Big Data
          Lab.
        </p>
        <button
          className="button primary"
          disabled={!enabled.length || busy}
          type="submit"
        >
          <Sparkles size={17} />
          {busy ? "Generating and validating…" : "Generate demo"}
        </button>
      </fieldset>
      {busy && (
        <p role="status" className="form-hint">
          Generating rows and saving the dataset. Please keep this page open.
        </p>
      )}
      {error && <Notice error text={error} />}
    </form>
  );
}

function Importer({
  onSaved,
}: {
  onSaved: (dataset: Manifest) => Promise<void>;
}) {
  const input = useRef<HTMLInputElement>(null);
  const [profile, setProfile] = useState("generic");
  const [stage, setStage] = useState<Stage | null>(null);
  const [options, setOptions] = useState<ImportOptions>(initialOptions);
  const [report, setReport] = useState<Report | null>(null);
  const [busy, setBusy] = useState("");
  const [error, setError] = useState("");
  function update(update: Partial<ImportOptions>) {
    const hints =
      report?.reporting_hints ||
      (stage && hintsForMapping(stage, options.mapping));
    setOptions((current) => {
      const next = { ...current, ...update, confirmed: false };
      for (const field of [
        "conversion_definition",
        "attribution_window",
      ] as const) {
        const changed =
          update.mapping &&
          (update.mapping[field] !== current.mapping[field] ||
            (field === "conversion_definition" &&
              update.mapping.conversions !== current.mapping.conversions));
        if (changed && hints?.[field].status === "detected")
          next[field] = "unspecified";
        const nextHints = stage && hintsForMapping(stage, next.mapping);
        if (changed && nextHints?.[field].status === "detected")
          next[field] = nextHints[field].value || "unspecified";
      }
      return next;
    });
    setReport(null);
  }
  async function upload(file?: File) {
    if (!file) return;
    if (
      file.size > 10 * 1024 * 1024 ||
      !file.name.toLowerCase().endsWith(".csv")
    ) {
      setError("Choose a UTF-8 CSV no larger than 10 MiB.");
      return;
    }
    setBusy("Reading your CSV…");
    setError("");
    setReport(null);
    try {
      if (stage)
        await api(`/imports/${stage.token}`, { method: "DELETE" }).catch(
          () => undefined,
        );
      const preview = await api<Stage>(
        `/imports/preview?${new URLSearchParams({ filename: file.name, profile })}`,
        { method: "POST", headers: { "Content-Type": "text/csv" }, body: file },
      );
      setStage(preview);
      setOptions({
        ...initialOptions,
        name: file.name.replace(/\.csv$/i, ""),
        mapping: preview.suggested_mapping,
        conversion_definition:
          preview.reporting_hints?.conversion_definition.status === "detected"
            ? preview.reporting_hints.conversion_definition.value ||
              "unspecified"
            : "unspecified",
        attribution_window:
          preview.reporting_hints?.attribution_window.status === "detected"
            ? preview.reporting_hints.attribution_window.value || "unspecified"
            : "unspecified",
        original_currency:
          preview.detected_currencies.length === 1
            ? preview.detected_currencies[0]
            : "PKR",
      });
    } catch (reason) {
      setStage(null);
      setError(message(reason));
    } finally {
      setBusy("");
    }
  }
  return (
    <div className="data-form">
      <span className="source-badge">Authorized campaign report</span>
      <h3>Preview before you save.</h3>
      <p className="section-copy">
        CSV only · UTF-8 · up to 10 MiB / 100,000 rows. Daily or weekly campaign
        observations, not store orders. Unmapped personal fields are discarded.
      </p>
      <label>
        Export profile
        <select
          aria-label="Export profile"
          value={profile}
          disabled={!!stage || !!busy}
          onChange={(event) => setProfile(event.target.value)}
        >
          <option value="generic">Generic campaign CSV</option>
          <option value="meta">Meta Ads Manager</option>
          <option value="google">Google Ads</option>
          <option value="tiktok">TikTok Ads Manager</option>
        </select>
      </label>
      <div
        className="upload-zone"
        onDragOver={(event) => event.preventDefault()}
        onDrop={(event) => {
          event.preventDefault();
          if (!busy) void upload(event.dataTransfer.files[0]);
        }}
      >
        <Upload size={24} />
        <strong>Drop a CSV here, or choose a file</strong>
        <input
          ref={input}
          aria-label="Campaign CSV file"
          type="file"
          accept=".csv,text/csv"
          disabled={!!busy}
          onChange={(event) => void upload(event.target.files?.[0])}
        />
      </div>
      <a className="text-link" href="/api/v1/templates/campaign.csv" download>
        <ArrowDownToLine size={16} />
        Download a labelled synthetic sample
      </a>
      {stage && (
        <>
          <div className="import-stage-title">
            <strong>{stage.filename}</strong>
            <span>{number(stage.row_count)} rows · Preview only</span>
          </div>
          {stage.warnings.map((warning) => (
            <Notice key={warning} text={warning} />
          ))}
          <details>
            <summary>Inspect uploaded rows before mapping</summary>
            <RawTable
              rows={stage.preview}
              columns={stage.columns}
              label="Uploaded CSV preview, first 20 rows"
            />
          </details>
          <fieldset disabled={!!busy}>
            <div className="mapping-header">
              <h3>Map your columns</h3>
              <p>
                Blank metric fields stay missing. Platform can use an explicit
                default.
              </p>
            </div>
            <div className="mapping-grid">
              {fields.slice(0, 8).map((field) => (
                <label key={field}>
                  {field.replaceAll("_", " ")}
                  {["date", "campaign"].includes(field) ? " *" : ""}
                  <select
                    aria-label={`Map ${field.replaceAll("_", " ")}`}
                    value={options.mapping[field] || ""}
                    onChange={(event) =>
                      update({
                        mapping: {
                          ...options.mapping,
                          [field]: event.target.value,
                        },
                      })
                    }
                  >
                    <option value="">Not in this file</option>
                    {stage.columns.map((column) => (
                      <option key={column} value={column}>
                        {column}
                      </option>
                    ))}
                  </select>
                  {stage.mapping_details[field] && (
                    <span className="form-hint">
                      {stage.mapping_details[field].status === "automatic"
                        ? "Detected"
                        : "Review"}
                      : {stage.mapping_details[field].reason}.
                      {stage.mapping_details[field].candidates
                        .map(
                          (c) =>
                            ` ${c.column} (${Math.round(c.confidence * 100)}% mapping confidence)`,
                        )
                        .join(";")}
                    </span>
                  )}
                </label>
              ))}
            </div>
            <details className="optional-mapping">
              <summary>Optional audience, IDs & attribution columns</summary>
              <div className="mapping-grid">
                {fields.slice(8).map((field) => (
                  <label key={field}>
                    {field.replaceAll("_", " ")}
                    <select
                      aria-label={`Map ${field.replaceAll("_", " ")}`}
                      value={options.mapping[field] || ""}
                      onChange={(event) =>
                        update({
                          mapping: {
                            ...options.mapping,
                            [field]: event.target.value,
                          },
                        })
                      }
                    >
                      <option value="">Not in this file</option>
                      {stage.columns.map((column) => (
                        <option key={column} value={column}>
                          {column}
                        </option>
                      ))}
                    </select>
                  </label>
                ))}
              </div>
            </details>
            <div className="form-grid import-options">
              <label>
                Dataset name
                <input
                  value={options.name}
                  onChange={(event) => update({ name: event.target.value })}
                  maxLength={100}
                />
              </label>
              <label>
                Default platform
                <select
                  aria-label="Default platform"
                  value={options.default_platform || ""}
                  onChange={(event) =>
                    update({ default_platform: event.target.value || null })
                  }
                >
                  <option value="">No default · use mapped field</option>
                  {platforms.map((platform) => (
                    <option key={platform}>{platform}</option>
                  ))}
                </select>
              </label>
              <label>
                Original currency
                <input
                  value={options.original_currency}
                  maxLength={3}
                  onChange={(event) =>
                    update({
                      original_currency: event.target.value.toUpperCase(),
                      exchange_rate:
                        event.target.value.toUpperCase() === "PKR"
                          ? null
                          : options.exchange_rate,
                    })
                  }
                />
              </label>
              <label>
                PKR per 1 {options.original_currency}
                <input
                  type="number"
                  min="0.000001"
                  step="any"
                  value={
                    options.original_currency === "PKR"
                      ? 1
                      : (options.exchange_rate ?? "")
                  }
                  disabled={options.original_currency === "PKR"}
                  onChange={(event) =>
                    update({
                      exchange_rate: event.target.value
                        ? Number(event.target.value)
                        : null,
                    })
                  }
                  placeholder="Verified exchange rate"
                />
              </label>
              <label>
                Date format
                <select
                  aria-label="Date format"
                  value={options.date_format}
                  onChange={(event) =>
                    update({ date_format: event.target.value })
                  }
                >
                  <option value="auto">
                    Detect safely · confirm ambiguous dates
                  </option>
                  <option value="%G-W%V">ISO week · 2026-W43</option>
                  <option value="%Y-%m-%d">YYYY-MM-DD</option>
                  <option value="%d/%m/%Y">DD/MM/YYYY</option>
                  <option value="%m/%d/%Y">MM/DD/YYYY</option>
                </select>
              </label>
              <label>
                Reporting period
                <select
                  aria-label="Reporting period"
                  value={options.date_granularity}
                  onChange={(event) =>
                    update({ date_granularity: event.target.value })
                  }
                >
                  <option value="auto">Detect from date column</option>
                  <option value="daily">Daily observations</option>
                  <option value="weekly">
                    Weekly totals · never split into days
                  </option>
                </select>
              </label>
              <label>
                Data type
                <select
                  aria-label="Data type"
                  value={String(options.is_synthetic)}
                  onChange={(event) =>
                    update({ is_synthetic: event.target.value === "true" })
                  }
                >
                  <option value="false">Authorized advertiser export</option>
                  <option value="true">Synthetic / test fixture</option>
                </select>
              </label>
            </div>
            <section
              className="reporting-import"
              aria-label="Understand the report results"
            >
              <h3>Help us understand the results</h3>
              <p>
                We use reporting rules found in the file. Answer what you know;
                you can review analytics even if you’re unsure.
              </p>
              <ReportingQuestions
                key={stage.token}
                conversion={options.conversion_definition}
                window={options.attribution_window}
                hints={
                  report?.reporting_hints ||
                  hintsForMapping(stage, options.mapping)
                }
                onChange={(field, value) => update({ [field]: value })}
              />
            </section>
            <p className="form-hint">
              The currency rate applies to both spend and attributed revenue.
              Use the report’s actual rules for training; “I’m not sure yet”
              keeps forecasting unavailable.
            </p>
            <label className="checkbox-line">
              <input
                type="checkbox"
                checked={options.drop_duplicates}
                onChange={(event) =>
                  update({ drop_duplicates: event.target.checked })
                }
              />
              Remove exact duplicate rows
            </label>
            <label className="checkbox-line">
              <input
                type="checkbox"
                checked={options.exclude_invalid}
                onChange={(event) =>
                  update({ exclude_invalid: event.target.checked })
                }
              />
              Explicitly exclude invalid rows after reviewing their count
            </label>
            <button
              className="button secondary"
              type="button"
              disabled={!!busy || !options.name.trim()}
              onClick={async () => {
                setBusy("Validating mapped rows…");
                setError("");
                try {
                  const validated = await api<Report>(
                    `/imports/${stage.token}/validate`,
                    json(options),
                  );
                  setReport(validated);
                  setOptions((current) => ({
                    ...current,
                    conversion_definition:
                      !hasAnswer(current.conversion_definition) &&
                      validated.reporting_hints?.conversion_definition
                        .status === "detected"
                        ? validated.reporting_hints.conversion_definition
                            .value || current.conversion_definition
                        : current.conversion_definition,
                    attribution_window:
                      !hasAnswer(current.attribution_window) &&
                      validated.reporting_hints?.attribution_window.status ===
                        "detected"
                        ? validated.reporting_hints.attribution_window.value ||
                          current.attribution_window
                        : current.attribution_window,
                  }));
                } catch (reason) {
                  setError(message(reason));
                } finally {
                  setBusy("");
                }
              }}
            >
              <ShieldCheck size={17} />
              Validate mapping
            </button>
          </fieldset>
          {report && (
            <section
              className="validation-report"
              aria-label="Validation report"
            >
              <div className="card-heading">
                <h3>
                  {report.can_import
                    ? "Ready for your review"
                    : "A few things need attention"}
                </h3>
                <span className="source-badge">
                  {report.is_synthetic ? "Synthetic CSV" : "Advertiser CSV"}
                </span>
              </div>
              <p className="form-hint">
                Reporting period: {report.date_granularity}.{" "}
                {report.date_granularity === "weekly"
                  ? "Each weekly total stays one record; no daily observations are invented."
                  : "Each row keeps its observation date."}
              </p>
              <div className="validation-counts">
                <span>
                  <strong>{number(report.valid_rows)}</strong> valid rows
                </span>
                <span>
                  <strong>{number(report.invalid_rows)}</strong> invalid rows
                </span>
                <span>
                  <strong>{number(report.duplicate_rows)}</strong> exact
                  duplicates
                </span>
              </div>
              {report.errors.length > 0 && (
                <ul className="validation-errors">
                  {report.errors.map((issue, i) => (
                    <li key={i}>
                      <strong>
                        {issue.field} · {number(issue.count)} rows
                      </strong>
                      <p>
                        {issue.message}
                        {issue.rows.length
                          ? ` CSV rows: ${issue.rows.join(", ")}.`
                          : ""}
                      </p>
                    </li>
                  ))}
                </ul>
              )}
              {report.warnings.length > 0 && (
                <ul className="warning-list">
                  {report.warnings.map((warning) => (
                    <li key={warning}>{warning}</li>
                  ))}
                </ul>
              )}
              <details>
                <summary>Normalized preview & field coverage</summary>
                <Coverage dataset={report} />
                <RawTable
                  rows={report.preview}
                  label="Normalized CSV preview, first 20 valid rows"
                />
              </details>
              {report.can_import && (
                <>
                  <label className="checkbox-line confirmation">
                    <input
                      type="checkbox"
                      checked={options.confirmed}
                      onChange={(event) =>
                        setOptions((current) => ({
                          ...current,
                          confirmed: event.target.checked,
                        }))
                      }
                    />
                    I have permission to use this data and have reviewed its
                    source, currency, mapping, reporting rules, duplicates and
                    any exclusions.
                  </label>
                  <button
                    className="button primary"
                    disabled={!!busy || !options.confirmed}
                    onClick={async () => {
                      setBusy("Saving your validated dataset…");
                      setError("");
                      try {
                        const dataset = await api<Manifest>(
                          `/imports/${stage.token}/commit`,
                          json(options),
                        );
                        setStage(null);
                        setReport(null);
                        await onSaved(dataset);
                      } catch (reason) {
                        setError(message(reason));
                      } finally {
                        setBusy("");
                      }
                    }}
                  >
                    <Check size={17} />
                    Confirm and save dataset
                  </button>
                </>
              )}
            </section>
          )}
        </>
      )}
      {busy && <Loading text={busy} />}
      {error && <Notice error text={error} />}
    </div>
  );
}

function SavedDatasets({
  state,
  refresh,
}: {
  state: WorkspaceState;
  refresh: () => Promise<void>;
}) {
  const [busy, setBusy] = useState("");
  const [error, setError] = useState("");
  const [deleting, setDeleting] = useState<Manifest | null>(null);
  return (
    <section className="card saved-datasets">
      <div className="card-heading">
        <h2>Saved datasets</h2>
        <span className="source-badge">{state.dataset_count} datasets</span>
      </div>
      <p className="section-copy">
        Select one source at a time. These reports are never combined
        automatically.
      </p>
      {!state.datasets.length ? (
        <div className="datasets-empty">
          <Database size={24} />
          <p>
            No saved datasets yet. Generate a demo or validate an advertising
            CSV above.
          </p>
        </div>
      ) : (
        <div className="dataset-list">
          {state.datasets.map((dataset) => (
            <div key={dataset.id} className="dataset-row">
              <div>
                <strong>{dataset.name}</strong>
                <p>
                  {sourceLabel(dataset)} · {number(dataset.rows)} rows · PKR ·{" "}
                  {dataset.date_start} to {dataset.date_end}
                </p>
              </div>
              <div className="dataset-actions">
                <button
                  className="button secondary"
                  disabled={!!busy || dataset.id === state.selected_dataset_id}
                  onClick={async () => {
                    setBusy(dataset.id);
                    setError("");
                    try {
                      await api(
                        "/workspace/dataset",
                        json({ dataset_id: dataset.id }, "PUT"),
                      );
                      await refresh();
                    } catch (reason) {
                      setError(message(reason));
                    } finally {
                      setBusy("");
                    }
                  }}
                >
                  {dataset.id === state.selected_dataset_id ? (
                    <>
                      <Check size={15} />
                      Selected
                    </>
                  ) : (
                    "Select dataset"
                  )}
                </button>
                <a
                  className="icon-button"
                  aria-label={`Export ${dataset.name}`}
                  href={`/api/v1/datasets/${dataset.id}/export`}
                  download
                >
                  <ArrowDownToLine size={17} />
                </a>
                <button
                  className="icon-button"
                  aria-label={`Delete ${dataset.name}`}
                  disabled={!!busy}
                  onClick={() => setDeleting(dataset)}
                >
                  <Trash2 size={17} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
      {error && !deleting && <Notice error text={error} />}
      <Dialog.Root
        open={!!deleting}
        onOpenChange={(open) => {
          if (!open && !busy) setDeleting(null);
        }}
      >
        <Dialog.Portal>
          <Dialog.Overlay className="drawer-overlay" />
          <Dialog.Content className="confirm-dialog">
            <Dialog.Title>Delete this local dataset?</Dialog.Title>
            <Dialog.Description>
              {deleting?.name}, its saved campaign rows, and any models and
              holdout evidence trained from it will be removed from this
              workspace. Commerce comparisons and profit plans using it are also
              removed. Finish or cancel its active training first. The original
              file on your computer is unchanged.
            </Dialog.Description>
            {error && <Notice error text={error} />}
            <div className="confirm-actions">
              <Dialog.Close className="button secondary" disabled={!!busy}>
                Keep dataset
              </Dialog.Close>
              <button
                className="button danger-button"
                disabled={!!busy}
                onClick={async () => {
                  if (!deleting) return;
                  setBusy(deleting.id);
                  setError("");
                  try {
                    await api(`/datasets/${deleting.id}`, { method: "DELETE" });
                    await refresh();
                    setDeleting(null);
                  } catch (reason) {
                    setError(message(reason));
                  } finally {
                    setBusy("");
                  }
                }}
              >
                Delete dataset
              </button>
            </div>
            <Dialog.Close
              className="icon-button drawer-close"
              aria-label="Close delete confirmation"
              disabled={!!busy}
            >
              <X size={18} />
            </Dialog.Close>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </section>
  );
}
