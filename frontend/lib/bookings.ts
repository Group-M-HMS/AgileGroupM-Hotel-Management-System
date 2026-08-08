import { auth } from "./firebase";

// Talks to booking-service directly, same as lib/checkout.ts (no BFF proxy layer).
const BOOKING_SERVICE_URL =
  process.env.NEXT_PUBLIC_BOOKING_SERVICE_URL ?? "http://168.138.170.92:8085";

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
