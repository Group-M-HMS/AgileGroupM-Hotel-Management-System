'use client';

import React, { useState } from 'react';
import { BellRingIcon, CheckIcon, CreditCardIcon, ServerIcon, XIcon } from 'lucide-react';
import { toast } from 'sonner';
import { useHotel } from '../_lib/contexts/HotelDataContext';
import type { AlertItem } from '../_lib/types/hotel';

const icons = {
  payment: CreditCardIcon,
  request: BellRingIcon,
  system: ServerIcon,
};

const kindLabels: Record<AlertItem['kind'], string> = {
  payment: 'Payment',
  request: 'Guest request',
  system: 'System',
};

const filters: Array<{ key: AlertItem['resolved'] | 'all'; label: string }> = [
  { key: 'all', label: 'All' },
  { key: 'pending', label: 'Pending' },
  { key: 'approved', label: 'Approved' },
  { key: 'dismissed', label: 'Dismissed' },
];

export default function AdminAlerts() {
  const { alerts, resolveAlert } = useHotel();
  const [filter, setFilter] = useState<AlertItem['resolved'] | 'all'>('all');

  const counts = {
    all: alerts.length,
    pending: alerts.filter((a) => a.resolved === 'pending').length,
    approved: alerts.filter((a) => a.resolved === 'approved').length,
    dismissed: alerts.filter((a) => a.resolved === 'dismissed').length,
  };

  const visible = filter === 'all' ? alerts : alerts.filter((a) => a.resolved === filter);

  return (
    <div className="space-y-5">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold text-jungle-dark">Activity & alerts</h1>
          <p className="mt-1 text-sm text-jungle/60">Payment logs and in-room guest requests.</p>
        </div>
      </header>

      <div className="grid gap-4 sm:grid-cols-3">
        {[
          ['Pending', counts.pending, 'text-amber-700'],
          ['Approved', counts.approved, 'text-emerald-700'],
          ['Dismissed', counts.dismissed, 'text-jungle-dark'],
        ].map(([label, value, tone]) => (
          <div key={label as string} className="rounded-xl border border-sand bg-white px-5 py-4">
            <p className="text-xs font-semibold uppercase tracking-wider text-jungle/60">{label}</p>
            <p className={`mt-2 text-2xl font-semibold ${tone}`}>{value}</p>
          </div>
        ))}
      </div>

      <section className="rounded-xl border border-sand bg-white">
        <header className="flex flex-wrap items-center gap-2 border-b border-sand px-5 py-4">
          {filters.map((f) => (
            <button
              key={f.key}
              type="button"
              onClick={() => setFilter(f.key)}
              aria-pressed={filter === f.key}
              className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors duration-150 ${
                filter === f.key
                  ? 'border-clay bg-clay/12 text-clay'
                  : 'border-sand text-jungle/60 hover:border-sage hover:text-jungle'
              }`}>

              {f.label} ({counts[f.key]})
            </button>
          ))}
        </header>

        <ul className="space-y-3 p-5">
          {visible.map((alert) => {
            const Icon = icons[alert.kind];
            return (
              <li key={alert.id} className="rounded-lg border border-sand bg-sand-light p-4">
                <div className="flex items-start gap-3">
                  <span
                    className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${
                      alert.kind === 'payment'
                        ? 'bg-emerald-500/12 text-emerald-700'
                        : alert.kind === 'request'
                        ? 'bg-clay/12 text-clay'
                        : 'bg-rose-500/12 text-rose-700'
                    }`}>

                    <Icon className="h-4 w-4" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-jungle/45">
                      {kindLabels[alert.kind]}
                    </p>
                    <p className="mt-0.5 text-sm font-medium text-jungle-dark">{alert.title}</p>
                    <p className="mt-0.5 text-xs text-jungle/60">{alert.detail}</p>
                    <p className="mt-1 text-[11px] text-jungle/45">{alert.time}</p>
                  </div>
                </div>

                {alert.resolved === 'pending' ? (
                  <div className="mt-3 flex gap-2 border-t border-sand pt-3">
                    <button
                      type="button"
                      onClick={() => {
                        resolveAlert(alert.id, 'approved');
                        toast.success('Request approved and sent to the team');
                      }}
                      className="flex items-center gap-1.5 rounded-lg bg-emerald-500 px-3 py-1.5 text-xs font-semibold text-white transition-colors duration-150 hover:bg-emerald-600">

                      <CheckIcon className="h-3.5 w-3.5" /> Approve
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        resolveAlert(alert.id, 'dismissed');
                        toast.message('Alert dismissed');
                      }}
                      className="flex items-center gap-1.5 rounded-lg border border-sand px-3 py-1.5 text-xs font-semibold text-jungle transition-colors duration-150 hover:bg-white">

                      <XIcon className="h-3.5 w-3.5" /> Dismiss
                    </button>
                  </div>
                ) : (
                  <p
                    className={`mt-3 border-t border-sand pt-3 text-xs font-semibold ${
                      alert.resolved === 'approved' ? 'text-emerald-700' : 'text-jungle/45'
                    }`}>

                    {alert.resolved === 'approved' ? 'Approved' : 'Dismissed'}
                  </p>
                )}
              </li>
            );
          })}
          {visible.length === 0 && (
            <p className="py-10 text-center text-sm text-jungle/45">No alerts in this state.</p>
          )}
        </ul>
      </section>
    </div>
  );
}
