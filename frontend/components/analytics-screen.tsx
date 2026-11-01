"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  useSyncExternalStore,
} from "react";
import Link from "next/link";
import {
  ArrowDownToLine,
  ArrowRight,
  ArrowUpDown,
  BarChart3,
  ChevronLeft,
  ChevronRight,
  Filter,
  ShieldCheck,
  TrendingUp,
  Wallet,
} from "lucide-react";
import {
  Area,
  AreaChart,
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
  compact,
  coveragePercent,
  message,
  money,
  number,
  sourceLabel,
  type Aggregate,
  type Analytics,
  type Manifest,
  type Totals,
} from "@/lib/data";
import { Loading, Notice, Provenance } from "./data-primitives";

type Filters = Record<string, string>;
const filterKeys = [
  "start_date",
  "end_date",
  "platform",
  "campaign",
  "city",
  "age",
  "gender",
  "device",
];
function subscribe(listener: () => void) {
  window.addEventListener("storage", listener);
  window.addEventListener("adwise-filters", listener);
  return () => {
    window.removeEventListener("storage", listener);
    window.removeEventListener("adwise-filters", listener);
  };
}
function useSavedFilters(datasetId: string) {
  const key = `adwise:filters:${datasetId}`;
  const snapshot = useSyncExternalStore(
    subscribe,
    useCallback(() => localStorage.getItem(key) || "{}", [key]),
    () => "{}",
  );
  const filters = useMemo(() => {
    try {
      const value = JSON.parse(snapshot);
      return Object.fromEntries(
        Object.entries(value).filter(
          ([key, item]) => filterKeys.includes(key) && typeof item === "string",
        ),
      ) as Filters;
    } catch {
      return {};
    }
  }, [snapshot]);
  const save = useCallback(
    (next: Filters) => {
      localStorage.setItem(key, JSON.stringify(next));
      window.dispatchEvent(new Event("adwise-filters"));
    },
    [key],
  );
  return [filters, save] as const;
}

