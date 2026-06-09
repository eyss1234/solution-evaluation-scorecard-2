"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { scorePercentColor } from "@/lib/score-labels";
import { ScorecardActions } from "./ScorecardActions";

interface ScorecardItemProps {
  runId: string;
  initialName: string;
  completed: boolean;
  total: number;
  dateLabel: string;
}

export function ScorecardItem({
  runId,
  initialName,
  completed,
  total,
  dateLabel,
}: ScorecardItemProps) {
  const router = useRouter();
  const [name, setName] = useState(initialName);
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(initialName);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const href = completed
    ? `/scorecard/${runId}`
    : `/scorecard/${runId}/step/1`;

  useEffect(() => {
    if (editing) {
      setValue(name);
      setError(null);
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
      setEditing(false);
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const res = await fetch(`/api/scorecard/${runId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: trimmed }),
      });
      const json = await res.json();
      if (!res.ok || !json.ok) {
        setError(json?.error?.message ?? "Failed to rename scorecard.");
        return;
      }
      setName(trimmed);
      setEditing(false);
      router.refresh();
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <li className="flex items-center justify-between gap-3 py-3">
      <div className="min-w-0 flex-1">
        {editing ? (
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <input
                ref={inputRef}
                value={value}
                onChange={(e) => setValue(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") save();
                  if (e.key === "Escape") setEditing(false);
                }}
                disabled={saving}
                maxLength={120}
                aria-label="Scorecard name"
                className="input max-w-xs py-1 text-sm"
              />
              <button
                type="button"
                onClick={save}
                disabled={saving}
                className="btn-primary px-3 py-1 text-xs disabled:opacity-50"
              >
                {saving ? "Saving…" : "Save"}
              </button>
              <button
                type="button"
                onClick={() => setEditing(false)}
                disabled={saving}
                className="btn-secondary px-3 py-1 text-xs"
              >
                Cancel
              </button>
            </div>
            {error && (
              <p role="alert" className="mt-1 text-sm text-red-600">
                {error}
              </p>
            )}
          </div>
        ) : (
          <Link href={href} className="group block min-w-0">
            <p className="truncate font-medium text-slate-900 transition-colors group-hover:text-brand-700">
              {name}
            </p>
            <p className="text-sm text-slate-500">{dateLabel}</p>
          </Link>
        )}
      </div>

      <div className="flex shrink-0 items-center gap-2">
        {completed ? (
          <>
            <span className="inline-flex items-center rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-medium text-emerald-700 ring-1 ring-inset ring-emerald-600/20">
              Completed
            </span>
            <span className={`text-sm font-semibold ${scorePercentColor(total)}`}>
              {Math.round(total)}%
            </span>
          </>
        ) : (
          <span className="inline-flex items-center rounded-full bg-amber-50 px-2.5 py-0.5 text-xs font-medium text-amber-700 ring-1 ring-inset ring-amber-600/20">
            In progress
          </span>
        )}
        <ScorecardActions
          runId={runId}
          name={name}
          onRename={() => setEditing(true)}
        />
      </div>
    </li>
  );
}
