import { prisma } from "@/lib/db";
import { apiOk, apiError } from "@/lib/api";
import { financialCostInputSchema } from "@/lib/validation";

interface RouteContext {
  params: Promise<{ projectId: string; entryId: string }>;
}

/**
 * PUT /api/projects/[projectId]/financial/entries/[entryId]/costs — upsert the
 * cost amount for this entry under a specific scorecard run.
 */
export async function PUT(request: Request, { params }: RouteContext) {
  try {
    const { projectId, entryId } = await params;
    const body = await request.json().catch(() => null);

    const parsed = financialCostInputSchema.safeParse(body);
    if (!parsed.success) {
      const message = parsed.error.issues[0]?.message ?? "Invalid request body";
      return apiError(message, 400);
    }
    const { scorecardRunId, amount } = parsed.data;

    // Both the entry and the run must belong to this project.
    const entry = await prisma.financialEntry.findFirst({
      where: { id: entryId, projectId },
      select: { id: true },
    });
    if (!entry) {
      return apiError("Financial entry not found", 404);
    }

    const run = await prisma.scorecardRun.findFirst({
      where: { id: scorecardRunId, projectId },
      select: { id: true },
    });
    if (!run) {
      return apiError("Scorecard run not found for this project", 404);
    }

    const cost = await prisma.financialCost.upsert({
      where: { entryId_scorecardRunId: { entryId, scorecardRunId } },
      create: { entryId, scorecardRunId, amount },
      update: { amount },
    });

    return apiOk(cost);
  } catch (error) {
    console.error("PUT financial cost failed:", error);
    return apiError("Failed to save financial cost", 500);
  }
}
