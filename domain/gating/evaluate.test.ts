import { describe, it, expect } from "vitest";
import { evaluateGating } from "./evaluate";
import type { GatingAnswer } from "./types";

const answer = (questionId: string, value: boolean): GatingAnswer => ({
  questionId,
  value,
});

describe("evaluateGating", () => {
  it("recommends proceeding when ANY answer is yes", () => {
    const result = evaluateGating([
      answer("q1", false),
      answer("q2", true),
      answer("q3", false),
    ]);
    expect(result.shouldProceed).toBe(true);
    expect(result.answeredYes).toBe(1);
    expect(result.totalQuestions).toBe(3);
  });

  it("does not proceed when every answer is no", () => {
    const result = evaluateGating([
      answer("q1", false),
      answer("q2", false),
    ]);
    expect(result.shouldProceed).toBe(false);
    expect(result.answeredYes).toBe(0);
    expect(result.totalQuestions).toBe(2);
  });

  it("counts every yes when all answers are yes", () => {
    const result = evaluateGating([
      answer("q1", true),
      answer("q2", true),
      answer("q3", true),
    ]);
    expect(result.shouldProceed).toBe(true);
    expect(result.answeredYes).toBe(3);
    expect(result.totalQuestions).toBe(3);
  });

  it("handles an empty answer set without proceeding", () => {
    const result = evaluateGating([]);
    expect(result.shouldProceed).toBe(false);
    expect(result.answeredYes).toBe(0);
    expect(result.totalQuestions).toBe(0);
  });
});
