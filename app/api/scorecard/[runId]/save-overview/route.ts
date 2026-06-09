import { prisma } from "@/lib/db";
import { apiOk, apiError } from "@/lib/api";
import { scorecardOverviewSchema } from "@/lib/validation";

interface RouteContext {
  params: Promise<{ runId: string }>;
}

/**
 * POST /api/scorecard/[runId]/save-overview — upsert the run's overview
 * (pros / cons / summary). Omitted fields are left unchanged.
 */
export async function POST(request: Request, { params }: RouteContext) {
  try {
    const { runId } = await params;
    const body = await request.json().catch(() => null);

    const parsed = scorecardOverviewSchema.safeParse(body);
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

    const overview = await prisma.scorecardOverview.upsert({
      where: { runId },
      create: { runId, ...parsed.data },
      update: parsed.data,
    });

    return apiOk(overview);
  } catch (error) {
    console.error("POST /api/scorecard/[runId]/save-overview failed:", error);
    return apiError("Failed to save overview", 500);
  }
}
