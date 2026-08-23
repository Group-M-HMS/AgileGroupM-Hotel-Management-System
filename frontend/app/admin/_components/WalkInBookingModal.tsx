'use client';

import React, { useState } from 'react';
import { toast } from 'sonner';
import { Modal } from './ui/Modal';
import { Field, inputClass } from './ui/Field';
import { defaultStay, useHotel } from '../_lib/contexts/HotelDataContext';
import { isValidEmail, money, nightsBetween, TAX_RATE } from '../_lib/utils/format';

export function WalkInBookingModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { rooms, createBooking } = useHotel();
  const stay = defaultStay();
  const available = rooms.filter((r) => r.status === 'available');
  const [form, setForm] = useState({
    guestName: '',
    guestEmail: '',
    guestPhone: '',
    roomId: available[0]?.id ?? '',
    checkIn: stay.checkIn,
    checkOut: stay.checkOut,
    guests: 2,
    specialRequests: '',
  });
  const [errors, setErrors] = useState<{ [k: string]: string }>({});
  const [saving, setSaving] = useState(false);

  const room = rooms.find((r) => r.id === form.roomId);
  const nights = Math.max(1, nightsBetween(form.checkIn, form.checkOut));
  const total = room ? room.price * nights * (1 + TAX_RATE) : 0;

  const set = (patch: Partial<typeof form>) => setForm((f) => ({ ...f, ...patch }));

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const next: { [k: string]: string } = {};
    if (form.guestName.trim().length < 3) next.guestName = 'Guest name is required.';
    if (!isValidEmail(form.guestEmail)) next.guestEmail = 'A valid email is required.';
    if (!form.roomId) next.roomId = 'Select an available room.';
    if (nightsBetween(form.checkIn, form.checkOut) < 1) next.checkOut = 'Must be at least one night.';
    if (room && form.guests > room.capacity) next.guests = `This room sleeps ${room.capacity}.`;
    setErrors(next);
    if (Object.keys(next).length) {
      toast.error('Check the highlighted fields.');
      return;
    }
    setSaving(true);
    setTimeout(() => {
      const booking = createBooking({
        ...form,
        guestPhone: form.guestPhone || '—',
        source: 'Walk-in',
        paid: false,
        amount: Math.round(total),
      });
      setSaving(false);
      onClose();
      setForm({ ...form, guestName: '', guestEmail: '', guestPhone: '', specialRequests: '' });
      toast.success(`Walk-in booked — ${booking.ref} on room ${booking.roomNumber}`);
    }, 700);
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="New walk-in booking"
      description="Register a reservation taken at the front desk."
      footer={
        <>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-sand px-4 py-2 text-sm font-semibold text-jungle transition-colors duration-150 hover:bg-sand">

            Cancel
          </button>
          <button
            type="submit"
            form="walkin-form"
            disabled={saving}
            className="flex items-center gap-2 rounded-lg bg-jungle-dark px-4 py-2 text-sm font-semibold text-white transition-colors duration-150 hover:bg-jungle disabled:opacity-70">

            {saving && <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/40 border-t-white" />}
            Create booking
          </button>
        </>
      }>

      <form id="walkin-form" onSubmit={submit} className="grid gap-4 sm:grid-cols-2">
        <Field label="Guest name" error={errors.guestName} htmlFor="w-name">
          <input id="w-name" value={form.guestName} onChange={(e) => set({ guestName: e.target.value })} className={inputClass('dark', !!errors.guestName)} />
        </Field>
        <Field label="Guest email" error={errors.guestEmail} htmlFor="w-email">
          <input id="w-email" value={form.guestEmail} onChange={(e) => set({ guestEmail: e.target.value })} className={inputClass('dark', !!errors.guestEmail)} />
        </Field>
        <Field label="Phone" htmlFor="w-phone">
          <input id="w-phone" value={form.guestPhone} onChange={(e) => set({ guestPhone: e.target.value })} className={inputClass()} />
        </Field>
        <Field label="Room" error={errors.roomId} htmlFor="w-room">
          <select id="w-room" value={form.roomId} onChange={(e) => set({ roomId: e.target.value })} className={inputClass('dark', !!errors.roomId)}>
            {available.length === 0 && <option value="">No rooms available</option>}
            {available.map((r) => (
              <option key={r.id} value={r.id}>
                {r.number} · {r.title} · ${r.price}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Check-in" htmlFor="w-in">
          <input id="w-in" type="date" value={form.checkIn} onChange={(e) => set({ checkIn: e.target.value })} className={inputClass()} />
        </Field>
        <Field label="Check-out" error={errors.checkOut} htmlFor="w-out">
          <input id="w-out" type="date" min={form.checkIn} value={form.checkOut} onChange={(e) => set({ checkOut: e.target.value })} className={inputClass('dark', !!errors.checkOut)} />
        </Field>
        <Field label="Guest count" error={errors.guests} htmlFor="w-guests">
          <input
            id="w-guests"
            type="number"
            min={1}
            max={8}
            value={form.guests}
            onChange={(e) => set({ guests: Number(e.target.value) })}
            className={inputClass('dark', !!errors.guests)}
          />

        </Field>
        <Field label="Estimated total" htmlFor="w-total">
          <input id="w-total" readOnly value={money(total)} className={`${inputClass()} !text-jungle/60`} />
        </Field>
        <Field label="Special requests" className="sm:col-span-2" htmlFor="w-req">
          <textarea
            id="w-req"
            rows={3}
            value={form.specialRequests}
            onChange={(e) => set({ specialRequests: e.target.value })}
            className={`${inputClass()} resize-none`}
          />

        </Field>
      </form>
    </Modal>
  );
}
