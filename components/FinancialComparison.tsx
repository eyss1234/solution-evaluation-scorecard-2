"use client";

import { useState } from "react";
import type { FinancialCategory } from "@/domain/financial/calculate";
import { type Currency, formatCurrency } from "@/domain/financial/format";
import { CurrencySelector } from "./CurrencySelector";
import { FinancialSection } from "./FinancialSection";

export interface RunColumn {
  id: string;
  name: string;
}

export interface EntryData {
  id: string;
  name: string;
  category: FinancialCategory;
  order: number;
  /** runId -> amount */
  costs: Record<string, number>;
}

const SECTIONS: { category: FinancialCategory; label: string }[] = [
  { category: "IMPLEMENTATION_CAPEX", label: "Implementation CapEx" },
  { category: "IMPLEMENTATION_OPEX", label: "Implementation OpEx" },
  { category: "ONGOING_CAPEX", label: "Ongoing CapEx" },
  { category: "ONGOING_OPEX", label: "Ongoing OpEx" },
];

interface FinancialComparisonProps {
  projectId: string;
  runs: RunColumn[];
  initialEntries: EntryData[];
  initialCurrency: Currency;
}

export function FinancialComparison({
  projectId,
  runs,
  initialEntries,
  initialCurrency,
}: FinancialComparisonProps) {
  const [currency, setCurrency] = useState<Currency>(initialCurrency);
  const [entries, setEntries] = useState<EntryData[]>(initialEntries);
  const [error, setError] = useState<string | null>(null);

  async function addEntry(
    category: FinancialCategory,
    name: string,
  ): Promise<boolean> {
    setError(null);
    try {
      const res = await fetch(`/api/projects/${projectId}/financial/entries`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, category }),
      });
      const json = await res.json();
      if (!res.ok || !json.ok) throw new Error(json?.error?.message);
      setEntries((prev) => [
        ...prev,
        {
          id: json.data.id,
          name: json.data.name,
          category: json.data.category,
          order: json.data.order,
          costs: {},
        },
      ]);
      return true;
    } catch {
      setError("Failed to add cost item. Please try again.");
      return false;
    }
  }

  async function deleteEntry(entryId: string): Promise<void> {
    setError(null);
    const snapshot = entries;
    setEntries((prev) => prev.filter((e) => e.id !== entryId)); // optimistic
    try {
      const res = await fetch(
        `/api/projects/${projectId}/financial/entries/${entryId}`,
        { method: "DELETE" },
      );
      const json = await res.json();
      if (!res.ok || !json.ok) throw new Error();
    } catch {
      setEntries(snapshot); // revert
      setError("Failed to delete cost item. Please try again.");
    }
  }

  async function saveCost(
    entryId: string,
    runId: string,
    amount: number,
  ): Promise<void> {
    setError(null);
    const previous = entries.find((e) => e.id === entryId)?.costs[runId] ?? 0;
    setEntries((prev) =>
      prev.map((e) =>
        e.id === entryId ? { ...e, costs: { ...e.costs, [runId]: amount } } : e,
      ),
    );
    try {
      const res = await fetch(
        `/api/projects/${projectId}/financial/entries/${entryId}/costs`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ scorecardRunId: runId, amount }),
        },
      );
      const json = await res.json();
      if (!res.ok || !json.ok) throw new Error(json?.error?.message);
    } catch {
      setEntries((prev) =>
        prev.map((e) =>
          e.id === entryId
            ? { ...e, costs: { ...e.costs, [runId]: previous } }
            : e,
        ),
      );
      setError("Failed to save cost. Please try again.");
    }
  }

  const grandTotal = (runId: string) =>
    entries.reduce((sum, e) => sum + (e.costs[runId] ?? 0), 0);

  return (
    <section className="card space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-lg font-semibold text-slate-900">
          Financial Comparison
        </h2>
        <CurrencySelector
          projectId={projectId}
          value={currency}
          onChange={setCurrency}
        />
      </div>

      {error && (
        <p role="alert" className="text-sm text-red-600">
          {error}
        </p>
      )}

      {runs.length === 0 ? (
        <p className="text-sm text-slate-500">
          Create a scorecard to compare costs across solutions.
        </p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[40rem] border-collapse text-sm">
            <thead>
              <tr className="border-b border-surface-border text-left">
                <th className="py-2 pr-3 font-medium text-slate-500">
                  Cost item
                </th>
                {runs.map((run) => (
                  <th
                    key={run.id}
                    className="px-3 py-2 text-right font-medium text-slate-700"
                  >
                    {run.name}
                  </th>
                ))}
                <th className="w-10" />
              </tr>
            </thead>

            {SECTIONS.map((section) => (
              <FinancialSection
                key={section.category}
                category={section.category}
                label={section.label}
                entries={entries
                  .filter((e) => e.category === section.category)
                  .sort((a, b) => a.order - b.order)}
                runs={runs}
                currency={currency}
                onAddEntry={addEntry}
                onDeleteEntry={deleteEntry}
                onSaveCost={saveCost}
              />
            ))}

            <tfoot>
              <tr className="border-t-2 border-surface-border font-bold text-slate-900">
                <td className="py-2.5 pr-3">Grand Total</td>
                {runs.map((run) => (
                  <td key={run.id} className="px-3 py-2.5 text-right">
                    {formatCurrency(grandTotal(run.id), currency)}
                  </td>
                ))}
                <td />
              </tr>
            </tfoot>
          </table>
        </div>
      )}
    </section>
  );
}
