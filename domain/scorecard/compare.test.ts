import { describe, it, expect } from "vitest";
import { calculateRunComparison, type ScorecardRunInput } from "./compare";
import type { SectionWeights } from "./calculate";

const weights: SectionWeights = new Map([
  [1, 30],
  [2, 20],
]);

describe("calculateRunComparison", () => {
  const runs: ScorecardRunInput[] = [
    {
      runId: "run-a",
      name: "Vendor A",
      scores: [
        { questionId: "q1", stepNumber: 1, value: 5, weight: 1 },
        { questionId: "q2", stepNumber: 2, value: 5, weight: 1 },
      ],
    },
    {
      runId: "run-b",
      name: "Vendor B",
      scores: [
        { questionId: "q1", stepNumber: 1, value: 0, weight: 1 },
        { questionId: "q2", stepNumber: 2, value: 0, weight: 1 },
      ],
    },
  ];

  it("scores each run independently and preserves input order", () => {
    const result = calculateRunComparison(runs, weights);
    expect(result.runs.map((r) => r.runId)).toEqual(["run-a", "run-b"]);
    expect(result.runs[0].total).toBeCloseTo(100);
    expect(result.runs[1].total).toBeCloseTo(0);
  });

  it("carries the run name and per-section breakdowns", () => {
    const result = calculateRunComparison(runs, weights);
    expect(result.runs[0].name).toBe("Vendor A");
    expect(result.runs[0].sections.map((s) => s.stepNumber)).toEqual([1, 2]);
  });

  it("returns the sorted union of step numbers across runs", () => {
    const result = calculateRunComparison(runs, weights);
    expect(result.stepNumbers).toEqual([1, 2]);
  });

  it("handles an empty set of runs", () => {
    const result = calculateRunComparison([], weights);
    expect(result.runs).toEqual([]);
    expect(result.stepNumbers).toEqual([]);
  });
});
