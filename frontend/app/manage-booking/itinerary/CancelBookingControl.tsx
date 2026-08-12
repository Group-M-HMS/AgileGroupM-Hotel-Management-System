"use client";

import { useEffect, useState } from "react";
import { StatusBadge } from "@/app/dashboard/StatusBadge";
import { cancelBooking, type BookingStatus } from "@/lib/bookings";

export function CancelBookingControl({
  bookingId,
  initialStatus,
}: {
  bookingId: number;
  initialStatus: BookingStatus;
}) {
  const [status, setStatus] = useState<BookingStatus>(initialStatus);
  const [modalOpen, setModalOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    if (!showBanner) return;
    const timer = setTimeout(() => setShowBanner(false), 5000);
    return () => clearTimeout(timer);
  }, [showBanner]);

  async function handleConfirmCancel() {
    const trimmed = reason.trim();
    if (!trimmed) {
      setError("Please tell us why you're cancelling.");
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      const newStatus = await cancelBooking(bookingId, trimmed);
      setStatus(newStatus);
      setModalOpen(false);
      setReason("");
      setShowBanner(true);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "We couldn't cancel this booking right now. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  }

  // Only a confirmed (paid) or still-pending booking can be cancelled.
  const cancellable = status === "CONFIRMED" || status === "PENDING";

  return (
    <>
      <StatusBadge status={status} />

      {cancellable && (
        <button
          type="button"
          onClick={() => setModalOpen(true)}
          className="no-print ml-auto font-jakarta text-meta font-semibold text-red-600 hover:underline"
        >
          Cancel Booking
        </button>
      )}

      {showBanner && (
        <div className="no-print w-full rounded-input border border-green-200 bg-green-50 px-4 py-3 font-jakarta text-meta text-green-700">
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
        <div className="no-print fixed inset-0 z-50 flex items-center justify-center bg-primary/40 px-4">
          <div className="flex w-full max-w-sm flex-col gap-4 rounded-3xl bg-white p-6 shadow-soft-lg">
            <h2 className="font-fraunces text-[20px] font-medium text-jungle-dark">Cancel this booking?</h2>
            <div className="rounded-input border border-red-200 bg-red-50 px-4 py-3 font-jakarta text-[13px] text-red-700">
              This action is final and cannot be undone. Your reservation will be canceled
              immediately.
            </div>
            <div className="flex flex-col gap-[4px]">
              <label htmlFor="cancel-reason" className="font-jakarta text-[13px] font-medium text-jungle-dark">
                Reason for cancelling
              </label>
              <textarea
                id="cancel-reason"
                value={reason}
                onChange={e => setReason(e.target.value)}
                rows={3}
                placeholder="e.g. Travel plans changed"
                className="w-full resize-none rounded-input border-2 border-sand bg-white px-field-x py-3 font-jakarta text-[13px] text-jungle placeholder:text-jungle/50 outline-none transition-colors focus:border-sage"
              />
            </div>
            {error && (
              <p className="font-jakarta text-[13px] text-red-600">{error}</p>
            )}
            <div className="flex flex-col gap-3 sm:flex-row">
              <button
                type="button"
                onClick={() => {
                  setModalOpen(false);
                  setError(null);
                  setReason("");
                }}
                disabled={submitting}
                className="flex h-btn w-full items-center justify-center rounded-btn border border-sand font-jakarta text-field font-semibold text-jungle-dark transition-colors hover:border-sage disabled:opacity-60"
              >
                No, Keep Booking
              </button>
              <button
                type="button"
                onClick={handleConfirmCancel}
                disabled={submitting || !reason.trim()}
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
