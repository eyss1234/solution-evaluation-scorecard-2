import { z } from "zod";
import {
  MAX_SCORE,
  MIN_SCORE,
  MAX_SCORECARD_SCORE,
  MIN_SCORECARD_SCORE,
} from "@/domain/scoring";

/** Zod schemas shared between API routes, forms, and server actions. */

export const projectInputSchema = z.object({
  name: z.string().min(1, "Name is required").max(120),
});
export type ProjectInput = z.infer<typeof projectInputSchema>;

/** Update payload for a project — currently only the name is editable. */
export const projectUpdateSchema = projectInputSchema;
export type ProjectUpdate = z.infer<typeof projectUpdateSchema>;

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

/** Body for creating a scorecard run. Name is optional and auto-generated. */
export const scorecardRunInputSchema = z.object({
  projectId: z.string().min(1),
  name: z.string().min(1).max(120).optional(),
});
export type ScorecardRunInput = z.infer<typeof scorecardRunInputSchema>;

/** A single score within a save/submit payload (run id comes from the path). */
export const scorecardSaveScoreSchema = z.object({
  questionId: z.string().min(1),
  value: z.number().int().min(MIN_SCORECARD_SCORE).max(MAX_SCORECARD_SCORE),
});

/**
 * Save/submit payload: a batch of scores plus an optional step comment. When a
 * `stepComment` is supplied a `stepNumber` is required to anchor it.
 */
export const scorecardSaveSchema = z
  .object({
    scores: z.array(scorecardSaveScoreSchema).default([]),
    stepComment: z.string().max(5000).optional(),
    stepNumber: z.number().int().min(1).optional(),
  })
  .refine((d) => d.stepComment === undefined || d.stepNumber !== undefined, {
    message: "stepNumber is required when stepComment is provided",
    path: ["stepNumber"],
  });
export type ScorecardSaveInput = z.infer<typeof scorecardSaveSchema>;

/** Overview free-text fields; all optional so individual fields can be saved. */
export const scorecardOverviewSchema = z.object({
  pros: z.string().max(10000).optional().nullable(),
  cons: z.string().max(10000).optional().nullable(),
  summary: z.string().max(10000).optional().nullable(),
});
export type ScorecardOverviewInput = z.infer<typeof scorecardOverviewSchema>;

/** Which overview section the AI should generate. */
export const generateOverviewSchema = z.object({
  type: z.enum(["pros", "cons", "summary"]),
});
export type GenerateOverviewInput = z.infer<typeof generateOverviewSchema>;
