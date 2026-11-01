import type { Manifest } from "./data";
export type Score = {
  rows: number;
  mae: number;
  rmse: number;
  r2?: number | null;
  wape: number | null;
};
export type Evaluation = {
  model: Score;
  baseline: Score;
  platforms: { platform: string; model: Score; baseline: Score }[];
};
export type ModelResult = {
  algorithm: string;
  fallback_reason: string | null;
  elapsed_seconds: number;
  target: string;
  grain: string;
  features: string[];
  categories: string[][];
  splits: Record<string, { rows: number; start: string; end: string }>;
  coverage: {
    input_rows: number;
    eligible_rows: number;
    excluded_rows: number;
    maturity_cutoff: string;
    label_lag_days: number;
  };
  test: Evaluation;
  validation: Evaluation;
  acceptance: { eligible: boolean; reasons: string[]; policy: string };
  spend_ranges: Record<string, { min: number; max: number }>;
  feature_importance: { feature: string; importance: number }[];
  campaign_overlap_count: number;
  versions: Record<string, string>;
  limitations: string[];
  parameters: Record<string, unknown>;
  recommendations_enabled: boolean;
  recommendations_reason: string;
  uncertainty: string;
};
export type ModelJob = {
  id: string;
  status: string;
  stage: string;
  message: string;
  created_at: string;
  completed_at: string | null;
  config: {
    dataset_id: string;
    seed: number;
    as_of_date: string;
    label_lag_days: number;
  };
  dataset: Manifest;
  result: ModelResult | null;
  cancel_requested: boolean;
  input_sha256: string;
};
export type MLState = {
  jobs: ModelJob[];
  active_job: ModelJob | null;
  versions: Record<string, string | null>;
};
export type Readiness = {
  ready: boolean;
  reasons: string[];
  coverage?: ModelResult["coverage"];
  splits?: ModelResult["splits"];
  reporting_setup?: import("./reporting").ReportingSetup | null;
};
export const finished = (status: string) =>
  ["succeeded", "failed", "cancelled", "interrupted"].includes(status);
