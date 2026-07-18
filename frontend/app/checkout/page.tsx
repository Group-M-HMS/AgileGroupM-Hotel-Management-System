import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { mockRooms, TAX_RATE } from "@/app/search-results/mockRooms";
import { BookingSummaryHeader } from "./BookingSummaryHeader";
import { PriceBreakdown } from "./PriceBreakdown";
import { nightsBetween } from "./nightsBetween";

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
  const room = mockRooms.find(r => r.id === roomId);

  if (!room) {
    notFound();
  }

  const checkIn = parseParam(query.checkIn);
  const checkOut = parseParam(query.checkOut);
  const guests = parseParam(query.guests);
  const nights = nightsBetween(checkIn, checkOut);

  return (
    <>
      <Navbar />
      <div className="bg-sand-light pt-16">
        <BookingSummaryHeader
          roomTitle={room.title}
          checkIn={checkIn}
          checkOut={checkOut}
          guests={guests}
        />
        <div className="mx-auto flex max-w-7xl flex-col gap-8 px-page-x pt-12 pb-24 lg:flex-row lg:items-start lg:justify-between lg:px-page-x-lg">
          <p className="font-outfit text-field text-jungle/60">
            Booking form coming soon.
          </p>
          <PriceBreakdown pricePerNight={room.pricePerNight} nights={nights} taxRate={TAX_RATE} />
        </div>
      </div>
      <Footer />
    </>
  );
}
