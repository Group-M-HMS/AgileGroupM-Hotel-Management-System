"use client";

import {
  CalendarDays,
  Users,
  BedDouble,
  Receipt,
  CheckCircle2,
} from "lucide-react";

export default function PaymentSummary() {
  // Later these values will come from props, context or backend
  const booking = {
    room: "River View Villa",
    checkIn: "25 Jul 2026",
    checkOut: "28 Jul 2026",
    guests: 2,
    nights: 3,
    roomRate: 120,
    taxes: 45,
  };

  const subtotal = booking.roomRate * booking.nights;
  const total = subtotal + booking.taxes;

  return (
    <aside className="lg:sticky lg:top-24 h-fit">

      <div className="overflow-hidden rounded-3xl border border-stone-200 bg-white shadow-sm">

        {/* Header */}

        <div className="bg-jungle-dark p-6">

          <p className="font-outfit text-xs uppercase tracking-[3px] text-sage">
            Booking Summary
          </p>

          <h2 className="mt-2 font-lora text-3xl text-white">
            Your Reservation
          </h2>

        </div>

        {/* Content */}

        <div className="space-y-6 p-6">

          {/* Room */}

          <div className="flex items-center gap-4">

            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-sage/10">
              <BedDouble
                size={22}
                className="text-jungle-dark"
              />
            </div>

            <div>
              <p className="font-outfit text-xs uppercase tracking-[2px] text-stone-500">
                Room
              </p>

              <h3 className="font-lora text-xl text-jungle-dark">
                {booking.room}
              </h3>
            </div>

          </div>

          <hr />

          {/* Dates */}

          <div className="flex items-start gap-4">

            <CalendarDays
              className="mt-1 text-sage"
              size={22}
            />

            <div className="space-y-2">

              <div className="flex justify-between gap-10">

                <span className="text-stone-600">
                  Check-In
                </span>

                <strong>{booking.checkIn}</strong>

              </div>

              <div className="flex justify-between gap-10">

                <span className="text-stone-600">
                  Check-Out
                </span>

                <strong>{booking.checkOut}</strong>

              </div>

              <div className="flex justify-between gap-10">

                <span className="text-stone-600">
                  Nights
                </span>

                <strong>{booking.nights}</strong>

              </div>

            </div>

          </div>

          <hr />

          {/* Guests */}

          <div className="flex items-center gap-4">

            <Users
              className="text-sage"
              size={22}
            />

            <div className="flex w-full justify-between">

              <span className="text-stone-600">
                Guests
              </span>

              <strong>
                {booking.guests}
              </strong>

            </div>

          </div>

          <hr />

          {/* Pricing */}

          <div>

            <div className="mb-4 flex items-center gap-3">

              <Receipt
                size={20}
                className="text-sage"
              />

              <h4 className="font-lora text-xl text-jungle-dark">
                Price Details
              </h4>

            </div>

            <div className="space-y-3">

              <div className="flex justify-between">

                <span className="text-stone-600">
                  £{booking.roomRate} × {booking.nights} nights
                </span>

                <span>
                  £{subtotal}
                </span>

              </div>

              <div className="flex justify-between">

                <span className="text-stone-600">
                  Taxes & Fees
                </span>

                <span>
                  £{booking.taxes}
                </span>

              </div>

            </div>

          </div>

          <hr />

          {/* Total */}

          <div className="flex items-center justify-between">

            <span className="font-lora text-2xl text-jungle-dark">
              Total
            </span>

            <span className="font-lora text-3xl text-sage">
              £{total}
            </span>

          </div>

          {/* Secure */}

          <div className="rounded-2xl bg-sage/10 p-5">

            <div className="flex items-start gap-3">

              <CheckCircle2
                className="mt-1 text-sage"
                size={22}
              />

              <div>

                <h4 className="font-semibold text-jungle-dark">
                  Secure Booking
                </h4>

                <p className="mt-2 text-sm leading-6 text-stone-600">
                  Your reservation is protected with secure
                  payment processing and encrypted data
                  transmission.
                </p>

              </div>

            </div>

          </div>

        </div>

      </div>

    </aside>
  );
}