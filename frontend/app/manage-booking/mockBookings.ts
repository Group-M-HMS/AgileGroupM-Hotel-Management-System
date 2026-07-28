// TODO(NIBM2-295): once room-service's real booking-lookup endpoint exists, delete this
// fixture module and fetch real booking data instead (both the lookup route and the
// itinerary page currently depend on it).

export type MockBooking = {
  email: string;
  bookingReference: string;
  roomId: string; // must match a real seeded room id in the local room-service DB
  checkIn: string;
  checkOut: string;
  guests: string;
  subtotal: number;
  taxRate: number;
  taxAmount: number;
  total: number;
  status: "Confirmed" | "Cancelled";
  firstName: string;
  lastName: string;
  phone: string;
  specialRequests: string;
};

// Next.js's dev bundler compiles Server Components and Route Handlers into separate
// module graphs, so a plain top-level array here is not guaranteed to be the same
// instance in both places (a POST to /api/manage-booking/cancel could mutate a copy the
// itinerary page never sees). Anchoring on `globalThis` forces a single process-wide
// instance across both, which is the standard workaround for this class of issue.
const globalForMockBookings = globalThis as unknown as { __MOCK_BOOKINGS__?: MockBooking[] };

export const MOCK_BOOKINGS: MockBooking[] =
  globalForMockBookings.__MOCK_BOOKINGS__ ??
  (globalForMockBookings.__MOCK_BOOKINGS__ = [
    {
      email: "test@example.com",
      bookingReference: "ABC123",
      roomId: "1",
      checkIn: "2026-08-10",
      checkOut: "2026-08-13",
      guests: "2",
      subtotal: 450,
      taxRate: 0.1,
      taxAmount: 45,
      total: 495,
      status: "Confirmed",
      firstName: "Test",
      lastName: "User",
      phone: "+1 555 123 4567",
      specialRequests: "Late check-in around 10pm, please.",
    },
    {
      email: "jane.doe@example.com",
      bookingReference: "XYZ789",
      roomId: "1",
      checkIn: "2026-09-02",
      checkOut: "2026-09-05",
      guests: "1",
      subtotal: 450,
      taxRate: 0.1,
      taxAmount: 45,
      total: 495,
      status: "Confirmed",
      firstName: "Jane",
      lastName: "Doe",
      phone: "+1 555 987 6543",
      specialRequests: "",
    },
  ]);

export function findMockBooking(email: string, bookingReference: string): MockBooking | null {
  const match = MOCK_BOOKINGS.find(
    (b) =>
      b.email.toLowerCase() === email.toLowerCase() &&
      b.bookingReference.toLowerCase() === bookingReference.toLowerCase()
  );
  return match ?? null;
}

export function cancelMockBooking(email: string, bookingReference: string): MockBooking | null {
  const booking = findMockBooking(email, bookingReference);
  if (!booking) return null;
  booking.status = "Cancelled";
  return booking;
}
