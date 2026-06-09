import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { STEPS } from "@/lib/steps";
import { evaluateGating } from "@/domain/gating/evaluate";
import {
  calculateOverallScore,
  type QuestionScore,
  type SectionWeights,
} from "@/domain/scorecard/calculate";
import {
  calculateRunComparison,
  type RunComparison,
} from "@/domain/scorecard/compare";
import { ProjectHeader } from "@/components/ProjectHeader";
import { CreateScorecardButton } from "@/components/CreateScorecardButton";
import { FinancialComparison } from "@/components/FinancialComparison";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ projectId: string }>;
}

const SECTION_WEIGHTS: SectionWeights = new Map(
  STEPS.map((s) => [s.number, s.sectionWeight]),
);
const SCORING_STEPS = STEPS.filter((s) => s.questionsPerStep > 0);

const dateFormatter = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "long",
  year: "numeric",
});

export default async function ProjectDetailPage({ params }: PageProps) {
  const { projectId } = await params;

  const project = await prisma.project.findUnique({
    where: { id: projectId },
    include: {
      gatingRuns: {
        orderBy: { createdAt: "desc" },
        take: 1,
        include: { answers: { select: { questionId: true, value: true } } },
      },
      scorecardRuns: {
        orderBy: { createdAt: "desc" },
        include: {
          scores: {
            select: {
              questionId: true,
              value: true,
              question: { select: { stepNumber: true, weight: true } },
            },
          },
        },
      },
      financialSettings: { select: { currency: true } },
      financialEntries: {
        orderBy: { order: "asc" },
        include: {
          costs: { select: { scorecardRunId: true, amount: true } },
        },
      },
    },
  });

  if (!project) notFound();

  const latestGating = project.gatingRuns[0];
  const gateResult = latestGating ? evaluateGating(latestGating.answers) : null;
  const gateStatus: "not-started" | "passed" | "failed" = !gateResult
    ? "not-started"
    : gateResult.shouldProceed
      ? "passed"
      : "failed";

  const runViews = project.scorecardRuns.map((run) => {
    const scores: QuestionScore[] = run.scores.map((s) => ({
      questionId: s.questionId,
      stepNumber: s.question.stepNumber,
      value: s.value,
      weight: s.question.weight,
    }));
    return {
      id: run.id,
      name: run.name ?? "Untitled scorecard",
      createdAt: run.createdAt,
      completed: run.submittedAt !== null,
      total: calculateOverallScore(scores, SECTION_WEIGHTS).total,
      scores,
    };
  });

  const completedRuns = runViews.filter((r) => r.completed);
  const comparison =
    completedRuns.length >= 2
      ? calculateRunComparison(
          completedRuns.map((r) => ({ runId: r.id, name: r.name, scores: r.scores })),
          SECTION_WEIGHTS,
        )
      : null;

  // Financial comparison data: scorecard runs as columns, entries with their
  // per-run cost amounts (Decimal → number for the client).
  const financialRuns = runViews.map((r) => ({ id: r.id, name: r.name }));
  const financialEntries = project.financialEntries.map((e) => ({
    id: e.id,
    name: e.name,
    category: e.category,
    order: e.order,
    costs: Object.fromEntries(
      e.costs.map((c) => [c.scorecardRunId, Number(c.amount)]),
    ),
  }));
  const currency = project.financialSettings?.currency ?? "GBP";

  return (
    <div className="animate-fade-in space-y-8">
      <Link
        href="/"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 transition-colors hover:text-slate-900"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-4 w-4" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
        </svg>
        Projects
      </Link>

      <div className="space-y-1.5">
        <ProjectHeader projectId={project.id} initialName={project.name} />
        <p className="text-sm text-slate-500">
          Created {dateFormatter.format(project.createdAt)}
        </p>
      </div>

      <GatingCard
        projectId={project.id}
        status={gateStatus}
        answeredYes={gateResult?.answeredYes ?? 0}
      />

      {gateStatus === "passed" && (
        <>
          <ScorecardsCard projectId={project.id} runs={runViews} />
          <ComparisonCard comparison={comparison} />
          <FinancialComparison
            projectId={project.id}
            runs={financialRuns}
            initialEntries={financialEntries}
            initialCurrency={currency}
          />
        </>
      )}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Gating                                                                     */
/* -------------------------------------------------------------------------- */

function GatingCard({
  projectId,
  status,
  answeredYes,
}: {
  projectId: string;
  status: "not-started" | "passed" | "failed";
  answeredYes: number;
}) {
  if (status === "not-started") {
    return (
      <section className="card flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <StatusIcon kind="clock" />
          <div>
            <h2 className="font-semibold text-slate-900">Gating Evaluation</h2>
            <p className="text-sm text-slate-500">Not Started</p>
          </div>
        </div>
        <Link href={`/project/${projectId}/gate`} className="btn-primary">
          Start Gating Evaluation
        </Link>
      </section>
    );
  }

  if (status === "passed") {
    return (
      <section className="card flex items-center gap-3">
        <StatusIcon kind="check" />
        <div>
          <h2 className="font-semibold text-slate-900">Gate Passed</h2>
          <p className="text-sm text-slate-500">
            {answeredYes} {answeredYes === 1 ? "answer" : "answers"} indicated a
            full evaluation is warranted.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="card flex items-center gap-3">
      <StatusIcon kind="x" />
      <div>
        <h2 className="font-semibold text-slate-900">Gate Failed</h2>
        <p className="text-sm text-slate-500">
          All gating questions were answered no — a full scorecard evaluation is
          not required for this project.
        </p>
      </div>
    </section>
  );
}

/* -------------------------------------------------------------------------- */
/* Scorecards                                                                 */
/* -------------------------------------------------------------------------- */

interface RunView {
  id: string;
  name: string;
  createdAt: Date;
  completed: boolean;
  total: number;
}

function ScorecardsCard({
  projectId,
  runs,
}: {
  projectId: string;
  runs: RunView[];
}) {
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
                    <span className={`text-sm font-semibold ${scoreColor(run.total)}`}>
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

/* -------------------------------------------------------------------------- */
/* Comparison                                                                 */
/* -------------------------------------------------------------------------- */

function ComparisonCard({ comparison }: { comparison: RunComparison | null }) {
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
                    className={`px-3 py-2 text-right font-medium ${scoreColor(pct)}`}
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
                className={`px-3 py-2.5 text-right font-bold ${scoreColor(run.total)}`}
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

/* -------------------------------------------------------------------------- */
/* Shared bits                                                                */
/* -------------------------------------------------------------------------- */

/** Color a percentage: green ≥80, yellow ≥60, red <60. */
function scoreColor(pct: number): string {
  if (pct >= 80) return "text-emerald-700";
  if (pct >= 60) return "text-amber-600";
  return "text-red-600";
}

function StatusIcon({ kind }: { kind: "clock" | "check" | "x" }) {
  const base = "flex h-10 w-10 shrink-0 items-center justify-center rounded-full";
  if (kind === "clock") {
    return (
      <span className={`${base} bg-slate-100 text-slate-500`}>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="h-5 w-5" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6l4 2m6-2a10 10 0 1 1-20 0 10 10 0 0 1 20 0Z" />
        </svg>
      </span>
    );
  }
  if (kind === "check") {
    return (
      <span className={`${base} bg-emerald-50 text-emerald-600`}>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-5 w-5" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
        </svg>
      </span>
    );
  }
  return (
    <span className={`${base} bg-red-50 text-red-600`}>
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-5 w-5" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
      </svg>
    </span>
  );
}
