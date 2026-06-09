"use client";

import { useEffect, useState } from "react";
import {
  type Currency,
  formatCurrency,
  getCurrencySymbol,
  parseCurrencyInput,
} from "@/domain/financial/format";
import type { EntryData, RunColumn } from "./FinancialComparison";

interface FinancialEntryRowProps {
  entry: EntryData;
  runs: RunColumn[];
  currency: Currency;
  /** Keys ("entryId:runId") whose last cost save failed. */
  costErrors: Set<string>;
  onSaveCost: (entryId: string, runId: string, amount: number) => Promise<void>;
  onDelete: (entryId: string) => Promise<void>;
}

export function FinancialEntryRow({
  entry,
  runs,
  currency,
  costErrors,
  onSaveCost,
  onDelete,
}: FinancialEntryRowProps) {
  const [confirming, setConfirming] = useState(false);
  const [deleting, setDeleting] = useState(false);

  return (
    <tr className="border-b border-surface-border/60">
      <td className="py-1.5 pr-3 text-slate-700">{entry.name}</td>

      {runs.map((run) => (
        <td key={run.id} className="px-3 py-1.5">
          <CostCell
            currency={currency}
            amount={entry.costs[run.id] ?? 0}
            hasError={costErrors.has(`${entry.id}:${run.id}`)}
            onSave={(amount) => onSaveCost(entry.id, run.id, amount)}
          />
        </td>
      ))}

      <td className="px-1 py-1.5 text-right">
        {confirming ? (
          <span className="inline-flex items-center gap-1">
            <button
              type="button"
              onClick={async () => {
                setDeleting(true);
                // On success the row unmounts; on failure the parent reverts
                // and re-mounts a fresh row, so no post-await state reset here.
                await onDelete(entry.id);
              }}
              disabled={deleting}
              aria-label={`Confirm delete ${entry.name}`}
              className="rounded p-1 text-emerald-600 hover:bg-emerald-50 disabled:opacity-50"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} className="h-4 w-4" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
              </svg>
            </button>
            <button
              type="button"
              onClick={() => setConfirming(false)}
              disabled={deleting}
              aria-label="Cancel delete"
              className="rounded p-1 text-slate-400 hover:bg-surface-subtle disabled:opacity-50"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} className="h-4 w-4" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
              </svg>
            </button>
          </span>
        ) : (
          <button
            type="button"
            onClick={() => setConfirming(true)}
            aria-label={`Delete ${entry.name}`}
            className="rounded p-1 text-slate-400 hover:bg-red-50 hover:text-red-600"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="h-4 w-4" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
            </svg>
          </button>
        )}
      </td>
    </tr>
  );
}

function CostCell({
  currency,
  amount,
  hasError,
  onSave,
}: {
  currency: Currency;
  amount: number;
  hasError?: boolean;
  onSave: (amount: number) => Promise<void>;
}) {
  const symbol = getCurrencySymbol(currency);
  const [value, setValue] = useState(amount ? String(amount) : "");
  const [saving, setSaving] = useState(false);

  // Reflect external changes (e.g. revert after a failed save).
  useEffect(() => {
    setValue(amount ? String(amount) : "");
  }, [amount]);

  async function commit() {
    const parsed = parseCurrencyInput(value);
    if (parsed === amount) {
      setValue(amount ? String(amount) : "");
      return;
    }
    setSaving(true);
    await onSave(parsed);
    setSaving(false);
  }

  return (
    <>
      {/* Editable on screen */}
      <div className="flex items-center justify-end gap-1 print:hidden">
        <span className="text-xs text-slate-400">{symbol}</span>
        <input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onBlur={commit}
          onKeyDown={(e) => {
            if (e.key === "Enter") (e.target as HTMLInputElement).blur();
          }}
          inputMode="decimal"
          disabled={saving}
          aria-label="Cost amount"
          aria-invalid={hasError || undefined}
          title={hasError ? "Failed to save — edit to retry" : undefined}
          className={`w-full min-w-0 rounded-md border bg-surface px-2 py-1 text-right text-sm text-slate-900 focus:outline-none focus:ring-2 disabled:opacity-60 ${
            hasError
              ? "border-red-400 focus:border-red-500 focus:ring-red-400/30"
              : "border-surface-border focus:border-brand-500 focus:ring-brand-500/30"
          }`}
        />
      </div>
      {/* Formatted, read-only in print */}
      <span className="hidden text-right text-slate-700 print:block">
        {amount ? formatCurrency(amount, currency) : "—"}
      </span>
    </>
  );
}
