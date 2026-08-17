'use client';

import React from 'react';
import { addDays, format, parseISO } from 'date-fns';
import type { Booking, Room } from '../_lib/types/hotel';
import { money, prettyDate } from '../_lib/utils/format';

const DAYS = 14;

const barTone: Record<Booking['status'], string> = {
  confirmed: 'bg-jungle-dark/80 text-white',
  'checked-in': 'bg-emerald-500/80 text-jungle-dark',
  'checked-out': 'bg-gray-500/80 text-white',
  cancelled: 'bg-rose-500/70 text-white line-through',
};

interface Props {
  rooms: Room[];
  bookings: Booking[];
  onSelect: (booking: Booking) => void;
}

export function CalendarTimeline({ rooms, bookings, onSelect }: Props) {
  const start = new Date();
  const days = Array.from({ length: DAYS }, (_, i) => addDays(start, i));
  const windowStart = days[0];
  const windowEnd = days[DAYS - 1];

  const dayIndex = (iso: string) => {
    const d = parseISO(iso);
    return Math.round((d.getTime() - windowStart.getTime()) / 86400000);
  };

  const rows = rooms
    .map((room) => ({
      room,
      stays: bookings.filter((b) => {
        if (b.roomId !== room.id || b.status === 'cancelled') return false;
        const inIdx = dayIndex(b.checkIn);
        const outIdx = dayIndex(b.checkOut);
        return outIdx > 0 && inIdx < DAYS;
      }),
    }))
    .filter((r) => r.stays.length > 0)
    .slice(0, 18);

  return (
    <section className="rounded-xl border border-sand bg-white">
      <header className="flex flex-wrap items-center justify-between gap-4 border-b border-sand px-5 py-4">
        <div>
          <h2 className="text-sm font-semibold text-jungle-dark">Calendar timeline</h2>
          <p className="mt-0.5 text-xs text-jungle/60">
            {format(windowStart, 'd MMM')} – {format(windowEnd, 'd MMM yyyy')} · hover a bar for details
          </p>
        </div>
        <div className="flex flex-wrap gap-3 text-[11px] text-jungle/60">
          {[
            ['Confirmed', 'bg-jungle-dark'],
            ['Checked-In', 'bg-emerald-500'],
            ['Checked-Out', 'bg-slate-600'],
          ].map(([label, dot]) => (
            <span key={label} className="flex items-center gap-1.5">
              <span className={`h-2 w-2 rounded-full ${dot}`} /> {label}
            </span>
          ))}
        </div>
      </header>

      <div className="overflow-x-auto thin-scroll">
        <div className="min-w-[980px] p-5">
          <div className="grid" style={{ gridTemplateColumns: `170px repeat(${DAYS}, minmax(50px, 1fr))` }}>
            <div className="pb-3 text-[11px] font-semibold uppercase tracking-wider text-jungle/45">Room</div>
            {days.map((d) => (
              <div key={d.toISOString()} className="pb-3 text-center">
                <p className="text-[10px] uppercase tracking-wider text-jungle/45">{format(d, 'EEE')}</p>
                <p className="text-xs font-semibold text-jungle">{format(d, 'd')}</p>
              </div>
            ))}
          </div>

          <div className="space-y-1.5">
            {rows.map(({ room, stays }) => (
              <div
                key={room.id}
                className="grid items-center rounded-lg border border-sand/60 bg-sand-light/40"
                style={{ gridTemplateColumns: `170px repeat(${DAYS}, minmax(50px, 1fr))` }}>

                <div className="border-r border-sand/60 px-3 py-2.5">
                  <p className="text-xs font-semibold text-jungle">No. {room.number}</p>
                  <p className="truncate text-[11px] text-jungle/45">{room.title}</p>
                </div>
                <div
                  className="relative grid h-11"
                  style={{ gridColumn: '2 / -1', gridTemplateColumns: `repeat(${DAYS}, minmax(50px, 1fr))` }}>

                  {days.map((d, i) => (
                    <div key={i} className="border-r border-sand/30 last:border-0" />
                  ))}
                  {stays.map((b) => {
                    const from = Math.max(0, dayIndex(b.checkIn));
                    const to = Math.min(DAYS, dayIndex(b.checkOut));
                    const span = Math.max(1, to - from);
                    return (
                      <button
                        key={b.id}
                        type="button"
                        onClick={() => onSelect(b)}
                        title={`${b.ref} · ${b.guestName} · ${prettyDate(b.checkIn)} → ${prettyDate(b.checkOut)} · ${money(b.amount)}`}
                        className={`absolute top-1/2 flex h-7 -translate-y-1/2 items-center overflow-hidden rounded-md px-2 text-[11px] font-semibold transition-transform duration-150 ease-out hover:scale-[1.02] ${barTone[b.status]}`}
                        style={{
                          left: `calc(${(from / DAYS) * 100}% + 3px)`,
                          width: `calc(${(span / DAYS) * 100}% - 6px)`,
                        }}>

                        <span className="truncate">{b.guestName}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
            {rows.length === 0 && (
              <p className="py-12 text-center text-sm text-jungle/45">No reservations fall inside this window.</p>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
