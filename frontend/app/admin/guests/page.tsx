'use client';

import React, { Suspense, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { format } from 'date-fns';
import { HistoryIcon, PencilIcon, PlusIcon, SearchIcon, Trash2Icon } from 'lucide-react';
import { toast } from 'sonner';
import { useHotel } from '../_lib/contexts/HotelDataContext';
import { Modal } from '../_components/ui/Modal';
import { Field, inputClass } from '../_components/ui/Field';
import { BookingStatusBadge } from '../_components/StatusBadge';
import type { Guest } from '../_lib/types/hotel';
import { isValidEmail, money, prettyDate } from '../_lib/utils/format';

/** Splits a stored "First Last" name into edit-form fields. Extra middle words stay with the last name. */
const splitName = (name: string) => {
  const [first = '', ...rest] = name.trim().split(/\s+/);
  return { firstName: first, lastName: rest.join(' ') };
};

function AdminGuestsInner() {
  const { guests, bookings, addGuest, updateGuest, deleteGuest } = useHotel();
  const params = useSearchParams();
  const [search, setSearch] = useState(params.get('q') ?? '');
  const [limit, setLimit] = useState(12);
  const [addOpen, setAddOpen] = useState(false);
  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', phone: '' });
  const [errors, setErrors] = useState<{ [k: string]: string }>({});
  const [editing, setEditing] = useState<Guest | null>(null);
  const [editForm, setEditForm] = useState({ firstName: '', lastName: '', email: '', phone: '' });
  const [history, setHistory] = useState<Guest | null>(null);
  const [deleting, setDeleting] = useState<Guest | null>(null);

  const q = search.trim().toLowerCase();
  const filtered = useMemo(
    () => guests.filter((g) => (q ? `${g.name} ${g.email} ${g.phone}`.toLowerCase().includes(q) : true)),
    [guests, q]
  );
  const rows = filtered.slice(0, limit);

  const thisMonth = format(new Date(), 'MMM yyyy');
  const repeat = guests.filter((g) => g.stays > 1).length;
  const newThisMonth = guests.filter((g) => g.joined === thisMonth).length;

  const historyBookings = history
    ? bookings.filter((b) => b.guestId === history.id || b.guestEmail.toLowerCase() === history.email.toLowerCase())
    : [];

  const submitAdd = (e: React.FormEvent) => {
    e.preventDefault();
    const next: { [k: string]: string } = {};
    if (form.firstName.trim().length < 2) next.firstName = 'First name is required.';
    if (form.lastName.trim().length < 2) next.lastName = 'Last name is required.';
    if (!isValidEmail(form.email)) next.email = 'Enter a valid email.';
    if (form.phone.replace(/\D/g, '').length < 8) next.phone = 'Enter a reachable phone number.';
    if (guests.some((g) => g.email.toLowerCase() === form.email.trim().toLowerCase()))
      next.email = 'A guest profile with this email already exists.';
    setErrors(next);
    if (Object.keys(next).length) {
      toast.error('Check the highlighted fields.');
      return;
    }
    addGuest({
      name: `${form.firstName.trim()} ${form.lastName.trim()}`,
      email: form.email.trim(),
      phone: form.phone.trim(),
    });
    setAddOpen(false);
    setForm({ firstName: '', lastName: '', email: '', phone: '' });
    toast.success('Guest profile created');
  };

  const saveEdit = () => {
    if (!editing) return;
    if (editForm.firstName.trim().length < 2) {
      toast.error('First name is required.');
      return;
    }
    if (editForm.lastName.trim().length < 2) {
      toast.error('Last name is required.');
      return;
    }
    if (!isValidEmail(editForm.email)) {
      toast.error('Enter a valid email address.');
      return;
    }
    updateGuest(editing.id, {
      name: `${editForm.firstName.trim()} ${editForm.lastName.trim()}`,
      email: editForm.email,
      phone: editForm.phone,
    });
    toast.success(`${editing.name}’s contact details updated`);
    setEditing(null);
  };

  return (
    <div className="space-y-5">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold text-jungle-dark">Guests & profiles</h1>
          <p className="mt-1 text-sm text-jungle/60">The full guest directory, including walk-in registrations.</p>
        </div>
        <button
          type="button"
          onClick={() => setAddOpen(true)}
          className="flex items-center gap-1.5 rounded-lg bg-jungle-dark px-3.5 py-2 text-sm font-semibold text-white transition-colors duration-150 hover:bg-jungle">

          <PlusIcon className="h-4 w-4" /> Add New Guest
        </button>
      </header>

      <div className="grid gap-4 sm:grid-cols-3">
        {[
          ['Total Registered Guests', guests.length, 'text-jungle-dark'],
          ['Repeat Customers', repeat, 'text-emerald-700'],
          ['New This Month', newThisMonth, 'text-cyan-700'],
        ].map(([label, value, tone]) => (
          <div key={label as string} className="rounded-xl border border-sand bg-white px-5 py-4">
            <p className="text-xs font-semibold uppercase tracking-wider text-jungle/60">{label}</p>
            <p className={`mt-2 text-2xl font-semibold ${tone}`}>{value}</p>
          </div>
        ))}
      </div>

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
              placeholder="Search name, email or phone…"
              aria-label="Search guests"
              className="w-full rounded-lg border border-sand bg-sand-light py-2 pl-9 pr-3 text-sm text-jungle-dark placeholder-jungle/40 outline-none focus:border-sage"
            />

          </div>
          <p className="ml-auto text-xs text-jungle/45" aria-live="polite">
            {filtered.length} matching profiles
          </p>
        </header>

        <div className="overflow-x-auto thin-scroll">
          <table className="w-full min-w-[820px] text-left text-sm">
            <thead>
              <tr className="border-b border-sand text-[11px] uppercase tracking-wider text-jungle/45">
                <th scope="col" className="px-5 py-3 font-semibold">Guest</th>
                <th scope="col" className="px-5 py-3 font-semibold">Email</th>
                <th scope="col" className="px-5 py-3 font-semibold">Phone</th>
                <th scope="col" className="px-5 py-3 font-semibold">Stays</th>
                <th scope="col" className="px-5 py-3 text-right font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((g) => (
                <tr key={g.id} className="border-b border-sand/60 transition-colors duration-150 hover:bg-sand-light/50">
                  <td className="px-5 py-3">
                    <p className="font-medium text-jungle-dark">{g.name}</p>
                    <p className="text-xs text-jungle/45">{g.country} · since {g.joined}</p>
                  </td>
                  <td className="px-5 py-3 text-jungle">{g.email}</td>
                  <td className="px-5 py-3 text-jungle">{g.phone}</td>
                  <td className="px-5 py-3">
                    <span
                      className={`rounded-full border px-2 py-0.5 text-[11px] font-semibold ${
                        g.stays > 1
                          ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-700'
                          : 'border-sand text-jungle'
                      }`}>

                      {g.stays} {g.stays === 1 ? 'stay' : 'stays'}
                    </span>
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setEditing(g);
                          setEditForm({ ...splitName(g.name), email: g.email, phone: g.phone });
                        }}
                        className="flex items-center gap-1.5 rounded-md border border-sand px-2.5 py-1.5 text-[11px] font-semibold text-jungle transition-colors duration-150 hover:bg-sand">

                        <PencilIcon className="h-3.5 w-3.5" /> Edit Contact
                      </button>
                      <button
                        type="button"
                        onClick={() => setHistory(g)}
                        className="flex items-center gap-1.5 rounded-md border border-sand px-2.5 py-1.5 text-[11px] font-semibold text-jungle transition-colors duration-150 hover:bg-sand">

                        <HistoryIcon className="h-3.5 w-3.5" /> View Stay History
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeleting(g)}
                        aria-label={`Delete ${g.name}`}
                        className="rounded-md border border-sand p-1.5 text-rose-700 transition-colors duration-150 hover:bg-rose-500/10">

                        <Trash2Icon className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {rows.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-5 py-12 text-center text-sm text-jungle/45">
                    No guest profiles match that search.
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

              Load more profiles
            </button>
          </footer>
        )}
      </section>

      {/* Add guest */}
      <Modal
        open={addOpen}
        onClose={() => setAddOpen(false)}
        width="max-w-md"
        title="Add new guest"
        description="Register a walk-in guest profile."
        footer={
          <>
            <button
              type="button"
              onClick={() => setAddOpen(false)}
              className="rounded-lg border border-sand px-4 py-2 text-sm font-semibold text-jungle transition-colors duration-150 hover:bg-sand">

              Cancel
            </button>
            <button
              type="submit"
              form="add-guest"
              className="rounded-lg bg-jungle-dark px-4 py-2 text-sm font-semibold text-white transition-colors duration-150 hover:bg-jungle">

              Create profile
            </button>
          </>
        }>

        <form id="add-guest" onSubmit={submitAdd} className="grid gap-4 sm:grid-cols-2">
          <Field label="First name" error={errors.firstName} htmlFor="g-first">
            <input id="g-first" value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })} className={inputClass('dark', !!errors.firstName)} />
          </Field>
          <Field label="Last name" error={errors.lastName} htmlFor="g-last">
            <input id="g-last" value={form.lastName} onChange={(e) => setForm({ ...form, lastName: e.target.value })} className={inputClass('dark', !!errors.lastName)} />
          </Field>
          <Field label="Email" error={errors.email} htmlFor="g-mail" className="sm:col-span-2">
            <input id="g-mail" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className={inputClass('dark', !!errors.email)} />
          </Field>
          <Field label="Phone" error={errors.phone} htmlFor="g-phone">
            <input id="g-phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className={inputClass('dark', !!errors.phone)} />
          </Field>
        </form>
      </Modal>

      {/* Edit contact */}
      <Modal
        open={!!editing}
        onClose={() => setEditing(null)}
        width="max-w-md"
        title={`Edit contact — ${editing?.name ?? ''}`}
        footer={
          <>
            <button
              type="button"
              onClick={() => setEditing(null)}
              className="rounded-lg border border-sand px-4 py-2 text-sm font-semibold text-jungle transition-colors duration-150 hover:bg-sand">

              Cancel
            </button>
            <button
              type="button"
              onClick={saveEdit}
              className="rounded-lg bg-jungle-dark px-4 py-2 text-sm font-semibold text-white transition-colors duration-150 hover:bg-jungle">

              Save contact
            </button>
          </>
        }>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="First name" htmlFor="ec-first">
            <input id="ec-first" value={editForm.firstName} onChange={(e) => setEditForm({ ...editForm, firstName: e.target.value })} className={inputClass()} />
          </Field>
          <Field label="Last name" htmlFor="ec-last">
            <input id="ec-last" value={editForm.lastName} onChange={(e) => setEditForm({ ...editForm, lastName: e.target.value })} className={inputClass()} />
          </Field>
          <Field label="Email" htmlFor="ec-mail" className="sm:col-span-2">
            <input id="ec-mail" value={editForm.email} onChange={(e) => setEditForm({ ...editForm, email: e.target.value })} className={inputClass()} />
          </Field>
          <Field label="Phone" htmlFor="ec-phone" className="sm:col-span-2">
            <input id="ec-phone" value={editForm.phone} onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })} className={inputClass()} />
          </Field>
        </div>
      </Modal>

      {/* Stay history */}
      <Modal
        open={!!history}
        onClose={() => setHistory(null)}
        width="max-w-lg"
        title={history ? `${history.name}’s stay history` : 'Stay history'}
        description={history ? `${history.email} · ${history.phone}` : undefined}>

        {historyBookings.length === 0 ? (
          <p className="rounded-lg border border-dashed border-sand py-12 text-center text-sm text-jungle/45">
            No reservations recorded for this profile yet.
          </p>
        ) : (
          <ul className="space-y-3">
            {historyBookings.map((b) => (
              <li key={b.id} className="rounded-lg border border-sand bg-sand-light p-4">
                <div className="flex items-center justify-between gap-3">
                  <p className="font-mono text-xs text-clay">{b.ref}</p>
                  <BookingStatusBadge status={b.status} />
                </div>
                <p className="mt-2 text-sm font-medium text-jungle-dark">{b.roomTitle} · No. {b.roomNumber}</p>
                <p className="mt-1 text-xs text-jungle/60">
                  {prettyDate(b.checkIn)} → {prettyDate(b.checkOut)} · {b.guests} guests · {money(b.amount)}
                </p>
              </li>
            ))}
          </ul>
        )}
      </Modal>

      {/* Delete */}
      <Modal
        open={!!deleting}
        onClose={() => setDeleting(null)}
        width="max-w-md"
        title="Delete guest profile"
        description="Reservation history stays in the ledger, but the profile record is removed."
        footer={
          <>
            <button
              type="button"
              onClick={() => setDeleting(null)}
              className="rounded-lg border border-sand px-4 py-2 text-sm font-semibold text-jungle transition-colors duration-150 hover:bg-sand">

              Keep profile
            </button>
            <button
              type="button"
              onClick={() => {
                if (deleting) {
                  deleteGuest(deleting.id);
                  toast.success(`${deleting.name}’s profile deleted`);
                }
                setDeleting(null);
              }}
              className="rounded-lg bg-rose-500 px-4 py-2 text-sm font-semibold text-white transition-colors duration-150 hover:bg-rose-600">

              Delete profile
            </button>
          </>
        }>

        <p className="text-sm text-jungle">
          Remove <span className="font-semibold text-jungle-dark">{deleting?.name}</span> from the guest directory?
        </p>
      </Modal>
    </div>
  );
}

export default function AdminGuests() {
  return (
    <Suspense fallback={null}>
      <AdminGuestsInner />
    </Suspense>
  );
}
