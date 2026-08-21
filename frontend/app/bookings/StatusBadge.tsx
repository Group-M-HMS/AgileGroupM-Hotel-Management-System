import type { BookingStatus } from "@/lib/bookings";

const STYLES: Record<BookingStatus, string> = {
  CONFIRMED: "bg-sage/20 text-jungle-dark",
  PENDING: "bg-amber-100 text-amber-700",
  CANCELLED: "bg-red-100 text-red-600",
};

const LABELS: Record<BookingStatus, string> = {
  CONFIRMED: "Confirmed",
  PENDING: "Pending payment",
  CANCELLED: "Cancelled",
};

export function StatusBadge({ status }: { status: BookingStatus }) {
  return (
    <span
      className={`inline-flex items-center justify-center whitespace-nowrap rounded-full px-4 py-2 font-jakarta text-sm font-semibold ${STYLES[status]}`}
    >
      {LABELS[status]}
    </span>
  );
}
