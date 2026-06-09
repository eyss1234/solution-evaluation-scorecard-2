"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ConfirmModal } from "./ConfirmModal";
import { useToast } from "@/contexts/ToastContext";

interface ProjectActionsMenuProps {
  projectId: string;
  projectName: string;
  onRename: () => void;
}

/** 3-dot dropdown with Rename and Delete (Delete behind a confirmation modal). */
export function ProjectActionsMenu({
  projectId,
  projectName,
  onRename,
}: ProjectActionsMenuProps) {
  const router = useRouter();
  const { showToast } = useToast();
  const [open, setOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function onDocClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onDocClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDocClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  async function handleDelete() {
    setDeleting(true);
    setError(null);
    try {
      const res = await fetch(`/api/projects/${projectId}`, { method: "DELETE" });
      const json = await res.json().catch(() => ({}));
      if (!res.ok || !json.ok) {
        setError(json?.error?.message ?? "Failed to delete project.");
        setDeleting(false);
        return;
      }
      // Leave the (now-deleted) project page.
      showToast("Project deleted");
      router.push("/");
      router.refresh();
    } catch {
      setError("Something went wrong. Please try again.");
      setDeleting(false);
    }
  }

  return (
    <div className="relative" ref={menuRef}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label="Project actions"
        className="rounded-lg border border-surface-border bg-surface p-2 text-slate-500 transition-colors hover:bg-surface-subtle hover:text-slate-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500"
      >
        <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5" aria-hidden="true">
          <circle cx="12" cy="5" r="1.6" />
          <circle cx="12" cy="12" r="1.6" />
          <circle cx="12" cy="19" r="1.6" />
        </svg>
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 z-20 mt-1 w-44 overflow-hidden rounded-lg border border-surface-border bg-surface py-1 shadow-card"
        >
          <button
            type="button"
            role="menuitem"
            onClick={() => {
              setOpen(false);
              onRename();
            }}
            className="block w-full px-3.5 py-2 text-left text-sm text-slate-700 transition-colors hover:bg-surface-subtle"
          >
            Rename
          </button>
          <button
            type="button"
            role="menuitem"
            onClick={() => {
              setOpen(false);
              setError(null);
              setConfirmOpen(true);
            }}
            className="block w-full px-3.5 py-2 text-left text-sm text-red-600 transition-colors hover:bg-red-50"
          >
            Delete
          </button>
        </div>
      )}

      <ConfirmModal
        open={confirmOpen}
        title="Delete project"
        message={
          <>
            Are you sure you want to delete{" "}
            <span className="font-medium text-slate-900">{projectName}</span>?
            This permanently removes its gating runs, scorecards, and financial
            data. This action cannot be undone.
          </>
        }
        confirmLabel="Delete project"
        destructive
        loading={deleting}
        error={error}
        onConfirm={handleDelete}
        onCancel={() => {
          if (!deleting) setConfirmOpen(false);
        }}
      />
    </div>
  );
}
