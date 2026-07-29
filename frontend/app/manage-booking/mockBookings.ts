// TODO(NIBM2-295): once room-service's real booking-lookup endpoint exists, delete this
// fixture module and fetch real booking data instead (both the lookup route and the
// itinerary page currently depend on it).

export type MockBooking = {
  email: string;
  id: string; // UUID — matches the real Booking entity's primary key, no separate human-readable code
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
      id: "328661c7-5381-4e43-b54a-1257c2e65aad",
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
      id: "7179a9a3-f09b-4792-8c5d-eee5fc1f9818",
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
    {
      email: "test@example.com",
      id: "2e56c739-a7fd-4beb-901f-c1f73c02afb4",
      roomId: "1",
      checkIn: "2026-06-01",
      checkOut: "2026-06-05",
      guests: "2",
      subtotal: 600,
      taxRate: 0.1,
      taxAmount: 60,
      total: 660,
      status: "Confirmed",
      firstName: "Test",
      lastName: "User",
      phone: "+1 555 123 4567",
      specialRequests: "",
    },
    {
      email: "test@example.com",
      id: "5264cda5-ac5e-4bc5-b688-e66d63c509cc",
      roomId: "2",
      checkIn: "2026-09-15",
      checkOut: "2026-09-18",
      guests: "3",
      subtotal: 540,
      taxRate: 0.1,
      taxAmount: 54,
      total: 594,
      status: "Confirmed",
      firstName: "Test",
      lastName: "User",
      phone: "+1 555 123 4567",
      specialRequests: "Anniversary trip — a bottle of wine would be lovely.",
    },
    {
      email: "test@example.com",
      id: "790fbe78-3f8f-4d1b-a31e-8e93c13134ed",
      roomId: "3",
      checkIn: "2026-10-20",
      checkOut: "2026-10-25",
      guests: "4",
      subtotal: 900,
      taxRate: 0.1,
      taxAmount: 90,
      total: 990,
      status: "Confirmed",
      firstName: "Test",
      lastName: "User",
      phone: "+1 555 123 4567",
      specialRequests: "",
    },
    {
      email: "test@example.com",
      id: "9f16d820-c7c0-4f09-bc72-ac0956e7d2e8",
      roomId: "4",
      checkIn: "2026-05-10",
      checkOut: "2026-05-12",
      guests: "2",
      subtotal: 300,
      taxRate: 0.1,
      taxAmount: 30,
      total: 330,
      status: "Confirmed",
      firstName: "Test",
      lastName: "User",
      phone: "+1 555 123 4567",
      specialRequests: "",
    },
    {
      email: "test@example.com",
      id: "c31406a8-949f-4501-bb6d-1999c24b26f1",
      roomId: "5",
      checkIn: "2026-04-01",
      checkOut: "2026-04-04",
      guests: "1",
      subtotal: 360,
      taxRate: 0.1,
      taxAmount: 36,
      total: 396,
      status: "Cancelled",
      firstName: "Test",
      lastName: "User",
      phone: "+1 555 123 4567",
      specialRequests: "",
    },
    {
      email: "test@example.com",
      id: "8a2bb3d6-44e8-4e4a-afb9-ddf82ff90a52",
      roomId: "6",
      checkIn: "2027-01-05",
      checkOut: "2027-01-10",
      guests: "2",
      subtotal: 750,
      taxRate: 0.1,
      taxAmount: 75,
      total: 825,
      status: "Confirmed",
      firstName: "Test",
      lastName: "User",
      phone: "+1 555 123 4567",
      specialRequests: "",
    },
  ]);

export function findMockBooking(email: string, id: string): MockBooking | null {
  const match = MOCK_BOOKINGS.find(
    (b) =>
      b.email.toLowerCase() === email.toLowerCase() &&
      b.id.toLowerCase() === id.toLowerCase()
  );
  return match ?? null;
}

export function findMockBookingsByEmail(email: string): MockBooking[] {
  return MOCK_BOOKINGS.filter((b) => b.email.toLowerCase() === email.toLowerCase());
}

export function cancelMockBooking(email: string, id: string): MockBooking | null {
  const booking = findMockBooking(email, id);
  if (!booking) return null;
  booking.status = "Cancelled";
  return booking;
}
