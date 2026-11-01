export type GenerationConfig = {
  rows: number;
  seed: number;
  start_date: string;
  end_date: string;
  platforms: string[];
  chunk_rows: number;
};
export type ExperimentConfig = GenerationConfig & {
  kind: "generate" | "benchmark";
  engines: string[];
  repeats: number;
  workers: number;
  memory_mib: number;
  dataset_id: string | null;
};
export type PlatformTotal = {
  name: string;
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
};
export type LabDataset = {
  id: string;
  created_at: string;
  rows: number;
  bytes: number;
  parts: number;
  sha256: string;
  generator_version: string;
  config: GenerationConfig;
  reference: PlatformTotal[];
};
export type EngineResult = {
  engine: string;
  status: string;
  mode?: string;
  message?: string;
  setup_seconds: number | null;
  peak_tree_rss_bytes: number | null;
  median_seconds: number | null;
  median_rows_per_second: number | null;
  aggregate?: PlatformTotal[];
  runs: {
    repeat: number;
    elapsed_seconds: number;
    rows_per_second: number;
    correct: boolean;
  }[];
};
export type LabJob = {
  id: string;
  status: string;
  stage: string;
  created_at: string;
  updated_at: string;
  config: ExperimentConfig;
  message: string;
  generated_rows: number;
  generation_seconds?: number | null;
  cancel_requested: boolean;
  dataset: LabDataset | null;
  results: EngineResult[];
  environment: LabEnvironment | null;
  methodology?: Record<string, string>;
  benchmark_version?: string;
};
export type LabEnvironment = {
  os: string;
  architecture: string;
  cpu: string;
  logical_cpus: number | null;
  physical_cpus: number | null;
  ram_total_bytes: number | null;
  ram_available_bytes: number | null;
  disk_free_bytes: number;
  python: string;
  packages: Record<string, string | null>;
  java: { major: number; description: string } | null;
  input_format: string;
  engines: { id: string; label: string; available: boolean; reason: string }[];
};
export type LabState = {
  environment: LabEnvironment;
  methodology: Record<string, string>;
  datasets: LabDataset[];
  jobs: LabJob[];
};
export const initialConfig: ExperimentConfig = {
  kind: "benchmark",
  rows: 10000,
  seed: 42,
  start_date: "2026-01-01",
  end_date: "2026-03-31",
  platforms: ["Facebook", "Instagram", "Google", "TikTok", "YouTube"],
  chunk_rows: 50000,
  engines: ["pandas", "mapreduce", "spark"],
  repeats: 3,
  workers: 2,
  memory_mib: 2048,
  dataset_id: null,
};
export const engineName = (id: string) =>
  ({ pandas: "Pandas", mapreduce: "Local MapReduce", spark: "Apache Spark" })[
    id
  ] || id;
export const terminal = (status: string) =>
  ["completed", "failed", "cancelled", "interrupted"].includes(status);
export const bytes = (value: number | null) =>
  value === null
    ? "Not measured"
    : value >= 1024 ** 3
      ? `${(value / 1024 ** 3).toFixed(1)} GiB`
      : `${(value / 1024 ** 2).toFixed(1)} MiB`;
export const seconds = (value: number | null) =>
  value === null ? "Not measured" : `${value.toFixed(3)} s`;
