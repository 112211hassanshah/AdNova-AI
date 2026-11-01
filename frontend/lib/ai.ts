export type AIStatus = {
  provider: string;
  model: string;
  configured: boolean;
  key_source: "environment" | "local_file" | "missing";
  verified: boolean;
  checked_at: string | null;
  last_error: string | null;
};
export type ReportKind = "performance" | "model" | "budget";
export type AISummary = {
  dataset_id: string;
  kind: ReportKind;
  summary: Record<string, unknown>;
  local_reference: Record<string, unknown>;
  summary_sha256: string;
  scope: string;
};
export type AIExplanation = {
  text: string;
  provider: string;
  model: string;
  generated_at: string;
  summary_sha256: string;
  dataset_id: string;
  is_synthetic: boolean;
  notice: string;
};

// The AI boundary returns only sanitized errors, including provider failures.
export async function aiApi<T>(
  path: string,
  init: RequestInit = {},
): Promise<T> {
  const response = await fetch(`/api/v1/ai${path}`, {
    ...init,
    cache: "no-store",
  });
  const body = await response.json().catch(() => null);
  if (!response.ok)
    throw new Error(
      typeof body?.detail === "string"
        ? body.detail
        : "The AI service could not finish. Your local reports still work.",
    );
  return body as T;
}
