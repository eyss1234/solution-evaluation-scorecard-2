import { prisma } from "@/lib/db";
import { apiOk, apiError } from "@/lib/api";
import { financialEntryUpdateSchema } from "@/lib/validation";

interface RouteContext {
  params: Promise<{ projectId: string; entryId: string }>;
}

/** PATCH /api/projects/[projectId]/financial/entries/[entryId] — update name. */
export async function PATCH(request: Request, { params }: RouteContext) {
  try {
    const { projectId, entryId } = await params;
    const body = await request.json().catch(() => null);

    const parsed = financialEntryUpdateSchema.safeParse(body);
    if (!parsed.success) {
      const message = parsed.error.issues[0]?.message ?? "Invalid request body";
      return apiError(message, 400);
    }

    // Scope the entry to the project so cross-project ids 404 rather than edit.
    const existing = await prisma.financialEntry.findFirst({
      where: { id: entryId, projectId },
      select: { id: true },
    });
    if (!existing) {
      return apiError("Financial entry not found", 404);
    }

    const entry = await prisma.financialEntry.update({
      where: { id: entryId },
      data: { name: parsed.data.name },
    });

    return apiOk(entry);
  } catch (error) {
    console.error("PATCH financial entry failed:", error);
    return apiError("Failed to update financial entry", 500);
  }
}

/**
 * DELETE /api/projects/[projectId]/financial/entries/[entryId] — delete an
 * entry and its costs (FinancialCost cascades on the entry relation).
 */
export async function DELETE(_request: Request, { params }: RouteContext) {
  try {
    const { projectId, entryId } = await params;

    const existing = await prisma.financialEntry.findFirst({
      where: { id: entryId, projectId },
      select: { id: true },
    });
    if (!existing) {
      return apiError("Financial entry not found", 404);
    }

    await prisma.financialEntry.delete({ where: { id: entryId } });

    return apiOk({ id: entryId });
  } catch (error) {
    console.error("DELETE financial entry failed:", error);
    return apiError("Failed to delete financial entry", 500);
  }
}
