/**
 * Pure financial aggregation maths for scorecard runs.
 *
 * Costs are attached to (entry, run) pairs; entries are grouped into one of four
 * cost categories. No framework dependencies — amounts are plain numbers, so
 * Decimal values from the database must be converted at the boundary.
 */

/** The four financial categories a cost entry can belong to. */
export type FinancialCategory =
  | "IMPLEMENTATION_CAPEX"
  | "IMPLEMENTATION_OPEX"
  | "ONGOING_CAPEX"
  | "ONGOING_OPEX";

/** Every category, in display order. */
export const FINANCIAL_CATEGORIES: readonly FinancialCategory[] = [
  "IMPLEMENTATION_CAPEX",
  "IMPLEMENTATION_OPEX",
  "ONGOING_CAPEX",
  "ONGOING_OPEX",
] as const;

/** A named line item of cost, categorised for analysis. */
export interface FinancialEntry {
  id: string;
  name: string;
  category: FinancialCategory;
}

/** The cost amount for an entry under a specific scorecard run. */
export interface FinancialCost {
  entryId: string;
  scorecardRunId: string;
  amount: number;
}

/** A category and its total cost for a run. */
export interface CategoryTotal {
  category: FinancialCategory;
  total: number;
}

/** Return only the entries belonging to the given category. */
export function filterEntriesByCategory(
  entries: FinancialEntry[],
  category: FinancialCategory,
): FinancialEntry[] {
  return entries.filter((entry) => entry.category === category);
}

/**
 * Sum the costs for a single category within a run (a "section total").
 */
export function calculateSectionTotal(
  entries: FinancialEntry[],
  costs: FinancialCost[],
  scorecardRunId: string,
  category: FinancialCategory,
): number {
  const runCosts = costsForRun(costs, scorecardRunId);
  return filterEntriesByCategory(entries, category).reduce(
    (sum, entry) => sum + (runCosts.get(entry.id) ?? 0),
    0,
  );
}

/**
 * Compute the total for every category within a run. All four categories are
 * always returned (zero-filled when absent) so callers get a stable shape.
 */
export function calculateCategoryTotals(
  entries: FinancialEntry[],
  costs: FinancialCost[],
  scorecardRunId: string,
): CategoryTotal[] {
  return FINANCIAL_CATEGORIES.map((category) => ({
    category,
    total: calculateSectionTotal(entries, costs, scorecardRunId, category),
  }));
}

/**
 * Sum every cost for a run across all categories (the grand total). Only costs
 * that map to a known entry are counted.
 */
export function calculateGrandTotal(
  entries: FinancialEntry[],
  costs: FinancialCost[],
  scorecardRunId: string,
): number {
  const runCosts = costsForRun(costs, scorecardRunId);
  return entries.reduce(
    (sum, entry) => sum + (runCosts.get(entry.id) ?? 0),
    0,
  );
}

/** Build a map of entryId -> total amount for a single run. */
function costsForRun(
  costs: FinancialCost[],
  scorecardRunId: string,
): Map<string, number> {
  const map = new Map<string, number>();
  for (const cost of costs) {
    if (cost.scorecardRunId !== scorecardRunId) continue;
    map.set(cost.entryId, (map.get(cost.entryId) ?? 0) + cost.amount);
  }
  return map;
}
