// TODO(NIBM2-295): once room-service's real booking-lookup endpoint exists, replace this
// handler's body with a proxy fetch to the real endpoint. TODO(NIBM2-367): a real backend must
// additionally verify the requesting session actually owns the returned bookings before
// returning them — this mock trusts the client-supplied email the same way the existing
// lookup/cancel routes do, since there is no session/token backend yet.

import { findMockBookingsByEmail } from "@/app/manage-booking/mockBookings";

export async function POST(request: Request) {
  const { email } = await request.json();

  const bookings = findMockBookingsByEmail(String(email));

  return Response.json({ bookings });
}
