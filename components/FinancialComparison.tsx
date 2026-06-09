"use client";

interface FinancialComparisonProps {
  projectId: string;
}

/**
 * Placeholder for the financial comparison across scorecards. The data layer
 * (entries, per-run costs, currency) and API already exist; the interactive
 * table will be implemented in a later iteration.
 */
export function FinancialComparison({ projectId }: FinancialComparisonProps) {
  // projectId will drive data fetching once this is implemented.
  void projectId;

  return (
    <section className="card">
      <h2 className="text-lg font-semibold text-slate-900">
        Financial Comparison
      </h2>
      <div className="mt-4 flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-surface-border bg-surface-muted py-10 text-center">
        <span className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-50 text-brand-600">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} className="h-5 w-5" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18 9 11.25l4.306 4.306a11.95 11.95 0 0 1 5.814-5.518l2.74-1.22m0 0-5.94-2.281m5.94 2.28-2.28 5.941" />
          </svg>
        </span>
        <p className="text-sm font-medium text-slate-700">
          Financial comparison coming soon
        </p>
        <p className="max-w-sm text-sm text-slate-500">
          Cost entries and per-scorecard totals will be compared here.
        </p>
      </div>
    </section>
  );
}
