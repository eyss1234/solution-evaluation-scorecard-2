"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { STEPS, TOTAL_STEPS } from "@/lib/steps";
import { SCORE_LABELS, scorePercentColor } from "@/lib/score-labels";
import { useScorecard } from "@/contexts/ScorecardContext";
import {
  calculateOverallScore,
  type QuestionScore,
  type SectionWeights,
} from "@/domain/scorecard/calculate";

const SCORING_STEPS = STEPS.filter((s) => s.questionsPerStep > 0);
const SECTION_WEIGHTS: SectionWeights = new Map(
  STEPS.map((s) => [s.number, s.sectionWeight]),
);

export function ScorecardReview() {
  const router = useRouter();
  const {
    runId,
    questions,
    scores,
    stepComments,
    overview,
    getStepQuestions,
    getStepScore,
  } = useScorecard();

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const totalQuestions = questions.length;
  const answeredQuestions = questions.filter(
    (q) => scores[q.id] !== undefined,
  ).length;
  const allAnswered = answeredQuestions === totalQuestions;

  const answeredScores: QuestionScore[] = questions
    .filter((q) => scores[q.id] !== undefined)
    .map((q) => ({
      questionId: q.id,
      stepNumber: q.stepNumber,
      value: scores[q.id],
      weight: q.weight,
    }));
  const overall = calculateOverallScore(answeredScores, SECTION_WEIGHTS);

  const overviewEntries = (
    [
      { label: "Pros", text: overview.pros },
      { label: "Cons", text: overview.cons },
      { label: "Summary", text: overview.summary },
    ] as const
  ).filter((entry) => entry.text != null && entry.text.trim().length > 0);

  async function handleSubmit() {
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch(`/api/scorecard/${runId}/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          scores: questions
            .filter((q) => scores[q.id] !== undefined)
            .map((q) => ({ questionId: q.id, value: scores[q.id] })),
        }),
      });
      const json = await res.json();
      if (!res.ok || !json.ok) {
        setError(json?.error?.message ?? "Failed to submit the evaluation.");
        return;
      }
      router.push(`/scorecard/${runId}`);
      router.refresh();
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          Review &amp; Submit
        </h1>
      </header>

      <div className="card flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-sm text-slate-500">Questions answered</p>
          <p className="text-2xl font-bold text-slate-900">
            {answeredQuestions}
            <span className="text-base font-normal text-slate-400">
              {" "}
              / {totalQuestions}
            </span>
          </p>
        </div>
        <div className="text-right">
          <p className="text-sm text-slate-500">Overall weighted score</p>
          <p className={`text-3xl font-bold ${scorePercentColor(overall.total)}`}>
            {Math.round(overall.total)}%
          </p>
        </div>
      </div>

      <div className="space-y-3">
        {SCORING_STEPS.map((step) => {
          const section = getStepScore(step.number);
          const comment = stepComments[step.number];
          return (
            <details key={step.number} className="card group">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-3 [&::-webkit-details-marker]:hidden">
                <span className="flex items-center gap-2">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-4 w-4 text-slate-400 transition-transform group-open:rotate-90" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" d="m9 5 7 7-7 7" />
                  </svg>
                  <span className="font-medium text-slate-900">{step.name}</span>
                  <span className="text-xs text-slate-400">
                    {step.sectionWeight}%
                  </span>
                </span>
                <span className={`font-semibold ${scorePercentColor(section.percentage)}`}>
                  {Math.round(section.percentage)}%
                </span>
              </summary>

              <div className="mt-3 border-t border-surface-border pt-3">
                <ul>
                  {getStepQuestions(step.number).map((question) => {
                    const value = scores[question.id];
                    return (
                      <li
                        key={question.id}
                        className="flex items-start justify-between gap-3 border-b border-surface-border/60 py-2 last:border-0"
                      >
                        <span className="text-sm text-slate-600">
                          {question.text}
                        </span>
                        <span className="flex shrink-0 items-center gap-3 text-sm">
                          <span className="text-xs text-slate-400">
                            {question.weight}%
                          </span>
                          {value !== undefined ? (
                            <span className="font-medium text-slate-700">
                              {value}/5{" "}
                              <span className="text-slate-500">
                                {SCORE_LABELS[value]}
                              </span>
                            </span>
                          ) : (
                            <span className="text-slate-400">Not scored</span>
                          )}
                        </span>
                      </li>
                    );
                  })}
                </ul>

                {comment && comment.trim().length > 0 && (
                  <div className="mt-3 rounded-lg bg-surface-muted p-3 text-sm text-slate-600">
                    <span className="font-medium text-slate-700">Comment:</span>{" "}
                    {comment}
                  </div>
                )}
              </div>
            </details>
          );
        })}
      </div>

      {overviewEntries.length > 0 && (
        <section className="card space-y-3">
          <h2 className="text-lg font-semibold text-slate-900">Overview</h2>
          {overviewEntries.map((entry) => (
            <div key={entry.label}>
              <p className="text-sm font-medium text-slate-700">{entry.label}</p>
              <p className="whitespace-pre-wrap text-sm text-slate-600">
                {entry.text}
              </p>
            </div>
          ))}
        </section>
      )}

      {error && (
        <p role="alert" className="text-sm text-red-600">
          {error}
        </p>
      )}

      <div className="flex items-center justify-between gap-3">
        <Link href={`/scorecard/${runId}/step/${TOTAL_STEPS}`} className="btn-secondary">
          Back to Step {TOTAL_STEPS}
        </Link>
        <div className="flex flex-col items-end gap-1">
          {!allAnswered && (
            <p className="text-xs text-slate-500">
              {totalQuestions - answeredQuestions} question
              {totalQuestions - answeredQuestions === 1 ? "" : "s"} not yet
              scored.
            </p>
          )}
          <button
            type="button"
            onClick={handleSubmit}
            disabled={submitting}
            className="btn-primary disabled:opacity-50"
          >
            {submitting ? "Submitting…" : "Submit Evaluation"}
          </button>
        </div>
      </div>
    </div>
  );
}
