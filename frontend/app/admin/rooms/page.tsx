'use client';

import React, { Suspense, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { BedDoubleIcon, MaximizeIcon, PencilIcon, PlusIcon, SearchIcon, Trash2Icon, UsersIcon } from 'lucide-react';
import { toast } from 'sonner';
import { useHotel } from '../_lib/contexts/HotelDataContext';
import { Modal } from '../_components/ui/Modal';
import { Field, inputClass } from '../_components/ui/Field';
import { RoomStatusBadge } from '../_components/StatusBadge';
import type { Room, RoomStatus } from '../_lib/types/hotel';
import { IMAGES } from '../_lib/data/rooms';
import { moneyShort } from '../_lib/utils/format';

const emptyForm = {
  title: '',
  type: 'Room',
  price: 200,
  capacity: 2,
  bedType: '1 Queen Bed',
  sqm: 34,
  number: '',
  gallery: [IMAGES.standard, IMAGES.hero, IMAGES.river] as [string, string, string],
  description: '',
};

/** Every room shows exactly 3 photos — pads/truncates whatever's on the room to fit the 3 slots. */
const toThreePhotos = (gallery: string[]): [string, string, string] => [
  gallery[0] ?? '',
  gallery[1] ?? '',
  gallery[2] ?? '',
];

const statusFilters: Array<{ key: RoomStatus | 'all'; label: string }> = [
  { key: 'all', label: 'All' },
  { key: 'available', label: 'Available' },
  { key: 'occupied', label: 'Occupied' },
  { key: 'cleaning', label: 'Needs Cleaning' },
  { key: 'maintenance', label: 'Maintenance' },
];

function AdminRoomsInner() {
  const { rooms, addRoom, updateRoom, deleteRoom } = useHotel();
  const params = useSearchParams();
  const [search, setSearch] = useState(params.get('q') ?? '');
  const [statusFilter, setStatusFilter] = useState<RoomStatus | 'all'>('all');
  const [sort, setSort] = useState<'low' | 'high'>('low');
  const [addOpen, setAddOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState<{ [k: string]: string }>({});
  const [editing, setEditing] = useState<Room | null>(null);
  const [editForm, setEditForm] = useState({
    price: 0,
    description: '',
    bedType: '',
    capacity: 2,
    gallery: ['', '', ''] as [string, string, string],
  });
  const [deleting, setDeleting] = useState<Room | null>(null);
  const [saving, setSaving] = useState(false);

  const q = search.trim().toLowerCase();
  const visible = useMemo(
    () =>
      rooms
        .filter((r) => (statusFilter === 'all' ? true : r.status === statusFilter))
        .filter((r) => (q ? `${r.title} ${r.bedType} ${r.number} ${r.type}`.toLowerCase().includes(q) : true))
        .sort((a, b) => (sort === 'low' ? a.price - b.price : b.price - a.price)),
    [rooms, statusFilter, q, sort]
  );

  const metrics = [
    ['Total Rooms', rooms.length, 'text-jungle-dark'],
    ['Occupied', rooms.filter((r) => r.status === 'occupied').length, 'text-emerald-700'],
    ['Available', rooms.filter((r) => r.status === 'available').length, 'text-cyan-700'],
    ['Cleaning Queue', rooms.filter((r) => r.status === 'cleaning').length, 'text-amber-700'],
  ] as const;

  const submitAdd = (e: React.FormEvent) => {
    e.preventDefault();
    const next: { [k: string]: string } = {};
    if (form.title.trim().length < 3) next.title = 'Room title is required.';
    if (!/^\d{3}$/.test(form.number)) next.number = 'Use a 3-digit room number, e.g. 512.';
    if (rooms.some((r) => r.number === form.number)) next.number = 'That room number already exists.';
    if (form.price <= 0) next.price = 'Enter a nightly rate.';
    if (form.capacity < 1) next.capacity = 'At least one guest.';
    if (form.gallery.some((url) => !url.trim())) next.gallery = 'All 3 photo URLs are required.';
    if (form.description.trim().length < 20) next.description = 'Add a description of at least 20 characters.';
    setErrors(next);
    if (Object.keys(next).length) {
      toast.error('Check the highlighted fields.');
      return;
    }
    setSaving(true);
    setTimeout(() => {
      addRoom({
        ...form,
        image: form.gallery[0],
        amenities: ['Free WiFi', 'Air Conditioning'],
        guestName: undefined,
      });
      setSaving(false);
      setAddOpen(false);
      setForm(emptyForm);
      toast.success(`Room ${form.number} added to inventory`);
    }, 650);
  };

  const openEdit = (room: Room) => {
    setEditing(room);
    setEditForm({
      price: room.price,
      description: room.description,
      bedType: room.bedType,
      capacity: room.capacity,
      gallery: toThreePhotos(room.gallery),
    });
  };

  const saveEdit = () => {
    if (!editing) return;
    if (editForm.price <= 0) {
      toast.error('Nightly rate must be above zero.');
      return;
    }
    if (editForm.gallery.some((url) => !url.trim())) {
      toast.error('All 3 photo URLs are required.');
      return;
    }
    updateRoom(editing.id, { ...editForm, image: editForm.gallery[0] });
    toast.success(`Room ${editing.number} updated`);
    setEditing(null);
  };

  return (
    <div className="space-y-5">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold text-jungle-dark">Rooms & suites</h1>
          <p className="mt-1 text-sm text-jungle/60">Inventory, pricing and housekeeping state.</p>
        </div>
        <button
          type="button"
          onClick={() => setAddOpen(true)}
          className="flex items-center gap-1.5 rounded-lg bg-jungle-dark px-3.5 py-2 text-sm font-semibold text-white transition-colors duration-150 hover:bg-jungle">

          <PlusIcon className="h-4 w-4" /> Add New Room
        </button>
      </header>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {metrics.map(([label, value, tone]) => (
          <div key={label} className="rounded-xl border border-sand bg-white px-5 py-4">
            <p className="text-xs font-semibold uppercase tracking-wider text-jungle/60">{label}</p>
            <p className={`mt-2 text-2xl font-semibold ${tone}`}>{value}</p>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap gap-2">
        {statusFilters.map((f) => (
          <button
            key={f.key}
            type="button"
            onClick={() => setStatusFilter(f.key)}
            aria-pressed={statusFilter === f.key}
            className={`rounded-full border px-3.5 py-1.5 text-xs font-semibold transition-colors duration-150 ${
              statusFilter === f.key
                ? 'border-clay bg-clay/12 text-clay'
                : 'border-sand text-jungle/60 hover:border-sage hover:text-jungle'
            }`}>

            {f.label} {f.key !== 'all' && `(${rooms.filter((r) => r.status === f.key).length})`}
          </button>
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-3 rounded-xl border border-sand bg-white px-5 py-4">
        <div className="relative w-full max-w-sm">
          <SearchIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-jungle/45" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search room title or bed type…"
            aria-label="Search rooms"
            className="w-full rounded-lg border border-sand bg-sand-light py-2 pl-9 pr-3 text-sm text-jungle-dark placeholder-jungle/40 outline-none focus:border-sage"
          />

        </div>
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value as 'low' | 'high')}
          aria-label="Sort rooms"
          className="rounded-lg border border-sand bg-sand-light px-3 py-2 text-sm text-jungle-dark outline-none focus:border-sage">

          <option value="low">Price: Low to High</option>
          <option value="high">Price: High to Low</option>
        </select>
        <p className="ml-auto text-xs text-jungle/45" aria-live="polite">
          {visible.length} of {rooms.length} rooms
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {visible.map((room) => (
          <article key={room.id} className="flex flex-col overflow-hidden rounded-xl border border-sand bg-white">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={room.image} alt={room.title} className="h-40 w-full object-cover" />
            <div className="flex flex-1 flex-col p-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs text-jungle/45">No. {room.number} · {room.type}</p>
                  <h2 className="mt-0.5 text-sm font-semibold text-jungle-dark">{room.title}</h2>
                </div>
                <RoomStatusBadge status={room.status} />
              </div>
              <dl className="mt-3 flex flex-wrap gap-x-4 gap-y-1.5 text-[11px] text-jungle/60">
                <div className="flex items-center gap-1.5"><BedDoubleIcon className="h-3.5 w-3.5" /><dd>{room.bedType}</dd></div>
                <div className="flex items-center gap-1.5"><UsersIcon className="h-3.5 w-3.5" /><dd>Sleeps {room.capacity}</dd></div>
                <div className="flex items-center gap-1.5"><MaximizeIcon className="h-3.5 w-3.5" /><dd>{room.sqm} m²</dd></div>
              </dl>
              <p className="mt-3 line-clamp-2 text-xs leading-relaxed text-jungle/60">{room.description}</p>
              <div className="mt-auto flex items-center justify-between gap-3 border-t border-sand pt-4">
                <p className="text-sm font-semibold text-jungle-dark">
                  {moneyShort(room.price)}
                  <span className="text-xs font-normal text-jungle/45"> / night</span>
                </p>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => openEdit(room)}
                    className="flex items-center gap-1.5 rounded-md border border-sand px-2.5 py-1.5 text-[11px] font-semibold text-jungle transition-colors duration-150 hover:bg-sand">

                    <PencilIcon className="h-3.5 w-3.5" /> Edit Details & Pricing
                  </button>
                  <button
                    type="button"
                    onClick={() => setDeleting(room)}
                    aria-label={`Delete room ${room.number}`}
                    className="rounded-md border border-sand p-1.5 text-rose-700 transition-colors duration-150 hover:bg-rose-500/10">

                    <Trash2Icon className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            </div>
          </article>
        ))}
        {visible.length === 0 && (
          <p className="col-span-full rounded-xl border border-dashed border-sand py-16 text-center text-sm text-jungle/45">
            No rooms match that search.
          </p>
        )}
      </div>

      {/* Add room */}
      <Modal
        open={addOpen}
        onClose={() => setAddOpen(false)}
        title="Add new room"
        description="Creates an available room in live inventory."
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
              form="add-room"
              disabled={saving}
              className="flex items-center gap-2 rounded-lg bg-jungle-dark px-4 py-2 text-sm font-semibold text-white transition-colors duration-150 hover:bg-jungle disabled:opacity-70">

              {saving && <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/40 border-t-white" />}
              Add room
            </button>
          </>
        }>

        <form id="add-room" onSubmit={submitAdd} className="grid gap-4 sm:grid-cols-2">
          <Field label="Room title" error={errors.title} htmlFor="r-title" className="sm:col-span-2">
            <input id="r-title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className={inputClass('dark', !!errors.title)} />
          </Field>
          <Field label="Room number" error={errors.number} htmlFor="r-number">
            <input id="r-number" value={form.number} onChange={(e) => setForm({ ...form, number: e.target.value })} placeholder="512" className={inputClass('dark', !!errors.number)} />
          </Field>
          <Field label="Room type" htmlFor="r-type">
            <select id="r-type" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} className={inputClass()}>
              {['Room', 'Suite', 'Villa', 'Loft', 'Cabana'].map((t) => (
                <option key={t}>{t}</option>
              ))}
            </select>
          </Field>
          <Field label="Price / night (USD)" error={errors.price} htmlFor="r-price">
            <input id="r-price" type="number" min={1} value={form.price} onChange={(e) => setForm({ ...form, price: Number(e.target.value) })} className={inputClass('dark', !!errors.price)} />
          </Field>
          <Field label="Max occupancy" error={errors.capacity} htmlFor="r-cap">
            <input id="r-cap" type="number" min={1} max={8} value={form.capacity} onChange={(e) => setForm({ ...form, capacity: Number(e.target.value) })} className={inputClass('dark', !!errors.capacity)} />
          </Field>
          <Field label="Bed type" htmlFor="r-bed">
            <select id="r-bed" value={form.bedType} onChange={(e) => setForm({ ...form, bedType: e.target.value })} className={inputClass()}>
              {['1 King Bed', '1 Queen Bed', '2 Twin Beds', '1 King Bed + Daybed'].map((b) => (
                <option key={b}>{b}</option>
              ))}
            </select>
          </Field>
          <Field label="Size (m²)" htmlFor="r-sqm">
            <input id="r-sqm" type="number" min={10} value={form.sqm} onChange={(e) => setForm({ ...form, sqm: Number(e.target.value) })} className={inputClass()} />
          </Field>
          <Field label="Photo 1 URL (cover)" error={errors.gallery} htmlFor="r-img-1" className="sm:col-span-2">
            <input
              id="r-img-1"
              value={form.gallery[0]}
              onChange={(e) => setForm({ ...form, gallery: [e.target.value, form.gallery[1], form.gallery[2]] })}
              className={inputClass('dark', !!errors.gallery)}
            />
          </Field>
          <Field label="Photo 2 URL" htmlFor="r-img-2">
            <input
              id="r-img-2"
              value={form.gallery[1]}
              onChange={(e) => setForm({ ...form, gallery: [form.gallery[0], e.target.value, form.gallery[2]] })}
              className={inputClass()}
            />
          </Field>
          <Field label="Photo 3 URL" htmlFor="r-img-3">
            <input
              id="r-img-3"
              value={form.gallery[2]}
              onChange={(e) => setForm({ ...form, gallery: [form.gallery[0], form.gallery[1], e.target.value] })}
              className={inputClass()}
            />
          </Field>
          <Field label="Description" error={errors.description} htmlFor="r-desc" className="sm:col-span-2">
            <textarea
              id="r-desc"
              rows={3}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className={`${inputClass('dark', !!errors.description)} resize-none`}
            />

          </Field>
        </form>
      </Modal>

      {/* Edit popup */}
      <Modal
        open={!!editing}
        onClose={() => setEditing(null)}
        title={editing ? `Edit ${editing.title}` : 'Edit room'}
        description={editing ? `Room No. ${editing.number}` : undefined}
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

              Save changes
            </button>
          </>
        }>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Price / night (USD)" htmlFor="e-price">
            <input id="e-price" type="number" min={1} value={editForm.price} onChange={(e) => setEditForm({ ...editForm, price: Number(e.target.value) })} className={inputClass()} />
          </Field>
          <Field label="Max occupancy" htmlFor="e-cap">
            <input id="e-cap" type="number" min={1} max={8} value={editForm.capacity} onChange={(e) => setEditForm({ ...editForm, capacity: Number(e.target.value) })} className={inputClass()} />
          </Field>
          <Field label="Bed type" htmlFor="e-bed" className="sm:col-span-2">
            <select id="e-bed" value={editForm.bedType} onChange={(e) => setEditForm({ ...editForm, bedType: e.target.value })} className={inputClass()}>
              {['1 King Bed', '1 Queen Bed', '2 Twin Beds', '1 King Bed + Daybed'].map((b) => (
                <option key={b}>{b}</option>
              ))}
            </select>
          </Field>
          <Field label="Photo 1 URL (cover)" htmlFor="e-img-1" className="sm:col-span-2">
            <div className="flex items-center gap-3">
              {editForm.gallery[0] && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={editForm.gallery[0]} alt="" className="h-11 w-14 shrink-0 rounded-md object-cover" />
              )}
              <input
                id="e-img-1"
                value={editForm.gallery[0]}
                onChange={(e) => setEditForm({ ...editForm, gallery: [e.target.value, editForm.gallery[1], editForm.gallery[2]] })}
                className={inputClass()}
              />
            </div>
          </Field>
          <Field label="Photo 2 URL" htmlFor="e-img-2">
            <div className="flex items-center gap-3">
              {editForm.gallery[1] && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={editForm.gallery[1]} alt="" className="h-11 w-14 shrink-0 rounded-md object-cover" />
              )}
              <input
                id="e-img-2"
                value={editForm.gallery[1]}
                onChange={(e) => setEditForm({ ...editForm, gallery: [editForm.gallery[0], e.target.value, editForm.gallery[2]] })}
                className={inputClass()}
              />
            </div>
          </Field>
          <Field label="Photo 3 URL" htmlFor="e-img-3">
            <div className="flex items-center gap-3">
              {editForm.gallery[2] && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={editForm.gallery[2]} alt="" className="h-11 w-14 shrink-0 rounded-md object-cover" />
              )}
              <input
                id="e-img-3"
                value={editForm.gallery[2]}
                onChange={(e) => setEditForm({ ...editForm, gallery: [editForm.gallery[0], editForm.gallery[1], e.target.value] })}
                className={inputClass()}
              />
            </div>
          </Field>
          <Field label="Description" htmlFor="e-desc" className="sm:col-span-2">
            <textarea
              id="e-desc"
              rows={5}
              value={editForm.description}
              onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
              className={`${inputClass()} resize-none`}
            />

          </Field>
        </div>
      </Modal>

      {/* Delete confirm */}
      <Modal
        open={!!deleting}
        onClose={() => setDeleting(null)}
        width="max-w-md"
        title="Delete room"
        description="This removes the room from live inventory immediately."
        footer={
          <>
            <button
              type="button"
              onClick={() => setDeleting(null)}
              className="rounded-lg border border-sand px-4 py-2 text-sm font-semibold text-jungle transition-colors duration-150 hover:bg-sand">

              Keep room
            </button>
            <button
              type="button"
              onClick={() => {
                if (deleting) {
                  deleteRoom(deleting.id);
                  toast.success(`Room ${deleting.number} removed from inventory`);
                }
                setDeleting(null);
              }}
              className="rounded-lg bg-rose-500 px-4 py-2 text-sm font-semibold text-white transition-colors duration-150 hover:bg-rose-600">

              Delete room
            </button>
          </>
        }>

        <p className="text-sm text-jungle">
          Delete <span className="font-semibold text-jungle-dark">{deleting?.title}</span> (No. {deleting?.number})? Existing
          reservations on this room will need to be reassigned by hand.
        </p>
      </Modal>
    </div>
  );
}

export default function AdminRooms() {
  return (
    <Suspense fallback={null}>
      <AdminRoomsInner />
    </Suspense>
  );
}
