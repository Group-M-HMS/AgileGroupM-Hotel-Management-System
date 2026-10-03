'use client';

import React, { Suspense, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { BedDoubleIcon, ChevronDownIcon, MaximizeIcon, PencilIcon, PlusIcon, SearchIcon, Trash2Icon, UsersIcon } from 'lucide-react';
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
  type: '',
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
  const { rooms, addRoom, updateRoom, updateRoomType, deleteRoom } = useHotel();
  const params = useSearchParams();
  const [search, setSearch] = useState(params.get('q') ?? '');
  const [statusFilter, setStatusFilter] = useState<RoomStatus | 'all'>('all');
  const [sort, setSort] = useState<'low' | 'high'>('low');
  const [addOpen, setAddOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState<{ [k: string]: string }>({});
  const [editing, setEditing] = useState<Room | null>(null);
  const [editNumber, setEditNumber] = useState('');
  const [newTypeName, setNewTypeName] = useState('');
  const [editingType, setEditingType] = useState<{ type: string; count: number } | null>(null);
  const [typeForm, setTypeForm] = useState({
    title: '',
    price: 0,
    description: '',
    bedType: '',
    capacity: 2,
    sqm: 30,
    amenities: '',
    gallery: ['', '', ''] as [string, string, string],
  });
  const [deleting, setDeleting] = useState<Room | null>(null);
  const [saving, setSaving] = useState(false);
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  const toggleExpanded = (title: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(title)) next.delete(title);
      else next.add(title);
      return next;
    });
  };

  const q = search.trim().toLowerCase();
  const visible = useMemo(
    () =>
      rooms
        .filter((r) => (statusFilter === 'all' ? true : r.status === statusFilter))
        .filter((r) => (q ? `${r.title} ${r.bedType} ${r.number} ${r.type}`.toLowerCase().includes(q) : true))
        .sort((a, b) => (sort === 'low' ? a.price - b.price : b.price - a.price)),
    [rooms, statusFilter, q, sort]
  );

  /** Groups by room type (same rule as the backend: case-insensitive type, falling back to title)
   * so the page shows one summary card per type, with its numbered rooms behind an expand toggle. */
  const groupedVisible = useMemo(() => {
    const groups = new Map<string, Room[]>();
    for (const room of visible) {
      const key = (room.type || room.title).trim().toLowerCase();
      const group = groups.get(key);
      if (group) group.push(room);
      else groups.set(key, [room]);
    }
    return Array.from(groups.entries()).map(([key, roomsInGroup]) => {
      const statusCounts = roomsInGroup.reduce<Record<RoomStatus, number>>(
        (acc, r) => ({ ...acc, [r.status]: (acc[r.status] ?? 0) + 1 }),
        { available: 0, occupied: 0, cleaning: 0, maintenance: 0 }
      );
      const representative = roomsInGroup.reduce((a, b) => (b.price < a.price ? b : a));
      return { key, title: representative.title, rooms: roomsInGroup, representative, statusCounts };
    });
  }, [visible]);

  const metrics = [
    ['Total Rooms', rooms.length, 'text-jungle-dark'],
    ['Occupied', rooms.filter((r) => r.status === 'occupied').length, 'text-emerald-700'],
    ['Available', rooms.filter((r) => r.status === 'available').length, 'text-cyan-700'],
    ['Cleaning Queue', rooms.filter((r) => r.status === 'cleaning').length, 'text-amber-700'],
  ] as const;

  const NEW_TYPE = '__new__';
  const typeOptions = useMemo(() => Array.from(new Set(rooms.map((r) => r.type).filter(Boolean))), [rooms]);
  // Existing type by default; "new type" is the only case that needs the full type-level form.
  const selectedType = form.type || typeOptions[0] || NEW_TYPE;
  const isNewType = selectedType === NEW_TYPE;
  const typeRep = isNewType
    ? undefined
    : rooms
        .filter((r) => r.type === selectedType)
        .reduce<Room | undefined>((best, r) => (!best || r.price < best.price ? r : best), undefined);

  const submitAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    const next: { [k: string]: string } = {};
    if (!/^\d{3}$/.test(form.number)) next.number = 'Use a 3-digit room number, e.g. 512.';
    if (rooms.some((r) => r.number === form.number)) next.number = 'That room number already exists.';
    if (isNewType) {
      const name = newTypeName.trim();
      if (name.length < 3) next.newType = 'Enter a name for the new room type.';
      else if (typeOptions.some((t) => t.toLowerCase() === name.toLowerCase())) next.newType = 'That room type already exists — pick it from the list.';
      if (form.title.trim().length < 3) next.title = 'Room title is required.';
      if (form.price <= 0) next.price = 'Enter a nightly rate.';
      if (form.capacity < 1) next.capacity = 'At least one guest.';
      if (form.gallery.some((url) => !url.trim())) next.gallery = 'All 3 photo URLs are required.';
      if (form.description.trim().length < 20) next.description = 'Add a description of at least 20 characters.';
    }
    setErrors(next);
    if (Object.keys(next).length) {
      toast.error('Check the highlighted fields.');
      return;
    }
    setSaving(true);
    try {
      // An existing type copies its shared details, so the new room matches its siblings exactly.
      const base = isNewType || !typeRep
        ? { ...form, type: newTypeName.trim(), amenities: ['Free WiFi', 'Air Conditioning'] }
        : {
            title: typeRep.title,
            type: typeRep.type,
            price: typeRep.price,
            capacity: typeRep.capacity,
            bedType: typeRep.bedType,
            sqm: typeRep.sqm,
            number: form.number,
            gallery: typeRep.gallery,
            description: typeRep.description,
            amenities: typeRep.amenities,
          };
      await addRoom({ ...base, number: form.number, image: base.gallery[0], guestName: undefined });
      setAddOpen(false);
      setForm(emptyForm);
      setNewTypeName('');
      toast.success(`Room ${form.number} added to inventory`);
    } catch {
      toast.error('Could not add the room. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const openEdit = (room: Room) => {
    setEditing(room);
    setEditNumber(room.number);
  };

  /** Single-room edit: only unit-level data (room number). Everything else is type-level. */
  const saveEdit = async () => {
    if (!editing) return;
    if (!/^\d{3}$/.test(editNumber)) {
      toast.error('Use a 3-digit room number, e.g. 512.');
      return;
    }
    if (rooms.some((r) => r.number === editNumber && r.id !== editing.id)) {
      toast.error('That room number already exists.');
      return;
    }
    try {
      await updateRoom(editing.id, { number: editNumber });
      toast.success(`Room ${editNumber} updated`);
      setEditing(null);
    } catch {
      toast.error('Could not save changes. Please try again.');
    }
  };

  const openEditType = (rep: Room, count: number) => {
    setEditingType({ type: rep.type || rep.title, count });
    setTypeForm({
      title: rep.title,
      price: rep.price,
      description: rep.description,
      bedType: rep.bedType,
      capacity: rep.capacity,
      sqm: rep.sqm,
      amenities: rep.amenities.join(', '),
      gallery: toThreePhotos(rep.gallery),
    });
  };

  const saveEditType = async () => {
    if (!editingType) return;
    if (typeForm.title.trim().length < 3) return void toast.error('Room type title is required.');
    if (typeForm.price <= 0) return void toast.error('Nightly rate must be above zero.');
    if (typeForm.capacity < 1) return void toast.error('At least one guest.');
    if (typeForm.gallery.some((url) => !url.trim())) return void toast.error('All 3 photo URLs are required.');
    setSaving(true);
    try {
      await updateRoomType(editingType.type, {
        title: typeForm.title,
        price: typeForm.price,
        description: typeForm.description,
        bedType: typeForm.bedType,
        capacity: typeForm.capacity,
        sqm: typeForm.sqm,
        gallery: typeForm.gallery,
        amenities: typeForm.amenities.split(',').map((a) => a.trim()).filter(Boolean),
      });
      toast.success(`${typeForm.title} updated across ${editingType.count} ${editingType.count === 1 ? 'room' : 'rooms'}`);
      setEditingType(null);
    } catch {
      toast.error('Could not save the room type. Please try again.');
    } finally {
      setSaving(false);
    }
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

      <div className="space-y-4">
        {groupedVisible.map(({ key, title, rooms: roomsInGroup, representative, statusCounts }) => {
          const isOpen = expanded.has(key);
          return (
            <div key={key} className="overflow-hidden rounded-xl border border-sand bg-white">
              <div className="flex items-center gap-2 pr-4 transition-colors duration-150 hover:bg-sand-light/50">
              <button
                type="button"
                onClick={() => toggleExpanded(key)}
                aria-expanded={isOpen}
                className="flex min-w-0 flex-1 items-center gap-4 p-4 text-left">

                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={representative.image} alt={title} className="h-16 w-20 shrink-0 rounded-lg object-cover" />
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-sm font-semibold text-jungle-dark">{title}</h2>
                    <span className="rounded-full border border-sand bg-sand-light px-2 py-0.5 text-[11px] font-semibold text-jungle/60">
                      {roomsInGroup.length} {roomsInGroup.length === 1 ? 'room' : 'rooms'}
                    </span>
                  </div>
                  <dl className="mt-1.5 flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-jungle/60">
                    <div className="flex items-center gap-1.5"><BedDoubleIcon className="h-3.5 w-3.5" /><dd>{representative.bedType}</dd></div>
                    <div className="flex items-center gap-1.5"><UsersIcon className="h-3.5 w-3.5" /><dd>Sleeps {representative.capacity}</dd></div>
                    <div className="flex items-center gap-1.5"><MaximizeIcon className="h-3.5 w-3.5" /><dd>{representative.sqm} m²</dd></div>
                  </dl>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {(Object.entries(statusCounts) as Array<[RoomStatus, number]>)
                      .filter(([, count]) => count > 0)
                      .map(([roomStatus, count]) => (
                        <span key={roomStatus} className="flex items-center gap-1 text-[11px] font-medium text-jungle/60">
                          <RoomStatusBadge status={roomStatus} /> × {count}
                        </span>
                      ))}
                  </div>
                </div>
                <p className="shrink-0 text-sm font-semibold text-jungle-dark">
                  {moneyShort(representative.price)}
                  <span className="text-xs font-normal text-jungle/45"> / night</span>
                </p>
                <ChevronDownIcon
                  className={`h-4 w-4 shrink-0 text-jungle/45 transition-transform duration-150 ${isOpen ? 'rotate-180' : ''}`}
                />
              </button>
              <button
                type="button"
                onClick={() => openEditType(representative, roomsInGroup.length)}
                className="flex shrink-0 items-center gap-1.5 rounded-md border border-sand px-2.5 py-1.5 text-[11px] font-semibold text-jungle transition-colors duration-150 hover:bg-sand">

                <PencilIcon className="h-3.5 w-3.5" /> Edit room type
              </button>
              </div>

              {isOpen && (
                <div className="grid gap-4 border-t border-sand bg-sand-light/40 p-4 md:grid-cols-2 xl:grid-cols-3">
                  {roomsInGroup.map((room) => (
                    <article key={room.id} className="flex flex-col overflow-hidden rounded-xl border border-sand bg-white">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={room.image} alt={room.title} className="h-32 w-full object-cover" />
                      <div className="flex flex-1 flex-col p-4">
                        <div className="flex items-start justify-between gap-3">
                          <p className="text-xs text-jungle/45">No. {room.number} · {room.type}</p>
                          <RoomStatusBadge status={room.status} />
                        </div>
                        <p className="mt-3 line-clamp-2 text-xs leading-relaxed text-jungle/60">{room.description}</p>
                        <div className="mt-auto flex items-center justify-between gap-3 border-t border-sand pt-3">
                          <p className="text-sm font-semibold text-jungle-dark">
                            {moneyShort(room.price)}
                            <span className="text-xs font-normal text-jungle/45"> / night</span>
                          </p>
                          <div className="flex gap-2">
                            <button
                              type="button"
                              onClick={() => openEdit(room)}
                              className="flex items-center gap-1.5 rounded-md border border-sand px-2.5 py-1.5 text-[11px] font-semibold text-jungle transition-colors duration-150 hover:bg-sand">

                              <PencilIcon className="h-3.5 w-3.5" /> Edit
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
                </div>
              )}
            </div>
          );
        })}
        {visible.length === 0 && (
          <p className="rounded-xl border border-dashed border-sand py-16 text-center text-sm text-jungle/45">
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
          <Field label="Room number" error={errors.number} htmlFor="r-number">
            <input id="r-number" value={form.number} onChange={(e) => setForm({ ...form, number: e.target.value })} placeholder="512" className={inputClass('dark', !!errors.number)} />
          </Field>
          <Field label="Room type" htmlFor="r-type">
            <select id="r-type" value={selectedType} onChange={(e) => setForm({ ...form, type: e.target.value })} className={inputClass()}>
              {typeOptions.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
              <option value={NEW_TYPE}>+ New room type…</option>
            </select>
          </Field>
          {!isNewType && typeRep && (
            <p className="rounded-lg border border-sand bg-sand-light px-3 py-2.5 text-xs text-jungle/70 sm:col-span-2">
              This room will share the details of <span className="font-semibold text-jungle-dark">{typeRep.title}</span>{' '}
              ({moneyShort(typeRep.price)} / night, sleeps {typeRep.capacity}). Change them for all rooms of the type with “Edit room type”.
            </p>
          )}
          {isNewType && (
            <>
              <Field label="New room type name" error={errors.newType} htmlFor="r-newtype" className="sm:col-span-2">
                <input id="r-newtype" value={newTypeName} onChange={(e) => setNewTypeName(e.target.value)} placeholder="e.g. Garden Suite" className={inputClass('dark', !!errors.newType)} />
              </Field>
              <Field label="Room title" error={errors.title} htmlFor="r-title" className="sm:col-span-2">
                <input id="r-title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className={inputClass('dark', !!errors.title)} />
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
            </>
          )}
        </form>
      </Modal>

      {/* Edit single room (unit-level only) */}
      <Modal
        open={!!editing}
        onClose={() => setEditing(null)}
        title={editing ? `Edit room ${editing.number}` : 'Edit room'}
        description="Changes this room only. Price, photos, description and other shared details are edited per room type."
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

        <Field label="Room number" htmlFor="e-number">
          <input id="e-number" value={editNumber} onChange={(e) => setEditNumber(e.target.value)} className={inputClass()} />
        </Field>
      </Modal>

      {/* Edit room type (applies to every room of the type) */}
      <Modal
        open={!!editingType}
        onClose={() => setEditingType(null)}
        title={editingType ? `Edit room type: ${editingType.type}` : 'Edit room type'}
        description={
          editingType
            ? `Applies to all ${editingType.count} ${editingType.count === 1 ? 'room' : 'rooms'} of this type, including the nightly rate. Existing bookings keep the price they were made at.`
            : undefined
        }
        footer={
          <>
            <button
              type="button"
              onClick={() => setEditingType(null)}
              className="rounded-lg border border-sand px-4 py-2 text-sm font-semibold text-jungle transition-colors duration-150 hover:bg-sand">

              Cancel
            </button>
            <button
              type="button"
              onClick={saveEditType}
              disabled={saving}
              className="flex items-center gap-2 rounded-lg bg-jungle-dark px-4 py-2 text-sm font-semibold text-white transition-colors duration-150 hover:bg-jungle disabled:opacity-70">

              {saving && <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/40 border-t-white" />}
              Save to all rooms
            </button>
          </>
        }>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Title" htmlFor="t-title" className="sm:col-span-2">
            <input id="t-title" value={typeForm.title} onChange={(e) => setTypeForm({ ...typeForm, title: e.target.value })} className={inputClass()} />
          </Field>
          <Field label="Price / night (USD)" htmlFor="t-price">
            <input id="t-price" type="number" min={1} value={typeForm.price} onChange={(e) => setTypeForm({ ...typeForm, price: Number(e.target.value) })} className={inputClass()} />
          </Field>
          <Field label="Max occupancy" htmlFor="t-cap">
            <input id="t-cap" type="number" min={1} max={8} value={typeForm.capacity} onChange={(e) => setTypeForm({ ...typeForm, capacity: Number(e.target.value) })} className={inputClass()} />
          </Field>
          <Field label="Bed type" htmlFor="t-bed">
            <select id="t-bed" value={typeForm.bedType} onChange={(e) => setTypeForm({ ...typeForm, bedType: e.target.value })} className={inputClass()}>
              {Array.from(new Set(['1 King Bed', '1 Queen Bed', '2 Twin Beds', '1 King Bed + Daybed', typeForm.bedType].filter(Boolean))).map((b) => (
                <option key={b}>{b}</option>
              ))}
            </select>
          </Field>
          <Field label="Size (m²)" htmlFor="t-sqm">
            <input id="t-sqm" type="number" min={10} value={typeForm.sqm} onChange={(e) => setTypeForm({ ...typeForm, sqm: Number(e.target.value) })} className={inputClass()} />
          </Field>
          {([0, 1, 2] as const).map((i) => (
            <Field key={i} label={i === 0 ? 'Photo 1 URL (cover)' : `Photo ${i + 1} URL`} htmlFor={`t-img-${i}`} className={i === 0 ? 'sm:col-span-2' : undefined}>
              <div className="flex items-center gap-3">
                {typeForm.gallery[i] && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={typeForm.gallery[i]} alt="" className="h-11 w-14 shrink-0 rounded-md object-cover" />
                )}
                <input
                  id={`t-img-${i}`}
                  value={typeForm.gallery[i]}
                  onChange={(e) => {
                    const gallery = [...typeForm.gallery] as [string, string, string];
                    gallery[i] = e.target.value;
                    setTypeForm({ ...typeForm, gallery });
                  }}
                  className={inputClass()}
                />
              </div>
            </Field>
          ))}
          <Field label="Amenities (comma-separated)" htmlFor="t-amen" className="sm:col-span-2">
            <input id="t-amen" value={typeForm.amenities} onChange={(e) => setTypeForm({ ...typeForm, amenities: e.target.value })} className={inputClass()} />
          </Field>
          <Field label="Description" htmlFor="t-desc" className="sm:col-span-2">
            <textarea id="t-desc" rows={5} value={typeForm.description} onChange={(e) => setTypeForm({ ...typeForm, description: e.target.value })} className={`${inputClass()} resize-none`} />
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
              onClick={async () => {
                if (deleting) {
                  try {
                    await deleteRoom(deleting.id);
                    toast.success(`Room ${deleting.number} removed from inventory`);
                  } catch {
                    toast.error('Could not delete the room. Please try again.');
                  }
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
