import { auth } from "./firebase";

// Talks to booking-service directly, same as lib/checkout.ts (no BFF proxy layer).
const BOOKING_SERVICE_URL =
  process.env.NEXT_PUBLIC_BOOKING_SERVICE_URL ?? "http://168.138.170.92:8085";

// Room photos live in room-service, keyed by roomId (same source as the itinerary page).
const ROOM_SERVICE_URL =
  process.env.NEXT_PUBLIC_ROOM_SERVICE_URL ?? "http://168.138.170.92:8081";

type ApiEnvelope<T> = { success: boolean; message: string | null; data: T };

async function unwrap<T>(res: Response): Promise<T> {
  const body = (await res.json().catch(() => null)) as ApiEnvelope<T> | null;
  if (!res.ok || !body?.success) {
    throw new Error(body?.message || `Request failed (${res.status}).`);
  }
  return body.data;
}

export type BookingStatus = "PENDING" | "CONFIRMED" | "CANCELLED";

// Mirrors booking-service's BookingSummary record (GET /api/v1/bookings/my).
// `hotelName` holds the resolved room name; `roomType` its description.
type BookingSummaryDto = {
  bookingId: number;
  hotelName: string;
  roomType: string;
  checkInDate: string; // ISO date, e.g. "2026-08-10"
  checkOutDate: string;
  status: BookingStatus;
  totalAmount: number;
  guestCount: number;
  subTotal: number;
  taxAmount: number;
};

export type DashboardBooking = {
  bookingId: number;
  roomName: string;
  roomType: string;
  checkIn: string; // ISO date
  checkOut: string;
  status: BookingStatus;
  total: number;
  guests: number;
  subTotal: number;
  taxAmount: number;
};

/** Fetches the signed-in customer's bookings from booking-service (X-User-Id = Firebase UID). */
export async function fetchMyBookings(): Promise<DashboardBooking[]> {
  const uid = auth.currentUser?.uid;
  if (!uid) throw new Error("You must be signed in to view your bookings.");

  const res = await fetch(`${BOOKING_SERVICE_URL}/api/v1/bookings/my`, {
    headers: { "X-User-Id": uid },
  });
  const summaries = await unwrap<BookingSummaryDto[]>(res);

  return summaries.map((s) => ({
    bookingId: s.bookingId,
    roomName: s.hotelName,
    roomType: s.roomType,
    checkIn: s.checkInDate,
    checkOut: s.checkOutDate,
    status: s.status,
    total: Number(s.totalAmount),
    guests: s.guestCount,
    subTotal: Number(s.subTotal),
    taxAmount: Number(s.taxAmount),
  }));
}

// Mirrors booking-service's BookingDetailResponse (GET /api/v1/bookings/my/{id}).
type BookingDetailDto = {
  bookingId: number;
  roomId: number;
  hotelName: string;
  roomType: string;
  checkInDate: string; // ISO date
  checkOutDate: string;
  numberOfGuests: number;
  specialRequests: string | null;
  status: BookingStatus;
  paymentStatus: string;
  totalAmount: number;
  bookingReference: string | null;
};

export type BookingDetail = {
  bookingId: number;
  roomId: number;
  roomName: string;
  roomType: string;
  checkIn: string; // ISO date
  checkOut: string;
  guests: number;
  specialRequests: string;
  status: BookingStatus;
  paymentStatus: string;
  total: number;
  bookingReference: string | null;
};

/** Fetches one of the signed-in customer's bookings by id (booking-service scopes it to the caller). */
export async function fetchBookingDetail(bookingId: string | number): Promise<BookingDetail> {
  const uid = auth.currentUser?.uid;
  if (!uid) throw new Error("You must be signed in to view this booking.");

  const res = await fetch(`${BOOKING_SERVICE_URL}/api/v1/bookings/my/${bookingId}`, {
    headers: { "X-User-Id": uid },
  });
  const d = await unwrap<BookingDetailDto>(res);

  return {
    bookingId: d.bookingId,
    roomId: d.roomId,
    roomName: d.hotelName,
    roomType: d.roomType,
    checkIn: d.checkInDate,
    checkOut: d.checkOutDate,
    guests: d.numberOfGuests,
    specialRequests: d.specialRequests ?? "",
    status: d.status,
    paymentStatus: d.paymentStatus,
    total: Number(d.totalAmount),
    bookingReference: d.bookingReference,
  };
}

/** Cancels one of the signed-in customer's bookings. `reason` is required by the backend. */
export async function cancelBooking(
  bookingId: string | number,
  reason: string
): Promise<BookingStatus> {
  const uid = auth.currentUser?.uid;
  if (!uid) throw new Error("You must be signed in to cancel this booking.");

  const res = await fetch(`${BOOKING_SERVICE_URL}/api/v1/bookings/${bookingId}/cancel`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "X-User-Id": uid },
    body: JSON.stringify({ reason }),
  });
  const result = await unwrap<{ bookingId: number; status: BookingStatus }>(res);
  return result.status;
}

/** First room photo for a room, or null. Same shape the itinerary page reads. */
async function fetchRoomThumbnail(roomId: number): Promise<string | null> {
  try {
    const res = await fetch(`${ROOM_SERVICE_URL}/api/rooms/${roomId}`);
    if (!res.ok) return null;
    const room = await res.json();
    return room.images?.[0] ?? null;
  } catch {
    return null;
  }
}

/**
 * Best-effort thumbnail per booking, keyed by bookingId. The list DTO carries no
 * image or roomId, so each entry needs two hops: booking detail (for roomId) →
 * room-service (for the photo). Failures resolve to null rather than throwing.
 */
export async function fetchBookingThumbnails(
  bookingIds: number[]
): Promise<Record<number, string | null>> {
  const entries = await Promise.all(
    bookingIds.map(async id => {
      try {
        const detail = await fetchBookingDetail(id);
        return [id, await fetchRoomThumbnail(detail.roomId)] as const;
      } catch {
        return [id, null] as const;
      }
    })
  );
  return Object.fromEntries(entries);
}
