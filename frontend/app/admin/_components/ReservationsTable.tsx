'use client';

import React, { useMemo, useState } from 'react';
import { EyeIcon, SearchIcon, UsersIcon, BedDoubleIcon } from 'lucide-react';
import { toast } from 'sonner';
import { useHotel } from '../_lib/contexts/HotelDataContext';
import type { Booking, BookingStatus } from '../_lib/types/hotel';
import { BookingStatusBadge } from './StatusBadge';
import { BookingDetailsDrawer } from './BookingDetailsDrawer';
import { money, shortDate } from '../_lib/utils/format';

const statusFilters: Array<{ value: BookingStatus | 'all'; label: string }> = [
  { value: 'all', label: 'All statuses' },
  { value: 'confirmed', label: 'Confirmed' },
  { value: 'checked-in', label: 'Checked-In' },
  { value: 'checked-out', label: 'Checked-Out' },
  { value: 'cancelled', label: 'Cancelled' },
];

export function ReservationsTable({ initialQuery = '' }: { initialQuery?: string }) {
  const { bookings, guests, checkInBooking, checkOutBooking } = useHotel();
  const [tab, setTab] = useState<'bookings' | 'guests'>('bookings');
  const [search, setSearch] = useState(initialQuery);
  const [status, setStatus] = useState<BookingStatus | 'all'>('all');
  const [limit, setLimit] = useState(10);
  const [selected, setSelected] = useState<Booking | null>(null);

  const q = search.trim().toLowerCase();

  const filteredBookings = useMemo(
    () =>
      bookings
        .filter((b) => (status === 'all' ? true : b.status === status))
        .filter((b) =>
          q ? `${b.ref} ${b.guestName} ${b.roomTitle} ${b.roomNumber} ${b.guestEmail}`.toLowerCase().includes(q) : true
        ),
    [bookings, status, q]
  );

  const filteredGuests = useMemo(
    () => guests.filter((g) => (q ? `${g.name} ${g.email} ${g.phone}`.toLowerCase().includes(q) : true)),
    [guests, q]
  );

  const doCheckIn = async (booking: Booking) => {
    try {
      await checkInBooking(booking.id);
      toast.success(`${booking.guestName} checked in — room ${booking.roomNumber} now occupied`);
    } catch {
      toast.error('Could not check in this guest. Please try again.');
    }
    setSelected(null);
  };
  const doCheckOut = async (booking: Booking) => {
    try {
      await checkOutBooking(booking.id);
      toast.success(`${booking.guestName} checked out — room ${booking.roomNumber} queued for cleaning`);
    } catch {
      toast.error('Could not check out this guest. Please try again.');
    }
    setSelected(null);
  };

  const rows = filteredBookings.slice(0, limit);
  const guestRows = filteredGuests.slice(0, limit);

  return (
    <section className="rounded-xl border border-sand bg-white">
      <header className="flex flex-wrap items-center gap-4 border-b border-sand px-5 py-4">
        <div className="flex rounded-lg border border-sand bg-sand-light p-1">
          <button
            type="button"
            onClick={() => setTab('bookings')}
            className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-semibold transition-colors duration-150 ${
              tab === 'bookings' ? 'bg-jungle-dark text-white' : 'text-jungle/60 hover:text-jungle'
            }`}>

            <BedDoubleIcon className="h-3.5 w-3.5" /> Room Bookings
          </button>
          <button
            type="button"
            onClick={() => setTab('guests')}
            className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-semibold transition-colors duration-150 ${
              tab === 'guests' ? 'bg-jungle-dark text-white' : 'text-jungle/60 hover:text-jungle'
            }`}>

            <UsersIcon className="h-3.5 w-3.5" /> Guest Directory
          </button>
        </div>

        <div className="relative ml-auto w-full max-w-xs">
          <SearchIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-jungle/45" />
          <input
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setLimit(10);
            }}
            placeholder={tab === 'bookings' ? 'Search ref, guest or room…' : 'Search name, email or phone…'}
            aria-label="Filter reservations"
            className="w-full rounded-lg border border-sand bg-sand-light py-2 pl-9 pr-3 text-sm text-jungle-dark placeholder-jungle/40 outline-none transition-colors duration-150 focus:border-sage"
          />

        </div>

        {tab === 'bookings' && (
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
        )}
      </header>

      <div className="overflow-x-auto thin-scroll">
        {tab === 'bookings' ? (
          <table className="w-full min-w-[900px] text-left text-sm">
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

                      {money(b.amount)} {b.paid ? 'Paid via Stripe' : 'Unpaid'}
                    </span>
                  </td>
                  <td className="px-5 py-3">
                    <BookingStatusBadge status={b.status} />
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex items-center justify-end gap-2">
                      {b.status === 'confirmed' && b.paid && (
                        <button
                          type="button"
                          onClick={() => doCheckIn(b)}
                          className="rounded-md bg-emerald-500 px-2.5 py-1.5 text-[11px] font-semibold text-white transition-colors duration-150 hover:bg-emerald-600">

                          Check-In
                        </button>
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

                        <EyeIcon className="h-3.5 w-3.5" /> View Details
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
        ) : (
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead>
              <tr className="border-b border-sand text-[11px] uppercase tracking-wider text-jungle/45">
                <th scope="col" className="px-5 py-3 font-semibold">Guest</th>
                <th scope="col" className="px-5 py-3 font-semibold">Email</th>
                <th scope="col" className="px-5 py-3 font-semibold">Phone</th>
                <th scope="col" className="px-5 py-3 font-semibold">Stays</th>
                <th scope="col" className="px-5 py-3 font-semibold">Member since</th>
              </tr>
            </thead>
            <tbody>
              {guestRows.map((g) => (
                <tr key={g.id} className="border-b border-sand/60 transition-colors duration-150 hover:bg-sand-light/50">
                  <td className="px-5 py-3 font-medium text-jungle-dark">{g.name}</td>
                  <td className="px-5 py-3 text-jungle">{g.email}</td>
                  <td className="px-5 py-3 text-jungle">{g.phone}</td>
                  <td className="px-5 py-3">
                    <span className="rounded-full border border-sand px-2 py-0.5 text-[11px] font-semibold text-jungle">
                      {g.stays} {g.stays === 1 ? 'stay' : 'stays'}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-jungle/60">{g.joined}</td>
                </tr>
              ))}
              {guestRows.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-5 py-12 text-center text-sm text-jungle/45">
                    No guests match that search.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      <footer className="flex items-center justify-between gap-4 border-t border-sand px-5 py-3.5">
        <p className="text-xs text-jungle/45" aria-live="polite">
          Showing {tab === 'bookings' ? rows.length : guestRows.length} of{' '}
          {tab === 'bookings' ? filteredBookings.length : filteredGuests.length}
        </p>
        {(tab === 'bookings' ? filteredBookings.length : filteredGuests.length) > limit && (
          <button
            type="button"
            onClick={() => setLimit((l) => l + 10)}
            className="rounded-lg border border-sand px-3 py-1.5 text-xs font-semibold text-jungle transition-colors duration-150 hover:bg-sand">

            Load more
          </button>
        )}
      </footer>

      <BookingDetailsDrawer
        booking={selected}
        onClose={() => setSelected(null)}
        onCheckIn={doCheckIn}
        onCheckOut={doCheckOut}
      />

    </section>
  );
}
