'use client';

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  BedDoubleIcon,
  BellIcon,
  CalendarDaysIcon,
  ChevronDownIcon,
  LayoutDashboardIcon,
  LeafIcon,
  LogOutIcon,
  PanelLeftCloseIcon,
  PanelLeftOpenIcon,
  PlusIcon,
  SearchIcon,
  SettingsIcon,
  UsersIcon,
  XIcon,
} from 'lucide-react';
import { toast } from 'sonner';
import { useHotel } from '../_lib/contexts/HotelDataContext';
import { WalkInBookingModal } from './WalkInBookingModal';

const nav = [
  { to: '/admin', label: 'Dashboard Overview', icon: LayoutDashboardIcon, end: true },
  { to: '/admin/rooms', label: 'Rooms & Suites', icon: BedDoubleIcon },
  { to: '/admin/bookings', label: 'Bookings & Calendar', icon: CalendarDaysIcon },
  { to: '/admin/guests', label: 'Guests & Profiles', icon: UsersIcon },
  { to: '/admin/experiences', label: 'Experiences', icon: LeafIcon },
  { to: '/admin/alerts', label: 'Activity & Alerts', icon: BellIcon },
];

export function AdminShell({ children }: { children: React.ReactNode }) {
  const { rooms, guests, bookings, alerts } = useHotel();
  const [collapsed, setCollapsed] = useState(false);
  const [query, setQuery] = useState('');
  const [bellOpen, setBellOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [walkIn, setWalkIn] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const bellRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      const t = e.target as Node;
      if (bellRef.current && !bellRef.current.contains(t)) setBellOpen(false);
      if (profileRef.current && !profileRef.current.contains(t)) setProfileOpen(false);
      if (searchRef.current && !searchRef.current.contains(t)) setQuery('');
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  const q = query.trim().toLowerCase();
  const results = q
    ? {
        rooms: rooms.filter((r) => `${r.number} ${r.title} ${r.bedType}`.toLowerCase().includes(q)).slice(0, 4),
        guests: guests.filter((g) => `${g.name} ${g.email} ${g.phone}`.toLowerCase().includes(q)).slice(0, 4),
        bookings: bookings.filter((b) => `${b.ref} ${b.guestName}`.toLowerCase().includes(q)).slice(0, 4),
      }
    : null;
  const resultCount = results ? results.rooms.length + results.guests.length + results.bookings.length : 0;

  const pending = alerts.filter((a) => a.resolved === 'pending').slice(0, 3);

  const go = (path: string, term: string) => {
    setQuery('');
    router.push(`${path}?q=${encodeURIComponent(term)}`);
  };

  const isActive = (to: string, end?: boolean) => (end ? pathname === to : pathname === to || pathname?.startsWith(`${to}/`));

  return (
    <div className="flex min-h-screen w-full bg-sand-light text-jungle">
      <aside
        className={`sticky top-0 hidden h-screen shrink-0 flex-col border-r border-sand bg-white transition-[width] duration-200 ease-out lg:flex ${
          collapsed ? 'w-[76px]' : 'w-64'
        }`}>

        <div className="flex h-16 items-center gap-2.5 border-b border-sand px-4">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-jungle-dark text-white">
            <LeafIcon className="h-4 w-4" />
          </span>
          {!collapsed && (
            <span className="leading-tight">
              <span className="block text-sm font-semibold text-jungle-dark">River Nest</span>
              <span className="block text-[10px] uppercase tracking-wider text-jungle/60">Operations</span>
            </span>
          )}
        </div>

        <nav aria-label="Admin sections" className="flex-1 space-y-1 p-3">
          {nav.map(({ to, label, icon: Icon, end }) => (
            <Link
              key={to}
              href={to}
              title={collapsed ? label : undefined}
              className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors duration-150 ${
                isActive(to, end) ? 'bg-clay/15 text-clay' : 'text-jungle/60 hover:bg-sand hover:text-jungle-dark'
              }`}>

              <Icon className="h-[18px] w-[18px] shrink-0" />
              {!collapsed && <span className="truncate">{label}</span>}
            </Link>
          ))}
        </nav>

        <div className="border-t border-sand p-3">
          <button
            type="button"
            onClick={() => setCollapsed((v) => !v)}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-jungle/60 transition-colors duration-150 hover:bg-sand hover:text-jungle-dark">

            {collapsed ? <PanelLeftOpenIcon className="h-[18px] w-[18px]" /> : <PanelLeftCloseIcon className="h-[18px] w-[18px]" />}
            {!collapsed && 'Collapse'}
          </button>
          <Link
            href="/"
            className="mt-1 flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-jungle/60 transition-colors duration-150 hover:bg-sand hover:text-jungle-dark">

            <SettingsIcon className="h-[18px] w-[18px]" />
            {!collapsed && 'Guest website'}
          </Link>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-sand bg-sand-light/95 px-4 backdrop-blur lg:px-6">
          <div className="relative w-full max-w-md" ref={searchRef}>
            <SearchIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-jungle/45" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search rooms, guests or booking refs…"
              aria-label="Global search"
              className="w-full rounded-lg border border-sand bg-white py-2 pl-9 pr-8 text-sm text-jungle-dark placeholder-jungle/40 outline-none transition-colors duration-150 focus:border-sage"
            />

            {query && (
              <button
                type="button"
                aria-label="Clear search"
                onClick={() => setQuery('')}
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-jungle/45 hover:text-jungle">

                <XIcon className="h-3.5 w-3.5" />
              </button>
            )}

            {results && (
              <div className="absolute left-0 top-12 max-h-80 w-full overflow-y-auto rounded-xl border border-sand bg-white py-2 shadow-2xl thin-scroll">
                {resultCount === 0 && <p className="px-4 py-3 text-sm text-jungle/45">No matches for “{query}”.</p>}
                {results.rooms.length > 0 && (
                  <>
                    <p className="px-4 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-jungle/45">Rooms</p>
                    {results.rooms.map((r) => (
                      <button
                        key={r.id}
                        type="button"
                        onClick={() => go('/admin/rooms', r.title)}
                        className="flex w-full items-center justify-between gap-3 px-4 py-2 text-left text-sm text-jungle transition-colors duration-150 hover:bg-sand">

                        <span>{r.number} · {r.title}</span>
                        <span className="text-xs text-jungle/45">{r.bedType}</span>
                      </button>
                    ))}
                  </>
                )}
                {results.guests.length > 0 && (
                  <>
                    <p className="px-4 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-jungle/45">Guests</p>
                    {results.guests.map((g) => (
                      <button
                        key={g.id}
                        type="button"
                        onClick={() => go('/admin/guests', g.name)}
                        className="flex w-full items-center justify-between gap-3 px-4 py-2 text-left text-sm text-jungle transition-colors duration-150 hover:bg-sand">

                        <span>{g.name}</span>
                        <span className="truncate text-xs text-jungle/45">{g.email}</span>
                      </button>
                    ))}
                  </>
                )}
                {results.bookings.length > 0 && (
                  <>
                    <p className="px-4 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-jungle/45">Bookings</p>
                    {results.bookings.map((b) => (
                      <button
                        key={b.id}
                        type="button"
                        onClick={() => go('/admin/bookings', b.ref)}
                        className="flex w-full items-center justify-between gap-3 px-4 py-2 text-left text-sm text-jungle transition-colors duration-150 hover:bg-sand">

                        <span>{b.ref} · {b.guestName}</span>
                        <span className="text-xs text-jungle/45">{b.roomTitle}</span>
                      </button>
                    ))}
                  </>
                )}
              </div>
            )}
          </div>

          <div className="ml-auto flex items-center gap-2">
            <button
              type="button"
              onClick={() => setWalkIn(true)}
              className="hidden items-center gap-1.5 rounded-lg bg-jungle-dark px-3.5 py-2 text-sm font-semibold text-white transition-colors duration-150 hover:bg-jungle sm:flex">

              <PlusIcon className="h-4 w-4" /> New Walk-in Booking
            </button>

            <div className="relative" ref={bellRef}>
              <button
                type="button"
                onClick={() => setBellOpen((v) => !v)}
                aria-label="Notifications"
                aria-expanded={bellOpen}
                className="relative rounded-lg border border-sand p-2 text-jungle transition-colors duration-150 hover:bg-white">

                <BellIcon className="h-4 w-4" />
                {pending.length > 0 && (
                  <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white">
                    {pending.length}
                  </span>
                )}
              </button>
              {bellOpen && (
                <div className="absolute right-0 top-12 w-80 overflow-hidden rounded-xl border border-sand bg-white shadow-2xl">
                  <p className="border-b border-sand px-4 py-3 text-xs font-semibold uppercase tracking-wider text-jungle/60">
                    Live alerts
                  </p>
                  {pending.length === 0 && <p className="px-4 py-4 text-sm text-jungle/45">All caught up.</p>}
                  {pending.map((a) => (
                    <div key={a.id} className="border-b border-sand/60 px-4 py-3 last:border-0">
                      <p className="text-sm font-medium text-jungle-dark">{a.title}</p>
                      <p className="mt-0.5 text-xs text-jungle/60">{a.detail}</p>
                      <p className="mt-1 text-[11px] text-jungle/45">{a.time}</p>
                    </div>
                  ))}
                  <Link
                    href="/admin/alerts"
                    onClick={() => setBellOpen(false)}
                    className="block px-4 py-2.5 text-center text-xs font-semibold text-clay transition-colors duration-150 hover:bg-sand">

                    View all activity & alerts
                  </Link>
                </div>
              )}
            </div>

            <div className="relative" ref={profileRef}>
              <button
                type="button"
                onClick={() => setProfileOpen((v) => !v)}
                aria-expanded={profileOpen}
                className="flex items-center gap-2 rounded-lg border border-sand py-1 pl-1 pr-2 transition-colors duration-150 hover:bg-white">

                <span className="flex h-7 w-7 items-center justify-center rounded-md bg-emerald-500/15 text-xs font-bold text-emerald-700">
                  DR
                </span>
                <ChevronDownIcon className="h-3.5 w-3.5 text-jungle/60" />
              </button>
              {profileOpen && (
                <div className="absolute right-0 top-12 w-56 overflow-hidden rounded-xl border border-sand bg-white shadow-2xl">
                  <div className="border-b border-sand px-4 py-3">
                    <p className="text-sm font-semibold text-jungle-dark">Dinuka Rajapaksa</p>
                    <p className="text-xs text-jungle/60">Resort Manager</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setProfileOpen(false);
                      toast.success('Signed out of the operations console');
                    }}
                    className="flex w-full items-center gap-2.5 px-4 py-2.5 text-sm text-rose-700 transition-colors duration-150 hover:bg-sand">

                    <LogOutIcon className="h-4 w-4" /> Sign out
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        <div className="min-w-0 flex-1 p-4 lg:p-6">{children}</div>
      </div>

      <WalkInBookingModal open={walkIn} onClose={() => setWalkIn(false)} />
    </div>
  );
}
