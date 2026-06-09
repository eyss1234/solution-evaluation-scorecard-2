"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface CreateScorecardButtonProps {
  projectId: string;
}

/** Creates a scorecard run, then navigates into its first step. */
export function CreateScorecardButton({ projectId }: CreateScorecardButtonProps) {
  const router = useRouter();
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleCreate() {
    setCreating(true);
    setError(null);
    try {
      const res = await fetch("/api/scorecard", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ projectId }),
      });
      const json = await res.json();
      if (!res.ok || !json.ok) {
        setError(json?.error?.message ?? "Failed to create scorecard.");
        setCreating(false);
        return;
      }
      router.push(`/scorecard/${json.data.id}/step/1`);
    } catch {
      setError("Something went wrong. Please try again.");
      setCreating(false);
    }
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <button
        type="button"
        onClick={handleCreate}
        disabled={creating}
        className="btn-primary disabled:opacity-50"
      >
        {creating ? "Creating…" : "Create Scorecard"}
      </button>
      {error && (
        <p role="alert" className="text-sm text-red-600">
          {error}
        </p>
      )}
    </div>
  );
}
