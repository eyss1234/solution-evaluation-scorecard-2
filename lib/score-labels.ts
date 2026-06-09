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

/**
 * Tailwind badge classes (bg + text + ring) for a single 0–5 score:
 * red ≤ 2, amber = 3, green ≥ 4.
 */
export function scoreValueBadgeClasses(value: number): string {
  if (value <= 2) return "bg-red-50 text-red-700 ring-red-600/20";
  if (value === 3) return "bg-amber-50 text-amber-700 ring-amber-600/20";
  return "bg-emerald-50 text-emerald-700 ring-emerald-600/20";
}
