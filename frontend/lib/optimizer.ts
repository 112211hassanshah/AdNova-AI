import type { Manifest } from "./data";

export type PlatformLimit = {
  platform: string;
  min_percent: number;
  max_percent: number;
  min_amount?: number;
  max_amount?: number | null;
};
export type PlanConfig = {
  dataset_id: string;
  method: "auto" | "model" | "baseline" | "historical" | "evidence";
  model_id: string | null;
  budget: number;
  step: number | null;
  start_date: string;
  horizon_days: number;
  as_of_date: string;
  label_lag_days: number;
  platforms: PlatformLimit[];
};
export type Allocation = {
  platform: string;
  budget: number;
  share_percent: number;
  estimated_revenue: number | null;
  raw_estimated_revenue: number | null;
  next_step_revenue: number | null;
  effective_min: number;
  effective_max: number;
  requested_min_percent: number;
  requested_max_percent: number;
  reason: string;
};
export type PlanTotals = {
  budget: number;
  estimated_revenue: number | null;
  raw_estimated_revenue: number | null;
  estimated_roas: number | null;
};
export type PlanSummary = {
  id: string;
  created_at: string;
  config: PlanConfig;
  method_label: string;
  totals: PlanTotals;
  is_synthetic: boolean;
};
export type Plan = PlanSummary & {
  forecast_status?: "model" | "baseline" | "historical" | "unavailable";
  forecast_reasons?: string[];
  baseline_assessment?: {
    eligible: boolean;
    reasons: string[];
    policy: string;
  } | null;
  dataset: Manifest;
  source_sha256: string;
  model_id: string | null;
  objective: string;
  policy: string;
  planning_end: string;
  training_period: { start: string; end: string };
  training_controls: { as_of_date: string; label_lag_days: number };
  allocations: Allocation[];
  comparisons: (PlanTotals & {
    name: string;
    estimated_difference: number;
    allocations: Allocation[];
  })[];
  contexts: {
    platform: string;
    representative_date: string;
    campaign_segment_rows_per_day: number;
    supported_min: number;
    supported_max: number;
    campaign_day_spend_min: number;
    campaign_day_spend_max: number;
    reference_budget: number;
  }[];
  curves: {
    platform: string;
    points: { budget: number; raw_revenue: number; adjusted_revenue: number }[];
  }[];
  uncertainty: string;
  notice: string;
  limitations: string[];
  period_days?: number;
  curve_sample_step?: number;
  prediction_rows: number;
  elapsed_seconds: number;
};
export type OptimizerState = {
  dataset_id: string | null;
  suggested_start: string;
  models: {
    id: string;
    algorithm: string;
    eligible: boolean;
    reasons: string[];
    as_of_date: string;
    test_end: string;
  }[];
  plans: PlanSummary[];
};
