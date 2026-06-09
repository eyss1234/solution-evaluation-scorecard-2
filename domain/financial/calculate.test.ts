import { describe, it, expect } from "vitest";
import {
  filterEntriesByCategory,
  calculateSectionTotal,
  calculateCategoryTotals,
  calculateGrandTotal,
  FINANCIAL_CATEGORIES,
  type FinancialEntry,
  type FinancialCost,
} from "./calculate";

const entries: FinancialEntry[] = [
  { id: "e1", name: "Licensing", category: "IMPLEMENTATION_CAPEX" },
  { id: "e2", name: "Setup", category: "IMPLEMENTATION_OPEX" },
  { id: "e3", name: "Support", category: "ONGOING_OPEX" },
  { id: "e4", name: "Hardware", category: "IMPLEMENTATION_CAPEX" },
];

const costs: FinancialCost[] = [
  { entryId: "e1", scorecardRunId: "run-1", amount: 1000 },
  { entryId: "e2", scorecardRunId: "run-1", amount: 250 },
  { entryId: "e3", scorecardRunId: "run-1", amount: 500 },
  { entryId: "e4", scorecardRunId: "run-1", amount: 750 },
  // A different run's cost that must be excluded from run-1 totals.
  { entryId: "e1", scorecardRunId: "run-2", amount: 9999 },
];

describe("filterEntriesByCategory", () => {
  it("returns only entries in the given category", () => {
    const capex = filterEntriesByCategory(entries, "IMPLEMENTATION_CAPEX");
    expect(capex.map((e) => e.id)).toEqual(["e1", "e4"]);
  });

  it("returns an empty array when no entries match", () => {
    expect(filterEntriesByCategory(entries, "ONGOING_CAPEX")).toEqual([]);
  });
});

describe("calculateSectionTotal", () => {
  it("sums the costs for a category within a run", () => {
    // e1 (1000) + e4 (750) = 1750, ignoring run-2's 9999
    expect(
      calculateSectionTotal(entries, costs, "run-1", "IMPLEMENTATION_CAPEX"),
    ).toBe(1750);
  });

  it("returns 0 for a category with no costs", () => {
    expect(
      calculateSectionTotal(entries, costs, "run-1", "ONGOING_CAPEX"),
    ).toBe(0);
  });
});

describe("calculateCategoryTotals", () => {
  it("returns a total for every category, zero-filled", () => {
    const totals = calculateCategoryTotals(entries, costs, "run-1");
    expect(totals.map((t) => t.category)).toEqual([...FINANCIAL_CATEGORIES]);
    expect(totals).toEqual([
      { category: "IMPLEMENTATION_CAPEX", total: 1750 },
      { category: "IMPLEMENTATION_OPEX", total: 250 },
      { category: "ONGOING_CAPEX", total: 0 },
      { category: "ONGOING_OPEX", total: 500 },
    ]);
  });
});

describe("calculateGrandTotal", () => {
  it("sums every cost mapped to an entry for the run", () => {
    // 1000 + 250 + 500 + 750 = 2500, excluding run-2
    expect(calculateGrandTotal(entries, costs, "run-1")).toBe(2500);
  });

  it("returns 0 for a run with no costs", () => {
    expect(calculateGrandTotal(entries, costs, "run-3")).toBe(0);
  });
});
