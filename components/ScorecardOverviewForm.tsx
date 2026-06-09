"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { STEPS, TOTAL_STEPS } from "@/lib/steps";
import { useScorecard } from "@/contexts/ScorecardContext";

const OVERVIEW_FIELDS = [
  { key: "pros", label: "Pros", placeholder: "Key strengths of this solution…" },
  { key: "cons", label: "Cons", placeholder: "Key weaknesses, risks, or concerns…" },
  {
    key: "summary",
    label: "Summary",
    placeholder: "An overall summary and recommendation…",
  },
] as const;

export function ScorecardOverviewForm() {
  const router = useRouter();
  const { runId, overview, setOverview } = useScorecard();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const step = STEPS.find((s) => s.number === TOTAL_STEPS);

  async function handleContinue() {
    setSaving(true);
    setError(null);
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
        setError(json?.error?.message ?? "Failed to save the overview.");
        return;
      }
      router.push(`/scorecard/${runId}/review`);
    } catch {
      setError("Something went wrong. Please try again.");
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
          Summarise your evaluation. These notes are optional and can be left
          blank.
        </p>
      </header>

      <div className="space-y-4">
        {OVERVIEW_FIELDS.map((field) => (
          <div key={field.key} className="card space-y-2">
            <label
              htmlFor={`overview-${field.key}`}
              className="block text-sm font-medium text-slate-700"
            >
              {field.label}
            </label>
            <textarea
              id={`overview-${field.key}`}
              value={overview[field.key] ?? ""}
              onChange={(e) => setOverview({ [field.key]: e.target.value })}
              rows={4}
              maxLength={10000}
              placeholder={field.placeholder}
              className="input min-h-[6rem] resize-y"
            />
          </div>
        ))}
      </div>

      {error && (
        <p role="alert" className="text-sm text-red-600">
          {error}
        </p>
      )}

      <div className="flex items-center justify-between gap-3">
        <Link href={`/scorecard/${runId}/step/${TOTAL_STEPS - 1}`} className="btn-secondary">
          Back
        </Link>
        <button
          type="button"
          onClick={handleContinue}
          disabled={saving}
          className="btn-primary disabled:opacity-50"
        >
          {saving ? "Saving…" : "Continue to Review"}
        </button>
      </div>
    </div>
  );
}
