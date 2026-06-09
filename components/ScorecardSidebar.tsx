"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { STEPS } from "@/lib/steps";
import { useScorecard } from "@/contexts/ScorecardContext";

interface ScorecardSidebarProps {
  runId: string;
  projectId: string;
  projectName: string;
}

type CurrentStep = number | "review" | null;

function parseCurrentStep(pathname: string): CurrentStep {
  const stepMatch = pathname.match(/\/step\/(\d+)/);
  if (stepMatch) return Number(stepMatch[1]);
  if (pathname.endsWith("/review")) return "review";
  return null;
}

export function ScorecardSidebar({
  runId,
  projectId,
  projectName,
}: ScorecardSidebarProps) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const current = parseCurrentStep(pathname);

  const currentLabel =
    current === "review"
      ? "Review & Submit"
      : (STEPS.find((s) => s.number === current)?.name ?? "Scorecard");

  const nav = (
    <SidebarNav
      runId={runId}
      projectId={projectId}
      projectName={projectName}
      current={current}
      onNavigate={() => setOpen(false)}
    />
  );

  return (
    <>
      {/* Mobile top bar */}
      <div className="flex items-center gap-3 rounded-xl border border-surface-border bg-surface p-3 lg:hidden">
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label="Open steps menu"
          className="rounded-lg border border-surface-border p-2 text-slate-600 transition-colors hover:bg-surface-subtle"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-5 w-5" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5M3.75 17.25h16.5" />
          </svg>
        </button>
        <span className="text-sm font-medium text-slate-700">{currentLabel}</span>
      </div>

      {/* Desktop sidebar */}
      <aside className="hidden shrink-0 lg:block lg:w-96">
        <div className="sticky top-20">{nav}</div>
      </aside>

      {/* Mobile drawer */}
      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-slate-900/40"
            onClick={() => setOpen(false)}
            aria-hidden="true"
          />
          <div className="absolute left-0 top-0 h-full w-80 max-w-[85%] overflow-y-auto bg-surface-muted p-4 shadow-card-hover">
            <div className="mb-3 flex justify-end">
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close steps menu"
                className="rounded-lg p-2 text-slate-500 transition-colors hover:bg-surface-subtle"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-5 w-5" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            {nav}
          </div>
        </div>
      )}
    </>
  );
}

function SidebarNav({
  runId,
  projectId,
  projectName,
  current,
  onNavigate,
}: {
  runId: string;
  projectId: string;
  projectName: string;
  current: CurrentStep;
  onNavigate: () => void;
}) {
  const { isStepComplete, isStepPartiallyComplete } = useScorecard();

  return (
    <nav className="flex flex-col gap-4 rounded-2xl border border-surface-border bg-surface p-4 shadow-card">
      <div className="flex items-center gap-2.5">
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-brand-500 to-brand-700 text-sm font-bold text-white shadow-sm">
          SE
        </span>
        <span className="text-sm font-semibold tracking-tight text-slate-900">
          Scorecard
        </span>
      </div>

      <Link
        href={`/project/${projectId}`}
        onClick={onNavigate}
        className="group flex items-center gap-1.5 text-sm text-slate-500 transition-colors hover:text-slate-900"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-4 w-4" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
        </svg>
        <span className="min-w-0">
          Back to Project
          <span className="block truncate text-xs text-slate-400">{projectName}</span>
        </span>
      </Link>

      <span className="inline-flex w-fit items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700 ring-1 ring-inset ring-emerald-600/20">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} className="h-3.5 w-3.5" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
        </svg>
        Gate Passed
      </span>

      <ul className="flex flex-col gap-1">
        {STEPS.map((step) => {
          const complete = isStepComplete(step.number);
          const partial = isStepPartiallyComplete(step.number);
          const isCurrent = current === step.number;

          return (
            <li key={step.number}>
              <Link
                href={`/scorecard/${runId}/step/${step.number}`}
                onClick={onNavigate}
                aria-current={isCurrent ? "step" : undefined}
                className={`flex items-center gap-3 rounded-lg px-2.5 py-2 text-sm transition-colors ${
                  isCurrent
                    ? "bg-brand-50 font-medium text-brand-700"
                    : "text-slate-600 hover:bg-surface-subtle hover:text-slate-900"
                }`}
              >
                <span
                  className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-semibold ${
                    isCurrent
                      ? "bg-brand-600 text-white"
                      : "bg-surface-subtle text-slate-500"
                  }`}
                >
                  {step.number}
                </span>
                <span className="min-w-0 flex-1 truncate">{step.name}</span>
                <StepIndicator complete={complete} partial={partial} />
              </Link>
            </li>
          );
        })}
      </ul>

      <Link
        href={`/scorecard/${runId}/review`}
        onClick={onNavigate}
        aria-current={current === "review" ? "step" : undefined}
        className={`mt-1 inline-flex items-center justify-center rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
          current === "review"
            ? "bg-brand-700 text-white"
            : "bg-brand-600 text-white hover:bg-brand-700"
        }`}
      >
        Review &amp; Submit
      </Link>
    </nav>
  );
}

function StepIndicator({
  complete,
  partial,
}: {
  complete: boolean;
  partial: boolean;
}) {
  if (complete) {
    return (
      <span className="flex h-5 w-5 shrink-0 items-center justify-center text-emerald-600" aria-label="Complete">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} className="h-4 w-4" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
        </svg>
      </span>
    );
  }
  if (partial) {
    return (
      <span className="flex h-5 w-5 shrink-0 items-center justify-center" aria-label="In progress">
        <span className="h-2 w-2 rounded-full bg-amber-500" />
      </span>
    );
  }
  return (
    <span className="flex h-5 w-5 shrink-0 items-center justify-center" aria-label="Not started">
      <span className="h-2.5 w-2.5 rounded-full border border-surface-border" />
    </span>
  );
}
