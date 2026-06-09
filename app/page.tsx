import Link from "next/link";
import { prisma } from "@/lib/db";
import { evaluateGating } from "@/domain/gating/evaluate";
import { CreateProjectForm } from "@/components/CreateProjectForm";

// Always render fresh — this is a DB-backed dashboard.
export const dynamic = "force-dynamic";

type GateStatus = "not-started" | "passed" | "failed";

const dateFormatter = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "short",
  year: "numeric",
});

export default async function HomePage() {
  const projects = await prisma.project.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      gatingRuns: {
        orderBy: { createdAt: "desc" },
        take: 1,
        include: { answers: { select: { questionId: true, value: true } } },
      },
      _count: { select: { scorecardRuns: true } },
    },
  });

  return (
    <div className="animate-fade-in space-y-10">
      <header className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
          Solution Evaluation Scorecard
        </h1>
        <p className="max-w-2xl text-slate-600">
          Create and manage evaluation projects — gate them for significance,
          then score and compare candidate solutions on a single transparent
          scale.
        </p>
      </header>

      <section className="card">
        <h2 className="text-base font-semibold text-slate-900">
          Create a new project
        </h2>
        <p className="mb-4 mt-1 text-sm text-slate-500">
          Give your evaluation a name to get started.
        </p>
        <CreateProjectForm />
      </section>

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-900">Projects</h2>
          {projects.length > 0 && (
            <span className="text-sm text-slate-500">
              {projects.length} {projects.length === 1 ? "project" : "projects"}
            </span>
          )}
        </div>

        {projects.length === 0 ? (
          <EmptyState />
        ) : (
          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {projects.map((project) => {
              const latestRun = project.gatingRuns[0];
              const status: GateStatus = !latestRun
                ? "not-started"
                : evaluateGating(latestRun.answers).shouldProceed
                  ? "passed"
                  : "failed";
              const scorecardCount = project._count.scorecardRuns;

              return (
                <li key={project.id}>
                  <Link
                    href={`/project/${project.id}`}
                    className="card group flex h-full flex-col gap-4"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <h3 className="font-semibold text-slate-900 transition-colors group-hover:text-brand-700">
                        {project.name}
                      </h3>
                      <GatingBadge status={status} />
                    </div>

                    <div className="mt-auto flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-slate-500">
                      <span>{dateFormatter.format(project.createdAt)}</span>
                      <span aria-hidden="true">·</span>
                      <span>
                        {scorecardCount}{" "}
                        {scorecardCount === 1 ? "scorecard" : "scorecards"}
                      </span>
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}

function GatingBadge({ status }: { status: GateStatus }) {
  const config: Record<GateStatus, { label: string; className: string }> = {
    "not-started": {
      label: "Not Started",
      className: "bg-surface-subtle text-slate-600 ring-slate-500/20",
    },
    passed: {
      label: "Gate Passed",
      className: "bg-emerald-50 text-emerald-700 ring-emerald-600/20",
    },
    failed: {
      label: "Gate Failed",
      className: "bg-red-50 text-red-700 ring-red-600/20",
    },
  };
  const { label, className } = config[status];

  return (
    <span
      className={`inline-flex shrink-0 items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${className}`}
    >
      {label}
    </span>
  );
}

function EmptyState() {
  return (
    <div className="card flex flex-col items-center justify-center gap-3 py-14 text-center">
      <span className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-50 text-brand-600">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
          className="h-6 w-6"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M3.75 9.776c.112-.017.227-.026.344-.026h15.812c.117 0 .232.009.344.026m-16.5 0a2.25 2.25 0 0 0-1.883 2.542l.857 6a2.25 2.25 0 0 0 2.227 1.932H19.05a2.25 2.25 0 0 0 2.227-1.932l.857-6a2.25 2.25 0 0 0-1.883-2.542m-16.5 0V6A2.25 2.25 0 0 1 6 3.75h3.879a1.5 1.5 0 0 1 1.06.44l2.122 2.12a1.5 1.5 0 0 0 1.06.44H18A2.25 2.25 0 0 1 20.25 9v.776"
          />
        </svg>
      </span>
      <div className="space-y-1">
        <h3 className="font-semibold text-slate-900">No projects yet</h3>
        <p className="text-sm text-slate-500">
          Create your first project above to begin evaluating solutions.
        </p>
      </div>
    </div>
  );
}
