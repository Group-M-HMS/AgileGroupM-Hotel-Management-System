import type { Metadata } from "next";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";

const ROOM_SERVICE_URL =
  process.env.NEXT_PUBLIC_ROOM_SERVICE_URL ?? "http://168.138.170.92:8081";

export const metadata: Metadata = {
  title: "Booking Confirmed — River Nest Eco Villa",
};

function parseParam(value: string | string[] | undefined): string {
  return typeof value === "string" ? value : "";
}

async function fetchRoomTitle(roomId: string): Promise<string | null> {
  if (!roomId) return null;
  try {
    const response = await fetch(`${ROOM_SERVICE_URL}/api/rooms/${roomId}`);
    if (!response.ok) return null;
    const room = await response.json();
    return room.name ?? null;
  } catch {
    return null;
  }
}

function formatDate(iso: string): string {
  if (!iso) return "";
  const date = new Date(`${iso}T00:00:00`);
  if (Number.isNaN(date.getTime())) return iso;
  return date.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function formatMoney(value: string): string {
  const n = Number(value);
  if (!value || Number.isNaN(n)) return "";
  return n.toLocaleString("en-US", { style: "currency", currency: "USD" });
}

export default async function BookingSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const query = await searchParams;
  const reference = parseParam(query.ref);
  const roomId = parseParam(query.roomId);
  const checkIn = parseParam(query.checkIn);
  const checkOut = parseParam(query.checkOut);
  const guests = parseParam(query.guests);
  const total = parseParam(query.total);

  const roomTitle = (await fetchRoomTitle(roomId)) ?? "Your stay";

  return (
    <>
      <Navbar />
      <div className="bg-sand-light pt-16">
        <div className="mx-auto flex max-w-2xl flex-col items-center px-page-x py-16 lg:px-page-x-lg">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-sage/15">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-8 w-8 text-sage"
              aria-hidden="true"
            >
              <path d="M20 6 9 17l-5-5" />
            </svg>
          </div>

          <h1 className="mt-6 text-center font-fraunces text-3xl text-jungle">
            Booking Confirmed
          </h1>
          <p className="mt-2 text-center font-jakarta text-field text-jungle/70">
            Thank you — your reservation is all set. A confirmation has been
            recorded on your account.
          </p>

          {reference ? (
            <div className="mt-8 w-full rounded-xl border-2 border-sage/30 bg-white px-6 py-5 text-center">
              <p className="font-jakarta text-xs uppercase tracking-wide text-jungle/50">
                Booking Reference
              </p>
              <p className="mt-1 font-fraunces text-2xl tracking-wide text-jungle">
                {reference}
              </p>
            </div>
          ) : null}

          <div className="mt-6 w-full rounded-xl border-2 border-sand bg-white px-6 py-5">
            <h2 className="font-jakarta text-sm font-semibold text-jungle">
              Stay details
            </h2>
            <dl className="mt-4 space-y-3 font-jakarta text-field text-jungle/80">
              <div className="flex justify-between gap-4">
                <dt className="text-jungle/60">Room</dt>
                <dd className="text-right">{roomTitle}</dd>
              </div>
              {checkIn ? (
                <div className="flex justify-between gap-4">
                  <dt className="text-jungle/60">Check-in</dt>
                  <dd className="text-right">{formatDate(checkIn)}</dd>
                </div>
              ) : null}
              {checkOut ? (
                <div className="flex justify-between gap-4">
                  <dt className="text-jungle/60">Check-out</dt>
                  <dd className="text-right">{formatDate(checkOut)}</dd>
                </div>
              ) : null}
              {guests ? (
                <div className="flex justify-between gap-4">
                  <dt className="text-jungle/60">Guests</dt>
                  <dd className="text-right">{guests}</dd>
                </div>
              ) : null}
              {formatMoney(total) ? (
                <div className="flex justify-between gap-4 border-t border-sand pt-3">
                  <dt className="font-semibold text-jungle">Total paid</dt>
                  <dd className="text-right font-semibold text-jungle">
                    {formatMoney(total)}
                  </dd>
                </div>
              ) : null}
            </dl>
          </div>

          <div className="mt-8 flex w-full flex-col gap-3 sm:flex-row sm:justify-center">
            <Link
              href="/bookings"
              className="btn-primary text-center sm:px-8"
            >
              View My Bookings
            </Link>
            <Link
              href="/"
              className="rounded-md border-2 border-sand px-6 py-3 text-center font-jakarta text-sm text-jungle transition-colors hover:border-sage"
            >
              Back to Home
            </Link>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
