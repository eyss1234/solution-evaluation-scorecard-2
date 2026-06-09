"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useToast } from "@/contexts/ToastContext";
import { STEPS, TOTAL_STEPS } from "@/lib/steps";
import { useScorecard } from "@/contexts/ScorecardContext";

const FIELDS = [
  { key: "pros", label: "Pros", placeholder: "Key strengths of this solution…" },
  { key: "cons", label: "Cons", placeholder: "Key weaknesses, risks, or concerns…" },
  {
    key: "summary",
    label: "Summary",
    placeholder: "An overall summary and recommendation…",
  },
] as const;

type FieldKey = (typeof FIELDS)[number]["key"];

export function ScorecardOverviewForm() {
  const router = useRouter();
  const { showToast } = useToast();
  const { runId, overview, setOverview } = useScorecard();

  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [generatingField, setGeneratingField] = useState<FieldKey | null>(null);
  const [genErrors, setGenErrors] = useState<Partial<Record<FieldKey, string>>>(
    {},
  );

  const step = STEPS.find((s) => s.number === TOTAL_STEPS);

  async function generate(type: FieldKey) {
    setGeneratingField(type);
    setGenErrors((prev) => ({ ...prev, [type]: undefined }));
    try {
      const res = await fetch(`/api/scorecard/${runId}/generate-overview`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type }),
      });
      const json = await res.json();
      if (!res.ok || !json.ok) {
        setGenErrors((prev) => ({
          ...prev,
          [type]: json?.error?.message ?? "Failed to generate text.",
        }));
        return;
      }
      setOverview({ [type]: json.data.content });
    } catch {
      setGenErrors((prev) => ({
        ...prev,
        [type]: "Something went wrong. Please try again.",
      }));
    } finally {
      setGeneratingField(null);
    }
  }

  async function handleNext() {
    setSaving(true);
    setSaveError(null);
    try {
      const res = await fetch(`/api/scorecard/${runId}/save-overview`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pros: overview.pros ?? null,
          cons: overview.cons ?? null,
          summary: overview.summary ?? null,
        }),
      });
      const json = await res.json();
      if (!res.ok || !json.ok) {
        setSaveError(json?.error?.message ?? "Failed to save the overview.");
        return;
      }
      showToast("Overview saved");
      router.push(`/scorecard/${runId}/review`);
    } catch {
      setSaveError("Something went wrong. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      <header className="space-y-1.5">
        <p className="text-sm font-medium text-brand-700">
          Step {TOTAL_STEPS} of {TOTAL_STEPS}
        </p>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          {step?.name ?? "Overview"}
        </h1>
        <p className="text-slate-600">
          Summarise your evaluation, or generate a starting point with AI. These
          notes are optional and fully editable.
        </p>
      </header>

      <div className="space-y-4">
        {FIELDS.map((field) => {
          const isGenerating = generatingField === field.key;
          const genError = genErrors[field.key];
          return (
            <div key={field.key} className="card space-y-2">
              <div className="flex items-center justify-between gap-3">
                <label
                  htmlFor={`overview-${field.key}`}
                  className="block text-sm font-medium text-slate-700"
                >
                  {field.label}
                </label>
                <button
                  type="button"
                  onClick={() => generate(field.key)}
                  disabled={isGenerating}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-brand-200 bg-brand-50 px-2.5 py-1 text-xs font-medium text-brand-700 transition-colors hover:bg-brand-100 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isGenerating ? (
                    <>
                      <Spinner />
                      Generating…
                    </>
                  ) : (
                    <>
                      <SparkleIcon />
                      Generate with AI
                    </>
                  )}
                </button>
              </div>

              <textarea
                id={`overview-${field.key}`}
                value={overview[field.key] ?? ""}
                onChange={(e) => setOverview({ [field.key]: e.target.value })}
                rows={4}
                maxLength={10000}
                disabled={isGenerating}
                placeholder={field.placeholder}
                className="input min-h-[6rem] resize-y disabled:opacity-70"
              />

              {genError && (
                <p role="alert" className="text-sm text-red-600">
                  {genError}
                </p>
              )}
            </div>
          );
        })}
      </div>

      {saveError && (
        <p role="alert" className="text-sm text-red-600">
          {saveError}
        </p>
      )}

      <div className="flex items-center justify-between gap-3">
        <Link
          href={`/scorecard/${runId}/step/${TOTAL_STEPS - 1}`}
          className="btn-secondary"
        >
          Back
        </Link>
        <button
          type="button"
          onClick={handleNext}
          disabled={saving}
          className="btn-primary disabled:opacity-50"
        >
          {saving ? "Saving…" : "Next"}
        </button>
      </div>
    </div>
  );
}

function Spinner() {
  return (
    <svg className="h-3.5 w-3.5 animate-spin" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 0 1 8-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
  );
}

function SparkleIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="h-3.5 w-3.5" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 0 0-2.456 2.456Z" />
    </svg>
  );
}
