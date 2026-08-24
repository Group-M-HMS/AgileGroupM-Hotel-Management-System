import React from 'react';
import type { BookingStatus, RoomStatus } from '../_lib/types/hotel';

export const roomStatusMeta: Record<RoomStatus, { label: string; dot: string; chip: string }> = {
  available: { label: 'Available', dot: 'bg-emerald-400', chip: 'bg-emerald-500/12 text-emerald-700 border-emerald-500/30' },
  occupied: { label: 'Occupied', dot: 'bg-cyan-400', chip: 'bg-cyan-500/12 text-cyan-700 border-cyan-500/30' },
  cleaning: { label: 'Needs Cleaning', dot: 'bg-amber-400', chip: 'bg-amber-500/12 text-amber-700 border-amber-500/30' },
  maintenance: { label: 'Maintenance', dot: 'bg-rose-400', chip: 'bg-rose-500/12 text-rose-700 border-rose-500/30' },
};

export const bookingStatusMeta: Record<BookingStatus, { label: string; chip: string }> = {
  confirmed: { label: 'Confirmed', chip: 'bg-clay/12 text-clay border-clay/30' },
  'checked-in': { label: 'Checked-In', chip: 'bg-emerald-500/12 text-emerald-700 border-emerald-500/30' },
  'checked-out': { label: 'Checked-Out', chip: 'bg-gray-500/12 text-gray-600 border-gray-500/30' },
  cancelled: { label: 'Cancelled', chip: 'bg-rose-500/12 text-rose-700 border-rose-500/30' },
};

export function RoomStatusBadge({ status }: { status: RoomStatus }) {
  const meta = roomStatusMeta[status];
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-[11px] font-semibold ${meta.chip}`}>

      <span className={`h-1.5 w-1.5 rounded-full ${meta.dot}`} />
      {meta.label}
    </span>
  );
}

export function BookingStatusBadge({ status }: { status: BookingStatus }) {
  const meta = bookingStatusMeta[status];
  return (
    <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-semibold ${meta.chip}`}>
      {meta.label}
    </span>
  );
}
