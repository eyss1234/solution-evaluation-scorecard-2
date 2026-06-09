import { STEPS } from "@/lib/steps";
import { scorePercentColor } from "@/lib/score-labels";
import type { RunComparison } from "@/domain/scorecard/compare";

const SCORING_STEPS = STEPS.filter((s) => s.questionsPerStep > 0);

interface ScorecardComparisonCardProps {
  comparison: RunComparison | null;
}

export function ScorecardComparisonCard({
  comparison,
}: ScorecardComparisonCardProps) {
  if (!comparison) {
    return (
      <section className="card">
        <h2 className="text-lg font-semibold text-slate-900">
          Scorecard Comparison
        </h2>
        <p className="mt-2 text-sm text-slate-500">
          Create another scorecard to compare.
        </p>
      </section>
    );
  }

  const byStep = comparison.runs.map(
    (run) => new Map(run.sections.map((s) => [s.stepNumber, s.percentage])),
  );

  return (
    <section className="card space-y-4 overflow-x-auto">
      <h2 className="text-lg font-semibold text-slate-900">
        Scorecard Comparison
      </h2>
      <table className="w-full min-w-[32rem] border-collapse text-sm">
        <thead>
          <tr className="border-b border-surface-border text-left">
            <th className="py-2 pr-4 font-medium text-slate-500">Section</th>
            {comparison.runs.map((run) => (
              <th key={run.runId} className="px-3 py-2 text-right font-medium text-slate-700">
                {run.name}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {SCORING_STEPS.map((step) => (
            <tr key={step.number} className="border-b border-surface-border/60">
              <td className="py-2 pr-4 text-slate-600">
                {step.name}
                <span className="ml-1 text-xs text-slate-400">
                  ({step.sectionWeight}%)
                </span>
              </td>
              {byStep.map((map, i) => {
                const pct = map.get(step.number) ?? 0;
                return (
                  <td
                    key={comparison.runs[i].runId}
                    className={`px-3 py-2 text-right font-medium ${scorePercentColor(pct)}`}
                  >
                    {Math.round(pct)}%
                  </td>
                );
              })}
            </tr>
          ))}
          <tr className="border-t-2 border-surface-border">
            <td className="py-2.5 pr-4 font-semibold text-slate-900">Overall</td>
            {comparison.runs.map((run) => (
              <td
                key={run.runId}
                className={`px-3 py-2.5 text-right font-bold ${scorePercentColor(run.total)}`}
              >
                {Math.round(run.total)}%
              </td>
            ))}
          </tr>
        </tbody>
      </table>
    </section>
  );
}
