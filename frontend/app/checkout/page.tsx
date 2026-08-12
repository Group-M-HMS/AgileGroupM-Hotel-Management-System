import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { StaySummaryCard } from "./BookingSummaryHeader";
import { GuestInfoForm } from "./GuestInfoForm";

const ROOM_SERVICE_URL = process.env.NEXT_PUBLIC_ROOM_SERVICE_URL ?? "http://168.138.170.92:8081";
const PRICING_SERVICE_URL = process.env.NEXT_PUBLIC_PRICING_SERVICE_URL ?? "http://168.138.170.92:8083";

type Quote = {
  nightlyRate: number;
  nights: number;
  subtotal: number;
  tax: number;
  total: number;
};

async function fetchRoomTitle(roomId: string): Promise<string | null> {
  const response = await fetch(`${ROOM_SERVICE_URL}/api/rooms/${roomId}`);
  if (!response.ok) return null;
  const room = await response.json();
  return room.name;
}

async function fetchQuote(roomId: string, checkIn: string, checkOut: string): Promise<Quote | null> {
  const response = await fetch(`${PRICING_SERVICE_URL}/api/pricing/quote`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ roomId: Number(roomId), checkIn, checkOut }),
  });
  if (!response.ok) return null;
  return response.json();
}

function parseParam(value: string | string[] | undefined): string {
  return typeof value === "string" ? value : "";
}

export const metadata: Metadata = {
  title: "Checkout — River Nest Eco Villa",
};

export default async function CheckoutPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const query = await searchParams;
  const roomId = parseParam(query.roomId);
  const checkIn = parseParam(query.checkIn);
  const checkOut = parseParam(query.checkOut);
  const guests = parseParam(query.guests);

  const roomTitle = await fetchRoomTitle(roomId);

  if (!roomTitle) {
    notFound();
  }

  const quote = await fetchQuote(roomId, checkIn, checkOut);

  const backToRoomHref = `/room/${encodeURIComponent(roomId)}?checkIn=${encodeURIComponent(
    checkIn
  )}&checkOut=${encodeURIComponent(checkOut)}&guests=${encodeURIComponent(guests)}`;

  return (
    <>
      <Navbar />
      <div className="bg-sand-light pt-16">
        <div className="mx-auto max-w-7xl px-page-x pt-8 pb-24 lg:px-page-x-lg">
          <Link
            href={backToRoomHref}
            className="mb-6 inline-flex items-center gap-1 font-jakarta text-meta text-jungle transition-opacity hover:opacity-70"
          >
            <span
              className="material-symbols-outlined"
              style={{ fontSize: "18px" }}
              aria-hidden="true"
            >
              arrow_back
            </span>
            Back to Room
          </Link>

          {/* Page header — mirrors the eyebrow + Fraunces heading used across
              the home, search-results, and room-details screens. */}
          <header className="mb-10">
            <p className="font-jakarta text-[12px] font-medium uppercase tracking-[3px] text-sage">
              Secure Checkout
            </p>
            <h1 className="mt-2 font-fraunces text-heading-sm font-normal text-jungle-dark sm:text-heading-md lg:text-heading-lg">
              Complete your booking
            </h1>
            <p className="mt-2 font-jakarta text-[15px] text-jungle/60">
              You&apos;re one step away from your rainforest escape. Just a few details to confirm your stay.
            </p>
          </header>

          {/* The form spans the whole two-column grid: guest details on the
              left, and a sticky column on the right holding the stay summary,
              price, and (now separate) payment card. Layout lives inside the
              client form so Stripe's CardElement and the submit handler share
              one <Elements> provider across columns. */}
          <GuestInfoForm
            roomId={roomId}
            checkIn={checkIn}
            checkOut={checkOut}
            guests={guests}
            quote={quote}
            summary={
              <StaySummaryCard
                roomTitle={roomTitle}
                checkIn={checkIn}
                checkOut={checkOut}
                guests={guests}
                quote={quote}
              />
            }
          />
        </div>
      </div>
      <Footer />
    </>
  );
}
