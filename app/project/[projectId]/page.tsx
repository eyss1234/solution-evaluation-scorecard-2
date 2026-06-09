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
import { calculateRunComparison } from "@/domain/scorecard/compare";
import { ProjectHeader } from "@/components/ProjectHeader";
import { FinancialComparison } from "@/components/FinancialComparison";
import { GatingCard } from "@/components/project/GatingCard";
import { ScorecardsCard } from "@/components/project/ScorecardsCard";
import { ScorecardComparisonCard } from "@/components/project/ScorecardComparisonCard";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ projectId: string }>;
}

const SECTION_WEIGHTS: SectionWeights = new Map(
  STEPS.map((s) => [s.number, s.sectionWeight]),
);

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

  // Newest-first for the list view.
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

  // Chronological (oldest-first) for the side-by-side comparison and financial
  // tables, so their columns line up consistently.
  const chronological = [...runViews].sort(
    (a, b) => a.createdAt.getTime() - b.createdAt.getTime(),
  );
  const completedRuns = chronological.filter((r) => r.completed);
  const comparison =
    completedRuns.length >= 2
      ? calculateRunComparison(
          completedRuns.map((r) => ({ runId: r.id, name: r.name, scores: r.scores })),
          SECTION_WEIGHTS,
        )
      : null;

  // Financial comparison data: scorecard runs as columns, entries with their
  // per-run cost amounts (Decimal → number for the client).
  const financialRuns = chronological.map((r) => ({ id: r.id, name: r.name }));
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
        className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 transition-colors hover:text-slate-900 print:hidden"
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
          <ScorecardComparisonCard comparison={comparison} />
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
