import { money, type Manifest, type RecordRow } from "./data";
import type { PlatformLimit } from "./optimizer";

export const paisa = (value: number | null | undefined) =>
  money(value == null ? null : value / 100);
export type CommerceMeta = {
  dependencies?: string[];
  id: string;
  kind: string;
  name: string;
  store_id: string;
  is_synthetic: boolean;
  profile: string;
  created_at: string;
  period_start: string;
  period_end: string;
  timezone: string;
  orders: number;
  line_items: number;
  cost_rows: number;
  order_batch_id?: string;
  start_date?: string;
  end_date?: string;
  ad_dataset_id?: string;
  warnings: string[];
  definitions: {
    snapshot_as_of: string;
    complete_export: boolean;
    refunds_verified: boolean;
    [key: string]: unknown;
  };
};
export type CommerceState = {
  selected_order_batch_id: string | null;
  orders: CommerceMeta[];
  costs: CommerceMeta[];
  reconciliation: CommerceMeta[];
  profit_plan: CommerceMeta[];
  money_unit: string;
};
export type CommerceStage = {
  token: string;
  headers: string[];
  suggested_mapping: Record<string, string>;
  input_rows: number;
  removed_columns: number;
  fields: string[];
  notice: string;
};
export type CommerceOptions = {
  name: string;
  store_id: string;
  mapping: Record<string, string>;
  timezone: string;
  original_currency: string;
  exchange_rate: number | null;
  is_synthetic: boolean;
  duplicate_policy: string;
  order_grain: string;
  discount_basis: string;
  refund_basis: string;
  subtotal_basis: string;
  snapshot_as_of: string;
  period_start: string | null;
  period_end: string | null;
  complete_export: boolean;
  refunds_verified: boolean;
  order_batch_id: string | null;
  cogs_basis: string;
};
export type CommerceValidation = {
  can_import: boolean;
  errors: string[];
  warnings: string[];
  input_rows: number;
  orders?: number;
  line_items?: number;
  cost_rows?: number;
  is_synthetic?: boolean;
  unknown_net_sales?: number;
};
export type CampaignChoice = {
  platform: string;
  account_id: string;
  campaign_id: string;
};
export type MerchantMapping = CampaignChoice & {
  utm_source: string;
  utm_campaign: string;
};
export type ReconcileInput = {
  order_batch_id: string;
  ad_dataset_id: string;
  cost_batch_ids: string[];
  start_date: string;
  end_date: string;
  ad_scope_confirmed: boolean;
  timezones_confirmed: boolean;
  mappings_confirmed: boolean;
  mappings: MerchantMapping[];
  attribution_window_days: number;
  maturity_days: number;
  include_shipping_income: boolean;
  reference_net_sales: number | null;
  reference_eligible_orders: number | null;
};
export type Assessment = {
  eligible: boolean;
  reasons: string[];
  policy: string;
  parameters?: Record<
    string,
    {
      coefficient: number;
      reference_daily_spend: number;
      minimum_daily_spend: number;
      maximum_daily_spend: number;
    }
  >;
  evaluation?: Record<string, unknown>;
  splits?: Record<string, unknown>;
};
export type CommerceReport = {
  manifest: CommerceMeta;
  config: ReconcileInput;
  orders_manifest: CommerceMeta;
  ad_source: Manifest;
  store: {
    unique_orders: number;
    eligible_orders: number;
    excluded_orders: number;
    net_sales: number | null;
    gross_sales: number | null;
    discounts: number | null;
    merchandise_refunds: number | null;
    net_sales_coverage: number | null;
  };
  advertising: {
    spend: number | null;
    platform_reported_revenue: number | null;
    reported_roas: number | null;
  };
  attribution: {
    matched: number;
    unmatched: number;
    ambiguous: number;
    excluded: number;
    matched_net_sales: number | null;
    order_coverage: number | null;
    unknown_lag_orders: number;
  };
  costs: {
    coverage: Record<string, number | null>;
    totals: Record<string, number | null>;
    total: number | null;
  };
  profit: {
    contribution_after_ads: number | null;
    shipping_income: number | null;
    merchandise_mer: number | null;
    margin: number | null;
    forecast_reasons: string[];
  };
  assessment: Assessment;
  notice: string;
  reference: {
    provided_net_sales: string | null;
    net_sales_difference: number | null;
    provided_eligible_orders: number | null;
    order_count_difference: number | null;
    origin: string;
  };
  links: RecordRow[];
  link_total: number;
};
export type ProfitResult = {
  budget: number;
  estimated_contribution_before_ads: number;
  estimated_contribution_profit: number;
  allocations: {
    platform: string;
    budget: number;
    minimum: number;
    maximum: number;
  }[];
};
export type ProfitPlan = {
  manifest: CommerceMeta;
  result: ProfitResult;
  comparisons: (ProfitResult & { name: string })[];
  config: {
    reconciliation_id: string;
    budget: string;
    start_date: string;
    horizon_days: number;
    platforms: PlatformLimit[];
  };
  assessment: Assessment;
  notice: string;
  curve_points: Record<
    string,
    { budget: number; estimated_contribution_before_ads: number }[]
  >;
};
