import { z } from "zod";
import { MAX_SCORE, MIN_SCORE } from "@/domain/scoring";

/** Zod schemas shared between API routes, forms, and server actions. */

export const solutionInputSchema = z.object({
  name: z.string().min(1, "Name is required").max(120),
  description: z.string().max(2000).optional().nullable(),
});
export type SolutionInput = z.infer<typeof solutionInputSchema>;

export const criterionInputSchema = z.object({
  name: z.string().min(1, "Name is required").max(120),
  description: z.string().max(2000).optional().nullable(),
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
