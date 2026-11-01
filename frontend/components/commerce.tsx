"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import {
  ArrowDownToLine,
  FlaskConical,
  Plus,
  ShoppingBag,
  Trash2,
  X,
} from "lucide-react";
import { api, json, message, number, type Manifest } from "@/lib/data";
import type {
  CampaignChoice,
  CommerceMeta,
  CommerceReport,
  CommerceState,
  MerchantMapping,
  ReconcileInput,
} from "@/lib/commerce";
import { CommerceImport } from "./commerce-import";
import { CommerceResults } from "./commerce-report";
import { Loading, Notice, RawTable } from "./data-primitives";

export function Commerce({
  ads,
  refreshWorkspace,
}: {
  ads: Manifest[];
  refreshWorkspace: () => Promise<void>;
}) {
  const [state, setState] = useState<CommerceState | null>(null);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [busy, setBusy] = useState(false);
  const [retry, setRetry] = useState(0);
  const [reportId, setReportId] = useState("");
  const [deleting, setDeleting] = useState<CommerceMeta | null>(null);
  const deleteReturn = useRef<HTMLButtonElement | null>(null);
  const ordersSelect = useRef<HTMLSelectElement | null>(null);
  const refresh = useCallback(async () => {
    const next = await api<CommerceState>("/commerce");
    setState(next);
    return next;
  }, []);
  useEffect(() => {
    const c = new AbortController();
    api<CommerceState>("/commerce", { signal: c.signal })
      .then(setState)
      .catch((reason) => {
        if (!c.signal.aborted) setError(message(reason));
      });
    return () => c.abort();
  }, [retry]);
  const selected =
    state?.orders.find((meta) => meta.id === state.selected_order_batch_id) ||
    null;
  async function demo(variant: string) {
    setBusy(true);
    setError("");
    setNotice("");
    try {
      const result = await api<{ reconciliation_id: string }>(
        `/commerce/demo?variant=${variant}`,
        json({}),
      );
      await refreshWorkspace();
      await refresh();
      setReportId(result.reconciliation_id);
      setNotice(
        "Fictional commerce fixture imported and reconciled through the actual backend. This is not merchant validation.",
      );
    } catch (reason) {
      setError(message(reason));
    } finally {
      setBusy(false);
    }
  }
  return (
    <div className="commerce-workspace">
      <div className="notice" role="note">
        <ShoppingBag size={20} />
        <p>
          Commerce CSV pilot · store orders, ad reports and attributed sales
          retain separate origins. No Shopify account is connected and no order
          or ad spend is changed.
        </p>
      </div>
      {error && (
        <>
          <Notice error text={error} />
          <button
            className="button secondary"
            disabled={busy}
            onClick={() => {
              setError("");
              setRetry((v) => v + 1);
            }}
          >
            Retry commerce workspace
          </button>
        </>
      )}
      {notice && <Notice text={notice} />}
      <section className="card commerce-demo">
        <div>
          <span className="source-badge">
            <FlaskConical size={14} />
            Fictional examples
          </span>
          <h2>Inspect the numbers before trusting a forecast.</h2>
          <p>
            The small pilot includes multiple items, refunds, cancellations and
            unresolved attribution. The complete history tests the guarded
            profit-planning path.
          </p>
        </div>
        <div className="button-row">
          <button
            className="button primary"
            disabled={busy}
            onClick={() => void demo("pilot")}
          >
            {busy ? "Preparing fixture…" : "Try fictional commerce pilot"}
          </button>
          <button
            className="button secondary"
            disabled={busy}
            onClick={() => void demo("history")}
          >
            Try complete fictional history
          </button>
        </div>
      </section>
      {!state ? (
        <Loading text="Opening your separate commerce workspace…" />
      ) : (
        <>
          <section className="card commerce-source">
            <label>
              Selected orders snapshot
              <select
                aria-label="Selected orders snapshot"
                ref={ordersSelect}
                value={selected?.id || ""}
                disabled={busy}
                onChange={async (event) => {
                  setBusy(true);
                  setReportId("");
                  setError("");
                  try {
                    await api(
                      "/commerce/selection",
                      json(
                        { order_batch_id: event.target.value || null },
                        "PUT",
                      ),
                    );
                    await refresh();
                  } catch (reason) {
                    setError(message(reason));
                  } finally {
                    setBusy(false);
                  }
                }}
              >
                <option value="">No orders snapshot selected</option>
                {state.orders.map((meta) => (
                  <option key={meta.id} value={meta.id}>
                    {meta.name} · {meta.store_id} ·{" "}
                    {meta.is_synthetic ? "Synthetic" : "Imported"}
                  </option>
                ))}
              </select>
            </label>
            {selected && (
              <>
                <p>
                  {selected.store_id} · {selected.orders} unique orders ·{" "}
                  {selected.period_start} to {selected.period_end} ·{" "}
                  {selected.timezone} ·{" "}
                  {selected.is_synthetic
                    ? "Synthetic / simulated"
                    : "Imported CSV"}
                </p>
                <div className="button-row">
                  <a
                    className="button secondary"
                    href={`/api/v1/commerce/snapshots/${selected.id}/export?format=csv`}
                    download
                  >
                    <ArrowDownToLine size={15} />
                    Orders CSV
                  </a>
                  <a
                    className="button secondary"
                    href={`/api/v1/commerce/snapshots/${selected.id}/export`}
                    download
                  >
                    Snapshot JSON
                  </a>
                  <button
                    className="button secondary"
                    onClick={(event) => {
                      deleteReturn.current = event.currentTarget;
                      setDeleting(selected);
                    }}
                  >
                    <Trash2 size={15} />
                    Delete selected orders snapshot
                  </button>
                </div>
              </>
            )}
          </section>
          <details
            className="card commerce-upload-panel"
            open={!state.orders.length}
          >
            <summary>Import orders or optional costs</summary>
            <CommerceImport
              key={selected?.id || "empty"}
              selected={selected}
              onSaved={async (meta) => {
                await refresh();
                setReportId("");
                setNotice(
                  `${meta.name} saved in the separate commerce workspace.`,
                );
              }}
            />
          </details>
          {selected && (
            <>
              <ReconciliationEditor
                key={`${selected.id}:${reportId}`}
                order={selected}
                state={state}
                ads={ads}
                initialReportId={reportId}
                refresh={async () => {
                  await refresh();
                }}
              />
              <details className="card">
                <summary>Saved costs and source details</summary>
                <p>
                  Costs are tied to this orders snapshot; missing categories are
                  not zero. Choose each cost source explicitly in the comparison
                  form.
                </p>
                {state.costs
                  .filter((meta) => meta.order_batch_id === selected.id)
                  .map((meta) => (
                    <div className="commerce-cost-source" key={meta.id}>
                      <span>
                        {meta.name} · {meta.cost_rows} rows · {meta.profile}
                      </span>
                      <button
                        className="button secondary"
                        onClick={(event) => {
                          deleteReturn.current = event.currentTarget;
                          setDeleting(meta);
                        }}
                        aria-label={`Delete costs ${meta.name}`}
                      >
                        <Trash2 size={15} />
                        Delete costs
                      </button>
                    </div>
                  ))}
                {!state.costs.some(
                  (meta) => meta.order_batch_id === selected.id,
                ) && <p>No cost snapshots saved for this orders snapshot.</p>}
                <p>{selected.warnings.join(" ")}</p>
              </details>
            </>
          )}
        </>
      )}
      <Dialog.Root
        open={!!deleting}
        onOpenChange={(open) => {
          if (!open) setDeleting(null);
        }}
      >
        <Dialog.Portal>
          <Dialog.Overlay className="drawer-overlay" />
          <Dialog.Content
            className="methodology-dialog"
            onCloseAutoFocus={(event) => {
              event.preventDefault();
              (deleteReturn.current?.isConnected
                ? deleteReturn.current
                : ordersSelect.current
              )?.focus();
            }}
          >
            <Dialog.Title>Delete this commerce snapshot?</Dialog.Title>
            <Dialog.Description>
              Delete {deleting?.name} and the cost snapshots, reconciliations
              and profit plans derived from it. Your original CSV and
              independent advertising source remain available.
            </Dialog.Description>
            <div className="button-row">
              <Dialog.Close className="button secondary">
                Keep commerce snapshot
              </Dialog.Close>
              <button
                className="button primary"
                disabled={busy}
                onClick={async () => {
                  if (!deleting) return;
                  setBusy(true);
                  setError("");
                  try {
                    await api(`/commerce/snapshots/${deleting.id}`, {
                      method: "DELETE",
                    });
                    setReportId("");
                    setDeleting(null);
                    await refresh();
                    setNotice(
                      "Commerce snapshot and its derived records deleted.",
                    );
                  } catch (reason) {
                    setError(message(reason));
                  } finally {
                    setBusy(false);
                  }
                }}
              >
                Delete commerce snapshot
              </button>
            </div>
            <Dialog.Close
              className="icon-button drawer-close"
              aria-label="Close commerce deletion"
            >
              <X size={20} />
            </Dialog.Close>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </div>
  );
}

