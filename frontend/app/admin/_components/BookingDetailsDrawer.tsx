'use client';

import React from 'react';
import { MailIcon, MessageSquareIcon, PhoneIcon } from 'lucide-react';
import { Modal } from './ui/Modal';
import type { Booking } from '../_lib/types/hotel';
import { BookingStatusBadge } from './StatusBadge';
import { money, nightsBetween, prettyDate } from '../_lib/utils/format';

interface Props {
  booking: Booking | null;
  onClose: () => void;
  onCheckIn?: (booking: Booking) => void;
  onCheckOut?: (booking: Booking) => void;
}

export function BookingDetailsDrawer({ booking, onClose, onCheckIn, onCheckOut }: Props) {
  const nights = booking ? Math.max(1, nightsBetween(booking.checkIn, booking.checkOut)) : 0;

  return (
    <Modal
      open={!!booking}
      onClose={onClose}
      width="max-w-lg"
      title={booking ? `${booking.ref} · ${booking.guestName}` : 'Booking'}
      description={booking ? `${booking.roomTitle} · Room No. ${booking.roomNumber}` : undefined}
      footer={
        booking && (
          <>
            {booking.status === 'confirmed' && booking.paid && onCheckIn && (
              <button
                type="button"
                onClick={() => onCheckIn(booking)}
                className="rounded-lg bg-emerald-500 px-4 py-2 text-sm font-semibold text-white transition-colors duration-150 hover:bg-emerald-600">

                Check-In
              </button>
            )}
            {booking.status === 'checked-in' && onCheckOut && (
              <button
                type="button"
                onClick={() => onCheckOut(booking)}
                className="rounded-lg bg-amber-500 px-4 py-2 text-sm font-semibold text-jungle-dark transition-colors duration-150 hover:bg-amber-400">

                Check-Out
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-sand px-4 py-2 text-sm font-semibold text-jungle transition-colors duration-150 hover:bg-sand">

              Close
            </button>
          </>
        )
      }>

      {booking && (
        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <BookingStatusBadge status={booking.status} />
            <span className="rounded-full border border-sand px-2 py-0.5 text-[11px] font-semibold text-jungle">
              {booking.source}
            </span>
            <span
              className={`rounded-full border px-2 py-0.5 text-[11px] font-semibold ${
                booking.paid
                  ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-700'
                  : 'border-amber-500/30 bg-amber-500/10 text-amber-700'
              }`}>

              {money(booking.amount)} {booking.paid ? 'Paid via Stripe' : 'Unpaid'}
            </span>
          </div>

          <section>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-jungle/60">Guest contact</h3>
            <div className="mt-3 space-y-2.5 rounded-lg border border-sand bg-sand-light p-4 text-sm">
              <p className="font-semibold text-jungle-dark">{booking.guestName}</p>
              <p className="flex items-center gap-2 text-jungle">
                <MailIcon className="h-4 w-4 text-jungle/45" /> {booking.guestEmail}
              </p>
              <p className="flex items-center gap-2 text-jungle">
                <PhoneIcon className="h-4 w-4 text-jungle/45" /> {booking.guestPhone}
              </p>
            </div>
          </section>

          <section>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-jungle/60">Stay</h3>
            <dl className="mt-3 grid grid-cols-2 gap-4 rounded-lg border border-sand bg-sand-light p-4 text-sm">
              <div>
                <dt className="text-xs text-jungle/45">Arrival</dt>
                <dd className="mt-0.5 font-medium text-jungle-dark">{prettyDate(booking.checkIn)}</dd>
              </div>
              <div>
                <dt className="text-xs text-jungle/45">Departure</dt>
                <dd className="mt-0.5 font-medium text-jungle-dark">{prettyDate(booking.checkOut)}</dd>
              </div>
              <div>
                <dt className="text-xs text-jungle/45">Nights</dt>
                <dd className="mt-0.5 font-medium text-jungle-dark">{nights}</dd>
              </div>
              <div>
                <dt className="text-xs text-jungle/45">Guests</dt>
                <dd className="mt-0.5 font-medium text-jungle-dark">{booking.guests}</dd>
              </div>
            </dl>
          </section>

          <section>
            <h3 className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-jungle/60">
              <MessageSquareIcon className="h-3.5 w-3.5" /> Special requests
            </h3>
            <p className="mt-3 rounded-lg border border-sand bg-sand-light p-4 text-sm leading-relaxed text-jungle">
              {booking.specialRequests || 'No special requests on file.'}
            </p>
          </section>

          {booking.cancelReason && (
            <section>
              <h3 className="text-xs font-semibold uppercase tracking-wider text-rose-700">Cancellation reason</h3>
              <p className="mt-3 rounded-lg border border-rose-500/25 bg-rose-500/10 p-4 text-sm text-rose-700">
                {booking.cancelReason}
              </p>
            </section>
          )}
        </div>
      )}
    </Modal>
  );
}
