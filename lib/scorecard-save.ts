import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";
import type { ScorecardSaveInput } from "@/lib/validation";

/**
 * Upsert a batch of scores and (optionally) a step comment for a run, in a
 * single transaction. Shared by the save and submit routes. The caller is
 * responsible for verifying the run exists first.
 */
export async function persistScorecardProgress(
  runId: string,
  input: ScorecardSaveInput,
): Promise<void> {
  const operations: Prisma.PrismaPromise<unknown>[] = input.scores.map((score) =>
    prisma.scorecardScore.upsert({
      where: { runId_questionId: { runId, questionId: score.questionId } },
      create: { runId, questionId: score.questionId, value: score.value },
      update: { value: score.value },
    }),
  );

  if (input.stepComment !== undefined && input.stepNumber !== undefined) {
    operations.push(
      prisma.scorecardStepComment.upsert({
        where: { runId_stepNumber: { runId, stepNumber: input.stepNumber } },
        create: {
          runId,
          stepNumber: input.stepNumber,
          comment: input.stepComment,
        },
        update: { comment: input.stepComment },
      }),
    );
  }

  if (operations.length > 0) {
    await prisma.$transaction(operations);
  }
}

/** Fetch a run with the data the save/submit routes return to the client. */
export function findRunWithProgress(runId: string) {
  return prisma.scorecardRun.findUnique({
    where: { id: runId },
    include: {
      scores: true,
      stepComments: { orderBy: { stepNumber: "asc" } },
    },
  });
}
