import type { GatingAnswer, GatingResult } from "./types";

/**
 * Evaluate a set of gating answers.
 *
 * The gate is intentionally permissive: a single "yes" is enough to recommend
 * proceeding to a full scorecard evaluation, because any one of the gate
 * questions signals material complexity, risk, or cost.
 */
export function evaluateGating(answers: GatingAnswer[]): GatingResult {
  const totalQuestions = answers.length;
  const answeredYes = answers.reduce(
    (count, answer) => count + (answer.value ? 1 : 0),
    0,
  );

  return {
    shouldProceed: answeredYes > 0,
    answeredYes,
    totalQuestions,
  };
}
