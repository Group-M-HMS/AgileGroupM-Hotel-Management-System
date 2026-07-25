import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { BookingSummaryHeader } from "./BookingSummaryHeader";
import { PriceBreakdown } from "./PriceBreakdown";
import { GuestInfoForm } from "./GuestInfoForm";

const ROOM_SERVICE_URL = process.env.NEXT_PUBLIC_ROOM_SERVICE_URL ?? "http://localhost:8081";
const PRICING_SERVICE_URL = process.env.NEXT_PUBLIC_PRICING_SERVICE_URL ?? "http://localhost:8083";

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

  return (
    <>
      <Navbar />
      <div className="bg-sand-light pt-16">
        <BookingSummaryHeader
          roomTitle={roomTitle}
          checkIn={checkIn}
          checkOut={checkOut}
          guests={guests}
        />
        <div className="mx-auto flex max-w-7xl flex-col gap-8 px-page-x pt-12 pb-24 lg:flex-row lg:items-start lg:justify-between lg:px-page-x-lg">
          <GuestInfoForm roomId={roomId} checkIn={checkIn} checkOut={checkOut} guests={guests} quote={quote} />
          {quote ? (
            <PriceBreakdown quote={quote} />
          ) : (
            <p className="font-outfit text-field text-jungle/60">
              We couldn&apos;t load pricing for this stay right now.
            </p>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
}
