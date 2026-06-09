import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";
import { apiOk, apiError } from "@/lib/api";
import { scorecardSaveSchema } from "@/lib/validation";
import { persistScorecardProgress, findRunWithProgress } from "@/lib/scorecard-save";

interface RouteContext {
  params: Promise<{ runId: string }>;
}

/**
 * POST /api/scorecard/[runId]/save — save progress by upserting scores and an
 * optional step comment. Leaves the run as a draft (does not mark it complete).
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
    const updated = await findRunWithProgress(runId);

    return apiOk(updated);
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2003"
    ) {
      return apiError("Unknown question reference", 400);
    }
    console.error("POST /api/scorecard/[runId]/save failed:", error);
    return apiError("Failed to save scorecard progress", 500);
  }
}
