import Link from "next/link";
import {
  CalendarDays,
  ArrowUpRight,
  Search,
} from "lucide-react";

const bookings = [
  {
    id: "RN-240531",
    villa: "River View Villa",
    checkIn: "20 Jul 2026",
    checkOut: "23 Jul 2026",
    guests: 2,
    total: "$540",
    status: "Confirmed",
  },
  {
    id: "RN-240415",
    villa: "Forest Cabin",
    checkIn: "12 Apr 2026",
    checkOut: "15 Apr 2026",
    guests: 2,
    total: "$420",
    status: "Completed",
  },
  {
    id: "RN-231228",
    villa: "Garden Suite",
    checkIn: "28 Dec 2025",
    checkOut: "30 Dec 2025",
    guests: 4,
    total: "$610",
    status: "Completed",
  },
];

function StatusBadge({ status }) {
  const styles = {
    Confirmed: "bg-green-100 text-green-700",
    Completed: "bg-sage/20 text-jungle-dark",
    Cancelled: "bg-red-100 text-red-700",
  };

  return (
    <span
      className={`rounded-full px-3 py-1 text-xs font-semibold ${
        styles[status] || "bg-gray-100 text-gray-700"
      }`}
    >
      {status}
    </span>
  );
}

export default function BookingHistory() {
  return (
    <section className="rounded-[30px] border border-sand bg-white p-8 shadow-sm">

      {/* Header */}

      <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">

        <div>

          <p className="font-outfit text-sm uppercase tracking-[3px] text-sage">
            My Reservations
          </p>

          <h2 className="mt-2 font-lora text-4xl text-jungle-dark">
            Booking History
          </h2>

        </div>

        <div className="relative w-full lg:w-[320px]">

          <Search
            size={18}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-jungle/40"
          />

          <input
            type="text"
            placeholder="Search bookings..."
            className="w-full rounded-full border border-sand bg-sand-light py-3 pl-11 pr-5 outline-none transition focus:border-sage"
          />

        </div>

      </div>

      {/* Table */}

      <div className="mt-8 overflow-x-auto">

        <table className="w-full min-w-[900px]">

          <thead>

            <tr className="border-b border-sand text-left">

              <th className="pb-4 font-outfit font-semibold text-jungle-dark">
                Booking
              </th>

              <th className="pb-4 font-outfit font-semibold text-jungle-dark">
                Villa
              </th>

              <th className="pb-4 font-outfit font-semibold text-jungle-dark">
                Stay
              </th>

              <th className="pb-4 font-outfit font-semibold text-jungle-dark">
                Guests
              </th>

              <th className="pb-4 font-outfit font-semibold text-jungle-dark">
                Total
              </th>

              <th className="pb-4 font-outfit font-semibold text-jungle-dark">
                Status
              </th>

              <th className="pb-4"></th>

            </tr>

          </thead>

          <tbody>

            {bookings.map((booking) => (

              <tr
                key={booking.id}
                className="border-b border-sand/60 transition hover:bg-sand-light"
              >

                <td className="py-6">

                  <div className="flex items-center gap-3">

                    <div className="flex h-11 w-11 items-center justify-center rounded-full bg-sage/20">

                      <CalendarDays
                        size={20}
                        className="text-sage"
                      />

                    </div>

                    <div>

                      <p className="font-semibold text-jungle-dark">
                        {booking.id}
                      </p>

                      <p className="text-sm text-jungle/60">
                        Reservation
                      </p>

                    </div>

                  </div>

                </td>

                <td className="font-medium text-jungle-dark">
                  {booking.villa}
                </td>

                <td>

                  <div>

                    <p>{booking.checkIn}</p>

                    <p className="text-sm text-jungle/50">
                      to {booking.checkOut}
                    </p>

                  </div>

                </td>

                <td>{booking.guests}</td>

                <td className="font-semibold">
                  {booking.total}
                </td>

                <td>

                  <StatusBadge status={booking.status} />

                </td>

                <td>

                  <Link
                    href={`/booking/${booking.id}`}
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

    </section>
  );
}