function ReconciliationEditor({
  order,
  state,
  ads,
  initialReportId,
  refresh,
}: {
  order: CommerceMeta;
  state: CommerceState;
  ads: Manifest[];
  initialReportId: string;
  refresh: () => Promise<void>;
}) {
  const saved = state.reconciliation.filter(
    (meta) => meta.order_batch_id === order.id,
  );
  const [savedId, setSavedId] = useState(initialReportId || saved[0]?.id || "");
  const [config, setConfig] = useState<ReconcileInput>({
    order_batch_id: order.id,
    ad_dataset_id: "",
    cost_batch_ids: [],
    start_date: order.period_start,
    end_date: order.period_end,
    ad_scope_confirmed: false,
    timezones_confirmed: false,
    mappings_confirmed: false,
    mappings: [],
    attribution_window_days: 7,
    maturity_days: 30,
    include_shipping_income: false,
    reference_net_sales: null,
    reference_eligible_orders: null,
  });
  const [report, setReport] = useState<CommerceReport | null>(null);
  const [campaigns, setCampaigns] = useState<CampaignChoice[]>([]);
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(!!savedId);
  const [error, setError] = useState("");
  const [retry, setRetry] = useState(0);
  const [expanded, setExpanded] = useState(!savedId);
  useEffect(() => {
    if (!savedId) return;
    const controller = new AbortController();
    api<CommerceReport>(`/commerce/snapshots/${savedId}`, {
      signal: controller.signal,
    })
      .then((value) => {
        setReport(value);
        setConfig(value.config);
        setLoading(false);
      })
      .catch((reason) => {
        if (!controller.signal.aborted) {
          setError(message(reason));
          setLoading(false);
        }
      });
    return () => controller.abort();
  }, [savedId, retry]);
  useEffect(() => {
    if (!config.ad_dataset_id) return;
    const controller = new AbortController();
    api<{ campaigns: CampaignChoice[] }>(
      `/commerce/campaigns/${config.ad_dataset_id}`,
      { signal: controller.signal },
    )
      .then((value) => setCampaigns(value.campaigns))
      .catch((reason) => {
        if (!controller.signal.aborted) setError(message(reason));
      });
    return () => controller.abort();
  }, [config.ad_dataset_id]);
  function update(value: Partial<ReconcileInput>) {
    setConfig((old) => ({ ...old, ...value }));
    setReport(null);
    setError("");
  }
  function mapping(index: number, value: Partial<MerchantMapping>) {
    update({
      mappings: config.mappings.map((row, i) =>
        i === index ? { ...row, ...value } : row,
      ),
      mappings_confirmed: false,
    });
  }
  return (
    <>
      {!!saved.length && (
        <section className="card">
          <div className="commerce-report-picker">
            <label>
              Saved reconciliation
              <select
                aria-label="Saved commerce reconciliation"
                value={savedId}
                disabled={busy}
                onChange={(event) => {
                  setSavedId(event.target.value);
                  setReport(null);
                  setLoading(true);
                  setError("");
                }}
              >
                {saved.map((meta) => (
                  <option key={meta.id} value={meta.id}>
                    {meta.start_date} to {meta.end_date} ·{" "}
                    {meta.created_at.slice(0, 19)} · {meta.id.slice(0, 8)}
                  </option>
                ))}
              </select>
            </label>
            <button
              className="button secondary"
              onClick={() => {
                setLoading(true);
                setError("");
                setRetry((v) => v + 1);
              }}
            >
              Restore saved comparison
            </button>
          </div>
        </section>
      )}
      <section className="card commerce-reconcile">
        <details
          open={expanded}
          onToggle={(event) => setExpanded(event.currentTarget.open)}
        >
          <summary>
            Compare orders with a daily or weekly advertising report
          </summary>
          <p>
            Select a report dedicated to this store. Comparisons are
            order-cohort snapshots, with platform revenue kept separate.
            Selecting an ad source here does not change Overview.
          </p>
          <div className="form-grid">
            <label>
              Advertising report
              <select
                aria-label="Commerce advertising report"
                disabled={busy}
                value={config.ad_dataset_id}
                onChange={(event) => {
                  setCampaigns([]);
                  update({
                    ad_dataset_id: event.target.value,
                    ad_scope_confirmed: false,
                    timezones_confirmed: false,
                    mappings: [],
                    mappings_confirmed: false,
                  });
                }}
              >
                <option value="">Select an independent ad report</option>
                {ads.map((source) => (
                  <option key={source.id} value={source.id}>
                    {source.name} ·{" "}
                    {source.is_synthetic ? "Synthetic" : "Advertiser CSV"} ·{" "}
                    {source.date_granularity}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Comparison start
              <input
                type="date"
                value={config.start_date}
                disabled={busy}
                onChange={(event) => update({ start_date: event.target.value })}
              />
            </label>
            <label>
              Comparison end
              <input
                type="date"
                value={config.end_date}
                disabled={busy}
                onChange={(event) => update({ end_date: event.target.value })}
              />
            </label>
            <label>
              Maximum tagged-touch lag (days)
              <input
                type="number"
                min={0}
                max={90}
                value={config.attribution_window_days}
                disabled={busy}
                onChange={(event) =>
                  update({
                    attribution_window_days: Number(event.target.value),
                  })
                }
              />
            </label>
            <label>
              Refund maturity before forecasting (days)
              <input
                type="number"
                min={0}
                max={90}
                value={config.maturity_days}
                disabled={busy}
                onChange={(event) =>
                  update({ maturity_days: Number(event.target.value) })
                }
              />
            </label>
          </div>
          <fieldset className="commerce-cost-choices">
            <legend>Optional cost snapshots · choose explicitly</legend>
            {state.costs
              .filter((meta) => meta.order_batch_id === order.id)
              .map((meta) => (
                <label className="commerce-check" key={meta.id}>
                  <input
                    type="checkbox"
                    checked={config.cost_batch_ids.includes(meta.id)}
                    disabled={busy}
                    onChange={(event) =>
                      update({
                        cost_batch_ids: event.target.checked
                          ? [...config.cost_batch_ids, meta.id]
                          : config.cost_batch_ids.filter(
                              (id) => id !== meta.id,
                            ),
                      })
                    }
                  />
                  {meta.name} · {meta.profile}
                </label>
              ))}
            {!state.costs.some((meta) => meta.order_batch_id === order.id) && (
              <p>
                No costs yet. Import per-order expenses or SKU costs above;
                descriptive sales comparisons still work.
              </p>
            )}
          </fieldset>
          <details>
            <summary>
              Confirm UTM-to-campaign evidence when identifiers need a mapping
            </summary>
            <p>
              Use a merchant-verified association. The app never infers a paid
              channel from a domain or campaign name.
            </p>
            {config.mappings.map((row, index) => (
              <div className="commerce-mapping" key={index}>
                <label>
                  UTM source
                  <input
                    value={row.utm_source}
                    aria-label={`UTM source ${index + 1}`}
                    onChange={(event) =>
                      mapping(index, { utm_source: event.target.value })
                    }
                  />
                </label>
                <label>
                  UTM campaign
                  <input
                    value={row.utm_campaign}
                    aria-label={`UTM campaign ${index + 1}`}
                    onChange={(event) =>
                      mapping(index, { utm_campaign: event.target.value })
                    }
                  />
                </label>
                <label>
                  Verified paid campaign
                  <select
                    aria-label={`Verified paid campaign ${index + 1}`}
                    value={JSON.stringify({
                      platform: row.platform,
                      account_id: row.account_id,
                      campaign_id: row.campaign_id,
                    })}
                    onChange={(event) =>
                      mapping(
                        index,
                        JSON.parse(event.target.value) as CampaignChoice,
                      )
                    }
                  >
                    {campaigns.map((candidate) => (
                      <option
                        key={JSON.stringify(candidate)}
                        value={JSON.stringify(candidate)}
                      >
                        {candidate.platform} · {candidate.campaign_id} ·{" "}
                        {candidate.account_id}
                      </option>
                    ))}
                  </select>
                </label>
                <button
                  className="button secondary"
                  onClick={() =>
                    update({
                      mappings: config.mappings.filter((_, i) => i !== index),
                      mappings_confirmed: false,
                    })
                  }
                >
                  Remove mapping
                </button>
              </div>
            ))}
            <button
              className="button secondary"
              disabled={!campaigns.length || busy}
              onClick={() =>
                update({
                  mappings: [
                    ...config.mappings,
                    { ...campaigns[0], utm_source: "", utm_campaign: "" },
                  ],
                  mappings_confirmed: false,
                })
              }
            >
              <Plus size={15} />
              Add verified UTM mapping
            </button>
            {!!config.mappings.length && (
              <label className="commerce-check">
                <input
                  type="checkbox"
                  checked={config.mappings_confirmed}
                  onChange={(event) =>
                    update({ mappings_confirmed: event.target.checked })
                  }
                />
                I verified these UTM associations against campaign evidence
              </label>
            )}
          </details>
          <details>
            <summary>Store reference totals and shipping definition</summary>
            <p>
              Optional reference figures must use this same order-cohort,
              currency, eligibility policy and snapshot date. A discrepancy
              blocks profit forecasting.
            </p>
            <div className="form-grid">
              <label>
                Reference merchandise net sales (PKR)
                <input
                  type="number"
                  step="0.01"
                  min={0}
                  value={config.reference_net_sales ?? ""}
                  onChange={(event) =>
                    update({
                      reference_net_sales: event.target.value
                        ? Number(event.target.value)
                        : null,
                    })
                  }
                />
              </label>
              <label>
                Reference eligible paid orders
                <input
                  type="number"
                  step={1}
                  min={0}
                  value={config.reference_eligible_orders ?? ""}
                  onChange={(event) =>
                    update({
                      reference_eligible_orders: event.target.value
                        ? Number(event.target.value)
                        : null,
                    })
                  }
                />
              </label>
            </div>
            <label className="commerce-check">
              <input
                type="checkbox"
                checked={config.include_shipping_income}
                onChange={(event) =>
                  update({ include_shipping_income: event.target.checked })
                }
              />
              Include verified shipping charged minus shipping refunds in
              contribution
            </label>
          </details>
          <label className="commerce-check">
            <input
              type="checkbox"
              checked={config.ad_scope_confirmed}
              disabled={busy}
              onChange={(event) =>
                update({ ad_scope_confirmed: event.target.checked })
              }
            />
            This advertising report belongs only to the selected store
          </label>
          <label className="commerce-check">
            <input
              type="checkbox"
              checked={config.timezones_confirmed}
              disabled={busy}
              onChange={(event) =>
                update({ timezones_confirmed: event.target.checked })
              }
            />
            I verified comparable store-local dates and reporting timezones
          </label>
          <button
            className="button primary"
            disabled={
              busy ||
              !config.ad_dataset_id ||
              !config.ad_scope_confirmed ||
              !config.timezones_confirmed ||
              (!!config.mappings.length && !config.mappings_confirmed)
            }
            onClick={async () => {
              setBusy(true);
              setReport(null);
              setError("");
              try {
                const result = await api<CommerceReport>(
                  "/commerce/reconciliations",
                  json(config),
                );
                setReport(result);
                setSavedId(result.manifest.id);
                await refresh();
                setExpanded(false);
              } catch (reason) {
                setError(message(reason));
              } finally {
                setBusy(false);
              }
            }}
          >
            {busy
              ? "Reconciling actual records…"
              : "Save commerce reconciliation"}
          </button>
        </details>
      </section>
      {error && <Notice error text={error} />}
      {loading && <Loading text="Restoring the saved commerce comparison…" />}
      {report && <CommerceResults key={report.manifest.id} report={report} />}
      <details className="card">
        <summary>Read the normalized order preview</summary>
        <OrderPreview identifier={order.id} />
      </details>
    </>
  );
}

function OrderPreview({ identifier }: { identifier: string }) {
  const [data, setData] = useState<{
    rows: Record<string, string | number | boolean | null>[];
    total: number;
  } | null>(null);
  const [page, setPage] = useState(1);
  const [error, setError] = useState("");
  useEffect(() => {
    const c = new AbortController();
    api<{
      rows: Record<string, string | number | boolean | null>[];
      total: number;
    }>(`/commerce/snapshots/${identifier}/rows?page=${page}`, {
      signal: c.signal,
    })
      .then(setData)
      .catch((reason) => {
        if (!c.signal.aborted) setError(message(reason));
      });
    return () => c.abort();
  }, [identifier, page]);
  return error ? (
    <Notice error text={error} />
  ) : !data ? (
    <Loading text="Loading bounded pseudonymous orders…" />
  ) : (
    <>
      <p>
        {number(data.total)} normalized orders · monetary fields use paisa in
        this inspection table; JSON/CSV exports state the unit.
      </p>
      <RawTable
        label="Normalized order inspection"
        rows={data.rows.map((row) =>
          Object.fromEntries(
            Object.entries(row).filter(([key]) =>
              [
                "order_key",
                "date",
                "financial_status",
                "eligible",
                "gross",
                "discounts",
                "merchandise_refunds",
                "net_sales",
              ].includes(key),
            ),
          ),
        )}
      />
      <div className="button-row">
        <button
          className="button secondary"
          disabled={page <= 1}
          onClick={() => {
            setData(null);
            setPage((v) => v - 1);
          }}
        >
          Previous order preview
        </button>
        <span>Page {page}</span>
        <button
          className="button secondary"
          disabled={page * 20 >= data.total}
          onClick={() => {
            setData(null);
            setPage((v) => v + 1);
          }}
        >
          Next order preview
        </button>
      </div>
    </>
  );
}
