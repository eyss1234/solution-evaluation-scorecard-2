import { prisma } from "@/lib/db";
import { apiOk, apiError } from "@/lib/api";
import { scorecardSaveSchema } from "@/lib/validation";
import { persistScorecardProgress } from "@/lib/scorecard-save";

interface RouteContext {
  params: Promise<{ runId: string }>;
}

/**
 * POST /api/scorecard/[runId]/submit — save the final scores/comment and mark
 * the run complete by stamping `submittedAt`.
 */
export async function POST(request: Request, { params }: RouteContext) {
  try {
    const { runId } = await params;
    const body = await request.json().catch(() => null);

    const parsed = scorecardSaveSchema.safeParse(body);
    if (!parsed.success) {
      const message = parsed.error.issues[0]?.message ?? "Invalid request body";
      return apiError(message, 400);
    }

    const run = await prisma.scorecardRun.findUnique({
      where: { id: runId },
      select: { id: true },
    });
    if (!run) {
      return apiError("Scorecard run not found", 404);
    }

    await persistScorecardProgress(runId, parsed.data);

    const updated = await prisma.scorecardRun.update({
      where: { id: runId },
      data: { submittedAt: new Date() },
      include: {
        scores: true,
        stepComments: { orderBy: { stepNumber: "asc" } },
      },
    });

    return apiOk(updated);
  } catch (error) {
    console.error("POST /api/scorecard/[runId]/submit failed:", error);
    return apiError("Failed to submit scorecard run", 500);
  }
}
