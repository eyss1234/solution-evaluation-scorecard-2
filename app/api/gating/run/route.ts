import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";
import { apiOk, apiError } from "@/lib/api";
import { gatingRunInputSchema } from "@/lib/validation";
import { evaluateGating } from "@/domain/gating/evaluate";

/** POST /api/gating/run — create a gating run and evaluate the gate. */
export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => null);

    const parsed = gatingRunInputSchema.safeParse(body);
    if (!parsed.success) {
      const message = parsed.error.issues[0]?.message ?? "Invalid request body";
      return apiError(message, 400);
    }

    const { projectId, answers } = parsed.data;

    const run = await prisma.gatingRun.create({
      data: {
        projectId,
        answers: {
          create: answers.map((answer) => ({
            questionId: answer.questionId,
            value: answer.value,
          })),
        },
      },
    });

    const { shouldProceed, answeredYes, totalQuestions } =
      evaluateGating(answers);

    return apiOk({ runId: run.id, shouldProceed, answeredYes, totalQuestions }, 201);
  } catch (error) {
    // Unknown project/question reference, or a duplicate answer for a question.
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2003") {
        return apiError("Unknown project or question reference", 400);
      }
      if (error.code === "P2002") {
        return apiError("Duplicate answer for a question", 400);
      }
    }
    console.error("POST /api/gating/run failed:", error);
    return apiError("Failed to create gating run", 500);
  }
}
