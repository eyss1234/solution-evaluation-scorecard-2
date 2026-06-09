"use client";

import { useEffect, useId, useRef, type ReactNode } from "react";

interface ConfirmModalProps {
  open: boolean;
  title: string;
  message: ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  /** Style the confirm button as destructive (red). */
  destructive?: boolean;
  /** Disables the buttons and shows a working label while an action runs. */
  loading?: boolean;
  error?: string | null;
  onConfirm: () => void;
  onCancel: () => void;
}

/** Reusable confirmation dialog used for destructive actions across the app. */
export function ConfirmModal({
  open,
  title,
  message,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  destructive = false,
  loading = false,
  error,
  onConfirm,
  onCancel,
}: ConfirmModalProps) {
  const titleId = useId();
  const cancelRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    // Move focus into the dialog so keyboard users start on a safe action.
    cancelRef.current?.focus();
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape" && !loading) onCancel();
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, loading, onCancel]);

  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget && !loading) onCancel();
      }}
    >
      <div className="w-full max-w-md rounded-2xl border border-surface-border bg-surface p-6 shadow-card-hover">
        <h2 id={titleId} className="text-lg font-semibold text-slate-900">
          {title}
        </h2>
        <div className="mt-2 text-sm text-slate-600">{message}</div>
        {error && (
          <p role="alert" className="mt-3 text-sm text-red-600">
            {error}
          </p>
        )}
        <div className="mt-6 flex justify-end gap-2">
          <button
            ref={cancelRef}
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="btn-secondary disabled:opacity-50"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className={
              destructive
                ? "inline-flex items-center justify-center rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-500 disabled:opacity-50"
                : "btn-primary disabled:opacity-50"
            }
          >
            {loading ? "Working…" : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
