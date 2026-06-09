import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { STEPS } from "@/lib/steps";
import {
  SCORE_LABELS,
  scorePercentColor,
  scoreValueBadgeClasses,
} from "@/lib/score-labels";
import {
  calculateOverallScore,
  type QuestionScore,
  type SectionWeights,
} from "@/domain/scorecard/calculate";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ runId: string }>;
}

const SECTION_WEIGHTS: SectionWeights = new Map(
  STEPS.map((s) => [s.number, s.sectionWeight]),
);
const STEP_BY_NUMBER = new Map(STEPS.map((s) => [s.number, s]));
const round = (n: number) => Math.round(n);

export default async function CompletedScorecardPage({ params }: PageProps) {
  const { runId } = await params;

  const run = await prisma.scorecardRun.findUnique({
    where: { id: runId },
    include: {
      project: { select: { id: true, name: true } },
      scores: { include: { question: true } },
      overview: true,
      stepComments: true,
    },
  });

  if (!run) notFound();

  const backLink = (
    <Link
      href={`/project/${run.project.id}`}
      className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 transition-colors hover:text-slate-900"
    >
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-4 w-4" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
      </svg>
      Back to Project
    </Link>
  );

  // ── Empty state: no scores recorded yet ────────────────────────────────
  if (run.scores.length === 0) {
    return (
      <div className="animate-fade-in space-y-8">
        {backLink}
        <div className="card flex flex-col items-center justify-center gap-3 py-14 text-center">
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-50 text-brand-600">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="h-6 w-6" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5.586a1 1 0 0 1 .707.293l5.414 5.414a1 1 0 0 1 .293.707V19a2 2 0 0 1-2 2Z" />
            </svg>
          </span>
          <div className="space-y-1">
            <h1 className="text-xl font-bold text-slate-900">
              Scorecard Recommended
            </h1>
            <p className="text-sm text-slate-500">
              This scorecard hasn’t been started yet.
            </p>
          </div>
          <Link href={`/scorecard/${run.id}/step/1`} className="btn-primary mt-2">
            Start Scorecard
          </Link>
        </div>
      </div>
    );
  }

  // ── Computed scores ─────────────────────────────────────────────────────
  const answeredScores: QuestionScore[] = run.scores.map((s) => ({
    questionId: s.questionId,
    stepNumber: s.question.stepNumber,
    value: s.value,
    weight: s.question.weight,
  }));
  const overall = calculateOverallScore(answeredScores, SECTION_WEIGHTS);
  const commentByStep = new Map(
    run.stepComments.map((c) => [c.stepNumber, c.comment]),
  );
  const scoresByStep = new Map<number, typeof run.scores>();
  for (const score of run.scores) {
    const group = scoresByStep.get(score.question.stepNumber) ?? [];
    group.push(score);
    scoresByStep.set(score.question.stepNumber, group);
  }

  const overviewEntries = (
    [
      { label: "Pros", text: run.overview?.pros },
      { label: "Cons", text: run.overview?.cons },
      { label: "Summary", text: run.overview?.summary },
    ] as const
  ).filter((e) => e.text != null && e.text.trim().length > 0);

  return (
    <div className="animate-fade-in space-y-6">
      {backLink}

      <header className="space-y-1.5">
        <p className="text-sm font-medium text-brand-700">{run.name}</p>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
          Evaluation Complete
        </h1>
      </header>

      {/* Summary stats bar */}
      <div className="card grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Stat label="Questions answered" value={String(run.scores.length)} />
        <Stat
          label="Weighted score"
          value={`${round(overall.total)}%`}
          className={scorePercentColor(overall.total)}
        />
        <Stat label="Sections scored" value={String(overall.sections.length)} />
      </div>

      {/* Per-step cards */}
      <div className="space-y-4">
        {overall.sections.map((section) => {
          const step = STEP_BY_NUMBER.get(section.stepNumber);
          const stepScores = (scoresByStep.get(section.stepNumber) ?? [])
            .slice()
            .sort((a, b) => a.question.order - b.question.order);
          const comment = commentByStep.get(section.stepNumber);

          return (
            <section key={section.stepNumber} className="card space-y-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 className="font-semibold text-slate-900">
                    {step?.name ?? `Step ${section.stepNumber}`}
                  </h2>
                  <p className="text-xs text-slate-400">
                    Section weight {section.sectionWeight}%
                  </p>
                </div>
                <div className="text-right">
                  <p className={`text-2xl font-bold ${scorePercentColor(section.percentage)}`}>
                    {round(section.percentage)}%
                  </p>
                  <p className="text-xs text-slate-400">
                    {section.weightedContribution.toFixed(1)} pts to total
                  </p>
                </div>
              </div>

              <ul className="divide-y divide-surface-border/60">
                {stepScores.map((score) => (
                  <li
                    key={score.id}
                    className="flex items-start justify-between gap-3 py-2"
                  >
                    <div className="flex min-w-0 items-start gap-3">
                      <span
                        className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-sm font-bold ring-1 ring-inset ${scoreValueBadgeClasses(score.value)}`}
                      >
                        {score.value}
                      </span>
                      <span className="min-w-0 text-sm text-slate-700">
                        {score.question.text}
                      </span>
                    </div>
                    <span className="flex shrink-0 flex-col items-end text-sm">
                      <span className="font-medium text-slate-600">
                        {SCORE_LABELS[score.value]}
                      </span>
                      <span className="text-xs text-slate-400">
                        {score.question.weight}%
                      </span>
                    </span>
                  </li>
                ))}
              </ul>

              {comment && comment.trim().length > 0 && (
                <div className="rounded-lg bg-surface-muted p-3 text-sm text-slate-600">
                  <span className="font-medium text-slate-700">Comment:</span>{" "}
                  {comment}
                </div>
              )}
            </section>
          );
        })}
      </div>

      {/* Overview */}
      {overviewEntries.length > 0 && (
        <section className="card space-y-3">
          <h2 className="text-lg font-semibold text-slate-900">Overview</h2>
          {overviewEntries.map((entry) => (
            <div key={entry.label}>
              <p className="text-sm font-medium text-slate-700">{entry.label}</p>
              <p className="whitespace-pre-wrap text-sm text-slate-600">
                {entry.text}
              </p>
            </div>
          ))}
        </section>
      )}
    </div>
  );
}

function Stat({
  label,
  value,
  className,
}: {
  label: string;
  value: string;
  className?: string;
}) {
  return (
    <div>
      <p className="text-sm text-slate-500">{label}</p>
      <p className={`text-2xl font-bold text-slate-900 ${className ?? ""}`}>
        {value}
      </p>
    </div>
  );
}
