"use client";

import { useEffect, useState } from "react";
import { StatusBadge } from "@/components/StatusBadge";

type Status = "Confirmed" | "Cancelled";

export function CancelBookingControl({
  email,
  bookingReference,
  initialStatus,
}: {
  email: string;
  bookingReference: string;
  initialStatus: Status;
}) {
  const [status, setStatus] = useState<Status>(initialStatus);
  const [modalOpen, setModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    if (!showBanner) return;
    const timer = setTimeout(() => setShowBanner(false), 5000);
    return () => clearTimeout(timer);
  }, [showBanner]);

  async function handleConfirmCancel() {
    setSubmitting(true);
    setError(null);
    try {
      const response = await fetch("/api/manage-booking/cancel", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, bookingReference }),
      });
      if (!response.ok) {
        setError("We couldn't cancel this booking right now. Please try again.");
        return;
      }
      setStatus("Cancelled");
      setModalOpen(false);
      setShowBanner(true);
    } catch {
      setError("We couldn't cancel this booking right now. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <StatusBadge status={status} />

      {status === "Confirmed" && (
        <button
          type="button"
          onClick={() => setModalOpen(true)}
          className="no-print ml-auto font-outfit text-meta font-semibold text-red-600 hover:underline"
        >
          Cancel Booking
        </button>
      )}

      {showBanner && (
        <div className="no-print w-full rounded-input border border-green-200 bg-green-50 px-4 py-3 font-outfit text-meta text-green-700">
          <div className="flex items-center justify-between gap-3">
            <span>Your booking has been canceled successfully.</span>
            <button
              type="button"
              onClick={() => setShowBanner(false)}
              aria-label="Dismiss"
              className="text-green-700/70 hover:text-green-700"
            >
              <span className="material-symbols-outlined" style={{ fontSize: "18px" }} aria-hidden="true">
                close
              </span>
            </button>
          </div>
        </div>
      )}

      {modalOpen && (
        <div className="no-print fixed inset-0 z-50 flex items-center justify-center bg-jungle-dark/40 px-4">
          <div className="flex w-full max-w-sm flex-col gap-4 rounded-3xl bg-white p-6 shadow-soft-lg">
            <h2 className="font-lora text-[20px] font-medium text-jungle-dark">Cancel this booking?</h2>
            <div className="rounded-input border border-red-200 bg-red-50 px-4 py-3 font-outfit text-[13px] text-red-700">
              This action is final and cannot be undone. Your reservation will be canceled
              immediately.
            </div>
            {error && (
              <p className="font-outfit text-[13px] text-red-600">{error}</p>
            )}
            <div className="flex flex-col gap-3 sm:flex-row">
              <button
                type="button"
                onClick={() => {
                  setModalOpen(false);
                  setError(null);
                }}
                disabled={submitting}
                className="flex h-btn w-full items-center justify-center rounded-btn border border-sand font-outfit text-field font-semibold text-jungle-dark transition-colors hover:border-sage disabled:opacity-60"
              >
                No, Keep Booking
              </button>
              <button
                type="button"
                onClick={handleConfirmCancel}
                disabled={submitting}
                className="btn-primary disabled:opacity-60"
              >
                {submitting ? "Cancelling..." : "Yes, Cancel"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
