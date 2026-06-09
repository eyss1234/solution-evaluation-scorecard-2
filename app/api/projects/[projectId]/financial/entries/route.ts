import { prisma } from "@/lib/db";
import { apiOk, apiError } from "@/lib/api";
import { financialEntryInputSchema } from "@/lib/validation";

interface RouteContext {
  params: Promise<{ projectId: string }>;
}

/**
 * POST /api/projects/[projectId]/financial/entries — create a financial entry.
 * The display `order` is assigned server-side as the next value for the project.
 */
export async function POST(request: Request, { params }: RouteContext) {
  try {
    const { projectId } = await params;
    const body = await request.json().catch(() => null);

    const parsed = financialEntryInputSchema.safeParse(body);
    if (!parsed.success) {
      const message = parsed.error.issues[0]?.message ?? "Invalid request body";
      return apiError(message, 400);
    }

    const project = await prisma.project.findUnique({
      where: { id: projectId },
      select: { id: true },
    });
    if (!project) {
      return apiError("Project not found", 404);
    }

    // Append after the current highest order for this project.
    const { _max } = await prisma.financialEntry.aggregate({
      where: { projectId },
      _max: { order: true },
    });
    const order = (_max.order ?? 0) + 1;

    const entry = await prisma.financialEntry.create({
      data: {
        projectId,
        name: parsed.data.name,
        category: parsed.data.category,
        order,
      },
    });

    return apiOk(entry, 201);
  } catch (error) {
    console.error("POST /api/projects/[projectId]/financial/entries failed:", error);
    return apiError("Failed to create financial entry", 500);
  }
}
