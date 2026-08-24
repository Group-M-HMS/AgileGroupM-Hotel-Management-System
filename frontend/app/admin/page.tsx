'use client';

import React, { Suspense, useEffect, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import {
  ActivityIcon,
  ArrowUpRightIcon,
  DollarSignIcon,
  LeafIcon,
  LogInIcon,
  PercentIcon,
} from 'lucide-react';
import { useHotel } from './_lib/contexts/HotelDataContext';
import { fetchDashboardMetrics, type DashboardMetrics } from './_lib/api/dashboard';
import { RoomStatusGrid } from './_components/RoomStatusGrid';
import { ReservationsTable } from './_components/ReservationsTable';
import { money } from './_lib/utils/format';

function AdminDashboardInner() {
  const { experiences } = useHotel();
  const params = useSearchParams();
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetchDashboardMetrics()
      .then((m) => {
        if (!cancelled) setMetrics(m);
      })
      .catch((err) => console.error('Failed to load dashboard metrics', err));
    return () => {
      cancelled = true;
    };
  }, []);

  const kpis = [
    {
      label: 'Total Monthly Revenue',
      value: money(metrics?.monthlyRevenue ?? 0),
      meta: metrics ? `${metrics.growthPercentage >= 0 ? '+' : ''}${metrics.growthPercentage.toFixed(1)}% vs last month` : '—',
      metaTone: 'text-emerald-700',
      icon: DollarSignIcon,
      accent: 'bg-emerald-500/12 text-emerald-700',
      primary: true,
    },
    {
      label: 'Occupancy Rate',
      value: `${metrics?.occupancyPercentage ?? 0}%`,
      meta: `${metrics?.inServiceRooms ?? 0}/${metrics?.totalRooms ?? 0} Rooms Occupied`,
      metaTone: 'text-jungle/60',
      icon: PercentIcon,
      accent: 'bg-clay/12 text-clay',
    },
    {
      label: 'Today’s Check-ins',
      value: `${metrics?.todayTotalArrivals ?? 0} Guests`,
      meta: `${metrics?.arrivedTodayCount ?? 0} Checked-In, ${metrics?.pendingArrivalsCount ?? 0} Pending`,
      metaTone: 'text-jungle/60',
      icon: LogInIcon,
      accent: 'bg-cyan-500/12 text-cyan-700',
    },
    {
      label: 'Resort Experiences',
      value: `${experiences.filter((e) => e.active).length} Active`,
      meta: 'Activities bookable today',
      metaTone: 'text-jungle/60',
      icon: LeafIcon,
      accent: 'bg-amber-500/12 text-amber-700',
    },
  ];

  const pendingAlerts = metrics?.pendingAlerts ?? 0;

  return (
    <div className="space-y-5">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold text-jungle-dark">Dashboard overview</h1>
          <p className="mt-1 text-sm text-jungle/60">
            Front desk, housekeeping and reservations, live across all {metrics?.totalRooms ?? '—'} rooms.
          </p>
        </div>
        <Link
          href="/admin/alerts"
          className="flex items-center gap-2 rounded-lg border border-sand bg-white px-3.5 py-2 text-sm font-semibold text-jungle transition-colors duration-150 hover:bg-sand">

          <ActivityIcon className="h-4 w-4" /> Activity & alerts
          {pendingAlerts > 0 && (
            <span className="rounded-full bg-rose-500 px-1.5 text-[10px] font-bold text-white">{pendingAlerts}</span>
          )}
        </Link>
      </header>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {kpis.map((kpi) => (
          <article
            key={kpi.label}
            className={`rounded-xl border bg-white p-5 ${
              kpi.primary ? 'border-emerald-500/30 xl:p-6' : 'border-sand'
            }`}>

            <div className="flex items-start justify-between gap-3">
              <p className="text-xs font-semibold uppercase tracking-wider text-jungle/60">{kpi.label}</p>
              <span className={`flex h-8 w-8 items-center justify-center rounded-lg ${kpi.accent}`}>
                <kpi.icon className="h-4 w-4" />
              </span>
            </div>
            <p className={`mt-4 font-semibold text-jungle-dark ${kpi.primary ? 'text-3xl' : 'text-2xl'}`}>{kpi.value}</p>
            <p className={`mt-1.5 flex items-center gap-1 text-xs font-medium ${kpi.metaTone}`}>
              {kpi.primary && <ArrowUpRightIcon className="h-3.5 w-3.5" />}
              {kpi.meta}
            </p>
          </article>
        ))}
      </div>

      <RoomStatusGrid />

      <ReservationsTable key={params.get('q') ?? 'all'} initialQuery={params.get('q') ?? ''} />
    </div>
  );
}

export default function AdminDashboard() {
  return (
    <Suspense fallback={null}>
      <AdminDashboardInner />
    </Suspense>
  );
}
