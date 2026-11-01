"use client";

import { useId, useState } from "react";
import Link from "next/link";
import { CircleHelp, ShieldCheck } from "lucide-react";
import { api, json, message, type Manifest } from "@/lib/data";
import {
  hasAnswer,
  type ReportingField,
  type ReportingHints,
  type ReportingSetup,
} from "@/lib/reporting";
import { Notice } from "./data-primitives";

const choices: Record<ReportingField, [string, string][]> = {
  conversion_definition: [
    ["purchases", "Purchases / paid orders"],
    ["leads", "Leads / enquiries"],
    ["sign-ups", "Sign-ups / registrations"],
  ],
  attribution_window: [
    ["same-day click", "On the same day as an ad click"],
    ["7-day click", "Within 7 days after an ad click"],
    ["30-day click", "Within 30 days after an ad click"],
    [
      "7-day click / 1-day view",
      "Within 7 days after a click or 1 day after a view",
    ],
  ],
};
const labels: Record<ReportingField, string> = {
  conversion_definition: "What does a result count in this report?",
  attribution_window:
    "How long after an ad interaction can a result be counted?",
};
export function ReportingQuestions({
  conversion,
  window,
  hints,
  onChange,
}: {
  conversion: string;
  window: string;
  hints?: ReportingHints;
  onChange: (field: ReportingField, value: string) => void;
}) {
  const id = useId();
  const [custom, setCustom] = useState<
    Partial<Record<ReportingField, boolean>>
  >({});
  const values = {
    conversion_definition: conversion,
    attribution_window: window,
  };
  return (
    <div className="reporting-questions">
      {(
        ["conversion_definition", "attribution_window"] as ReportingField[]
      ).map((field) => {
        const value = values[field];
        const evidence = hints?.[field];
        const customMode = custom[field] && evidence?.status !== "detected";
        const presets = choices[field];
        const extra =
          evidence?.value && !presets.some(([key]) => key === evidence.value)
            ? evidence.value
            : null;
        const fromReport =
          hasAnswer(value) &&
          !presets.some(([key]) => key === value) &&
          !custom[field]
            ? value
            : null;
        return (
          <div className="reporting-question" key={field}>
            <label htmlFor={`${id}-${field}`}>{labels[field]}</label>
            <select
              id={`${id}-${field}`}
              aria-describedby={`${id}-${field}-help`}
              value={
                customMode
                  ? "__other__"
                  : hasAnswer(value)
                    ? value
                    : "unspecified"
              }
              disabled={evidence?.status === "detected"}
              onChange={(e) => {
                const other = e.target.value === "__other__";
                setCustom({ ...custom, [field]: other });
                onChange(field, other ? "unspecified" : e.target.value);
              }}
            >
              <option value="unspecified">I’m not sure yet</option>
              {presets.map(([key, label]) => (
                <option value={key} key={key}>
                  {label}
                </option>
              ))}
              {extra && (
                <option value={extra}>
                  {evidence?.status === "partial"
                    ? "Found in some rows"
                    : "Recorded in the report"}
                  : {extra}
                </option>
              )}
              {fromReport && fromReport !== extra && (
                <option value={fromReport}>
                  Recorded answer: {fromReport}
                </option>
              )}
              <option value="__other__">
                Another answer — copy it from the report
              </option>
            </select>
            {customMode && (
              <label className="reporting-custom">
                {field === "conversion_definition"
                  ? "Copy the result name from your report"
                  : "Copy the timing rule from your report"}
                <input
                  maxLength={100}
                  value={hasAnswer(value) ? value : ""}
                  onChange={(e) => onChange(field, e.target.value)}
                />
              </label>
            )}
            <p id={`${id}-${field}-help`} className="reporting-help">
              {field === "conversion_definition"
                ? "A column called conversions can mean purchases, leads or registrations. We only detect a specific meaning when the file states it."
                : "Use the rule used to make this report. A 7-day rule credits results within 7 days after the specified interaction; it is separate from the delay before labels settle."}
            </p>
            {evidence && (
              <p
                className={`reporting-evidence ${evidence.status === "detected" ? "" : "needs-answer"}`}
              >
                {evidence.status === "detected" ? (
                  <ShieldCheck size={15} />
                ) : (
                  <CircleHelp size={15} />
                )}
                <span>
                  {evidence.status === "detected"
                    ? `Found: ${evidence.value}. `
                    : evidence.status === "partial"
                      ? "Please confirm this rule for the whole report. "
                      : ""}
                  {evidence.evidence}
                </span>
              </p>
            )}
          </div>
        );
      })}
      <details className="reporting-help-panel">
        <summary>
          <CircleHelp size={16} /> I’m not sure — where do I find this?
        </summary>
        <p>
          Look in the exported report or ask the person who supplied it. These
          settings may be called <strong>conversion action</strong>,{" "}
          <strong>attribution setting</strong> or{" "}
          <strong>attribution window</strong>. Don’t choose an example just to
          enable training.
        </p>
        <p>
          Missing reporting rules cannot be recovered from spend and revenue
          numbers alone. You can still explore the data and return to training
          later.
        </p>
      </details>
    </div>
  );
}

export function SavedReportingSetup({
  dataset,
  setup,
  onSaved,
}: {
  dataset: Manifest;
  setup: ReportingSetup;
  onSaved: () => Promise<void>;
}) {
  const [conversion, setConversion] = useState(
    setup.fields.conversion_definition.value || "unspecified",
  );
  const [window, setWindow] = useState(
    setup.fields.attribution_window.value || "unspecified",
  );
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  async function save() {
    setBusy(true);
    setError("");
    try {
      await api(
        `/datasets/${dataset.id}/reporting-setup`,
        json({
          conversion_definition: conversion,
          attribution_window: window,
          confirmed: true,
        }),
      );
      await onSaved();
    } catch (reason) {
      setError(message(reason));
    } finally {
      setBusy(false);
    }
  }
  return (
    <section className="reporting-setup" aria-label="Complete reporting setup">
      <div className="card-heading">
        <h3>Let’s make sense of your report.</h3>
        <span className="source-badge">Two quick questions</span>
      </div>
      <p>
        Your numbers are available. We need to check what the reported results
        mean before learning from them.
      </p>
      {dataset.is_synthetic && (
        <p>
          For a generated sample, use the rules that were used to create it.
          Results stay labelled as simulated.
        </p>
      )}
      <fieldset disabled={busy}>
        <ReportingQuestions
          conversion={conversion}
          window={window}
          hints={setup.fields}
          onChange={(field, value) =>
            field === "conversion_definition"
              ? setConversion(value)
              : setWindow(value)
          }
        />
      </fieldset>
      {error && <Notice error text={error} />}
      <div className="reporting-actions">
        <button
          type="button"
          className="button secondary"
          disabled={
            busy || !hasAnswer(conversion) || !hasAnswer(window) || setup.mixed
          }
          onClick={save}
        >
          {busy ? "Saving your answers…" : "Save my answers"}
        </button>
        <Link className="text-link" href="/">
          Explore my data for now
        </Link>
      </div>
      <p className="reporting-help">
        Saving selects a new version of this report with your answers. Previous
        training results keep their original reporting rules.
      </p>
    </section>
  );
}
