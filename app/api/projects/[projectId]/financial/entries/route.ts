import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";
import { apiOk, apiError } from "@/lib/api";
import { financialEntryInputSchema } from "@/lib/validation";

interface RouteContext {
  params: Promise<{ projectId: string }>;
}

const MAX_ORDER_ATTEMPTS = 3;

/**
 * Create an entry with the next `order` for its project, computing the order
 * and inserting inside a serializable transaction so concurrent creates can't
 * produce duplicate orders. A write conflict (P2034) is retried a few times.
 */
async function createEntryWithNextOrder(
  projectId: string,
  name: string,
  category: Prisma.FinancialEntryCreateInput["category"],
) {
  let lastError: unknown;

  for (let attempt = 1; attempt <= MAX_ORDER_ATTEMPTS; attempt++) {
    try {
      return await prisma.$transaction(
        async (tx) => {
          const { _max } = await tx.financialEntry.aggregate({
            where: { projectId },
            _max: { order: true },
          });
          return tx.financialEntry.create({
            data: { projectId, name, category, order: (_max.order ?? 0) + 1 },
          });
        },
        { isolationLevel: Prisma.TransactionIsolationLevel.Serializable },
      );
    } catch (error) {
      lastError = error;
      const isWriteConflict =
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === "P2034";
      if (!isWriteConflict) throw error;
    }
  }

  throw lastError;
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

    const entry = await createEntryWithNextOrder(
      projectId,
      parsed.data.name,
      parsed.data.category,
    );

    return apiOk(entry, 201);
  } catch (error) {
    console.error("POST /api/projects/[projectId]/financial/entries failed:", error);
    return apiError("Failed to create financial entry", 500);
  }
}
