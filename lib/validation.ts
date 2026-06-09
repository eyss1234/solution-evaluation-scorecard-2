import { z } from "zod";
import {
  MAX_SCORE,
  MIN_SCORE,
  MAX_SCORECARD_SCORE,
  MIN_SCORECARD_SCORE,
} from "@/domain/scoring";

/** Zod schemas shared between API routes, forms, and server actions. */

export const solutionInputSchema = z.object({
  name: z.string().min(1, "Name is required").max(120),
  description: z.string().max(2000).optional().nullable(),
});
export type SolutionInput = z.infer<typeof solutionInputSchema>;

export const criterionInputSchema = z.object({
  name: z.string().min(1, "Name is required").max(120),
  description: z.string().max(2000).optional().nullable(),
  // Normalised relative weight (0–1) for the weighted-criteria system. This is
  // distinct from `ScorecardQuestion.weight`, which is expressed in percentage
  // points (e.g. 2.5, 5, 20) — see `scorecardScoreInputSchema` below.
  weight: z.number().min(0).max(1).default(1),
});
export type CriterionInput = z.infer<typeof criterionInputSchema>;

export const scoreInputSchema = z.object({
  solutionId: z.string().min(1),
  criterionId: z.string().min(1),
  value: z.number().int().min(MIN_SCORE).max(MAX_SCORE),
  notes: z.string().max(2000).optional().nullable(),
});
export type ScoreInput = z.infer<typeof scoreInputSchema>;

/**
 * A single answer within the step-based scorecard questionnaire. Scored on the
 * discrete 0–5 scale (`MIN_SCORECARD_SCORE`..`MAX_SCORECARD_SCORE`) that matches
 * the seeded criteria descriptions — values outside this range have no defined
 * meaning and are rejected here.
 */
export const scorecardScoreInputSchema = z.object({
  runId: z.string().min(1),
  questionId: z.string().min(1),
  value: z.number().int().min(MIN_SCORECARD_SCORE).max(MAX_SCORECARD_SCORE),
});
export type ScorecardScoreInput = z.infer<typeof scorecardScoreInputSchema>;
