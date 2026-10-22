"use client";

import { catchError, type ErrorInfo } from "next/error";

/**
 * Section error boundary (U-22, REQ-022): when one live part of a page fails (free times, the
 * map), only that part says so; the rest of the page keeps working. `retry` re-renders the
 * route in a transition (Next 16 `catchError`).
 */
function SectionFallback({ title }: { title: string }, { retry }: ErrorInfo) {
  return (
    <div className="container-page py-6">
      <div
        role="status"
        className="flex flex-col gap-3 rounded-2xl border border-dashed bg-surface p-5 sm:flex-row sm:items-center sm:justify-between"
      >
        <p>
          <span className="font-semibold">{title}</span> şu an gösterilemiyor.
        </p>
        <button
          type="button"
          onClick={() => {
            retry();
          }}
          className="min-h-11 rounded-full border border-input px-5 font-semibold"
        >
          Tekrar dene
        </button>
      </div>
    </div>
  );
}

export const SectionBoundary = catchError(SectionFallback);
