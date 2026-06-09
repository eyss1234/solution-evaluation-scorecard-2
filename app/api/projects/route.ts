import { prisma } from "@/lib/db";
import { apiOk, apiError } from "@/lib/api";
import { projectInputSchema } from "@/lib/validation";

/** POST /api/projects — create a new project. */
export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => null);

    const parsed = projectInputSchema.safeParse(body);
    if (!parsed.success) {
      const message = parsed.error.issues[0]?.message ?? "Invalid request body";
      return apiError(message, 400);
    }

    const project = await prisma.project.create({
      data: { name: parsed.data.name },
    });

    return apiOk(project, 201);
  } catch (error) {
    console.error("POST /api/projects failed:", error);
    return apiError("Failed to create project", 500);
  }
}
