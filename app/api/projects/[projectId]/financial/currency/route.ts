import { prisma } from "@/lib/db";
import { apiOk, apiError } from "@/lib/api";
import { currencyUpdateSchema } from "@/lib/validation";

interface RouteContext {
  params: Promise<{ projectId: string }>;
}

/**
 * PUT /api/projects/[projectId]/financial/currency — set the project's
 * reporting currency, creating the financial settings row if needed.
 */
export async function PUT(request: Request, { params }: RouteContext) {
  try {
    const { projectId } = await params;
    const body = await request.json().catch(() => null);

    const parsed = currencyUpdateSchema.safeParse(body);
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

    const settings = await prisma.projectFinancialSettings.upsert({
      where: { projectId },
      create: { projectId, currency: parsed.data.currency },
      update: { currency: parsed.data.currency },
    });

    return apiOk(settings);
  } catch (error) {
    console.error("PUT financial currency failed:", error);
    return apiError("Failed to update currency", 500);
  }
}
