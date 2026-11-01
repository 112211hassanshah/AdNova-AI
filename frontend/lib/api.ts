export type Capability = {
  id: string;
  phase: number;
  available: boolean;
  reason: string;
};
export type WorkspaceState = {
  api_version: "v1";
  phase: number;
  mode: "local_single_user";
  hosting_notice?: string | null;
  workspace_id: string;
  currency: "PKR";
  dataset_count: number;
  selected_dataset_id: string | null;
  revenue_source: string | null;
  model_status: "not_trained" | "trained" | "validated";
  connected_providers: string[];
  capabilities: Capability[];
  selected_dataset: Manifest | null;
  datasets: Manifest[];
};

export async function getWorkspace(
  signal?: AbortSignal,
): Promise<WorkspaceState> {
  const response = await fetch("/api/v1/workspace", {
    signal,
    cache: "no-store",
  });
  if (!response.ok)
    throw new Error(
      "The backend service is unavailable. For Vercel, check Python deployment logs and database configuration. For local use, start both services with npm run dev.",
    );
  const data = await response.json();
  if (
    data.api_version !== "v1" ||
    !Array.isArray(data.capabilities) ||
    !Array.isArray(data.datasets) ||
    typeof data.dataset_count !== "number"
  ) {
    throw new Error(
      "The service returned an unsupported response. Check that both services use the same project version.",
    );
  }
  return data;
}
import type { Manifest } from "./data";
