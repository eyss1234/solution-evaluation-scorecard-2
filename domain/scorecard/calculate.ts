/**
 * Pure scorecard scoring maths.
 *
 * Questions are scored on a discrete 0–5 scale and grouped into sections
 * (steps). Each question carries a weight; each section carries a weight
 * (expressed in percentage points) that determines its contribution to the
 * overall score. No framework dependencies — safe to unit-test in isolation
 * and to reuse on both the server and the client.
 */

import { MAX_SCORECARD_SCORE } from "../scoring";

/** A single answered scorecard question. */
export interface QuestionScore {
  questionId: string;
  /** The step (section) this question belongs to. */
  stepNumber: number;
  /** Raw score on the 0..MAX_SCORECARD_SCORE scale. */
  value: number;
  /** The question's relative weight within its section. */
  weight: number;
}

/** Maps a step number to its section weight (in percentage points). */
export type SectionWeights = Map<number, number>;

/** The computed score for a single section. */
export interface SectionScoreResult {
  /** Section score as a percentage (0–100). */
  percentage: number;
  /** Weighted average of the raw question scores (0..MAX_SCORECARD_SCORE). */
  rawAverage: number;
  /** The section's weight, in percentage points, carried through for context. */
  sectionWeight: number;
  /** `percentage * sectionWeight / 100` — this section's points toward the total. */
  weightedContribution: number;
}

/** A section result tagged with the step it belongs to. */
export interface SectionBreakdown extends SectionScoreResult {
  stepNumber: number;
}

/** The overall scorecard result with its per-section breakdown. */
export interface OverallScoreResult {
  /** Overall score as a percentage (0–100). */
  total: number;
  /** Per-section breakdowns, ordered by step number. */
  sections: SectionBreakdown[];
}

/**
 * Compute a single section's score.
 *
 * For each question the raw score is normalised to 0–1 (`value / 5`), weighted
 * by the question's weight, summed, and divided by the total weight. The result
 * is expressed both as a percentage (0–100) and as a raw average (0–5).
 *
 * Returns zeroes when there are no questions or the total weight is zero, which
 * keeps the maths well-defined for empty or unweighted sections.
 */
export function calculateSectionScore(
  scores: QuestionScore[],
  sectionWeight: number,
): SectionScoreResult {
  const totalWeight = scores.reduce((sum, q) => sum + Math.max(0, q.weight), 0);

  if (scores.length === 0 || totalWeight <= 0) {
    return {
      percentage: 0,
      rawAverage: 0,
      sectionWeight,
      weightedContribution: 0,
    };
  }

  const weightedNormalizedSum = scores.reduce((sum, q) => {
    const normalized = clamp01(q.value / MAX_SCORECARD_SCORE);
    return sum + normalized * Math.max(0, q.weight);
  }, 0);

  const normalized = weightedNormalizedSum / totalWeight; // 0–1
  const percentage = normalized * 100;
  const rawAverage = normalized * MAX_SCORECARD_SCORE;
  const weightedContribution = percentage * (sectionWeight / 100);

  return { percentage, rawAverage, sectionWeight, weightedContribution };
}

/**
 * Compute the overall scorecard score.
 *
 * Scores are grouped by step, each section is scored via
 * {@link calculateSectionScore}, and sections are combined as a weighted
 * average using their `sectionWeight`. Only sections that actually have scores
 * contribute, and the total is normalised by the weight of those sections so it
 * stays on a 0–100 scale even if some sections are unanswered.
 */
export function calculateOverallScore(
  scores: QuestionScore[],
  sectionWeights: SectionWeights,
): OverallScoreResult {
  const byStep = new Map<number, QuestionScore[]>();
  for (const score of scores) {
    const group = byStep.get(score.stepNumber) ?? [];
    group.push(score);
    byStep.set(score.stepNumber, group);
  }

  const sections: SectionBreakdown[] = [];
  let weightedSum = 0;
  let totalWeight = 0;

  for (const stepNumber of [...byStep.keys()].sort((a, b) => a - b)) {
    const sectionWeight = sectionWeights.get(stepNumber) ?? 0;
    const section = calculateSectionScore(byStep.get(stepNumber)!, sectionWeight);
    sections.push({ stepNumber, ...section });

    weightedSum += section.percentage * sectionWeight;
    totalWeight += sectionWeight;
  }

  const total = totalWeight > 0 ? weightedSum / totalWeight : 0;
  return { total, sections };
}

/** Clamp a value into the [0, 1] range. NaN collapses to 0. */
function clamp01(value: number): number {
  if (Number.isNaN(value)) return 0;
  return Math.min(1, Math.max(0, value));
}
