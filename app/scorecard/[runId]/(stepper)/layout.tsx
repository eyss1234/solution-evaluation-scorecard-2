import type { ReactNode } from "react";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { ScorecardShell } from "@/components/ScorecardShell";
import type {
  OverviewData,
  ScorecardCriterion,
  ScorecardQuestionData,
} from "@/contexts/ScorecardContext";

export const dynamic = "force-dynamic";

interface LayoutProps {
  children: ReactNode;
  params: Promise<{ runId: string }>;
}

export default async function StepperLayout({ children, params }: LayoutProps) {
  const { runId } = await params;

  const [run, questions] = await Promise.all([
    prisma.scorecardRun.findUnique({
      where: { id: runId },
      include: {
        project: { select: { id: true, name: true } },
        scores: { select: { questionId: true, value: true } },
        overview: true,
        stepComments: { select: { stepNumber: true, comment: true } },
      },
    }),
    prisma.scorecardQuestion.findMany({
      orderBy: [{ stepNumber: "asc" }, { order: "asc" }],
    }),
  ]);

  if (!run) notFound();

  const questionData: ScorecardQuestionData[] = questions.map((q) => ({
    id: q.id,
    text: q.text,
    stepNumber: q.stepNumber,
    order: q.order,
    weight: q.weight,
    criteria: parseCriteria(q.criteria),
  }));

  const initialScores: Record<string, number> = Object.fromEntries(
    run.scores.map((s) => [s.questionId, s.value]),
  );
  const initialStepComments: Record<number, string> = Object.fromEntries(
    run.stepComments.map((c) => [c.stepNumber, c.comment]),
  );
  const initialOverview: OverviewData = run.overview
    ? {
        pros: run.overview.pros,
        cons: run.overview.cons,
        summary: run.overview.summary,
      }
    : {};

  return (
    <ScorecardShell
      runId={run.id}
      projectId={run.project.id}
      projectName={run.project.name}
      questions={questionData}
      initialScores={initialScores}
      initialStepComments={initialStepComments}
      initialOverview={initialOverview}
    >
      {children}
    </ScorecardShell>
  );
}

/** Defensively parse the question `criteria` JSON into typed criterion rows. */
function parseCriteria(value: unknown): ScorecardCriterion[] {
  if (!Array.isArray(value)) return [];
  const result: ScorecardCriterion[] = [];
  for (const item of value) {
    if (item && typeof item === "object" && "score" in item && "description" in item) {
      const { score, description } = item as {
        score: unknown;
        description: unknown;
      };
      if (typeof score === "number" && typeof description === "string") {
        result.push({ score, description });
      }
    }
  }
  return result;
}
