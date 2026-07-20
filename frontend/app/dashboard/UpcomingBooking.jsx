import {
  CalendarDays,
  MapPin,
  Users,
  CreditCard,
  ArrowRight,
} from "lucide-react";

export default function UpcomingBooking() {
  return (
    <section className="grid gap-8 lg:grid-cols-3">

      {/* Booking Card */}
      <div className="lg:col-span-2 overflow-hidden rounded-[30px] border border-sand bg-white shadow-sm">

        {/* Image */}
        <div className="relative h-[280px]">

          <img
            src="/images/villa.jpg"
            alt="River View Villa"
            className="h-full w-full object-cover"
          />

          <div className="absolute right-6 top-6 rounded-full bg-green-100 px-5 py-2 text-sm font-semibold text-green-700">
            Confirmed
          </div>

        </div>

        {/* Details */}
        <div className="p-8">

          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">

            <div>

              <p className="font-outfit text-sm uppercase tracking-[2px] text-sage">
                Upcoming Stay
              </p>

              <h2 className="mt-2 font-lora text-4xl text-jungle-dark">
                River View Villa
              </h2>

            </div>

            <button className="rounded-full bg-sage px-6 py-3 font-semibold text-jungle-dark transition hover:bg-sage/90">
              View Booking
            </button>

          </div>

          <div className="mt-8 grid gap-8 md:grid-cols-2">

            <div className="flex gap-4">

              <CalendarDays className="mt-1 text-sage" />

              <div>
                <p className="text-sm text-jungle/60">
                  Check In
                </p>

                <h3 className="mt-1 font-semibold text-jungle-dark">
                  20 July 2026
                </h3>
              </div>

            </div>

            <div className="flex gap-4">

              <CalendarDays className="mt-1 text-sage" />

              <div>
                <p className="text-sm text-jungle/60">
                  Check Out
                </p>

                <h3 className="mt-1 font-semibold text-jungle-dark">
                  23 July 2026
                </h3>
              </div>

            </div>

            <div className="flex gap-4">

              <Users className="mt-1 text-sage" />

              <div>
                <p className="text-sm text-jungle/60">
                  Guests
                </p>

                <h3 className="mt-1 font-semibold text-jungle-dark">
                  2 Adults
                </h3>
              </div>

            </div>

            <div className="flex gap-4">

              <MapPin className="mt-1 text-sage" />

              <div>
                <p className="text-sm text-jungle/60">
                  Location
                </p>

                <h3 className="mt-1 font-semibold text-jungle-dark">
                  Kitulgala, Sri Lanka
                </h3>
              </div>

            </div>

          </div>

          <div className="mt-8 flex flex-wrap gap-4">

            <button className="rounded-full bg-jungle-dark px-6 py-3 font-semibold text-white transition hover:bg-jungle">
              Modify Booking
            </button>

            <button className="rounded-full border border-jungle-dark px-6 py-3 font-semibold text-jungle-dark transition hover:bg-jungle-dark hover:text-white">
              Download Invoice
            </button>

          </div>

        </div>

      </div>

      {/* Summary Card */}
      <div className="rounded-[30px] border border-sand bg-white p-8 shadow-sm">

        <p className="font-outfit text-sm uppercase tracking-[2px] text-sage">
          Booking Summary
        </p>

        <h2 className="mt-3 font-lora text-3xl text-jungle-dark">
          Reservation
        </h2>

        <div className="mt-8 space-y-6">

          <div className="flex justify-between">
            <span className="text-jungle/60">
              Booking ID
            </span>

            <span className="font-semibold">
              RN-240531
            </span>
          </div>

          <div className="flex justify-between">
            <span className="text-jungle/60">
              Nights
            </span>

            <span className="font-semibold">
              3
            </span>
          </div>

          <div className="flex justify-between">
            <span className="text-jungle/60">
              Guests
            </span>

            <span className="font-semibold">
              2
            </span>
          </div>

          <div className="flex justify-between">
            <span className="text-jungle/60">
              Payment
            </span>

            <span className="font-semibold text-green-700">
              Paid
            </span>
          </div>

          <div className="border-t border-sand pt-6">

            <div className="flex justify-between">

              <span className="text-jungle/60">
                Total
              </span>

              <span className="font-lora text-3xl text-jungle-dark">
                $540
              </span>

            </div>

          </div>

        </div>

        <button className="mt-8 flex w-full items-center justify-center gap-3 rounded-full bg-sage py-3 font-semibold text-jungle-dark transition hover:bg-sage/90">

          <CreditCard size={18} />

          Payment Details

          <ArrowRight size={18} />

        </button>

      </div>

    </section>
  );
}