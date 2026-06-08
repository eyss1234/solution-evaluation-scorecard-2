/**
 * Pure scoring logic for the Solution Evaluation Scorecard.
 *
 * This module has no dependencies on the database, React, or the network — it
 * operates on plain data so it can be unit-tested in isolation and reused on
 * both the server and the client.
 */

export const MIN_SCORE = 0;
export const MAX_SCORE = 10;

export interface WeightedCriterion {
  id: string;
  weight: number;
}

export interface CriterionScore {
  criterionId: string;
  /** Raw score in the range [MIN_SCORE, MAX_SCORE]. */
  value: number;
}

/** Clamp a raw score into the valid [MIN_SCORE, MAX_SCORE] range. */
export function clampScore(value: number): number {
  if (Number.isNaN(value)) return MIN_SCORE;
  return Math.min(MAX_SCORE, Math.max(MIN_SCORE, value));
}

/**
 * Normalize a set of criterion weights so they sum to 1.
 *
 * If every weight is zero (or the list is empty) an equal split is returned,
 * which keeps downstream math well-defined.
 */
export function normalizeWeights(
  criteria: WeightedCriterion[],
): Map<string, number> {
  const result = new Map<string, number>();
  if (criteria.length === 0) return result;

  const total = criteria.reduce((sum, c) => sum + Math.max(0, c.weight), 0);

  if (total <= 0) {
    const equal = 1 / criteria.length;
    for (const c of criteria) result.set(c.id, equal);
    return result;
  }

  for (const c of criteria) {
    result.set(c.id, Math.max(0, c.weight) / total);
  }
  return result;
}

/**
 * Compute a solution's overall weighted score on a 0..MAX_SCORE scale.
 *
 * Scores referencing criteria that are not in `criteria` are ignored. Criteria
 * without a score contribute 0.
 */
export function weightedScore(
  criteria: WeightedCriterion[],
  scores: CriterionScore[],
): number {
  const weights = normalizeWeights(criteria);
  const byCriterion = new Map(scores.map((s) => [s.criterionId, s]));

  let total = 0;
  for (const criterion of criteria) {
    const weight = weights.get(criterion.id) ?? 0;
    const score = byCriterion.get(criterion.id);
    total += weight * clampScore(score?.value ?? 0);
  }
  return total;
}

/** Convert an overall 0..MAX_SCORE score into a 0..100 percentage. */
export function scoreToPercent(score: number): number {
  return Math.round((clampScore(score) / MAX_SCORE) * 100);
}
