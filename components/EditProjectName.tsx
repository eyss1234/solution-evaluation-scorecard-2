"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

interface EditProjectNameProps {
  projectId: string;
  name: string;
  editing: boolean;
  onStartEdit: () => void;
  onCancel: () => void;
  onSaved: (name: string) => void;
}

/**
 * Inline-editable project name. Display mode shows the heading with a pencil
 * affordance; edit mode swaps in an input that PATCHes the project.
 */
export function EditProjectName({
  projectId,
  name,
  editing,
  onStartEdit,
  onCancel,
  onSaved,
}: EditProjectNameProps) {
  const router = useRouter();
  const [value, setValue] = useState(name);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editing) {
      setValue(name);
      setError(null);
      // Focus after the input mounts.
      requestAnimationFrame(() => {
        inputRef.current?.focus();
        inputRef.current?.select();
      });
    }
  }, [editing, name]);

  async function save() {
    const trimmed = value.trim();
    if (!trimmed) {
      setError("Name is required.");
      return;
    }
    if (trimmed === name) {
      onCancel();
      return;
    }

    setSaving(true);
    setError(null);
    try {
      const res = await fetch(`/api/projects/${projectId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: trimmed }),
      });
      const json = await res.json();
      if (!res.ok || !json.ok) {
        setError(json?.error?.message ?? "Failed to rename project.");
        return;
      }
      onSaved(trimmed);
      router.refresh();
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  if (!editing) {
    return (
      <div className="flex items-center gap-2">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
          {name}
        </h1>
        <button
          type="button"
          onClick={onStartEdit}
          aria-label="Rename project"
          className="rounded-md p-1.5 text-slate-400 transition-colors hover:bg-surface-subtle hover:text-slate-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="h-4 w-4" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Z" />
          </svg>
        </button>
      </div>
    );
  }

  return (
    <div className="flex-1">
      <div className="flex flex-wrap items-center gap-2">
        <input
          ref={inputRef}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") save();
            if (e.key === "Escape") onCancel();
          }}
          disabled={saving}
          maxLength={120}
          aria-label="Project name"
          className="input max-w-md text-lg font-semibold"
        />
        <button type="button" onClick={save} disabled={saving} className="btn-primary disabled:opacity-50">
          {saving ? "Saving…" : "Save"}
        </button>
        <button type="button" onClick={onCancel} disabled={saving} className="btn-secondary">
          Cancel
        </button>
      </div>
      {error && (
        <p role="alert" className="mt-1.5 text-sm text-red-600">
          {error}
        </p>
      )}
    </div>
  );
}
