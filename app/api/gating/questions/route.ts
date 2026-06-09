import { prisma } from "@/lib/db";
import { apiOk, apiError } from "@/lib/api";

/** GET /api/gating/questions — fetch all gate questions ordered by `order`. */
export async function GET() {
  try {
    const questions = await prisma.gateQuestion.findMany({
      orderBy: { order: "asc" },
    });

    return apiOk(questions);
  } catch (error) {
    console.error("GET /api/gating/questions failed:", error);
    return apiError("Failed to fetch gate questions", 500);
  }
}
