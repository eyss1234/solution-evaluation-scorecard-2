import Link from "next/link";

export default function NotFound() {
  return (
    <div className="animate-fade-in flex flex-col items-center justify-center gap-4 py-20 text-center">
      <span className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-50 text-brand-600">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} className="h-6 w-6" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 5.25h.008v.008H12v-.008Z" />
        </svg>
      </span>
      <div className="space-y-1">
        <h1 className="text-xl font-bold text-slate-900">Page not found</h1>
        <p className="max-w-md text-sm text-slate-500">
          The page you’re looking for doesn’t exist or may have been removed.
        </p>
      </div>
      <Link href="/" className="btn-primary">
        Back to projects
      </Link>
    </div>
  );
}
