export function Footer() {
  return (
    <footer className="border-t border-surface-border bg-surface-muted">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-2 px-4 py-6 text-sm text-slate-500 sm:flex-row sm:px-6 lg:px-8">
        <p>
          &copy; {new Date().getFullYear()} Solution Evaluation Scorecard
        </p>
        <p className="text-slate-400">
          Make better decisions, one criterion at a time.
        </p>
      </div>
    </footer>
  );
}
