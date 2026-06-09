"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

/**
 * Client form for creating a project. Posts to the projects API, then refreshes
 * the server component so the new project appears in the list.
 */
export function CreateProjectForm() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const trimmed = name.trim();
    if (!trimmed) {
      setError("Please enter a project name.");
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: trimmed }),
      });
      const json = await res.json();

      if (!res.ok || !json.ok) {
        setError(json?.error?.message ?? "Failed to create project.");
        return;
      }

      setName("");
      router.refresh();
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3" noValidate>
      <div className="flex flex-col gap-3 sm:flex-row">
        <input
          type="text"
          name="name"
          value={name}
          onChange={(e) => {
            setName(e.target.value);
            if (error) setError(null);
          }}
          placeholder="e.g. CRM platform replacement"
          aria-label="Project name"
          aria-invalid={error ? true : undefined}
          maxLength={120}
          disabled={submitting}
          className="input sm:flex-1"
        />
        <button
          type="submit"
          disabled={submitting || name.trim().length === 0}
          className="btn-primary shrink-0 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {submitting ? "Creating…" : "Create New Project"}
        </button>
      </div>

      {error && (
        <p role="alert" className="text-sm text-red-600">
          {error}
        </p>
      )}
    </form>
  );
}
