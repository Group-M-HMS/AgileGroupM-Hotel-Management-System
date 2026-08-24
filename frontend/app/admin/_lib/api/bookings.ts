import type { Booking, BookingStatus } from '../types/hotel';
import { bookingAdminFetch } from './config';

interface AdminBookingSummaryDto {
  id: number;
  ref: string;
  guestId: string;
  guestName: string;
  guestEmail: string;
  guestPhone: string;
  roomId: number;
  roomTitle: string;
  roomNumber: string;
  checkIn: string;
  checkOut: string;
  guests: number;
  amount: number;
  paid: boolean;
  status: string;
  source: string;
  specialRequests: string | null;
  cancelReason: string | null;
}

function toStatus(status: string): BookingStatus {
  return (
    {
      PENDING: 'confirmed',
      CONFIRMED: 'confirmed',
      CHECKED_IN: 'checked-in',
      CHECKED_OUT: 'checked-out',
      CANCELLED: 'cancelled',
    } as Record<string, BookingStatus>
  )[status] ?? 'confirmed';
}

function toSource(source: string): Booking['source'] {
  return ({ WEBSITE: 'Website', WALK_IN: 'Walk-in', AGENT: 'Agent' } as Record<string, Booking['source']>)[source] ?? 'Website';
}

function toBooking(dto: AdminBookingSummaryDto): Booking {
  return {
    id: String(dto.id),
    ref: dto.ref,
    guestId: dto.guestId,
    guestName: dto.guestName,
    guestEmail: dto.guestEmail,
    guestPhone: dto.guestPhone,
    roomId: String(dto.roomId),
    roomTitle: dto.roomTitle,
    roomNumber: dto.roomNumber,
    checkIn: dto.checkIn,
    checkOut: dto.checkOut,
    guests: dto.guests,
    amount: dto.amount,
    paid: dto.paid,
    status: toStatus(dto.status),
    specialRequests: dto.specialRequests ?? '',
    source: toSource(dto.source),
    cancelReason: dto.cancelReason ?? undefined,
  };
}

export async function fetchBookings(): Promise<Booking[]> {
  const page = await bookingAdminFetch<{ items: AdminBookingSummaryDto[]; total: number }>(
    '/api/admin/bookings?size=500'
  );
  return page.items.map(toBooking);
}

export interface WalkInInput {
  guestName: string;
  guestEmail: string;
  guestPhone: string;
  roomId: string;
  checkIn: string;
  checkOut: string;
  guests: number;
  specialRequests: string;
  paid: boolean;
}

export async function createWalkInBooking(input: WalkInInput): Promise<{ id: string }> {
  const res = await bookingAdminFetch<{ uuid: number; status: string; totalAmount: number }>(
    '/api/admin/bookings/walk-in',
    {
      method: 'POST',
      body: JSON.stringify({
        guestName: input.guestName,
        guestEmail: input.guestEmail,
        guestPhone: input.guestPhone || null,
        roomId: Number(input.roomId),
        checkIn: input.checkIn,
        checkOut: input.checkOut,
        guests: input.guests,
        specialRequests: input.specialRequests || null,
        paid: input.paid,
      }),
    }
  );
  return { id: String(res.uuid) };
}

export async function checkInBooking(bookingId: string): Promise<void> {
  await bookingAdminFetch<unknown>(`/api/admin/bookings/${bookingId}/check-in`, { method: 'POST' });
}

export async function checkOutBooking(bookingId: string): Promise<void> {
  await bookingAdminFetch<unknown>(`/api/admin/bookings/${bookingId}/check-out`, { method: 'POST' });
}

export async function cancelBooking(bookingId: string, reason: string): Promise<void> {
  await bookingAdminFetch<unknown>(`/api/admin/bookings/${bookingId}/cancel`, {
    method: 'POST',
    body: JSON.stringify({ reason }),
  });
}
