import { describe, it, expect } from "vitest";
import {
  clampScore,
  normalizeWeights,
  weightedScore,
  scoreToPercent,
  MAX_SCORE,
} from "./scoring";

describe("clampScore", () => {
  it("clamps below the minimum", () => {
    expect(clampScore(-5)).toBe(0);
  });

  it("clamps above the maximum", () => {
    expect(clampScore(42)).toBe(MAX_SCORE);
  });

  it("treats NaN as the minimum", () => {
    expect(clampScore(Number.NaN)).toBe(0);
  });
});

describe("normalizeWeights", () => {
  it("normalizes weights to sum to 1", () => {
    const weights = normalizeWeights([
      { id: "a", weight: 1 },
      { id: "b", weight: 3 },
    ]);
    expect(weights.get("a")).toBeCloseTo(0.25);
    expect(weights.get("b")).toBeCloseTo(0.75);
  });

  it("falls back to an equal split when all weights are zero", () => {
    const weights = normalizeWeights([
      { id: "a", weight: 0 },
      { id: "b", weight: 0 },
    ]);
    expect(weights.get("a")).toBeCloseTo(0.5);
    expect(weights.get("b")).toBeCloseTo(0.5);
  });

  it("returns an empty map for no criteria", () => {
    expect(normalizeWeights([]).size).toBe(0);
  });
});

describe("weightedScore", () => {
  const criteria = [
    { id: "cost", weight: 2 },
    { id: "scalability", weight: 1 },
  ];

  it("computes a weighted average", () => {
    const score = weightedScore(criteria, [
      { criterionId: "cost", value: 9 },
      { criterionId: "scalability", value: 3 },
    ]);
    // (2/3 * 9) + (1/3 * 3) = 6 + 1 = 7
    expect(score).toBeCloseTo(7);
  });

  it("treats missing scores as zero", () => {
    const score = weightedScore(criteria, [
      { criterionId: "cost", value: 9 },
    ]);
    // (2/3 * 9) + (1/3 * 0) = 6
    expect(score).toBeCloseTo(6);
  });

  it("ignores scores for unknown criteria", () => {
    const score = weightedScore(criteria, [
      { criterionId: "cost", value: 6 },
      { criterionId: "ghost", value: 10 },
      { criterionId: "scalability", value: 6 },
    ]);
    expect(score).toBeCloseTo(6);
  });
});

describe("scoreToPercent", () => {
  it("converts a 0..10 score to a percentage", () => {
    expect(scoreToPercent(7.5)).toBe(75);
  });
});
