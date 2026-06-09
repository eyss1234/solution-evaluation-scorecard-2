import { z } from "zod";
import { Currency, FinancialCategory } from "@prisma/client";
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

export const gatingAnswerInputSchema = z.object({
  questionId: z.string().min(1),
  value: z.boolean(),
});
export type GatingAnswerInput = z.infer<typeof gatingAnswerInputSchema>;

export const gatingRunInputSchema = z.object({
  projectId: z.string().min(1),
  answers: z
    .array(gatingAnswerInputSchema)
    .min(1, "At least one answer is required"),
});
export type GatingRunInput = z.infer<typeof gatingRunInputSchema>;

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

/** Create a financial entry. `order` is assigned server-side, not by the client. */
export const financialEntryInputSchema = z.object({
  name: z.string().min(1, "Name is required").max(120),
  category: z.nativeEnum(FinancialCategory),
});
export type FinancialEntryInput = z.infer<typeof financialEntryInputSchema>;

/** Update a financial entry — currently only the name is editable. */
export const financialEntryUpdateSchema = financialEntryInputSchema.pick({
  name: true,
});
export type FinancialEntryUpdate = z.infer<typeof financialEntryUpdateSchema>;

/**
 * Upsert a cost amount for an entry under a specific scorecard run. The upper
 * bound matches the `Decimal(15, 2)` column, so oversized amounts are rejected
 * with a 400 here rather than triggering a numeric overflow (500) at the DB.
 */
export const financialCostInputSchema = z.object({
  scorecardRunId: z.string().min(1),
  amount: z.number().finite().min(0).max(9_999_999_999_999.99, "Amount is too large"),
});
export type FinancialCostInput = z.infer<typeof financialCostInputSchema>;

/** Update a project's reporting currency. */
export const currencyUpdateSchema = z.object({
  currency: z.nativeEnum(Currency),
});
export type CurrencyUpdate = z.infer<typeof currencyUpdateSchema>;
