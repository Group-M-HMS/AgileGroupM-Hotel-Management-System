import Link from "next/link";
import { CalendarDays, Users, BedDouble, ArrowRight } from "lucide-react";
import { formatDate } from "@/app/checkout/formatDate";
import type { MockBooking } from "@/app/manage-booking/mockBookings";

export function UpcomingReservations({
  bookings,
  roomNames,
}: {
  bookings: MockBooking[];
  roomNames: Record<string, string>;
}) {
  return (
    <section>
      <div className="mb-6">
        <p className="font-outfit text-sm uppercase tracking-[3px] text-sage">Upcoming Stay</p>
        <h2 className="mt-2 font-lora text-4xl text-jungle-dark">Upcoming Reservations</h2>
      </div>

      {bookings.length === 0 ? (
        <p className="rounded-[30px] border border-sand bg-white p-8 font-outfit text-jungle/60 shadow-sm">
          No upcoming reservations.
        </p>
      ) : (
        <div className="flex flex-col gap-6">
          {bookings.map(booking => (
            <div
              key={booking.id}
              className="flex flex-col gap-4 rounded-[30px] border border-sand bg-white p-8 md:flex-row md:items-center md:justify-between"
            >
              <div className="flex flex-1 flex-col gap-3 md:flex-row md:items-center md:justify-between md:gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <BedDouble size={16} className="text-sage" />
                    <p className="text-sm text-jungle/60">Room</p>
                  </div>
                  <h3 className="mt-1 font-semibold text-jungle-dark">
                    {roomNames[booking.roomId] ?? "Room details unavailable"}
                  </h3>
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <CalendarDays size={16} className="text-sage" />
                    <p className="text-sm text-jungle/60">Stay Dates</p>
                  </div>
                  <h3 className="mt-1 font-semibold text-jungle-dark">
                    {formatDate(booking.checkIn)} – {formatDate(booking.checkOut)}
                  </h3>
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <Users size={16} className="text-sage" />
                    <p className="text-sm text-jungle/60">Guests</p>
                  </div>
                  <h3 className="mt-1 font-semibold text-jungle-dark">{booking.guests}</h3>
                </div>
                <div className="md:mr-6">
                  <p className="text-sm text-jungle/60">Booking ID</p>
                  <h3 className="mt-1 font-semibold text-jungle-dark">{booking.id}</h3>
                </div>
              </div>
              <Link
                href={`/manage-booking/itinerary?email=${encodeURIComponent(booking.email)}&id=${encodeURIComponent(booking.id)}`}
                className="flex items-center justify-center gap-2 rounded-full bg-sage px-6 py-3 font-semibold text-jungle-dark transition hover:bg-sage/90"
              >
                View Itinerary
                <ArrowRight size={18} />
              </Link>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
