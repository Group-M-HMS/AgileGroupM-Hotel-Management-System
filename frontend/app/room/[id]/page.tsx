import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { RoomGallery } from "@/app/room/RoomGallery";
import { AmenityList } from "@/app/room/AmenityList";
import { BookingCard } from "@/app/room/BookingCard";

const ROOM_SERVICE_URL = process.env.NEXT_PUBLIC_ROOM_SERVICE_URL ?? "http://localhost:8081";

type RoomDetail = {
  id: number;
  name: string;
  description: string;
  maxOccupancy: number;
  sizeSqm: number;
  bedType: { count: number; type: string };
  rating: number | null;
  reviewCount: number | null;
  pricePerNight: number;
  images: string[];
  amenities: string[];
};

// Next.js dedupes identical fetch() calls within a single render, so calling
// this from both generateMetadata and the page component costs one request.
async function fetchRoomDetail(id: string): Promise<RoomDetail | null> {
  const response = await fetch(`${ROOM_SERVICE_URL}/api/rooms/${id}`);
  if (!response.ok) return null;
  return response.json();
}

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
  const room = await fetchRoomDetail(id);
  return {
    title: room ? `${room.name} — River Nest Eco Villa` : "Room not found — River Nest Eco Villa",
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
  const room = await fetchRoomDetail(id);

  if (!room) {
    notFound();
  }

  const amenities = Object.fromEntries(room.amenities.map(name => [name, true]));

  const query = await searchParams;
  const checkIn = parseDateParam(query.checkIn);
  const checkOut = parseDateParam(query.checkOut);
  const guests = parseGuestsParam(query.guests);

  const backToResultsHref = `/search-results?checkIn=${encodeURIComponent(checkIn)}&checkOut=${encodeURIComponent(checkOut)}&guests=${encodeURIComponent(guests)}`;

  return (
    <>
      <Navbar />
      <div className="bg-sand-light pt-16">
        <div className="mx-auto max-w-7xl px-page-x pt-12 pb-24 lg:px-page-x-lg">
          <Link
            href={backToResultsHref}
            className="mb-6 inline-flex items-center gap-1 font-outfit text-meta text-jungle transition-opacity hover:opacity-70"
          >
            <span
              className="material-symbols-outlined"
              style={{ fontSize: "18px" }}
              aria-hidden="true"
            >
              arrow_back
            </span>
            Back to Results
          </Link>

          <h1 className="font-lora text-heading-sm font-normal text-jungle-dark sm:text-heading-md">
            {room.name}
          </h1>

          <div className="mt-2 flex items-center gap-1.5">
            {room.rating !== null ? (
              <>
                <span
                  className="material-symbols-outlined text-amber-500"
                  style={{ fontSize: "20px", fontVariationSettings: "'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 20" }}
                  aria-hidden="true"
                >
                  star
                </span>
                <span className="font-outfit text-field font-semibold text-jungle-dark">
                  {room.rating.toFixed(1)}
                </span>
                <span className="font-outfit text-field text-jungle/60">
                  ({room.reviewCount} reviews)
                </span>
              </>
            ) : (
              <span className="font-outfit text-field text-jungle/60">No reviews yet</span>
            )}
          </div>

          <div className="mt-6">
            <RoomGallery images={room.images} alt={room.name} />
          </div>

          <div className="mt-12 flex flex-col gap-8 lg:flex-row lg:items-start lg:gap-16">
            <div className="flex flex-1 flex-col gap-4">
              <h2 className="font-lora text-[30px] font-normal text-jungle-dark">
                About the {room.name}
              </h2>
              <p className="font-outfit text-[16px] text-jungle/80">
                {room.description || "No description available"}
              </p>

              <h2 className="mt-2 font-lora text-[24px] font-normal text-jungle-dark">
                Facilities &amp; Amenities
              </h2>
              <AmenityList amenities={amenities} />
            </div>

            <div className="w-full shrink-0 lg:sticky lg:top-24 lg:w-[320px]">
              <BookingCard
                price={room.pricePerNight}
                maxOccupancy={room.maxOccupancy}
                sizeSqm={room.sizeSqm}
                bedType={room.bedType}
                roomId={String(room.id)}
                checkIn={checkIn}
                checkOut={checkOut}
                guests={guests}
              />
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
