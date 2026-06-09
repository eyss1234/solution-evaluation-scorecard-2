import { describe, it, expect } from "vitest";
import {
  calculateSectionScore,
  calculateOverallScore,
  type QuestionScore,
  type SectionWeights,
} from "./calculate";

const q = (
  questionId: string,
  stepNumber: number,
  value: number,
  weight: number,
): QuestionScore => ({ questionId, stepNumber, value, weight });

describe("calculateSectionScore", () => {
  it("computes a full-marks section as 100% / raw 5", () => {
    const result = calculateSectionScore([q("a", 1, 5, 5)], 30);
    expect(result.percentage).toBeCloseTo(100);
    expect(result.rawAverage).toBeCloseTo(5);
    expect(result.weightedContribution).toBeCloseTo(30); // 100 * 30/100
  });

  it("computes a weighted average across questions", () => {
    // (5/5)*2 + (0/5)*1 = 2 ; / total weight 3 = 0.6667
    const result = calculateSectionScore(
      [q("a", 1, 5, 2), q("b", 1, 0, 1)],
      20,
    );
    expect(result.percentage).toBeCloseTo(66.667, 2);
    expect(result.rawAverage).toBeCloseTo(3.333, 2);
    expect(result.weightedContribution).toBeCloseTo(13.333, 2); // 66.667 * 20/100
  });

  it("returns zeroes for an empty section", () => {
    const result = calculateSectionScore([], 30);
    expect(result.percentage).toBe(0);
    expect(result.rawAverage).toBe(0);
    expect(result.sectionWeight).toBe(30);
    expect(result.weightedContribution).toBe(0);
  });

  it("returns zeroes when total weight is zero", () => {
    const result = calculateSectionScore([q("a", 1, 5, 0)], 30);
    expect(result.percentage).toBe(0);
    expect(result.rawAverage).toBe(0);
  });

  it("clamps out-of-range scores into the 0..5 band", () => {
    const high = calculateSectionScore([q("a", 1, 10, 1)], 10);
    expect(high.percentage).toBeCloseTo(100);
    const low = calculateSectionScore([q("a", 1, -5, 1)], 10);
    expect(low.percentage).toBeCloseTo(0);
  });
});

describe("calculateOverallScore", () => {
  const weights: SectionWeights = new Map([
    [1, 30],
    [2, 20],
  ]);

  it("weights each section by its section weight", () => {
    // Section 1 = 100%, Section 2 = 0%
    // total = (100*30 + 0*20) / (30+20) = 60
    const result = calculateOverallScore(
      [q("a", 1, 5, 1), q("b", 2, 0, 1)],
      weights,
    );
    expect(result.total).toBeCloseTo(60);
    expect(result.sections).toHaveLength(2);
  });

  it("orders the section breakdown by step number", () => {
    const result = calculateOverallScore(
      [q("b", 2, 3, 1), q("a", 1, 4, 1)],
      weights,
    );
    expect(result.sections.map((s) => s.stepNumber)).toEqual([1, 2]);
  });

  it("normalises by the weight of answered sections only", () => {
    // Only section 1 (weight 30) answered → total equals its percentage
    const result = calculateOverallScore([q("a", 1, 5, 1)], weights);
    expect(result.total).toBeCloseTo(100);
    expect(result.sections).toHaveLength(1);
  });

  it("returns a zero total when there are no scores", () => {
    const result = calculateOverallScore([], weights);
    expect(result.total).toBe(0);
    expect(result.sections).toEqual([]);
  });

  it("treats a section with no configured weight as non-contributing", () => {
    // Step 9 has no weight in the map → totalWeight 0 → total 0
    const result = calculateOverallScore([q("a", 9, 5, 1)], weights);
    expect(result.total).toBe(0);
    expect(result.sections[0].sectionWeight).toBe(0);
  });
});
