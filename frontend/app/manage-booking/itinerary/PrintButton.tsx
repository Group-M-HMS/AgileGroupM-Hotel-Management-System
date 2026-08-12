"use client";

export function PrintButton() {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="no-print rounded-btn bg-primary px-6 py-2.5 font-jakarta text-meta font-semibold text-sand-light transition-opacity hover:opacity-90"
    >
      Print Itinerary
    </button>
  );
}
