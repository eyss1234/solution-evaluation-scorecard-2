"use client";

/**
 * Exports the project view to PDF. For now this uses the browser's print-to-PDF
 * (no extra dependency); a richer server-rendered export can replace the body
 * of `handleExport` later without changing the call site.
 */
export function ExportProjectPdfButton() {
  function handleExport() {
    window.print();
  }

  return (
    <button type="button" onClick={handleExport} className="btn-secondary">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="mr-1.5 h-4 w-4" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-6L12 15m0 0 4.5-4.5M12 15V3" />
      </svg>
      Export PDF
    </button>
  );
}
