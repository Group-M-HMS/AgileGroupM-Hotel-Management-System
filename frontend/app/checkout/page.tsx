import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { mockRooms } from "@/app/search-results/mockRooms";
import { BookingSummaryHeader } from "./BookingSummaryHeader";

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
        <div className="mx-auto max-w-7xl px-page-x pt-12 pb-24 lg:px-page-x-lg">
          <p className="font-outfit text-field text-jungle/60">
            Booking form coming soon.
          </p>
        </div>
      </div>
      <Footer />
    </>
  );
}
