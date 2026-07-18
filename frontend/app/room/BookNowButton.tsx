"use client";

import Link from "next/link";

export function BookNowButton({
  roomId,
  checkIn,
  checkOut,
  price,
}: {
  roomId: string;
  checkIn: string;
  checkOut: string;
  price: number;
}) {
  const missingDates = !checkIn || !checkOut;

  if (missingDates) {
    return (
      <div className="flex flex-col items-stretch gap-1">
        <button
          type="button"
          disabled
          className="block w-full rounded-btn bg-jungle-dark px-6 py-2.5 font-outfit text-[16px] font-semibold text-sand-light opacity-40"
        >
          Book Now
        </button>
        <p className="text-center font-outfit text-[13px] text-jungle/50">
          Select check-in and check-out dates from search before booking.
        </p>
      </div>
    );
  }

  const checkoutHref = `/checkout?roomId=${encodeURIComponent(roomId)}&checkIn=${encodeURIComponent(checkIn)}&checkOut=${encodeURIComponent(checkOut)}&price=${price}`;

  return (
    <Link
      href={checkoutHref}
      className="block w-full rounded-btn bg-jungle-dark px-6 py-2.5 text-center font-outfit text-[16px] font-semibold text-sand-light transition-opacity hover:opacity-90"
    >
      Book Now
    </Link>
  );
}
