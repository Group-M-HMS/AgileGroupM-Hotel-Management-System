// TODO(NIBM2-295): once room-service's real lookup endpoint exists, replace this
// handler's body with a proxy fetch to `${ROOM_SERVICE_URL}/api/.../lookup`
// (or repoint ManageBookingForm directly at that URL and delete this route).

import { findMockBooking } from "@/app/manage-booking/mockBookings";

export async function POST(request: Request) {
  const { email, bookingReference } = await request.json();

  const match = findMockBooking(String(email), String(bookingReference));

  if (!match) {
    return Response.json({ message: "No booking matches those details." }, { status: 404 });
  }

  return Response.json({ ok: true });
}
