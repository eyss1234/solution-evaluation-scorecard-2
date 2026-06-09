/**
 * Pure comparison maths for placing multiple scorecard runs side by side.
 */

import {
  calculateOverallScore,
  type QuestionScore,
  type SectionBreakdown,
  type SectionWeights,
} from "./calculate";

/** One scorecard run's identity and its answered questions. */
export interface ScorecardRunInput {
  runId: string;
  name?: string | null;
  scores: QuestionScore[];
}

/** A single run's computed totals within a comparison. */
export interface RunComparisonEntry {
  runId: string;
  name?: string | null;
  /** Overall score as a percentage (0–100). */
  total: number;
  /** Per-section breakdowns, ordered by step number. */
  sections: SectionBreakdown[];
}

/** The full comparison across every supplied run. */
export interface RunComparison {
  /** Every step number that appears across the runs, ascending. */
  stepNumbers: number[];
  /** One entry per run, in input order. */
  runs: RunComparisonEntry[];
}

/**
 * Compare multiple scorecard runs.
 *
 * Each run is scored independently via {@link calculateOverallScore} using the
 * shared section weights, producing per-step scores and an overall total per
 * run. The union of step numbers across all runs is returned to make it easy to
 * lay the results out as a comparison table.
 */
export function calculateRunComparison(
  runs: ScorecardRunInput[],
  sectionWeights: SectionWeights,
): RunComparison {
  const entries: RunComparisonEntry[] = runs.map((run) => {
    const { total, sections } = calculateOverallScore(run.scores, sectionWeights);
    return { runId: run.runId, name: run.name, total, sections };
  });

  const stepNumbers = [
    ...new Set(entries.flatMap((e) => e.sections.map((s) => s.stepNumber))),
  ].sort((a, b) => a - b);

  return { stepNumbers, runs: entries };
}
