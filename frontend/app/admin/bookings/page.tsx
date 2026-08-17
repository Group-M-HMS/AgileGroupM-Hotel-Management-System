'use client';

import React, { Suspense, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { CalendarDaysIcon, EyeIcon, ListIcon, PlusIcon, SearchIcon } from 'lucide-react';
import { toast } from 'sonner';
import { useHotel } from '../_lib/contexts/HotelDataContext';
import { Modal } from '../_components/ui/Modal';
import { WalkInBookingModal } from '../_components/WalkInBookingModal';
import { BookingDetailsDrawer } from '../_components/BookingDetailsDrawer';
import { CalendarTimeline } from '../_components/CalendarTimeline';
import { BookingStatusBadge } from '../_components/StatusBadge';
import type { Booking, BookingStatus } from '../_lib/types/hotel';
import { money, shortDate } from '../_lib/utils/format';

const statusFilters: Array<{ value: BookingStatus | 'all'; label: string }> = [
  { value: 'all', label: 'All statuses' },
  { value: 'confirmed', label: 'Confirmed' },
  { value: 'checked-in', label: 'Checked-In' },
  { value: 'checked-out', label: 'Checked-Out' },
  { value: 'cancelled', label: 'Cancelled' },
];

function AdminBookingsInner() {
  const { bookings, rooms, checkInBooking, checkOutBooking, cancelBooking } = useHotel();
  const params = useSearchParams();
  const [view, setView] = useState<'table' | 'calendar'>('table');
  const [search, setSearch] = useState(params.get('q') ?? '');
  const [status, setStatus] = useState<BookingStatus | 'all'>('all');
  const [limit, setLimit] = useState(12);
  const [selected, setSelected] = useState<Booking | null>(null);
  const [walkIn, setWalkIn] = useState(false);
  const [cancelling, setCancelling] = useState<Booking | null>(null);
  const [reason, setReason] = useState('');
  const [reasonError, setReasonError] = useState('');

  const q = search.trim().toLowerCase();
  const filtered = useMemo(
    () =>
      bookings
        .filter((b) => (status === 'all' ? true : b.status === status))
        .filter((b) => (q ? `${b.ref} ${b.guestName} ${b.roomTitle} ${b.roomNumber}`.toLowerCase().includes(q) : true)),
    [bookings, status, q]
  );
  const rows = filtered.slice(0, limit);

  const summary = [
    ['Total Bookings', bookings.length, 'text-jungle-dark'],
    ['Confirmed', bookings.filter((b) => b.status === 'confirmed').length, 'text-clay'],
    ['Checked-In', bookings.filter((b) => b.status === 'checked-in').length, 'text-emerald-700'],
    ['Checked-Out', bookings.filter((b) => b.status === 'checked-out').length, 'text-jungle'],
  ] as const;

  const doCheckIn = (b: Booking) => {
    checkInBooking(b.id);
    toast.success(`${b.guestName} checked in — room ${b.roomNumber} now occupied`);
    setSelected(null);
  };
  const doCheckOut = (b: Booking) => {
    checkOutBooking(b.id);
    toast.success(`${b.guestName} checked out — room ${b.roomNumber} queued for cleaning`);
    setSelected(null);
  };
  const submitCancel = () => {
    if (reason.trim().length < 5) {
      setReasonError('A cancellation reason is required before dates are released.');
      return;
    }
    if (cancelling) {
      cancelBooking(cancelling.id, reason.trim());
      toast.success(`${cancelling.ref} cancelled — room ${cancelling.roomNumber} released`);
    }
    setCancelling(null);
    setReason('');
    setReasonError('');
  };

  return (
    <div className="space-y-5">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold text-jungle-dark">Bookings & calendar</h1>
          <p className="mt-1 text-sm text-jungle/60">The full reservation ledger and a fortnight of arrivals.</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex rounded-lg border border-sand bg-white p-1">
            <button
              type="button"
              onClick={() => setView('table')}
              className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-semibold transition-colors duration-150 ${
                view === 'table' ? 'bg-jungle-dark text-white' : 'text-jungle/60 hover:text-jungle'
              }`}>

              <ListIcon className="h-3.5 w-3.5" /> Table View
            </button>
            <button
              type="button"
              onClick={() => setView('calendar')}
              className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-semibold transition-colors duration-150 ${
                view === 'calendar' ? 'bg-jungle-dark text-white' : 'text-jungle/60 hover:text-jungle'
              }`}>

              <CalendarDaysIcon className="h-3.5 w-3.5" /> Calendar Timeline
            </button>
          </div>
          <button
            type="button"
            onClick={() => setWalkIn(true)}
            className="flex items-center gap-1.5 rounded-lg bg-jungle-dark px-3.5 py-2 text-sm font-semibold text-white transition-colors duration-150 hover:bg-jungle">

            <PlusIcon className="h-4 w-4" /> Walk-in Booking
          </button>
        </div>
      </header>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {summary.map(([label, value, tone]) => (
          <div key={label} className="rounded-xl border border-sand bg-white px-5 py-4">
            <p className="text-xs font-semibold uppercase tracking-wider text-jungle/60">{label}</p>
            <p className={`mt-2 text-2xl font-semibold ${tone}`}>{value}</p>
          </div>
        ))}
      </div>

      {view === 'calendar' ? (
        <CalendarTimeline rooms={rooms} bookings={bookings} onSelect={setSelected} />
      ) : (
        <section className="rounded-xl border border-sand bg-white">
          <header className="flex flex-wrap items-center gap-3 border-b border-sand px-5 py-4">
            <div className="relative w-full max-w-sm">
              <SearchIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-jungle/45" />
              <input
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setLimit(12);
                }}
                placeholder="Search booking ref, guest or room…"
                aria-label="Search bookings"
                className="w-full rounded-lg border border-sand bg-sand-light py-2 pl-9 pr-3 text-sm text-jungle-dark placeholder-jungle/40 outline-none focus:border-sage"
              />

            </div>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as BookingStatus | 'all')}
              aria-label="Filter by status"
              className="rounded-lg border border-sand bg-sand-light px-3 py-2 text-sm text-jungle-dark outline-none focus:border-sage">

              {statusFilters.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
            <p className="ml-auto text-xs text-jungle/45" aria-live="polite">
              {filtered.length} reservations
            </p>
          </header>

          <div className="overflow-x-auto thin-scroll">
            <table className="w-full min-w-[960px] text-left text-sm">
              <thead>
                <tr className="border-b border-sand text-[11px] uppercase tracking-wider text-jungle/45">
                  <th scope="col" className="px-5 py-3 font-semibold">Ref</th>
                  <th scope="col" className="px-5 py-3 font-semibold">Guest</th>
                  <th scope="col" className="px-5 py-3 font-semibold">Room</th>
                  <th scope="col" className="px-5 py-3 font-semibold">Dates</th>
                  <th scope="col" className="px-5 py-3 font-semibold">Payment</th>
                  <th scope="col" className="px-5 py-3 font-semibold">Status</th>
                  <th scope="col" className="px-5 py-3 text-right font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((b) => (
                  <tr key={b.id} className="border-b border-sand/60 transition-colors duration-150 hover:bg-sand-light/50">
                    <td className="px-5 py-3 font-mono text-xs text-clay">{b.ref}</td>
                    <td className="px-5 py-3">
                      <p className="font-medium text-jungle-dark">{b.guestName}</p>
                      <p className="text-xs text-jungle/45">{b.guests} guests · {b.source}</p>
                    </td>
                    <td className="px-5 py-3">
                      <p className="text-jungle">{b.roomTitle}</p>
                      <p className="text-xs text-jungle/45">No. {b.roomNumber}</p>
                    </td>
                    <td className="whitespace-nowrap px-5 py-3 text-jungle">
                      {shortDate(b.checkIn)} → {shortDate(b.checkOut)}
                    </td>
                    <td className="px-5 py-3">
                      <span
                        className={`rounded-full border px-2 py-0.5 text-[11px] font-semibold ${
                          b.paid
                            ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-700'
                            : 'border-amber-500/30 bg-amber-500/10 text-amber-700'
                        }`}>

                        {money(b.amount)} {b.paid ? 'Paid' : 'Unpaid'}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      <BookingStatusBadge status={b.status} />
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex items-center justify-end gap-2">
                        {b.status === 'confirmed' && (
                          <>
                            <button
                              type="button"
                              onClick={() => doCheckIn(b)}
                              className="rounded-md bg-emerald-500 px-2.5 py-1.5 text-[11px] font-semibold text-white transition-colors duration-150 hover:bg-emerald-600">

                              Check-In
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setCancelling(b);
                                setReason('');
                                setReasonError('');
                              }}
                              className="rounded-md border border-rose-500/40 px-2.5 py-1.5 text-[11px] font-semibold text-rose-700 transition-colors duration-150 hover:bg-rose-500/10">

                              Cancel
                            </button>
                          </>
                        )}
                        {b.status === 'checked-in' && (
                          <button
                            type="button"
                            onClick={() => doCheckOut(b)}
                            className="rounded-md bg-amber-500 px-2.5 py-1.5 text-[11px] font-semibold text-jungle-dark transition-colors duration-150 hover:bg-amber-400">

                            Check-Out
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => setSelected(b)}
                          className="flex items-center gap-1.5 rounded-md border border-sand px-2.5 py-1.5 text-[11px] font-semibold text-jungle transition-colors duration-150 hover:bg-sand">

                          <EyeIcon className="h-3.5 w-3.5" /> View
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {rows.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-5 py-12 text-center text-sm text-jungle/45">
                      No reservations match those filters.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {filtered.length > limit && (
            <footer className="flex justify-center border-t border-sand px-5 py-3.5">
              <button
                type="button"
                onClick={() => setLimit((l) => l + 12)}
                className="rounded-lg border border-sand px-3 py-1.5 text-xs font-semibold text-jungle transition-colors duration-150 hover:bg-sand">

                Load more reservations
              </button>
            </footer>
          )}
        </section>
      )}

      <WalkInBookingModal open={walkIn} onClose={() => setWalkIn(false)} />

      <BookingDetailsDrawer
        booking={selected}
        onClose={() => setSelected(null)}
        onCheckIn={doCheckIn}
        onCheckOut={doCheckOut}
      />


      <Modal
        open={!!cancelling}
        onClose={() => setCancelling(null)}
        width="max-w-md"
        title={`Cancel ${cancelling?.ref ?? ''}`}
        description="A reason is mandatory — it is logged against the reservation before dates are released."
        footer={
          <>
            <button
              type="button"
              onClick={() => setCancelling(null)}
              className="rounded-lg border border-sand px-4 py-2 text-sm font-semibold text-jungle transition-colors duration-150 hover:bg-sand">

              Keep booking
            </button>
            <button
              type="button"
              onClick={submitCancel}
              className="rounded-lg bg-rose-500 px-4 py-2 text-sm font-semibold text-white transition-colors duration-150 hover:bg-rose-600">

              Cancel & release dates
            </button>
          </>
        }>

        <label htmlFor="cancel-reason" className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-jungle/60">
          Cancellation reason
        </label>
        <textarea
          id="cancel-reason"
          rows={3}
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="Guest illness, double booking, weather closure…"
          className={`w-full resize-none rounded-lg border bg-sand-light px-3 py-2 text-sm text-jungle-dark placeholder-jungle/40 outline-none focus:border-sage ${
            reasonError ? 'border-rose-500' : 'border-sand'
          }`}
        />

        {reasonError && <p className="mt-1 text-xs font-medium text-rose-600">{reasonError}</p>}
        {cancelling && (
          <p className="mt-4 text-xs text-jungle/60">
            {cancelling.guestName} · {cancelling.roomTitle} No. {cancelling.roomNumber} · {money(cancelling.amount)}
          </p>
        )}
      </Modal>
    </div>
  );
}

export default function AdminBookings() {
  return (
    <Suspense fallback={null}>
      <AdminBookingsInner />
    </Suspense>
  );
}
