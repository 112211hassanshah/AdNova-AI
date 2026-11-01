"use client";

import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, Database, ShieldCheck } from "lucide-react";
import {
  api,
  coveragePercent,
  message,
  number,
  sourceLabel,
  type Manifest,
  type RecordRow,
} from "@/lib/data";

export function Notice({
  text,
  error = false,
}: {
  text: string;
  error?: boolean;
}) {
  return (
    <div
      className={`notice ${error ? "error" : "success-notice"}`}
      role={error ? "alert" : "status"}
    >
      <p>{text}</p>
    </div>
  );
}
export function Loading({ text = "Loading your dataset…" }: { text?: string }) {
  return (
    <div className="loading-state" role="status">
      <span className="loading-dot" />
      {text}
    </div>
  );
}
export function RawTable({
  rows,
  columns,
  label,
}: {
  rows: RecordRow[];
  columns?: string[];
  label: string;
}) {
  const fields = columns || Object.keys(rows[0] || {});
  return (
    <div className="table-scroll" role="region" aria-label={label} tabIndex={0}>
      <table className="data-table raw-table">
        <caption className="sr-only">{label}</caption>
        <thead>
          <tr>
            {fields.map((field) => (
              <th scope="col" key={field}>
                {field.replaceAll("_", " ")}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i}>
              {fields.map((field) => (
                <td key={field}>
                  {row[field] === null || row[field] === undefined ? (
                    <span className="muted">Not available</span>
                  ) : (
                    String(row[field])
                  )}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      {!rows.length && <p className="empty-table">No rows in this preview.</p>}
    </div>
  );
}
export function Coverage({ dataset }: { dataset: Pick<Manifest, "coverage"> }) {
  return (
    <dl className="coverage-list">
      {Object.entries(dataset.coverage).map(([field, ratio]) => (
        <div key={field}>
          <dt>{field.replaceAll("_", " ")}</dt>
          <dd>
            {coveragePercent(ratio)}{" "}
            <span className="coverage-track">
              <span style={{ width: `${ratio * 100}%` }} />
            </span>
          </dd>
        </div>
      ))}
    </dl>
  );
}
export function Provenance({ dataset }: { dataset: Manifest }) {
  return (
    <details className="provenance">
      <summary>
        <ShieldCheck size={16} />
        Source, coverage & assumptions
      </summary>
      <dl className="metadata-grid">
        <div>
          <dt>Dataset source</dt>
          <dd>
            {sourceLabel(dataset)} · {dataset.source.replaceAll("_", " ")}
          </dd>
        </div>
        <div>
          <dt>Revenue origin</dt>
          <dd>{dataset.revenue_source.replaceAll("_", " ")}</dd>
        </div>
        <div>
          <dt>Observation grain</dt>
          <dd>Daily campaign + platform + audience/device segment</dd>
        </div>
        <div>
          <dt>Currency</dt>
          <dd>
            {dataset.original_currency} → PKR · rate{" "}
            {number(dataset.exchange_rate, 4)}
          </dd>
        </div>
        <div>
          <dt>Conversions</dt>
          <dd>{dataset.conversion_definition}</dd>
        </div>
        <div>
          <dt>Attribution window</dt>
          <dd>{dataset.attribution_window}</dd>
        </div>
        <div>
          <dt>Saved at</dt>
          <dd>{new Date(dataset.imported_at).toLocaleString()}</dd>
        </div>
        {dataset.original_filename && (
          <div>
            <dt>Original filename</dt>
            <dd>{dataset.original_filename}</dd>
          </div>
        )}
        {dataset.import_profile && (
          <div>
            <dt>Import profile</dt>
            <dd>{dataset.import_profile}</dd>
          </div>
        )}
        {dataset.seed !== null && (
          <div>
            <dt>Random seed</dt>
            <dd>{dataset.seed}</dd>
          </div>
        )}
        <div>
          <dt>Workspace</dt>
          <dd>Local single user</dd>
        </div>
      </dl>
      <Coverage dataset={dataset} />
      {dataset.warnings.length > 0 && (
        <ul className="warning-list">
          {dataset.warnings.map((warning) => (
            <li key={warning}>{warning}</li>
          ))}
        </ul>
      )}
    </details>
  );
}
export function DatasetPreview({ dataset }: { dataset: Manifest }) {
  const [page, setPage] = useState(1);
  const [result, setResult] = useState<{
    page: number;
    rows: RecordRow[];
    columns: string[];
    total: number;
  } | null>(null);
  const [error, setError] = useState("");
  const [retry, setRetry] = useState(0);
  useEffect(() => {
    const controller = new AbortController();
    api<{ page: number; rows: RecordRow[]; columns: string[]; total: number }>(
      `/datasets/${dataset.id}/preview?page=${page}`,
      { signal: controller.signal },
    )
      .then((data) => {
        setResult(data);
        setError("");
      })
      .catch((reason) => {
        if (!controller.signal.aborted) setError(message(reason));
      });
    return () => controller.abort();
  }, [dataset.id, page, retry]);
  return (
    <section className="card preview-card">
      <div className="card-heading">
        <h2>
          <Database size={18} />
          Selected dataset preview
        </h2>
        <span className="source-badge">{number(dataset.rows)} rows</span>
      </div>
      <p className="section-copy">
        {dataset.name} · {sourceLabel(dataset)} · PKR · {dataset.date_start} to{" "}
        {dataset.date_end}
      </p>
      {error ? (
        <>
          <Notice error text={error} />
          <button
            className="button secondary"
            onClick={() => setRetry((value) => value + 1)}
          >
            Retry preview
          </button>
        </>
      ) : !result || result.page !== page ? (
        <Loading />
      ) : (
        <>
          <RawTable
            columns={result.columns}
            rows={result.rows}
            label="Saved campaign dataset preview"
          />
          <div className="pagination">
            <span>
              Page {page} of {Math.max(1, Math.ceil(result.total / 20))} · 20
              rows per page
            </span>
            <div>
              <button
                className="icon-button"
                aria-label="Previous preview page"
                disabled={page === 1}
                onClick={() => setPage(page - 1)}
              >
                <ChevronLeft size={17} />
              </button>
              <button
                className="icon-button"
                aria-label="Next preview page"
                disabled={page * 20 >= result.total}
                onClick={() => setPage(page + 1)}
              >
                <ChevronRight size={17} />
              </button>
            </div>
          </div>
        </>
      )}
      <Provenance dataset={dataset} />
    </section>
  );
}
