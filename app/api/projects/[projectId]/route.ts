import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";
import { apiOk, apiError } from "@/lib/api";
import { projectUpdateSchema } from "@/lib/validation";

interface RouteContext {
  params: Promise<{ projectId: string }>;
}

/** True when a Prisma operation failed because the record does not exist. */
function isRecordNotFound(error: unknown): boolean {
  return (
    error instanceof Prisma.PrismaClientKnownRequestError &&
    error.code === "P2025"
  );
}

/** GET /api/projects/[projectId] — fetch a project with all related data. */
export async function GET(_request: Request, { params }: RouteContext) {
  try {
    const { projectId } = await params;

    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: {
        financialSettings: true,
        financialEntries: { orderBy: { order: "asc" } },
        gatingRuns: { include: { answers: true } },
        scorecardRuns: {
          include: {
            scores: true,
            overview: true,
            stepComments: true,
            financialCosts: true,
          },
        },
      },
    });

    if (!project) {
      return apiError("Project not found", 404);
    }

    return apiOk(project);
  } catch (error) {
    console.error("GET /api/projects/[projectId] failed:", error);
    return apiError("Failed to fetch project", 500);
  }
}

/** PATCH /api/projects/[projectId] — update a project's name. */
export async function PATCH(request: Request, { params }: RouteContext) {
  try {
    const { projectId } = await params;
    const body = await request.json().catch(() => null);

    const parsed = projectUpdateSchema.safeParse(body);
    if (!parsed.success) {
      const message = parsed.error.issues[0]?.message ?? "Invalid request body";
      return apiError(message, 400);
    }

    const project = await prisma.project.update({
      where: { id: projectId },
      data: { name: parsed.data.name },
    });

    return apiOk(project);
  } catch (error) {
    if (isRecordNotFound(error)) {
      return apiError("Project not found", 404);
    }
    console.error("PATCH /api/projects/[projectId] failed:", error);
    return apiError("Failed to update project", 500);
  }
}

/** DELETE /api/projects/[projectId] — delete a project (cascades to children). */
export async function DELETE(_request: Request, { params }: RouteContext) {
  try {
    const { projectId } = await params;

    await prisma.project.delete({ where: { id: projectId } });

    return apiOk({ id: projectId });
  } catch (error) {
    if (isRecordNotFound(error)) {
      return apiError("Project not found", 404);
    }
    console.error("DELETE /api/projects/[projectId] failed:", error);
    return apiError("Failed to delete project", 500);
  }
}
