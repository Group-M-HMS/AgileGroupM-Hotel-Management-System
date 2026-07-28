// TODO(NIBM2-295): once room-service has a real cancellation endpoint, replace this
// handler's body with a proxy fetch to `${ROOM_SERVICE_URL}/api/.../cancel` (or repoint
// CancelBookingControl directly at that URL and delete this route).

import { cancelMockBooking } from "@/app/manage-booking/mockBookings";

export async function POST(request: Request) {
  const { email, bookingReference } = await request.json();

  const booking = cancelMockBooking(String(email), String(bookingReference));

  if (!booking) {
    return Response.json({ message: "No booking matches those details." }, { status: 404 });
  }

  return Response.json({ ok: true, status: booking.status });
}
