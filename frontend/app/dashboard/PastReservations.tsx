import Link from "next/link";
import { CalendarDays, ArrowUpRight } from "lucide-react";
import { formatDate } from "@/app/checkout/formatDate";
import type { DashboardBooking } from "@/lib/bookings";
import { StatusBadge } from "./StatusBadge";

export function PastReservations({ bookings }: { bookings: DashboardBooking[] }) {
  return (
    <section>
      <div className="mb-6">
        <p className="font-jakarta text-sm uppercase tracking-[3px] text-sage">My Reservations</p>
        <h2 className="mt-2 font-fraunces text-4xl text-jungle-dark">Past Reservations</h2>
      </div>

      {bookings.length === 0 ? (
        <p className="rounded-[30px] border border-sand bg-white p-8 font-jakarta text-jungle/60 shadow-sm">
          No past reservations yet.
        </p>
      ) : (
        <div className="overflow-x-auto rounded-[30px] border border-sand bg-white p-8 shadow-sm">
          <table className="w-full min-w-[700px]">
            <thead>
              <tr className="border-b border-sand text-left">
                <th className="w-[30%] pb-4 font-jakarta font-semibold text-jungle-dark">Booking</th>
                <th className="w-[25%] pb-4 font-jakarta font-semibold text-jungle-dark">Stay</th>
                <th className="w-[15%] pb-4 font-jakarta font-semibold text-jungle-dark">Guests</th>
                <th className="w-[15%] pb-4 font-jakarta font-semibold text-jungle-dark">Total</th>
                <th className="w-[12%] pb-4 font-jakarta font-semibold text-jungle-dark">Status</th>
                <th className="w-[13%] pb-4"></th>
              </tr>
            </thead>
            <tbody>
              {bookings.map(booking => (
                <tr
                  key={booking.bookingId}
                  className="border-b border-sand/60 transition hover:bg-sand-light"
                >
                  <td className="py-6">
                    <div className="flex items-center gap-3">
                      <div className="flex h-11 w-11 items-center justify-center rounded-full bg-sage/20">
                        <CalendarDays size={20} className="text-sage" />
                      </div>
                      <div>
                        <p className="font-semibold text-jungle-dark">{booking.roomName}</p>
                        <p className="text-sm text-jungle/50">#{booking.bookingId}</p>
                      </div>
                    </div>
                  </td>
                  <td>
                    <p>{formatDate(booking.checkIn)}</p>
                    <p className="text-sm text-jungle/50">to {formatDate(booking.checkOut)}</p>
                  </td>
                  <td>{booking.guests}</td>
                  <td className="font-semibold">${booking.total.toFixed(2)}</td>
                  <td>
                    <StatusBadge status={booking.status} />
                  </td>
                  <td>
                    <Link
                      href={`/manage-booking/itinerary?id=${booking.bookingId}`}
                      className="flex items-center gap-2 font-semibold text-sage transition hover:text-jungle-dark"
                    >
                      Details
                      <ArrowUpRight size={18} />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
