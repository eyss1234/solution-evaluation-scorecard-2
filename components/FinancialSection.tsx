"use client";

import { useState } from "react";
import { type Currency, formatCurrency } from "@/domain/financial/format";
import type { FinancialCategory } from "@/domain/financial/calculate";
import type { EntryData, RunColumn } from "./FinancialComparison";
import { FinancialEntryRow } from "./FinancialEntryRow";

interface FinancialSectionProps {
  category: FinancialCategory;
  label: string;
  entries: EntryData[];
  runs: RunColumn[];
  currency: Currency;
  costErrors: Set<string>;
  onAddEntry: (category: FinancialCategory, name: string) => Promise<boolean>;
  onDeleteEntry: (entryId: string) => Promise<void>;
  onSaveCost: (entryId: string, runId: string, amount: number) => Promise<void>;
}

export function FinancialSection({
  category,
  label,
  entries,
  runs,
  currency,
  costErrors,
  onAddEntry,
  onDeleteEntry,
  onSaveCost,
}: FinancialSectionProps) {
  const [newName, setNewName] = useState("");
  const [adding, setAdding] = useState(false);

  const colCount = runs.length + 2;
  const subtotal = (runId: string) =>
    entries.reduce((sum, e) => sum + (e.costs[runId] ?? 0), 0);

  async function handleAdd() {
    const name = newName.trim();
    if (!name) return;
    setAdding(true);
    const ok = await onAddEntry(category, name);
    setAdding(false);
    if (ok) setNewName("");
  }

  return (
    <tbody>
      <tr className="bg-surface-muted">
        <td
          colSpan={colCount}
          className="px-1 py-2 text-xs font-semibold uppercase tracking-wide text-slate-500"
        >
          {label}
        </td>
      </tr>

      {entries.map((entry) => (
        <FinancialEntryRow
          key={entry.id}
          entry={entry}
          runs={runs}
          currency={currency}
          costErrors={costErrors}
          onSaveCost={onSaveCost}
          onDelete={onDeleteEntry}
        />
      ))}

      <tr>
        <td colSpan={colCount} className="py-2 pr-3">
          <div className="flex items-center gap-2">
            <input
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleAdd();
              }}
              placeholder="Add cost item…"
              maxLength={120}
              aria-label={`Add ${label} cost item`}
              className="input max-w-xs py-1 text-sm"
            />
            <button
              type="button"
              onClick={handleAdd}
              disabled={adding || newName.trim().length === 0}
              className="btn-secondary px-3 py-1 text-xs disabled:opacity-50"
            >
              {adding ? "Adding…" : "Add"}
            </button>
          </div>
        </td>
      </tr>

      {entries.length > 0 && (
        <tr className="border-b border-surface-border text-slate-600">
          <td className="py-2 pr-3 text-sm font-medium">Subtotal</td>
          {runs.map((run) => (
            <td
              key={run.id}
              className="px-3 py-2 text-right text-sm font-medium"
            >
              {formatCurrency(subtotal(run.id), currency)}
            </td>
          ))}
          <td />
        </tr>
      )}
    </tbody>
  );
}
