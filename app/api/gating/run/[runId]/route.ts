import { prisma } from "@/lib/db";
import { apiOk, apiError } from "@/lib/api";

interface RouteContext {
  params: Promise<{ runId: string }>;
}

/** GET /api/gating/run/[runId] — fetch a gating run with its answers and questions. */
export async function GET(_request: Request, { params }: RouteContext) {
  try {
    const { runId } = await params;

    const run = await prisma.gatingRun.findUnique({
      where: { id: runId },
      include: {
        answers: {
          orderBy: { question: { order: "asc" } },
          include: { question: true },
        },
      },
    });

    if (!run) {
      return apiError("Gating run not found", 404);
    }

    return apiOk(run);
  } catch (error) {
    console.error("GET /api/gating/run/[runId] failed:", error);
    return apiError("Failed to fetch gating run", 500);
  }
}
