'use client';

import React, { useState } from 'react';
import { BedDoubleIcon, UserIcon } from 'lucide-react';
import { toast } from 'sonner';
import { useHotel } from '../_lib/contexts/HotelDataContext';
import type { Room, RoomStatus } from '../_lib/types/hotel';
import { Modal } from './ui/Modal';
import { RoomStatusBadge, roomStatusMeta } from './StatusBadge';
import { moneyShort } from '../_lib/utils/format';

const filters: Array<{ key: RoomStatus | 'all'; label: string }> = [
  { key: 'all', label: 'All' },
  { key: 'available', label: 'Available' },
  { key: 'occupied', label: 'Occupied' },
  { key: 'cleaning', label: 'Needs Cleaning' },
  { key: 'maintenance', label: 'Maintenance' },
];

const statusOptions: RoomStatus[] = ['available', 'occupied', 'cleaning', 'maintenance'];

export function RoomStatusGrid() {
  const { rooms, setRoomStatus } = useHotel();
  const [filter, setFilter] = useState<RoomStatus | 'all'>('all');
  const [target, setTarget] = useState<Room | null>(null);
  const [nextStatus, setNextStatus] = useState<RoomStatus>('available');

  const counts = {
    all: rooms.length,
    available: rooms.filter((r) => r.status === 'available').length,
    occupied: rooms.filter((r) => r.status === 'occupied').length,
    cleaning: rooms.filter((r) => r.status === 'cleaning').length,
    maintenance: rooms.filter((r) => r.status === 'maintenance').length,
  };

  const visible = filter === 'all' ? rooms : rooms.filter((r) => r.status === filter);

  const openOverride = (room: Room) => {
    setTarget(room);
    setNextStatus(room.status);
  };

  const applyOverride = async () => {
    if (!target) return;
    try {
      await setRoomStatus(target.id, nextStatus);
      toast.success(`Room ${target.number} set to ${roomStatusMeta[nextStatus].label}`);
      setTarget(null);
    } catch {
      toast.error('Could not update the room status. Please try again.');
    }
  };

  return (
    <section className="rounded-xl border border-sand bg-white">
      <header className="flex flex-wrap items-center justify-between gap-4 border-b border-sand px-5 py-4">
        <div>
          <h2 className="text-sm font-semibold text-jungle-dark">Live room status</h2>
          <p className="mt-0.5 text-xs text-jungle/60">Click any room to override its housekeeping state.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {filters.map((f) => (
            <button
              key={f.key}
              type="button"
              onClick={() => setFilter(f.key)}
              aria-pressed={filter === f.key}
              className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors duration-150 ${
                filter === f.key
                  ? 'border-clay bg-clay/15 text-clay'
                  : 'border-sand text-jungle/60 hover:border-sage hover:text-jungle'
              }`}>

              {f.label} ({counts[f.key]})
            </button>
          ))}
        </div>
      </header>

      <div className="grid max-h-[520px] gap-3 overflow-y-auto p-5 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 thin-scroll">
        {visible.map((room) => (
          <button
            key={room.id}
            type="button"
            onClick={() => openOverride(room)}
            className="rounded-lg border border-sand bg-sand-light p-4 text-left transition-colors duration-150 hover:border-clay/60">

            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-jungle-dark">No. {room.number}</p>
                <p className="mt-0.5 text-xs text-jungle/60">{room.title}</p>
              </div>
              <RoomStatusBadge status={room.status} />
            </div>
            <p className="mt-3 flex items-center gap-1.5 text-[11px] text-jungle/60">
              <BedDoubleIcon className="h-3.5 w-3.5" /> {room.bedType} · {room.sqm} m²
            </p>
            <div className="mt-3 flex items-center justify-between border-t border-sand pt-3">
              <p className="flex items-center gap-1.5 text-[11px] text-jungle/60">
                <UserIcon className="h-3.5 w-3.5" />
                {room.guestName ?? 'Unoccupied'}
              </p>
              <p className="text-xs font-semibold text-jungle">{moneyShort(room.price)}</p>
            </div>
          </button>
        ))}
        {visible.length === 0 && (
          <p className="col-span-full py-10 text-center text-sm text-jungle/45">No rooms in this state.</p>
        )}
      </div>

      <Modal
        open={!!target}
        onClose={() => setTarget(null)}
        width="max-w-md"
        title={`Override room status — No. ${target?.number ?? ''}`}
        description={target ? `${target.title} · ${target.bedType}` : undefined}
        footer={
          <>
            <button
              type="button"
              onClick={() => setTarget(null)}
              className="rounded-lg border border-sand px-4 py-2 text-sm font-semibold text-jungle transition-colors duration-150 hover:bg-sand">

              Cancel
            </button>
            <button
              type="button"
              onClick={applyOverride}
              className="rounded-lg bg-jungle-dark px-4 py-2 text-sm font-semibold text-white transition-colors duration-150 hover:bg-jungle">

              Apply status
            </button>
          </>
        }>

        <div className="space-y-2">
          {statusOptions.map((s) => (
            <label
              key={s}
              className={`flex cursor-pointer items-center justify-between rounded-lg border px-4 py-3 transition-colors duration-150 ${
                nextStatus === s ? 'border-clay bg-clay/10' : 'border-sand hover:border-sage'
              }`}>

              <span className="flex items-center gap-2.5">
                <input
                  type="radio"
                  name="status"
                  checked={nextStatus === s}
                  onChange={() => setNextStatus(s)}
                  className="h-3.5 w-3.5 accent-clay"
                />

                <span className="text-sm font-medium text-jungle-dark">{roomStatusMeta[s].label}</span>
              </span>
              <span className={`h-2 w-2 rounded-full ${roomStatusMeta[s].dot}`} />
            </label>
          ))}
        </div>
        {target?.guestName && nextStatus !== 'occupied' && (
          <p className="mt-4 rounded-lg border border-amber-500/25 bg-amber-500/10 px-3 py-2.5 text-xs text-amber-700">
            {target.guestName} is currently assigned to this room and will be unassigned.
          </p>
        )}
      </Modal>
    </section>
  );
}