export function AnalyticsScreen({
  dataset,
  campaigns = false,
  modelStatus = "not_trained",
}: {
  dataset: Manifest;
  campaigns?: boolean;
  modelStatus?: "not_trained" | "trained" | "validated";
}) {
  const [filters, saveFilters] = useSavedFilters(dataset.id);
  const [page, setPage] = useState(1);
  const [group, setGroup] = useState("campaign");
  const [sort, setSort] = useState("revenue");
  const [direction, setDirection] = useState("desc");
  const [retry, setRetry] = useState(0);
  const filterKey = JSON.stringify(filters);
  const query = new URLSearchParams({
    ...filters,
    group_by: group,
    page: String(page),
    page_size: campaigns ? "10" : "5",
    sort,
    direction,
    _refresh: String(retry),
  }).toString();
  const [result, setResult] = useState<{ key: string; data: Analytics } | null>(
    null,
  );
  const [failure, setFailure] = useState<{ key: string; text: string } | null>(
    null,
  );
  useEffect(() => {
    const controller = new AbortController();
    api<Analytics>(`/datasets/${dataset.id}/analytics?${query}`, {
      signal: controller.signal,
    })
      .then((data) => setResult({ key: query, data }))
      .catch((reason) => {
        if (!controller.signal.aborted)
          setFailure({ key: query, text: message(reason) });
      });
    return () => controller.abort();
  }, [dataset.id, query]);
  const data = result?.key === query ? result.data : null;
  function apply(next: Filters) {
    setPage(1);
    saveFilters(next);
  }
  const context = `${sourceLabel(dataset)} · PKR · ${filters.start_date || dataset.date_start} to ${filters.end_date || dataset.date_end}${Object.entries(
    filters,
  )
    .filter(([key, value]) => value && !key.includes("date"))
    .map(([key, value]) => ` · ${key}: ${value}`)
    .join("")}`;
  return (
    <div className="analytics-screen">
      {campaigns ? (
        <FiltersForm
          key={filterKey}
          dataset={dataset}
          filters={filters}
          apply={apply}
        />
      ) : (
        <details className="overview-filters">
          <summary>
            <Filter size={16} />
            Refine period, platform & audience
            <span>
              {Object.keys(filters).length
                ? `${Object.keys(filters).length} active`
                : "All observations"}
            </span>
          </summary>
          <FiltersForm
            key={filterKey}
            dataset={dataset}
            filters={filters}
            apply={apply}
          />
        </details>
      )}
      <div className="analysis-context">
        <span>{context}</span>
        <a
          className="button secondary"
          href={`/api/v1/datasets/${dataset.id}/export?${new URLSearchParams(filters)}`}
          download
        >
          <ArrowDownToLine size={16} />
          Export filtered CSV
        </a>
      </div>
      {dataset.is_synthetic && (
        <p className="data-disclaimer">
          <ShieldCheck size={15} />
          Synthetic demo · simulated outcomes, not real business performance.
        </p>
      )}
      {!dataset.data_ready_for_revenue && (
        <Notice text="This dataset has incomplete financial fields or reporting definitions. Available metrics still work; revenue forecasting remains gated. Review source and coverage below." />
      )}
      {failure?.key === query ? (
        <>
          <Notice error text={failure.text} />
          <button
            className="button secondary"
            onClick={() => setRetry((value) => value + 1)}
          >
            Retry analytics
          </button>
        </>
      ) : !data ? (
        <Loading text="Calculating performance from your selected dataset…" />
      ) : (
        <>
          <div className="metrics-row live-metrics">
            {[
              {
                name: "Your ad spend",
                key: "spend",
                value: money(data.totals.spend),
                icon: Wallet,
              },
              {
                name: "Attributed revenue",
                key: "revenue",
                value: money(data.totals.revenue),
                icon: TrendingUp,
              },
              {
                name: "Return on ad spend",
                key: "roas",
                value:
                  data.totals.roas === null
                    ? "Not available"
                    : `${number(data.totals.roas, 2)}×`,
                icon: BarChart3,
              },
            ].map((metric) => (
              <section className="card metric" key={metric.key}>
                <div className="card-heading">
                  <h2>{metric.name}</h2>
                  <metric.icon size={18} />
                </div>
                <div
                  data-testid={`metric-${metric.key}`}
                  className={`live-metric-value ${metric.value === "Not available" ? "unavailable-value" : ""}`}
                >
                  {metric.value}
                </div>
                <p>
                  {metric.value === "Not available"
                    ? "Missing inputs or zero denominator"
                    : `${number(data.totals.rows)} selected daily observations`}
                </p>
              </section>
            ))}
          </div>
          {!data.totals.rows ? (
            <section className="card empty-analysis">
              <Filter size={28} />
              <h2>No observations match these filters.</h2>
              <p>
                Try a different period or clear your filters to return to the
                full dataset.
              </p>
              <button className="button primary" onClick={() => apply({})}>
                Clear filters
              </button>
            </section>
          ) : (
            <>
              <div className="analytics-bento">
                <section className="card spotlight dark trend-card">
                  <div className="card-heading">
                    <h2>
                      <BarChart3 size={18} />
                      Spend & attributed revenue
                    </h2>
                    <span className="dark-pill">
                      {data.trend_grain === "day" ? "Daily" : "Weekly"} · PKR
                    </span>
                  </div>
                  <p className="chart-explanation">
                    Compare revenue reported against advertising cost over the
                    same period. This does not measure profit or causal uplift.
                  </p>
                  <TrendChart data={data.trend} />
                  <ChartTable
                    rows={data.trend}
                    caption={`Spend and revenue by ${data.trend_grain}`}
                  />
                </section>
                {!campaigns ? (
                  <section className="card spotlight lime analytics-next">
                    <span className="eyebrow">YOUR NEXT STEP</span>
                    <h2>
                      {dataset.data_ready_for_revenue
                        ? modelStatus === "validated"
                          ? "Give your budget its next step."
                          : "See what’s driving the results."
                        : "Understand the gaps first."}
                    </h2>
                    <p>
                      {dataset.data_ready_for_revenue
                        ? modelStatus === "validated"
                          ? "Use your accepted model to explore a constrained budget plan. Review estimates and assumptions before acting."
                          : "Train a revenue model and compare it with a historical baseline in ML Studio. Inspect validation before planning a budget."
                        : "Your reports are still useful. Check which fields and attribution definitions are missing before planning revenue."}
                    </p>
                    <Link
                      className="button primary"
                      href={
                        dataset.data_ready_for_revenue
                          ? modelStatus === "validated"
                            ? "/budget-optimizer"
                            : "/ml-studio"
                          : "/data-studio"
                      }
                    >
                      {dataset.data_ready_for_revenue
                        ? modelStatus === "validated"
                          ? "Plan a budget"
                          : "Open ML Studio"
                        : "Review dataset"}
                      <ArrowRight size={17} />
                    </Link>
                    <p className="form-hint">
                      Revenue model: {modelStatus.replaceAll("_", " ")} · Budget
                      plans are advisory and checked separately.
                    </p>
                  </section>
                ) : (
                  <section className="card platform-card">
                    <h2>Across your platforms</h2>
                    <p className="chart-explanation">
                      Use spend and revenue together. Historical ROAS alone does
                      not identify the best next allocation.
                    </p>
                    <PlatformChart data={data.platforms} />
                    <ChartTable
                      rows={data.platforms}
                      caption="Platform spend, revenue and ROAS"
                    />
                  </section>
                )}
                {!campaigns && (
                  <section className="card platform-card">
                    <h2>Across your platforms</h2>
                    <p className="chart-explanation">
                      One source, five possible channels. Select a platform in
                      filters to drill into its campaigns.
                    </p>
                    <PlatformChart data={data.platforms} />
                    <ChartTable
                      rows={data.platforms}
                      caption="Platform spend, revenue and ROAS"
                    />
                  </section>
                )}
                <section
                  className={`card ${campaigns ? "secondary-kpis-wide" : "data-health-card"}`}
                >
                  <div className="card-heading">
                    <h2>
                      {campaigns
                        ? "The rest of the picture"
                        : "Data you can inspect"}
                    </h2>
                    <ShieldCheck size={19} />
                  </div>
                  {campaigns ? (
                    <div className="secondary-kpis">
                      {[
                        ["impressions", "Impressions", ""],
                        ["clicks", "Clicks", ""],
                        ["conversions", "Conversions", ""],
                        ["ctr", "Click-through rate", "%"],
                        ["cpc", "Cost per click", "PKR"],
                        ["cpa", "Cost per acquisition", "PKR"],
                        ["cvr", "Conversion rate", "%"],
                      ].map(([key, label, unit]) => (
                        <div key={key}>
                          <span>{label}</span>
                          <strong>{metricText(data.totals, key, unit)}</strong>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <>
                      <div className="trust-row">
                        <span>Dataset source</span>
                        <strong>{sourceLabel(dataset)}</strong>
                      </div>
                      <div className="trust-row">
                        <span>Selected observations</span>
                        <strong>{number(data.totals.rows)}</strong>
                      </div>
                      <div className="trust-row">
                        <span>Conversions</span>
                        <strong>{number(data.totals.conversions, 2)}</strong>
                      </div>
                      <div className="trust-row">
                        <span>Revenue coverage</span>
                        <strong>
                          {coveragePercent(data.totals.coverage.revenue)}
                        </strong>
                      </div>
                      <p className="chart-explanation">
                        Revenue is{" "}
                        {dataset.is_synthetic
                          ? "synthetically generated"
                          : "platform-reported attributed value"}
                        , not profit or unique store sales.
                      </p>
                    </>
                  )}
                </section>
              </div>
              <section className="card campaign-table-card">
                <div className="table-toolbar">
                  <h2>
                    {campaigns
                      ? "Performance breakdown"
                      : "Campaign performance"}
                  </h2>
                  {campaigns && (
                    <label>
                      Group by
                      <select
                        aria-label="Group performance by"
                        value={group}
                        onChange={(event) => {
                          setGroup(event.target.value);
                          setPage(1);
                        }}
                      >
                        {[
                          "campaign",
                          "platform",
                          "city",
                          "age",
                          "gender",
                          "device",
                        ].map((field) => (
                          <option
                            key={field}
                            value={field}
                            disabled={
                              ["city", "age", "gender", "device"].includes(
                                field,
                              ) && !dataset.coverage[field]
                            }
                          >
                            {field.replaceAll("_", " ")}
                          </option>
                        ))}
                      </select>
                    </label>
                  )}
                </div>
                <p className="chart-explanation">
                  Rates use totals across the selected observations. Not
                  available means missing inputs or a zero denominator.
                </p>
                <div
                  className="table-scroll"
                  role="region"
                  aria-label="Campaign performance table"
                  tabIndex={0}
                >
                  <table className="data-table">
                    <caption className="sr-only">
                      {context}. Grouped by {group}.
                    </caption>
                    <thead>
                      <tr>
                        {[
                          ["name", group],
                          ["spend", "Spend (PKR)"],
                          ["revenue", "Revenue (PKR)"],
                          ["roas", "ROAS"],
                          ["conversions", "Conversions"],
                          ...(campaigns
                            ? [
                                ["ctr", "CTR (%)"],
                                ["cpc", "CPC (PKR)"],
                                ["cpa", "CPA (PKR)"],
                                ["cvr", "CVR (%)"],
                              ]
                            : []),
                        ].map(([key, label]) => (
                          <th
                            key={key}
                            scope="col"
                            aria-sort={
                              sort === key
                                ? direction === "asc"
                                  ? "ascending"
                                  : "descending"
                                : "none"
                            }
                          >
                            <button
                              onClick={() => {
                                setSort(key);
                                setDirection(
                                  sort === key && direction === "desc"
                                    ? "asc"
                                    : "desc",
                                );
                                setPage(1);
                              }}
                            >
                              <span>{label}</span>
                              <ArrowUpDown size={12} />
                            </button>
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {data.table.map((row) => (
                        <tr key={row.name}>
                          <th scope="row">
                            {group === "campaign" && !filters.campaign ? (
                              <Link
                                href="/campaigns"
                                onClick={() =>
                                  apply({ ...filters, campaign: row.name })
                                }
                              >
                                {row.name}
                                <ArrowRight size={13} />
                              </Link>
                            ) : (
                              row.name
                            )}
                          </th>
                          {[
                            "spend",
                            "revenue",
                            "roas",
                            "conversions",
                            ...(campaigns ? ["ctr", "cpc", "cpa", "cvr"] : []),
                          ].map((key) => (
                            <td key={key}>
                              {metricText(
                                row,
                                key,
                                key === "roas"
                                  ? "×"
                                  : ["ctr", "cvr"].includes(key)
                                    ? "%"
                                    : "",
                              )}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="pagination">
                  <span>
                    {number(data.table_total)} {group} groups · Page {page} of{" "}
                    {Math.max(1, Math.ceil(data.table_total / data.page_size))}
                  </span>
                  <div>
                    <button
                      className="icon-button"
                      aria-label="Previous performance page"
                      disabled={page === 1}
                      onClick={() => setPage((value) => value - 1)}
                    >
                      <ChevronLeft size={17} />
                    </button>
                    <button
                      className="icon-button"
                      aria-label="Next performance page"
                      disabled={page * data.page_size >= data.table_total}
                      onClick={() => setPage((value) => value + 1)}
                    >
                      <ChevronRight size={17} />
                    </button>
                  </div>
                </div>
              </section>
            </>
          )}
          <section className="card">
            <Provenance dataset={dataset} />
          </section>
        </>
      )}
    </div>
  );
}

function metricText(row: Totals, key: string, unit = "") {
  const value = row[key as keyof Totals];
  if (typeof value !== "number") return "Not available";
  return `${unit === "PKR" ? "Rs. " : ""}${number(value, key === "impressions" || key === "clicks" ? 0 : 2)}${unit === "%" || unit === "×" ? unit : ""}`;
}

function FiltersForm({
  dataset,
  filters,
  apply,
}: {
  dataset: Manifest;
  filters: Filters;
  apply: (filters: Filters) => void;
}) {
  const [draft, setDraft] = useState(filters);
  const [invalid, setInvalid] = useState("");
  const field = (key: string) => (
    <label key={key}>
      {key.replaceAll("_", " ")}
      {key.includes("date") ? (
        <input
          type="date"
          name={key}
          value={draft[key] || ""}
          onChange={(event) =>
            setDraft((current) => ({ ...current, [key]: event.target.value }))
          }
        />
      ) : (
        <select
          aria-label={key.replaceAll("_", " ")}
          name={key}
          value={draft[key] || ""}
          onChange={(event) =>
            setDraft((current) => ({ ...current, [key]: event.target.value }))
          }
          disabled={
            ["city", "age", "gender", "device"].includes(key) &&
            !dataset.coverage[key]
          }
        >
          <option value="">
            {["city", "age", "gender", "device"].includes(key) &&
            !dataset.coverage[key]
              ? "No reported coverage"
              : "All"}
          </option>
          {(dataset.options[key] || []).map((value) => (
            <option key={value}>{value}</option>
          ))}
        </select>
      )}
    </label>
  );
  return (
    <form
      className="card filters-card"
      onSubmit={(event) => {
        event.preventDefault();
        if (
          draft.start_date &&
          draft.end_date &&
          draft.start_date > draft.end_date
        ) {
          setInvalid("Start date must not be after end date.");
          return;
        }
        setInvalid("");
        apply(
          Object.fromEntries(
            Object.entries(draft).filter(([, value]) => value),
          ),
        );
      }}
    >
      <div className="filters-primary">
        {["start_date", "end_date", "platform"].map(field)}
        <button className="button primary" type="submit">
          <Filter size={16} />
          Apply filters
        </button>
        <button
          className="button secondary"
          type="button"
          onClick={() => {
            setDraft({});
            setInvalid("");
            apply({});
          }}
        >
          Reset filters
        </button>
      </div>
      <details className="advanced-filters">
        <summary>
          Campaign & audience filters{" "}
          {Object.keys(filters).some(
            (key) => !["start_date", "end_date", "platform"].includes(key),
          )
            ? "· active"
            : ""}
        </summary>
        <div className="form-grid">
          {["campaign", "city", "age", "gender", "device"].map(field)}
        </div>
      </details>
      {invalid && (
        <p role="alert" className="field-error">
          {invalid}
        </p>
      )}
    </form>
  );
}

function TrendChart({ data }: { data: Aggregate[] }) {
  return (
    <div
      className="chart-wrap dark-chart"
      role="group"
      aria-label="Spending and attributed revenue trend; values available in the table below"
    >
      <ResponsiveContainer width="100%" height={260} minWidth={0}>
        <AreaChart
          data={data}
          accessibilityLayer
          margin={{ left: 0, right: 12, top: 15, bottom: 0 }}
        >
          <CartesianGrid
            vertical={false}
            stroke="#394036"
            strokeDasharray="3 5"
          />
          <XAxis
            dataKey="name"
            tickFormatter={(value) => String(value).slice(5)}
            stroke="#c2c9be"
            tick={{ fontSize: 11 }}
            minTickGap={30}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            width={50}
            tickFormatter={compact}
            stroke="#c2c9be"
            tick={{ fontSize: 11 }}
            tickLine={false}
            axisLine={false}
          />
          <Tooltip
            contentStyle={{
              background: "#242725",
              color: "#fff",
              border: "1px solid #626861",
              borderRadius: 12,
            }}
            formatter={(value) =>
              money(typeof value === "number" ? value : null)
            }
          />
          <Legend wrapperStyle={{ fontSize: 12 }} />
          <Area
            name="Ad spend"
            dataKey="spend"
            stroke="#f3f4ef"
            fill="#f3f4ef"
            fillOpacity={0.03}
            strokeWidth={2}
            isAnimationActive={false}
          />
          <Area
            name="Attributed revenue"
            dataKey="revenue"
            stroke="#d9fa65"
            fill="#d9fa65"
            fillOpacity={0.09}
            strokeWidth={2}
            isAnimationActive={false}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
function PlatformChart({ data }: { data: Aggregate[] }) {
  return (
    <div
      className="chart-wrap"
      role="group"
      aria-label="Platform spend and attributed revenue; values available in the table below"
    >
      <ResponsiveContainer width="100%" height={260} minWidth={0}>
        <BarChart
          data={data}
          accessibilityLayer
          margin={{ left: 0, right: 8, top: 15 }}
        >
          <CartesianGrid vertical={false} stroke="#e5e8e0" />
          <XAxis
            dataKey="name"
            stroke="#626861"
            tick={{ fontSize: 11 }}
            interval={0}
            tickFormatter={(value) =>
              String(value) === "Instagram"
                ? "Insta."
                : String(value) === "Facebook"
                  ? "FB"
                  : String(value)
            }
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            tickFormatter={compact}
            width={48}
            stroke="#626861"
            tick={{ fontSize: 11 }}
            tickLine={false}
            axisLine={false}
          />
          <Tooltip
            formatter={(value) =>
              money(typeof value === "number" ? value : null)
            }
            contentStyle={{ borderRadius: 12, border: "1px solid #e5e8e0" }}
          />
          <Legend wrapperStyle={{ fontSize: 12 }} />
          <Bar
            name="Ad spend"
            dataKey="spend"
            fill="#242725"
            radius={[5, 5, 0, 0]}
            isAnimationActive={false}
          />
          <Bar
            name="Attributed revenue"
            dataKey="revenue"
            fill="#8c9e64"
            radius={[5, 5, 0, 0]}
            isAnimationActive={false}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
function ChartTable({ rows, caption }: { rows: Aggregate[]; caption: string }) {
  return (
    <details className="chart-table">
      <summary>Read chart values as a table</summary>
      <div
        className="table-scroll"
        tabIndex={0}
        role="region"
        aria-label={caption}
      >
        <table className="data-table">
          <caption className="sr-only">{caption}</caption>
          <thead>
            <tr>
              <th scope="col">Period / platform</th>
              <th scope="col">Spend (PKR)</th>
              <th scope="col">Revenue (PKR)</th>
              <th scope="col">ROAS</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.name}>
                <th scope="row">{row.name}</th>
                <td>{number(row.spend, 2)}</td>
                <td>{number(row.revenue, 2)}</td>
                <td>{metricText(row, "roas", "×")}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </details>
  );
}
