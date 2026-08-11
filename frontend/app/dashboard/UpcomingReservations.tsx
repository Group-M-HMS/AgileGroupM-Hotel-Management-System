import Link from "next/link";
import { CalendarDays, Users, BedDouble, ArrowRight } from "lucide-react";
import { formatDate } from "@/app/checkout/formatDate";
import type { DashboardBooking } from "@/lib/bookings";
import { StatusBadge } from "./StatusBadge";

export function UpcomingReservations({ bookings }: { bookings: DashboardBooking[] }) {
  return (
    <section>
      <div className="mb-6">
        <p className="font-jakarta text-sm uppercase tracking-[3px] text-sage">Upcoming Stay</p>
        <h2 className="mt-2 font-fraunces text-4xl text-jungle-dark">Upcoming Reservations</h2>
      </div>

      {bookings.length === 0 ? (
        <p className="rounded-[30px] border border-sand bg-white p-8 font-jakarta text-jungle/60 shadow-sm">
          No upcoming reservations.
        </p>
      ) : (
        <div className="flex flex-col gap-6">
          {bookings.map(booking => (
            <div
              key={booking.bookingId}
              className="flex flex-col gap-4 rounded-[30px] border border-sand bg-white p-8 md:flex-row md:items-center md:justify-between"
            >
              <div className="flex flex-1 flex-col gap-3 md:flex-row md:items-center md:justify-between md:gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <BedDouble size={16} className="text-sage" />
                    <p className="text-sm text-jungle/60">Room</p>
                  </div>
                  <h3 className="mt-1 font-semibold text-jungle-dark">
                    {booking.roomName || "Room details unavailable"}
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
                  <h3 className="mt-1 font-semibold text-jungle-dark">#{booking.bookingId}</h3>
                </div>
              </div>
              <div className="flex flex-col items-start gap-3 md:items-end">
                <StatusBadge status={booking.status} />
                <Link
                  href={`/manage-booking/itinerary?id=${booking.bookingId}`}
                  className="inline-flex items-center gap-1 font-jakarta text-sm font-semibold text-sage transition hover:text-jungle-dark"
                >
                  View Itinerary
                  <ArrowRight size={16} />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
