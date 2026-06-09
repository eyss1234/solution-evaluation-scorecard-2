import Link from "next/link";

interface GatingCardProps {
  projectId: string;
  status: "not-started" | "passed" | "failed";
  answeredYes: number;
}

export function GatingCard({ projectId, status, answeredYes }: GatingCardProps) {
  if (status === "not-started") {
    return (
      <section className="card flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <StatusIcon kind="clock" />
          <div>
            <h2 className="font-semibold text-slate-900">Gating Evaluation</h2>
            <p className="text-sm text-slate-500">Not Started</p>
          </div>
        </div>
        <Link href={`/project/${projectId}/gate`} className="btn-primary">
          Start Gating Evaluation
        </Link>
      </section>
    );
  }

  if (status === "passed") {
    return (
      <section className="card flex items-center gap-3">
        <StatusIcon kind="check" />
        <div>
          <h2 className="font-semibold text-slate-900">Gate Passed</h2>
          <p className="text-sm text-slate-500">
            {answeredYes} {answeredYes === 1 ? "answer" : "answers"} indicated a
            full evaluation is warranted.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="card flex items-center gap-3">
      <StatusIcon kind="x" />
      <div>
        <h2 className="font-semibold text-slate-900">Gate Failed</h2>
        <p className="text-sm text-slate-500">
          All gating questions were answered no — a full scorecard evaluation is
          not required for this project.
        </p>
      </div>
    </section>
  );
}

function StatusIcon({ kind }: { kind: "clock" | "check" | "x" }) {
  const base = "flex h-10 w-10 shrink-0 items-center justify-center rounded-full";
  if (kind === "clock") {
    return (
      <span className={`${base} bg-slate-100 text-slate-500`}>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="h-5 w-5" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6l4 2m6-2a10 10 0 1 1-20 0 10 10 0 0 1 20 0Z" />
        </svg>
      </span>
    );
  }
  if (kind === "check") {
    return (
      <span className={`${base} bg-emerald-50 text-emerald-600`}>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-5 w-5" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
        </svg>
      </span>
    );
  }
  return (
    <span className={`${base} bg-red-50 text-red-600`}>
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-5 w-5" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
      </svg>
    </span>
  );
}
