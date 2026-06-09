/**
 * Types for the pass/fail gating questionnaire.
 *
 * Pure data shapes only — no dependency on Prisma, React, or the network — so
 * the gating logic stays unit-testable in isolation.
 */

/** A single answer to a gate question within a gating run. */
export interface GatingAnswer {
  questionId: string;
  value: boolean;
}

/** The outcome of evaluating a set of gating answers. */
export interface GatingResult {
  /** True if ANY answer is "yes" — i.e. the project warrants a full scorecard. */
  shouldProceed: boolean;
  /** Number of answers that were "yes". */
  answeredYes: number;
  /** Total number of answers supplied. */
  totalQuestions: number;
}
