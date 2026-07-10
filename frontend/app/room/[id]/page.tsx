import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { mockRooms } from "@/app/search-results/mockRooms";
import { RoomHero } from "@/app/room/RoomHero";
import { AmenityList } from "@/app/room/AmenityList";
import { formatOccupancy } from "@/app/room/formatOccupancy";
import { BookNowButton } from "@/app/room/BookNowButton";

function parseDateParam(value: string | string[] | undefined): string {
  return typeof value === "string" ? value : "";
}

function parseGuestsParam(value: string | string[] | undefined): string {
  return typeof value === "string" ? value : "";
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const room = mockRooms.find(r => r.id === id);
  return {
    title: room ? `${room.title} — River Nest Eco Villa` : "Room not found — River Nest Eco Villa",
  };
}

export default async function RoomDetailsPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const { id } = await params;
  const room = mockRooms.find(r => r.id === id);

  if (!room) {
    notFound();
  }

  const query = await searchParams;
  const checkIn = parseDateParam(query.checkIn);
  const checkOut = parseDateParam(query.checkOut);
  const guests = parseGuestsParam(query.guests);

  const backToResultsHref = `/search-results?checkIn=${encodeURIComponent(checkIn)}&checkOut=${encodeURIComponent(checkOut)}&guests=${encodeURIComponent(guests)}`;

  return (
    <>
      <Navbar />
      <div className="pt-16">
        <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
          <Link
            href={backToResultsHref}
            className="mb-6 inline-flex items-center gap-1 font-outfit text-meta text-jungle transition-opacity hover:opacity-70"
          >
            &larr; Back to Results
          </Link>

          <RoomHero src={room.heroImageUrl} alt={room.title} />

          <div className="mt-8 flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
            <div className="flex flex-1 flex-col gap-4">
              <h1 className="font-lora text-heading-sm font-medium text-jungle-dark sm:text-heading-md">
                {room.title}
              </h1>
              <p className="font-outfit text-[13px] text-jungle/50">
                {formatOccupancy(room.maxOccupancy)}
              </p>
              <p className="font-outfit text-field text-jungle/70">
                {room.fullDescription || "No description available"}
              </p>
              <AmenityList amenities={room.amenities} />
            </div>

            <div className="flex shrink-0 flex-col items-end gap-3">
              <p className="whitespace-nowrap font-outfit text-heading-sm font-semibold text-jungle-dark">
                ${room.pricePerNight}{" "}
                <span className="text-[13px] font-normal text-jungle/50">/ night</span>
              </p>
              <BookNowButton
                roomId={room.id}
                checkIn={checkIn}
                checkOut={checkOut}
                price={room.pricePerNight}
              />
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
