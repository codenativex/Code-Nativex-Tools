import type { FindingStatus } from "@/lib/audit/types";

export type ScoreBand = "strong" | "fair" | "poor";

export function scoreBand(score: number): ScoreBand {
  if (score >= 85) return "strong";
  if (score >= 60) return "fair";
  return "poor";
}

/** CSS custom-property colour for a score, used by dials and bars. */
export function scoreColorVar(score: number): string {
  const band = scoreBand(score);
  if (band === "strong") return "var(--color-positive)";
  if (band === "fair") return "var(--color-caution)";
  return "var(--color-critical)";
}

interface FindingPresentation {
  readonly label: string;
  readonly symbol: string;
  /** Classes for the status marker beside a finding. */
  readonly markerClass: string;
}

/** One place that decides how each finding status looks and reads. */
export const findingMeta: Record<FindingStatus, FindingPresentation> = {
  pass: { label: "Passed", symbol: "✓", markerClass: "border-positive/30 bg-positive/10 text-positive" },
  warn: { label: "Warning", symbol: "!", markerClass: "border-caution/40 bg-caution/15 text-[oklch(0.5_0.12_75)]" },
  fail: { label: "Issue", symbol: "×", markerClass: "border-critical/30 bg-critical/10 text-critical" },
};
