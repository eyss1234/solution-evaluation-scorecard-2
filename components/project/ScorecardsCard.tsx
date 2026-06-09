import { CreateScorecardButton } from "@/components/CreateScorecardButton";
import { ScorecardItem } from "@/components/ScorecardItem";

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
            <ScorecardItem
              key={run.id}
              runId={run.id}
              initialName={run.name}
              completed={run.completed}
              total={run.total}
              dateLabel={dateFormatter.format(run.createdAt)}
            />
          ))}
        </ul>
      )}
    </section>
  );
}
