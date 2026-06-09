/** Human-readable labels for scorecard scores 0–5. */
export const SCORE_LABELS = [
  "N/A",
  "Very Poor",
  "Poor",
  "Adequate",
  "Good",
  "Excellent",
] as const;

/**
 * Tailwind text-color class for a 0–100 percentage:
 * green ≥ 80, amber ≥ 60, red below 60.
 */
export function scorePercentColor(pct: number): string {
  if (pct >= 80) return "text-emerald-700";
  if (pct >= 60) return "text-amber-600";
  return "text-red-600";
}
