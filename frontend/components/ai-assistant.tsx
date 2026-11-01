"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  CheckCircle2,
  KeyRound,
  RefreshCw,
  Send,
  ShieldCheck,
  Sparkles,
  Trash2,
} from "lucide-react";
import {
  aiApi,
  type AIExplanation,
  type AIStatus,
  type AISummary,
  type ReportKind,
} from "@/lib/ai";
import { json, message, type Manifest } from "@/lib/data";
import { Loading, Notice } from "./data-primitives";

export function AIAssistant({ dataset }: { dataset: Manifest | null }) {
  const [status, setStatus] = useState<AIStatus | null>(null);
  const [statusError, setStatusError] = useState("");
  const [key, setKey] = useState("");
  const [kind, setKind] = useState<ReportKind>("performance");
  const [snapshot, setSnapshot] = useState<AISummary | null>(null);
  const [summaryError, setSummaryError] = useState("");
  const [approved, setApproved] = useState(false);
  const [explanation, setExplanation] = useState<AIExplanation | null>(null);
  const [busy, setBusy] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [retry, setRetry] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    aiApi<AIStatus>("/status", { signal: controller.signal })
      .then(setStatus)
      .catch((reason) => {
        if (!controller.signal.aborted) setStatusError(message(reason));
      });
    return () => controller.abort();
  }, [retry]);
  useEffect(() => {
    if (!dataset) return;
    const controller = new AbortController();
    aiApi<AISummary>(`/summary?kind=${kind}`, { signal: controller.signal })
      .then(setSnapshot)
      .catch((reason) => {
        if (!controller.signal.aborted) setSummaryError(message(reason));
      });
    return () => controller.abort();
  }, [dataset, kind, retry]);

  function refreshSummary() {
    setSnapshot(null);
    setSummaryError("");
    setApproved(false);
    setExplanation(null);
    setError("");
    setRetry((value) => value + 1);
  }
  async function action(name: string, task: () => Promise<void>) {
    setBusy(name);
    setError("");
    setNotice("");
    try {
      await task();
    } catch (reason) {
      setError(message(reason));
    } finally {
      setBusy("");
      aiApi<AIStatus>("/status")
        .then(setStatus)
        .catch(() => {});
    }
  }
  return (
    <div className="ai-assistant">
      <div className="notice" role="note">
        <ShieldCheck size={20} />
        <p>
          Optional NVIDIA explanations. Your calculations and trained models
          stay in Python. Nothing is sent until you choose a test or approve a
          summary.
        </p>
      </div>
      <div className="ai-top-grid">
        <section className="card ai-settings">
          <div className="card-heading">
            <h2>
              <KeyRound size={18} /> NVIDIA access
            </h2>
            <span className="source-badge">Optional</span>
          </div>
          {statusError ? (
            <>
              <Notice error text={statusError} />
              <button
                className="button secondary"
                onClick={() => {
                  setStatusError("");
                  setRetry((v) => v + 1);
                }}
              >
                Retry AI settings
              </button>
            </>
          ) : !status ? (
            <Loading text="Checking local AI settings…" />
          ) : (
            <>
              <p className="ai-connection" role="status">
                <CheckCircle2 size={18} />
                {!status.configured
                  ? "No API key configured"
                  : status.verified
                    ? "NVIDIA API responded successfully"
                    : "API key configured · access not verified"}
              </p>
              <p className="form-hint">
                {status.model}
                {status.checked_at
                  ? ` · Last checked ${new Date(status.checked_at).toLocaleString()}`
                  : ""}
              </p>
              {status.last_error && <Notice error text={status.last_error} />}
              {status.key_source === "environment" ? (
                <p>
                  The launch environment manages this key. Update NVIDIA_API_KEY
                  there.
                </p>
              ) : (
                <form
                  className="data-form"
                  onSubmit={(event) => {
                    event.preventDefault();
                    const value = key;
                    setKey("");
                    void action("save", async () => {
                      setStatus(
                        await aiApi<AIStatus>(
                          "/key",
                          json({ api_key: value }, "PUT"),
                        ),
                      );
                      setNotice(
                        "Key saved privately on this computer. Test access before using it.",
                      );
                    });
                  }}
                >
                  <label>
                    NVIDIA API key
                    <input
                      type="password"
                      value={key}
                      autoComplete="off"
                      spellCheck={false}
                      onChange={(event) => setKey(event.target.value)}
                      placeholder="nvapi-…"
                      aria-describedby="ai-key-help"
                      disabled={!!busy}
                      required
                    />
                  </label>
                  <p id="ai-key-help" className="form-hint">
                    Stored in a private local file, outside source control. The
                    saved key is never returned to your browser. Replace a key
                    if you shared it in a chat.
                  </p>
                  <div className="button-row">
                    <button
                      className="button primary"
                      disabled={!!busy || !key.trim()}
                      type="submit"
                    >
                      {busy === "save"
                        ? "Saving key…"
                        : status.configured
                          ? "Replace key"
                          : "Save key"}
                    </button>
                    {status.configured && (
                      <button
                        className="button secondary"
                        type="button"
                        disabled={!!busy}
                        onClick={() =>
                          void action("remove", async () => {
                            setStatus(
                              await aiApi<AIStatus>("/key", {
                                method: "DELETE",
                              }),
                            );
                            setExplanation(null);
                            setNotice(
                              "Saved key removed from this computer. Revoke it separately in NVIDIA to invalidate it.",
                            );
                          })
                        }
                      >
                        <Trash2 size={15} /> Remove saved key
                      </button>
                    )}
                  </div>
                </form>
              )}
              <button
                className="button secondary"
                disabled={!status.configured || !!busy}
                onClick={() =>
                  void action("test", async () => {
                    setStatus(await aiApi<AIStatus>("/test", json({})));
                    setNotice(
                      "NVIDIA replied to a connection check. No report data was sent.",
                    );
                  })
                }
              >
                <RefreshCw size={15} />
                {busy === "test" ? "Testing NVIDIA…" : "Test NVIDIA access"}
              </button>
            </>
          )}
        </section>
        <aside className="card dark ai-context">
          <Sparkles size={26} />
          <h2>A clearer explanation of your evidence.</h2>
          <p>
            Ask NVIDIA to explain an existing report. Exact figures remain in
            the local reference; AI cannot create a forecast or change an
            allocation.
          </p>
          <p>
            Requests leave this computer for NVIDIA’s hosted service. Only the
            previewed qualitative summary is sent, with no numerical financial
            values, raw CSV rows, filenames, customer details or campaign names.
          </p>
          <p>
            Free endpoint access is for prototyping and may be rate-limited or
            unavailable. Local analytics, training and planning continue to
            work.
          </p>
        </aside>
      </div>
      {notice && <Notice text={notice} />}
      {error && <Notice error text={error} />}
      {!dataset ? (
        <section className="card empty-analysis">
          <h2>Choose a campaign report first.</h2>
          <p>
            Add or select a dataset to preview a report summary. Configuring the
            optional AI provider does not create campaign data.
          </p>
          <Link className="button primary" href="/data-studio">
            Open Data Studio
          </Link>
        </section>
      ) : (
        <section className="card ai-report">
          <div className="card-heading">
            <h2>Explain a saved report</h2>
            <span className="source-badge">
              {dataset.is_synthetic ? "Synthetic data" : "Advertiser CSV"} · PKR
            </span>
          </div>
          <p>
            Uses the entire selected dataset. Overview filters do not apply.
            Model and budget explanations refer to the latest saved result for
            this source.
          </p>
          <div className="ai-report-controls">
            <label>
              Report to explain
              <select
                aria-label="Report to explain"
                value={kind}
                disabled={!!busy}
                onChange={(event) => {
                  setKind(event.target.value as ReportKind);
                  setSnapshot(null);
                  setSummaryError("");
                  setApproved(false);
                  setExplanation(null);
                  setError("");
                }}
              >
                <option value="performance">
                  Campaign performance · all observations
                </option>
                <option value="model">Latest completed model evaluation</option>
                <option value="budget">Latest saved budget plan</option>
              </select>
            </label>
            <button
              className="button secondary"
              disabled={!!busy}
              onClick={refreshSummary}
            >
              <RefreshCw size={15} />
              Refresh summary
            </button>
          </div>
          {summaryError ? (
            <Notice error text={summaryError} />
          ) : !snapshot ? (
            <Loading text="Preparing a local summary. Nothing is sent to NVIDIA…" />
          ) : (
            <>
              <details className="ai-preview">
                <summary>Exact local figures · kept on this computer</summary>
                <pre tabIndex={0} aria-label="Local numeric reference">
                  {JSON.stringify(snapshot.local_reference, null, 2)}
                </pre>
              </details>
              <details className="ai-preview" open>
                <summary>Review the exact summary sent to NVIDIA</summary>
                <pre tabIndex={0} aria-label="NVIDIA summary preview">
                  {JSON.stringify(snapshot.summary, null, 2)}
                </pre>
              </details>
              <label className="ai-approval">
                <input
                  type="checkbox"
                  checked={approved}
                  disabled={!!busy}
                  onChange={(event) => setApproved(event.target.checked)}
                />
                <span>
                  Send this summary to NVIDIA for an AI-generated explanation.
                </span>
              </label>
              <button
                className="button primary"
                disabled={!status?.configured || !approved || !!busy}
                onClick={() =>
                  void action("explain", async () => {
                    setExplanation(null);
                    const result = await aiApi<AIExplanation>(
                      "/explain",
                      json({
                        kind,
                        summary_sha256: snapshot.summary_sha256,
                        approved,
                      }),
                    );
                    setExplanation(result);
                    setApproved(false);
                  })
                }
              >
                <Send size={16} />
                {busy === "explain"
                  ? "Waiting for NVIDIA…"
                  : "Explain this report"}
              </button>
              {!status?.configured && (
                <p className="form-hint">
                  Add an API key above to enable the optional explanation.
                </p>
              )}
            </>
          )}
        </section>
      )}
      {busy === "explain" && (
        <Loading text="NVIDIA is generating an explanation. Your local report is unchanged…" />
      )}
      {explanation && (
        <section className="card ai-answer" aria-labelledby="ai-answer-title">
          <div className="card-heading">
            <h2 id="ai-answer-title">AI-generated explanation</h2>
            <span className="source-badge">
              {explanation.is_synthetic
                ? "Simulated evidence"
                : "Reported evidence"}
            </span>
          </div>
          <Notice text={explanation.notice} />
          <p className="ai-answer-text">{explanation.text}</p>
          <p className="form-hint">
            {explanation.provider} · {explanation.model} ·{" "}
            {new Date(explanation.generated_at).toLocaleString()}
          </p>
        </section>
      )}
    </div>
  );
}
