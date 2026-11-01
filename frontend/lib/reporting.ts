export type ReportingField = "conversion_definition" | "attribution_window";
export type ReportingHint = {
  value: string | null;
  status: "detected" | "partial" | "missing" | "mixed";
  evidence: string;
};
export type ReportingHints = Record<ReportingField, ReportingHint>;
export type ReportingSetup = {
  fields: ReportingHints;
  needs_answers: boolean;
  mixed: boolean;
  financial_complete: boolean;
};
export const hasAnswer = (value: string) =>
  !["", "unspecified", "unknown", "none", "mixed"].includes(
    value.trim().toLowerCase(),
  );

export function hintsForMapping(
  stage: import("./data").Stage,
  mapping: Record<string, string>,
): ReportingHints | undefined {
  if (!stage.reporting_hints) return undefined;
  const result = { ...stage.reporting_hints };
  for (const field of [
    "conversion_definition",
    "attribution_window",
  ] as ReportingField[]) {
    const changed =
      mapping[field] !== stage.suggested_mapping[field] ||
      (field === "conversion_definition" &&
        mapping.conversions !== stage.suggested_mapping.conversions);
    if (changed)
      result[field] = {
        value: null,
        status: "missing",
        evidence: "Validate this column mapping to look for a reporting rule.",
      };
  }
  return result;
}
