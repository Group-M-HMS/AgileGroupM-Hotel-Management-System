"use client";

import Link from "next/link";
import { CalendarCheck } from "lucide-react";

export function BookNowButton({
  roomId,
  checkIn,
  checkOut,
  guests,
  price,
}: {
  roomId: string;
  checkIn: string;
  checkOut: string;
  guests: string;
  price: number;
}) {
  const missingDates = !checkIn || !checkOut;

  if (missingDates) {
    return (
      <div className="flex flex-col items-stretch gap-1">
        <button
          type="button"
          disabled
          className="flex w-full items-center justify-center gap-2 rounded-btn bg-primary px-6 py-4 font-jakarta text-[16px] font-semibold text-sand-light opacity-40"
        >
          <CalendarCheck size={18} />
          Book Your Stay
        </button>
        <p className="text-center font-jakarta text-[13px] text-jungle/50">
          Select check-in and check-out dates from search before booking.
        </p>
      </div>
    );
  }

  const checkoutHref = `/checkout?roomId=${encodeURIComponent(roomId)}&checkIn=${encodeURIComponent(checkIn)}&checkOut=${encodeURIComponent(checkOut)}&guests=${encodeURIComponent(guests)}&price=${price}`;

  return (
    <Link
      href={checkoutHref}
      className="flex w-full items-center justify-center gap-2 rounded-btn bg-primary px-6 py-4 font-jakarta text-[16px] font-semibold text-sand-light transition-opacity hover:opacity-90"
    >
      <CalendarCheck size={18} />
      Book Your Stay
    </Link>
  );
}
