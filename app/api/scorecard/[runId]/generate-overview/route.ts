import { prisma } from "@/lib/db";
import { apiOk, apiError } from "@/lib/api";
import { generateOverviewSchema } from "@/lib/validation";
import { generateChatCompletion, OpenAIConfigError } from "@/lib/openai";
import { STEPS } from "@/lib/steps";

interface RouteContext {
  params: Promise<{ runId: string }>;
}

interface Criterion {
  score: number;
  description: string;
}

const INSTRUCTIONS: Record<"pros" | "cons" | "summary", string> = {
  pros: "Identify the key strengths of this solution. Respond with a concise, professional bulleted list of pros grounded in the scores above.",
  cons: "Identify the key weaknesses, risks, and concerns for this solution. Respond with a concise, professional bulleted list of cons grounded in the scores above.",
  summary:
    "Write a brief executive summary (2–3 short paragraphs) of this solution evaluation, suitable for senior stakeholders.",
};

const SYSTEM_PROMPT =
  "You are an expert solution evaluation analyst helping a team document a software and vendor selection decision. Base your response strictly on the scorecard data provided. Be objective, concise, and professional.";

/**
 * POST /api/scorecard/[runId]/generate-overview — generate pros/cons/summary
 * text from the run's scores via OpenAI (gpt-4o-mini).
 */
export async function POST(request: Request, { params }: RouteContext) {
  try {
    const { runId } = await params;
    const body = await request.json().catch(() => null);

    const parsed = generateOverviewSchema.safeParse(body);
    if (!parsed.success) {
      const message = parsed.error.issues[0]?.message ?? "Invalid request body";
      return apiError(message, 400);
    }
    const { type } = parsed.data;

    const run = await prisma.scorecardRun.findUnique({
      where: { id: runId },
      include: { scores: { include: { question: true } } },
    });
    if (!run) {
      return apiError("Scorecard run not found", 404);
    }
    if (run.scores.length === 0) {
      return apiError("No scores recorded to generate an overview", 400);
    }

    const scorecardText = buildScorecardText(run.scores);
    const user = `Here is the scorecard for "${run.name ?? "this solution"}":\n\n${scorecardText}\n\n${INSTRUCTIONS[type]}`;

    const content = await generateChatCompletion({ system: SYSTEM_PROMPT, user });

    return apiOk({ type, content });
  } catch (error) {
    if (error instanceof OpenAIConfigError) {
      return apiError("AI overview generation is not configured", 500);
    }
    console.error("POST /api/scorecard/[runId]/generate-overview failed:", error);
    return apiError("Failed to generate overview", 502);
  }
}

/** Render the answered scores as a readable, step-grouped prompt section. */
function buildScorecardText(
  scores: {
    value: number;
    question: { text: string; stepNumber: number; order: number; criteria: unknown };
  }[],
): string {
  const lines: string[] = [];

  for (const step of STEPS) {
    const stepScores = scores
      .filter((s) => s.question.stepNumber === step.number)
      .sort((a, b) => a.question.order - b.question.order);
    if (stepScores.length === 0) continue;

    lines.push(`## ${step.name} (section weight ${step.sectionWeight}%)`);
    for (const score of stepScores) {
      const criteria = Array.isArray(score.question.criteria)
        ? (score.question.criteria as unknown as Criterion[])
        : [];
      const matched = criteria.find((c) => c.score === score.value);
      const detail = matched ? `: ${matched.description}` : "";
      lines.push(`- ${score.question.text} — scored ${score.value}/5${detail}`);
    }
    lines.push("");
  }

  return lines.join("\n").trim();
}
