import Link from "next/link";
import { CreateScorecardButton } from "@/components/CreateScorecardButton";
import { scorePercentColor } from "@/lib/score-labels";

export interface ScorecardRunView {
  id: string;
  name: string;
  createdAt: Date;
  completed: boolean;
  total: number;
}

const dateFormatter = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "long",
  year: "numeric",
});

interface ScorecardsCardProps {
  projectId: string;
  runs: ScorecardRunView[];
}

export function ScorecardsCard({ projectId, runs }: ScorecardsCardProps) {
  return (
    <section className="card space-y-4">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-lg font-semibold text-slate-900">Scorecards</h2>
        <CreateScorecardButton projectId={projectId} />
      </div>

      {runs.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-surface-border bg-surface-muted py-10 text-center">
          <p className="text-sm font-medium text-slate-700">No scorecards yet</p>
          <p className="text-sm text-slate-500">
            Create a scorecard to start evaluating a solution.
          </p>
        </div>
      ) : (
        <ul className="divide-y divide-surface-border">
          {runs.map((run) => (
            <li key={run.id}>
              <Link
                href={
                  run.completed
                    ? `/scorecard/${run.id}`
                    : `/scorecard/${run.id}/step/1`
                }
                className="group flex items-center justify-between gap-3 py-3"
              >
                <div className="min-w-0">
                  <p className="truncate font-medium text-slate-900 transition-colors group-hover:text-brand-700">
                    {run.name}
                  </p>
                  <p className="text-sm text-slate-500">
                    {dateFormatter.format(run.createdAt)}
                  </p>
                </div>
                {run.completed ? (
                  <span className="flex shrink-0 items-center gap-2">
                    <span className="inline-flex items-center rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-medium text-emerald-700 ring-1 ring-inset ring-emerald-600/20">
                      Completed
                    </span>
                    <span className={`text-sm font-semibold ${scorePercentColor(run.total)}`}>
                      {Math.round(run.total)}%
                    </span>
                  </span>
                ) : (
                  <span className="inline-flex shrink-0 items-center rounded-full bg-amber-50 px-2.5 py-0.5 text-xs font-medium text-amber-700 ring-1 ring-inset ring-amber-600/20">
                    In progress
                  </span>
                )}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
