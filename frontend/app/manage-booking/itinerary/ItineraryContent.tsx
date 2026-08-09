"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/lib/AuthContext";
import { fetchBookingDetail, type BookingDetail } from "@/lib/bookings";
import { AmenityIcon } from "@/app/room/amenityIcons";
import { formatDate } from "../../checkout/formatDate";
import { CancelBookingControl } from "./CancelBookingControl";
import { GuestDetails } from "./GuestDetails";
import { PrintButton } from "./PrintButton";
import { RoomThumbnail } from "./RoomThumbnail";
import { SectionHeading } from "./SectionHeading";

const ROOM_SERVICE_URL =
  process.env.NEXT_PUBLIC_ROOM_SERVICE_URL ?? "http://168.138.170.92:8081";

type RoomSummary = { thumbnail: string | null; amenities: string[] };

async function fetchRoomSummary(roomId: number): Promise<RoomSummary | null> {
  try {
    const response = await fetch(`${ROOM_SERVICE_URL}/api/rooms/${roomId}`);
    if (!response.ok) return null;
    const room = await response.json();
    return {
      thumbnail: room.images?.[0] ?? null,
      amenities: room.amenities ?? [],
    };
  } catch {
    return null;
  }
}

function nightsBetween(checkIn: string, checkOut: string): number {
  const start = new Date(`${checkIn}T00:00:00`);
  const end = new Date(`${checkOut}T00:00:00`);
  const diff = Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
  return diff > 0 ? diff : 1;
}

function formatMoney(value: number): string {
  return value.toLocaleString("en-US", { style: "currency", currency: "USD" });
}

export function ItineraryContent() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const searchParams = useSearchParams();
  const id = searchParams.get("id") ?? "";

  const [booking, setBooking] = useState<BookingDetail | null>(null);
  const [room, setRoom] = useState<RoomSummary | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Redirect to login if signed out (same guard as the dashboard).
  useEffect(() => {
    if (!loading && !user) {
      router.replace("/login");
    }
  }, [loading, user, router]);

  useEffect(() => {
    if (!user || !id) return;
    let cancelled = false;
    fetchBookingDetail(id)
      .then(async detail => {
        if (cancelled) return;
        setBooking(detail);
        const summary = await fetchRoomSummary(detail.roomId);
        if (!cancelled) setRoom(summary);
      })
      .catch(() => {
        if (!cancelled) setError("We couldn't find this booking. It may not exist or isn't yours.");
      });
    return () => {
      cancelled = true;
    };
  }, [user, id]);

  const backLink = (
    <Link
      href="/dashboard"
      className="no-print mb-6 inline-flex items-center gap-1 font-outfit text-meta text-jungle transition-opacity hover:opacity-70"
    >
      <span className="material-symbols-outlined" style={{ fontSize: "18px" }} aria-hidden="true">
        arrow_back
      </span>
      Back to My Bookings
    </Link>
  );

  // Missing/blank ?id — derived from the URL, so handled in render (not the effect).
  const pageError = !id ? "This link is missing a booking reference." : error;

  if (pageError) {
    return (
      <>
        {backLink}
        <p className="rounded-3xl border border-red-200 bg-red-50 p-8 text-center font-outfit text-red-600 shadow-soft">
          {pageError}
        </p>
      </>
    );
  }

  if (loading || !user || !booking) {
    return (
      <>
        {backLink}
        <p className="rounded-3xl border border-sand bg-white p-8 text-center font-outfit text-jungle/60 shadow-soft">
          Loading your itinerary...
        </p>
      </>
    );
  }

  const nights = nightsBetween(booking.checkIn, booking.checkOut);
  const roomDetailsHref = `/room/${booking.roomId}?checkIn=${encodeURIComponent(booking.checkIn)}&checkOut=${encodeURIComponent(booking.checkOut)}&guests=${encodeURIComponent(String(booking.guests))}`;

  return (
    <>
      {backLink}

      {/* NIBM2-302 / NIBM2-303 — room, status, and booking reference */}
      <div className="flex items-start gap-4">
        {room?.thumbnail && <RoomThumbnail src={room.thumbnail} alt={booking.roomName} />}
        <div className="flex flex-1 flex-col gap-2">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="font-lora text-heading-sm font-normal text-jungle-dark sm:text-[32px]">
              {booking.roomName || "Room details unavailable"}
            </h1>
            <CancelBookingControl bookingId={booking.bookingId} initialStatus={booking.status} />
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
          {booking.bookingReference ? (
            <>
              Reference: <span className="font-semibold text-jungle-dark">{booking.bookingReference}</span>
            </>
          ) : (
            <>
              Booking ID: <span className="font-semibold text-jungle-dark">#{booking.bookingId}</span>
            </>
          )}
        </p>
        <Link
          href={roomDetailsHref}
          className="no-print inline-flex w-fit items-center gap-1 font-outfit text-meta font-semibold text-jungle-dark hover:underline"
        >
          View Room Details
          <span className="material-symbols-outlined" style={{ fontSize: "16px" }} aria-hidden="true">
            arrow_forward
          </span>
        </Link>
      </div>

      {/* Single booking-document card: stay details, payment, guest details */}
      <div className="mt-6 flex flex-col gap-6 rounded-3xl border border-sand bg-white p-6 shadow-soft sm:p-8">
        {/* NIBM2-302 — reservation summary: dates, guests */}
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
              <span>Nights</span>
              <span className="font-medium text-jungle-dark">{nights}</span>
            </div>
            <div className="flex items-center justify-between gap-2 sm:flex-col sm:items-start">
              <span>Guests</span>
              <span className="font-medium text-jungle-dark">{booking.guests}</span>
            </div>
          </div>
        </div>

        {/* Payment: booking-service stores the total only (no per-line breakdown). */}
        <div className="flex flex-col gap-3 border-t border-dashed border-sand pt-6">
          <SectionHeading icon="payments">Payment</SectionHeading>
          <div className="flex flex-col gap-2 font-outfit text-[14px] text-jungle/80">
            <div className="flex items-center justify-between">
              <span>Payment status</span>
              <span className="font-medium text-jungle-dark">{booking.paymentStatus}</span>
            </div>
            <div className="flex items-center justify-between border-t border-sand pt-2 font-semibold text-jungle-dark">
              <span>Total{booking.paymentStatus === "PAID" ? " paid" : ""}</span>
              <span>{formatMoney(booking.total)}</span>
            </div>
          </div>
        </div>

        {/* NIBM2-382 — contact details (from the signed-in account) + special requests */}
        <div className="border-t border-dashed border-sand pt-6">
          <GuestDetails
            firstName={user?.firstName ?? ""}
            lastName={user?.lastName ?? ""}
            email={user?.email ?? ""}
            phone={user?.phone ?? ""}
            specialRequests={booking.specialRequests}
          />
        </div>

        {/* NIBM2-304 — print option */}
        <div className="border-t border-dashed border-sand pt-6">
          <PrintButton />
        </div>
      </div>
    </>
  );
}
