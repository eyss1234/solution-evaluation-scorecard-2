"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { STEPS, TOTAL_STEPS } from "@/lib/steps";
import { SCORE_LABELS } from "@/lib/score-labels";
import { useScorecard } from "@/contexts/ScorecardContext";

interface ScorecardStepFormProps {
  stepNumber: number;
}

export function ScorecardStepForm({ stepNumber }: ScorecardStepFormProps) {
  const router = useRouter();
  const {
    runId,
    projectId,
    scores,
    setScore,
    stepComments,
    setStepComment,
    getStepQuestions,
    isStepComplete,
  } = useScorecard();

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const step = STEPS.find((s) => s.number === stepNumber);
  const questions = getStepQuestions(stepNumber);
  const comment = stepComments[stepNumber] ?? "";
  const complete = isStepComplete(stepNumber);

  const backHref =
    stepNumber === 1
      ? `/project/${projectId}`
      : `/scorecard/${runId}/step/${stepNumber - 1}`;
  const nextHref =
    stepNumber < TOTAL_STEPS
      ? `/scorecard/${runId}/step/${stepNumber + 1}`
      : `/scorecard/${runId}/review`;

  async function handleNext() {
    setSaving(true);
    setError(null);
    try {
      const stepScores = questions
        .filter((q) => scores[q.id] !== undefined)
        .map((q) => ({ questionId: q.id, value: scores[q.id] }));

      const trimmedComment = comment.trim();
      const body = {
        scores: stepScores,
        ...(trimmedComment ? { stepComment: trimmedComment, stepNumber } : {}),
      };

      const res = await fetch(`/api/scorecard/${runId}/save`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const json = await res.json();
      if (!res.ok || !json.ok) {
        setError(json?.error?.message ?? "Failed to save your scores.");
        return;
      }
      router.push(nextHref);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  if (!step) return null;

  return (
    <div className="space-y-6">
      <header className="space-y-1.5">
        <p className="text-sm font-medium text-brand-700">
          Step {stepNumber} of {TOTAL_STEPS}
        </p>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          {step.name}
        </h1>
        <p className="text-slate-600">{step.description}</p>
      </header>

      <ol className="space-y-4">
        {questions.map((question, index) => {
          const value = scores[question.id];
          const selectedCriterion =
            value !== undefined
              ? question.criteria.find((c) => c.score === value)
              : undefined;

          return (
            <li key={question.id} className="card space-y-4">
              <div className="flex items-start justify-between gap-3">
                <p className="font-medium text-slate-900">
                  <span className="text-slate-400">{index + 1}.</span>{" "}
                  {question.text}
                </p>
                <span className="inline-flex shrink-0 items-center rounded-full bg-surface-subtle px-2.5 py-0.5 text-xs font-medium text-slate-500">
                  Weight {question.weight}%
                </span>
              </div>

              <div
                className="grid grid-cols-3 gap-2 sm:grid-cols-6"
                role="radiogroup"
                aria-label={`Score for: ${question.text}`}
              >
                {SCORE_LABELS.map((label, score) => {
                  const selected = value === score;
                  return (
                    <button
                      key={score}
                      type="button"
                      role="radio"
                      aria-checked={selected}
                      onClick={() => setScore(question.id, score)}
                      className={`flex flex-col items-center gap-1 rounded-lg border px-2 py-2.5 text-center transition-all active:scale-95 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500 ${
                        selected
                          ? "border-brand-600 bg-brand-600 text-white shadow-sm"
                          : "border-surface-border bg-surface text-slate-600 hover:border-brand-300 hover:bg-surface-subtle"
                      }`}
                    >
                      <span className="text-lg font-bold leading-none">
                        {score}
                      </span>
                      <span
                        className={`text-[0.7rem] font-medium leading-tight ${
                          selected ? "text-white/90" : "text-slate-500"
                        }`}
                      >
                        {label}
                      </span>
                    </button>
                  );
                })}
              </div>

              {selectedCriterion && (
                <div className="rounded-lg border border-surface-border bg-surface-muted p-3 text-sm text-slate-600">
                  <span className="font-medium text-slate-700">
                    {SCORE_LABELS[value!]}:
                  </span>{" "}
                  {selectedCriterion.description}
                </div>
              )}
            </li>
          );
        })}
      </ol>

      <div className="card space-y-2">
        <label
          htmlFor="step-comment"
          className="block text-sm font-medium text-slate-700"
        >
          Comment <span className="text-slate-400">(optional)</span>
        </label>
        <textarea
          id="step-comment"
          value={comment}
          onChange={(e) => setStepComment(stepNumber, e.target.value)}
          rows={3}
          maxLength={5000}
          placeholder="Add any notes or rationale for this section…"
          className="input min-h-[5rem] resize-y"
        />
      </div>

      {error && (
        <p role="alert" className="text-sm text-red-600">
          {error}
        </p>
      )}

      <div className="flex items-center justify-between gap-3">
        <Link href={backHref} className="btn-secondary">
          Back
        </Link>
        <div className="flex flex-col items-end gap-1">
          <button
            type="button"
            onClick={handleNext}
            disabled={!complete || saving}
            className="btn-primary disabled:cursor-not-allowed disabled:opacity-50"
          >
            {saving ? "Saving…" : "Next"}
          </button>
          {!complete && (
            <p className="text-xs text-slate-500">
              Score every question to continue.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
