"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/contexts/ToastContext";

interface GateQuestion {
  id: string;
  text: string;
}

interface GatingFormProps {
  projectId: string;
  questions: GateQuestion[];
}

export function GatingForm({ projectId, questions }: GatingFormProps) {
  const router = useRouter();
  const { showToast } = useToast();
  const [answers, setAnswers] = useState<Record<string, boolean>>({});
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const total = questions.length;
  const answeredCount = useMemo(
    () => questions.filter((q) => answers[q.id] !== undefined).length,
    [questions, answers],
  );
  const allAnswered = total > 0 && answeredCount === total;
  const percent = total === 0 ? 0 : Math.round((answeredCount / total) * 100);

  function setAnswer(questionId: string, value: boolean) {
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
    if (error) setError(null);
  }

  async function handleSubmit() {
    if (!allAnswered) return;
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/gating/run", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectId,
          answers: questions.map((q) => ({
            questionId: q.id,
            value: answers[q.id],
          })),
        }),
      });
      const json = await res.json();
      if (!res.ok || !json.ok) {
        setError(json?.error?.message ?? "Failed to submit gating evaluation.");
        return;
      }
      showToast("Gating evaluation submitted");
      router.push(`/project/${projectId}`);
      router.refresh();
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="sticky top-20 z-20 rounded-xl border border-surface-border bg-surface/90 p-4 shadow-card backdrop-blur">
        <div className="flex items-center justify-between text-sm">
          <span className="font-semibold text-slate-800">
            {answeredCount} of {total} answered
          </span>
          <span className="text-slate-500">{percent}%</span>
        </div>
        <div
          className="mt-2 h-2 w-full overflow-hidden rounded-full bg-surface-subtle"
          role="progressbar"
          aria-valuenow={answeredCount}
          aria-valuemin={0}
          aria-valuemax={total}
        >
          <div
            className="h-full rounded-full bg-brand-600 transition-all duration-300 ease-out"
            style={{ width: `${percent}%` }}
          />
        </div>
      </div>

      <ol className="space-y-3">
        {questions.map((question, index) => {
          const answer = answers[question.id];
          return (
            <li
              key={question.id}
              className="card flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="flex gap-3">
                <span
                  className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-sm font-semibold transition-colors ${
                    answer !== undefined
                      ? "bg-brand-100 text-brand-700"
                      : "bg-surface-subtle text-slate-500"
                  }`}
                >
                  {index + 1}
                </span>
                <p className="text-slate-800">{question.text}</p>
              </div>

              <div className="flex shrink-0 gap-2 sm:pl-3">
                <ToggleButton
                  variant="yes"
                  selected={answer === true}
                  onClick={() => setAnswer(question.id, true)}
                >
                  Yes
                </ToggleButton>
                <ToggleButton
                  variant="no"
                  selected={answer === false}
                  onClick={() => setAnswer(question.id, false)}
                >
                  No
                </ToggleButton>
              </div>
            </li>
          );
        })}
      </ol>

      <div className="flex flex-col items-end gap-2">
        {error && (
          <p role="alert" className="text-sm text-red-600">
            {error}
          </p>
        )}
        <button
          type="button"
          onClick={handleSubmit}
          disabled={!allAnswered || submitting}
          className="btn-primary disabled:cursor-not-allowed disabled:opacity-50"
        >
          {submitting ? "Submitting…" : "Submit gating evaluation"}
        </button>
        {!allAnswered && (
          <p className="text-sm text-slate-500">
            Answer all {total} questions to submit.
          </p>
        )}
      </div>
    </div>
  );
}

function ToggleButton({
  variant,
  selected,
  onClick,
  children,
}: {
  variant: "yes" | "no";
  selected: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  const selectedClasses =
    variant === "yes"
      ? "border-emerald-600 bg-emerald-600 text-white shadow-sm"
      : "border-red-600 bg-red-600 text-white shadow-sm";
  const idleHover =
    variant === "yes"
      ? "hover:border-emerald-400 hover:text-emerald-700"
      : "hover:border-red-400 hover:text-red-700";

  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      className={`min-w-[4.5rem] rounded-full border px-5 py-2 text-sm font-semibold transition-all duration-150 active:scale-95 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 ${
        variant === "yes"
          ? "focus-visible:outline-emerald-500"
          : "focus-visible:outline-red-500"
      } ${
        selected
          ? selectedClasses
          : `border-surface-border bg-surface text-slate-600 ${idleHover}`
      }`}
    >
      {children}
    </button>
  );
}
