"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="animate-fade-in flex flex-col items-center justify-center gap-4 py-20 text-center">
      <span className="flex h-12 w-12 items-center justify-center rounded-full bg-red-50 text-red-600">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} className="h-6 w-6" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m0 3.75h.008M12 3l9 16H3l9-16Z" />
        </svg>
      </span>
      <div className="space-y-1">
        <h1 className="text-xl font-bold text-slate-900">Something went wrong</h1>
        <p className="max-w-md text-sm text-slate-500">
          An unexpected error occurred. You can try again, or head back to your
          projects.
        </p>
      </div>
      <div className="flex gap-2">
        <button type="button" onClick={reset} className="btn-primary">
          Try again
        </button>
        <Link href="/" className="btn-secondary">
          Back to projects
        </Link>
      </div>
    </div>
  );
}
