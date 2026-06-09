import { prisma } from "@/lib/db";
import { apiOk, apiError } from "@/lib/api";
import { scorecardRunInputSchema } from "@/lib/validation";

/** POST /api/scorecard — create a new scorecard run for a project. */
export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => null);

    const parsed = scorecardRunInputSchema.safeParse(body);
    if (!parsed.success) {
      const message = parsed.error.issues[0]?.message ?? "Invalid request body";
      return apiError(message, 400);
    }

    const { projectId, name } = parsed.data;

    // Verify the project exists so we can return a clean 404 rather than an
    // opaque foreign-key error.
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      select: { id: true },
    });
    if (!project) {
      return apiError("Project not found", 404);
    }

    // Default the name to "Scorecard N", where N is the next run number.
    const existingCount = await prisma.scorecardRun.count({
      where: { projectId },
    });

    const run = await prisma.scorecardRun.create({
      data: {
        projectId,
        name: name ?? `Scorecard ${existingCount + 1}`,
      },
    });

    return apiOk(run, 201);
  } catch (error) {
    console.error("POST /api/scorecard failed:", error);
    return apiError("Failed to create scorecard run", 500);
  }
}
