import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";
import { apiOk, apiError } from "@/lib/api";
import { scorecardRunUpdateSchema } from "@/lib/validation";

interface RouteContext {
  params: Promise<{ runId: string }>;
}

function isRecordNotFound(error: unknown): boolean {
  return (
    error instanceof Prisma.PrismaClientKnownRequestError &&
    error.code === "P2025"
  );
}

/**
 * GET /api/scorecard/[runId] — fetch a run with its scores (and the questions
 * they answer), overview, and step comments.
 */
export async function GET(_request: Request, { params }: RouteContext) {
  try {
    const { runId } = await params;

    const run = await prisma.scorecardRun.findUnique({
      where: { id: runId },
      include: {
        scores: {
          include: { question: true },
          orderBy: [
            { question: { stepNumber: "asc" } },
            { question: { order: "asc" } },
          ],
        },
        overview: true,
        stepComments: { orderBy: { stepNumber: "asc" } },
      },
    });

    if (!run) {
      return apiError("Scorecard run not found", 404);
    }

    return apiOk(run);
  } catch (error) {
    console.error("GET /api/scorecard/[runId] failed:", error);
    return apiError("Failed to fetch scorecard run", 500);
  }
}

/** PATCH /api/scorecard/[runId] — rename a run. */
export async function PATCH(request: Request, { params }: RouteContext) {
  try {
    const { runId } = await params;
    const body = await request.json().catch(() => null);

    const parsed = scorecardRunUpdateSchema.safeParse(body);
    if (!parsed.success) {
      const message = parsed.error.issues[0]?.message ?? "Invalid request body";
      return apiError(message, 400);
    }

    const run = await prisma.scorecardRun.update({
      where: { id: runId },
      data: { name: parsed.data.name },
    });

    return apiOk(run);
  } catch (error) {
    if (isRecordNotFound(error)) {
      return apiError("Scorecard run not found", 404);
    }
    console.error("PATCH /api/scorecard/[runId] failed:", error);
    return apiError("Failed to update scorecard run", 500);
  }
}

/** DELETE /api/scorecard/[runId] — delete a run (cascades to its children). */
export async function DELETE(_request: Request, { params }: RouteContext) {
  try {
    const { runId } = await params;

    await prisma.scorecardRun.delete({ where: { id: runId } });

    return apiOk({ id: runId });
  } catch (error) {
    if (isRecordNotFound(error)) {
      return apiError("Scorecard run not found", 404);
    }
    console.error("DELETE /api/scorecard/[runId] failed:", error);
    return apiError("Failed to delete scorecard run", 500);
  }
}
