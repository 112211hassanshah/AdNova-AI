export type Manifest = {
  id: string;
  workspace_id: "local";
  name: string;
  source: string;
  is_synthetic: boolean;
  original_filename: string | null;
  import_profile: string | null;
  imported_at: string;
  currency: "PKR";
  original_currency: string;
  exchange_rate: number;
  date_granularity: "daily" | "weekly";
  date_start: string;
  date_end: string;
  rows: number;
  conversion_definition: string;
  attribution_window: string;
  revenue_source: string;
  coverage: Record<string, number>;
  warnings: string[];
  data_ready_for_revenue: boolean;
  options: Record<string, string[]>;
  seed: number | null;
  parent_dataset_id?: string | null;
  reporting_evidence?: Record<string, string>;
  provenance_flags?: Record<string, boolean>;
  import_mapping?: Record<string, unknown>;
};
export type Cell = string | number | boolean | null;
export type RecordRow = Record<string, Cell>;
export type Stage = {
  token: string;
  filename: string;
  profile: string;
  columns: string[];
  row_count: number;
  preview: RecordRow[];
  suggested_mapping: Record<string, string>;
  mapping_details: Record<
    string,
    {
      status: string;
      reason: string;
      candidates: { column: string; confidence: number; reason: string }[];
    }
  >;
  reporting_hints?: import("./reporting").ReportingHints;
  detected_currencies: string[];
  warnings: string[];
};
export type ImportOptions = {
  name: string;
  mapping: Record<string, string>;
  default_platform: string | null;
  original_currency: string;
  exchange_rate: number | null;
  date_format: string;
  date_granularity: string;
  conversion_definition: string;
  attribution_window: string;
  is_synthetic: boolean;
  exclude_invalid: boolean;
  drop_duplicates: boolean;
  confirmed: boolean;
};
export type Report = {
  date_granularity: "daily" | "weekly";
  reporting_hints?: import("./reporting").ReportingHints;
  input_rows: number;
  valid_rows: number;
  invalid_rows: number;
  duplicate_rows: number;
  excluded_rows: number;
  can_import: boolean;
  is_synthetic: boolean;
  coverage: Record<string, number>;
  warnings: string[];
  errors: { field: string; message: string; count: number; rows: number[] }[];
  preview: RecordRow[];
  data_ready_for_revenue: boolean;
};
export type Totals = {
  rows: number;
  impressions: number | null;
  clicks: number | null;
  spend: number | null;
  conversions: number | null;
  revenue: number | null;
  ctr: number | null;
  cpc: number | null;
  cpa: number | null;
  cvr: number | null;
  roas: number | null;
  coverage: Record<string, number>;
};
export type Aggregate = Totals & { name: string };
export type Analytics = {
  dataset: Manifest;
  totals: Totals;
  platforms: Aggregate[];
  trend: Aggregate[];
  trend_grain: string;
  group_by: string;
  table: Aggregate[];
  table_total: number;
  page: number;
  page_size: number;
  sort: string;
  direction: string;
  filters: Record<string, string>;
};
export const platforms = [
  "Facebook",
  "Instagram",
  "Google",
  "TikTok",
  "YouTube",
];
export const sourceLabel = (dataset: Manifest) =>
  dataset.source === "synthetic_csv"
    ? "Synthetic CSV"
    : dataset.is_synthetic
      ? "Synthetic demo"
      : "Advertiser CSV";
export const coveragePercent = (ratio: number) =>
  `${number(ratio === 1 ? 100 : Math.floor(ratio * 1000) / 10, 1)}%`;
export const number = (value: number | null, digits = 0) =>
  value === null
    ? "Not available"
    : new Intl.NumberFormat("en-PK", { maximumFractionDigits: digits }).format(
        value,
      );
export const money = (value: number | null) =>
  value === null ? "Not available" : `Rs. ${number(value, 2)}`;
export const compact = (value: number) =>
  new Intl.NumberFormat("en", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(value);

export async function api<T>(path: string, init: RequestInit = {}): Promise<T> {
  let response: Response;
  try {
    response = await fetch(`/api/v1${path}`, { ...init, cache: "no-store" });
  } catch (error) {
    if (init.signal?.aborted) throw error;
    throw new Error(
      "Could not reach the backend service. Check its deployment or local servers, then retry.",
    );
  }
  const body = await response.json().catch(() => null);
  if (!response.ok) {
    const message =
      response.status >= 500
        ? "The service could not confirm this action. Refresh your workspace before retrying."
        : typeof body?.detail === "string"
          ? body.detail
          : Array.isArray(body?.detail)
            ? body.detail.map((item: { msg: string }) => item.msg).join(" ")
            : "This action could not be completed. Review your inputs and retry.";
    throw new Error(message);
  }
  return body as T;
}
export const json = (body: unknown, method = "POST"): RequestInit => ({
  method,
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(body),
});
export const message = (error: unknown) =>
  error instanceof Error
    ? error.message
    : "Something went wrong. Please retry.";
