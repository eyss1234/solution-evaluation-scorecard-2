import { prisma } from "@/lib/db";
import { apiOk, apiError } from "@/lib/api";
import { STEPS } from "@/lib/steps";
import {
  calculateOverallScore,
  type QuestionScore,
  type SectionWeights,
} from "@/domain/scorecard/calculate";
import {
  calculateCategoryTotals,
  calculateGrandTotal,
  type FinancialEntry,
  type FinancialCost,
} from "@/domain/financial/calculate";
import { formatCurrency, type Currency } from "@/domain/financial/format";

interface RouteContext {
  params: Promise<{ runId: string }>;
}

const round2 = (n: number): number => Math.round(n * 100) / 100;

/**
 * GET /api/scorecard/[runId]/export-data — assemble all of a run's data,
 * grouped by step with computed section/overall scores and financial totals,
 * shaped for PDF rendering.
 */
export async function GET(_request: Request, { params }: RouteContext) {
  try {
    const { runId } = await params;

    const run = await prisma.scorecardRun.findUnique({
      where: { id: runId },
      include: {
        project: {
          include: {
            financialSettings: true,
            financialEntries: { orderBy: { order: "asc" } },
          },
        },
        scores: { include: { question: true } },
        overview: true,
        stepComments: true,
        financialCosts: true,
      },
    });

    if (!run) {
      return apiError("Scorecard run not found", 404);
    }

    // All questions, so the export shows unanswered ones too.
    const questions = await prisma.scorecardQuestion.findMany({
      orderBy: [{ stepNumber: "asc" }, { order: "asc" }],
    });

    const valueByQuestion = new Map(run.scores.map((s) => [s.questionId, s.value]));
    const commentByStep = new Map(
      run.stepComments.map((c) => [c.stepNumber, c.comment]),
    );

    // Computed scores via the pure domain logic.
    const scoresForCalc: QuestionScore[] = run.scores.map((s) => ({
      questionId: s.questionId,
      stepNumber: s.question.stepNumber,
      value: s.value,
      weight: s.question.weight,
    }));
    const sectionWeights: SectionWeights = new Map(
      STEPS.map((s) => [s.number, s.sectionWeight]),
    );
    const overall = calculateOverallScore(scoresForCalc, sectionWeights);
    const sectionByStep = new Map(overall.sections.map((s) => [s.stepNumber, s]));

    const steps = STEPS.map((step) => {
      const section = sectionByStep.get(step.number);
      return {
        number: step.number,
        name: step.name,
        sectionWeight: step.sectionWeight,
        score: section
          ? {
              percentage: round2(section.percentage),
              rawAverage: round2(section.rawAverage),
            }
          : null,
        comment: commentByStep.get(step.number) ?? null,
        questions: questions
          .filter((q) => q.stepNumber === step.number)
          .map((q) => ({
            id: q.id,
            text: q.text,
            order: q.order,
            weight: q.weight,
            value: valueByQuestion.get(q.id) ?? null,
            criteria: q.criteria,
          })),
      };
    });

    // Financial summary via the pure domain logic.
    const currency: Currency = run.project.financialSettings?.currency ?? "GBP";
    const entries: FinancialEntry[] = run.project.financialEntries.map((e) => ({
      id: e.id,
      name: e.name,
      category: e.category,
    }));
    const costs: FinancialCost[] = run.financialCosts.map((c) => ({
      entryId: c.entryId,
      scorecardRunId: c.scorecardRunId,
      amount: Number(c.amount),
    }));
    const grandTotal = calculateGrandTotal(entries, costs, run.id);

    const data = {
      generatedAt: new Date().toISOString(),
      project: { id: run.project.id, name: run.project.name },
      run: {
        id: run.id,
        name: run.name,
        createdAt: run.createdAt,
        submittedAt: run.submittedAt,
        isComplete: run.submittedAt !== null,
      },
      overall: { total: round2(overall.total) },
      steps,
      overview: run.overview
        ? {
            pros: run.overview.pros,
            cons: run.overview.cons,
            summary: run.overview.summary,
          }
        : null,
      financial: {
        currency,
        grandTotal,
        grandTotalFormatted: formatCurrency(grandTotal, currency),
        categoryTotals: calculateCategoryTotals(entries, costs, run.id).map(
          (t) => ({ ...t, formatted: formatCurrency(t.total, currency) }),
        ),
      },
    };

    return apiOk(data);
  } catch (error) {
    console.error("GET /api/scorecard/[runId]/export-data failed:", error);
    return apiError("Failed to build export data", 500);
  }
}
