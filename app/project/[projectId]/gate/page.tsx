import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { GatingForm } from "@/components/GatingForm";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ projectId: string }>;
}

export default async function GatePage({ params }: PageProps) {
  const { projectId } = await params;

  const [project, questions] = await Promise.all([
    prisma.project.findUnique({
      where: { id: projectId },
      select: { id: true, name: true },
    }),
    prisma.gateQuestion.findMany({
      orderBy: { order: "asc" },
      select: { id: true, text: true },
    }),
  ]);

  if (!project) notFound();

  return (
    <div className="animate-fade-in space-y-8">
      <div className="space-y-3">
        <Link
          href={`/project/${project.id}`}
          className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 transition-colors hover:text-slate-900"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-4 w-4" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
          </svg>
          {project.name}
        </Link>

        <div className="space-y-1.5">
          <p className="text-sm font-medium text-brand-700">{project.name}</p>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            Gating Questions
          </h1>
          <p className="max-w-2xl text-slate-600">
            Answer each question to decide whether this project warrants a full
            structured evaluation. If any answer is <strong>Yes</strong>, the
            project proceeds to the scorecard.
          </p>
        </div>
      </div>

      <GatingForm projectId={project.id} questions={questions} />
    </div>
  );
}
