"use client";

import type { ReactNode } from "react";
import {
  ScorecardProvider,
  type OverviewData,
  type ScorecardQuestionData,
} from "@/contexts/ScorecardContext";
import { ScorecardSidebar } from "@/components/ScorecardSidebar";

interface ScorecardShellProps {
  runId: string;
  projectId: string;
  projectName: string;
  questions: ScorecardQuestionData[];
  initialScores: Record<string, number>;
  initialStepComments: Record<number, string>;
  initialOverview: OverviewData;
  children: ReactNode;
}

/**
 * Client wrapper for the stepper flow: provides the scorecard state and lays
 * out the sidebar alongside the step content.
 */
export function ScorecardShell({
  runId,
  projectId,
  projectName,
  questions,
  initialScores,
  initialStepComments,
  initialOverview,
  children,
}: ScorecardShellProps) {
  return (
    <ScorecardProvider
      runId={runId}
      questions={questions}
      initialScores={initialScores}
      initialStepComments={initialStepComments}
      initialOverview={initialOverview}
    >
      <div className="flex flex-col gap-4 lg:flex-row lg:gap-8">
        <ScorecardSidebar
          runId={runId}
          projectId={projectId}
          projectName={projectName}
        />
        <div className="min-w-0 flex-1">{children}</div>
      </div>
    </ScorecardProvider>
  );
}
