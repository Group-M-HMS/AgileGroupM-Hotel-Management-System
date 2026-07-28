import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { AmenityIcon } from "@/app/room/amenityIcons";
import { formatDate } from "../../checkout/formatDate";
import { findMockBooking } from "../mockBookings";
import { CancelBookingControl } from "./CancelBookingControl";
import { GuestDetails } from "./GuestDetails";
import { PrintButton } from "./PrintButton";
import { RoomThumbnail } from "./RoomThumbnail";
import { SectionHeading } from "./SectionHeading";

const ROOM_SERVICE_URL = process.env.NEXT_PUBLIC_ROOM_SERVICE_URL ?? "http://localhost:8081";

async function fetchRoomSummary(
  roomId: string
): Promise<{ name: string; thumbnail: string | null; amenities: string[] } | null> {
  try {
    const response = await fetch(`${ROOM_SERVICE_URL}/api/rooms/${roomId}`);
    if (!response.ok) return null;
    const room = await response.json();
    return {
      name: room.name,
      thumbnail: room.images?.[0] ?? null,
      amenities: room.amenities ?? [],
    };
  } catch {
    return null;
  }
}

function parseParam(value: string | string[] | undefined): string {
  return typeof value === "string" ? value : "";
}

function nightsBetween(checkIn: string, checkOut: string): number {
  const start = new Date(`${checkIn}T00:00:00`);
  const end = new Date(`${checkOut}T00:00:00`);
  const diff = Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
  return diff > 0 ? diff : 1;
}

export const metadata: Metadata = {
  title: "Your Itinerary — River Nest Eco Villa",
};

export default async function ItineraryPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const query = await searchParams;
  const email = parseParam(query.email);
  const reference = parseParam(query.reference);

  const booking = findMockBooking(email, reference);
  if (!booking) {
    notFound();
  }

  const room = await fetchRoomSummary(booking.roomId);
  const nights = nightsBetween(booking.checkIn, booking.checkOut);
  const nightlyRate = Math.round((booking.subtotal / nights) * 100) / 100;
  const taxRate = booking.subtotal > 0 ? booking.taxAmount / booking.subtotal : 0;
  const roomDetailsHref = `/room/${booking.roomId}?checkIn=${encodeURIComponent(booking.checkIn)}&checkOut=${encodeURIComponent(booking.checkOut)}&guests=${encodeURIComponent(booking.guests)}`;

  return (
    <>
      <div className="no-print">
        <Navbar />
      </div>
      <div className="bg-sand-light pt-16">
        <div className="mx-auto max-w-7xl px-page-x pt-12 pb-24 lg:px-page-x-lg">
        <div className="mx-auto max-w-3xl">
          <Link
            href="/manage-booking"
            className="no-print mb-6 inline-flex items-center gap-1 font-outfit text-meta text-jungle transition-opacity hover:opacity-70"
          >
            <span
              className="material-symbols-outlined"
              style={{ fontSize: "18px" }}
              aria-hidden="true"
            >
              arrow_back
            </span>
            Back to Manage Booking
          </Link>

          {/* NIBM2-302 / NIBM2-303 — room, status, and booking reference */}
          <div className="flex items-start gap-4">
            {room?.thumbnail && <RoomThumbnail src={room.thumbnail} alt={room.name} />}
            <div className="flex flex-1 flex-col gap-2">
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="font-lora text-heading-sm font-normal text-jungle-dark sm:text-[32px]">
                  {room?.name ?? "Room details unavailable"}
                </h1>
                <CancelBookingControl
                  email={booking.email}
                  bookingReference={booking.bookingReference}
                  initialStatus={booking.status}
                />
              </div>
              {room && room.amenities.length > 0 && (
                <div className="flex flex-wrap gap-x-4 gap-y-1">
                  {room.amenities.map(name => (
                    <span
                      key={name}
                      className="flex items-center gap-1 font-outfit text-[13px] text-jungle/70"
                    >
                      <AmenityIcon name={name} />
                      {name}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
            <p className="font-outfit text-meta text-jungle/60">
              Booking Reference: <span className="font-semibold text-jungle-dark">{booking.bookingReference}</span>
            </p>
            {room && (
              <Link
                href={roomDetailsHref}
                className="no-print inline-flex w-fit items-center gap-1 font-outfit text-meta font-semibold text-jungle-dark hover:underline"
              >
                View Room Details
                <span className="material-symbols-outlined" style={{ fontSize: "16px" }} aria-hidden="true">
                  arrow_forward
                </span>
              </Link>
            )}
          </div>

          {/* Single booking-document card: stay details, price breakdown, guest details */}
          <div className="mt-6 flex flex-col gap-6 rounded-3xl border border-sand bg-white p-6 shadow-soft sm:p-8">
            {/* NIBM2-302 — reservation summary: dates, guests, total cost */}
            <div className="flex flex-col gap-3">
              <SectionHeading icon="calendar_month">Stay Details</SectionHeading>
              <div className="flex flex-col gap-2 font-outfit text-[14px] text-jungle/80 sm:flex-row sm:justify-between">
                <div className="flex items-center justify-between gap-2 sm:flex-col sm:items-start">
                  <span>Check-In</span>
                  <span className="font-medium text-jungle-dark">{formatDate(booking.checkIn)}</span>
                </div>
                <div className="flex items-center justify-between gap-2 sm:flex-col sm:items-start">
                  <span>Check-Out</span>
                  <span className="font-medium text-jungle-dark">{formatDate(booking.checkOut)}</span>
                </div>
                <div className="flex items-center justify-between gap-2 sm:flex-col sm:items-start">
                  <span>Guests</span>
                  <span className="font-medium text-jungle-dark">{booking.guests}</span>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-3 border-t border-dashed border-sand pt-6">
              <SectionHeading icon="payments">Price Breakdown</SectionHeading>
              <div className="flex flex-col gap-2 font-outfit text-[14px] text-jungle/80">
                <div className="flex items-center justify-between">
                  <span>${nightlyRate} x {nights} night{nights === 1 ? "" : "s"}</span>
                  <span className="text-jungle-dark">${booking.subtotal.toFixed(2)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Tax ({Math.round(taxRate * 100)}%)</span>
                  <span className="text-jungle-dark">${booking.taxAmount.toFixed(2)}</span>
                </div>
                <div className="flex items-center justify-between border-t border-sand pt-2 font-semibold text-jungle-dark">
                  <span>Total</span>
                  <span>${booking.total.toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* NIBM2-382 — saved contact details + special requests */}
            <div className="border-t border-dashed border-sand pt-6">
              <GuestDetails
                firstName={booking.firstName}
                lastName={booking.lastName}
                email={booking.email}
                phone={booking.phone}
                specialRequests={booking.specialRequests}
              />
            </div>

            {/* NIBM2-304 — print option */}
            <div className="border-t border-dashed border-sand pt-6">
              <PrintButton />
            </div>
          </div>
        </div>
        </div>
      </div>
      <div className="no-print">
        <Footer />
      </div>
    </>
  );
}
