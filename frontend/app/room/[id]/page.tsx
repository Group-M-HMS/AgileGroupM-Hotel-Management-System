import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { mockRooms } from "@/app/search-results/mockRooms";
import { RoomGallery } from "@/app/room/RoomGallery";
import { AmenityList } from "@/app/room/AmenityList";
import { BookingCard } from "@/app/room/BookingCard";

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
            {room.title}
          </h1>

          <div className="mt-2 flex items-center gap-1.5">
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
          </div>

          <div className="mt-6">
            <RoomGallery images={room.galleryImages} alt={room.title} />
          </div>

          <div className="mt-12 flex flex-col gap-8 lg:flex-row lg:items-start lg:gap-16">
            <div className="flex flex-1 flex-col gap-4">
              <h2 className="font-lora text-[30px] font-normal text-jungle-dark">
                About the {room.title}
              </h2>
              <p className="font-outfit text-[16px] text-jungle/80">
                {room.fullDescription || "No description available"}
              </p>

              <h2 className="mt-2 font-lora text-[24px] font-normal text-jungle-dark">
                Facilities &amp; Amenities
              </h2>
              <AmenityList amenities={room.amenities} />
            </div>

            <div className="w-full shrink-0 lg:sticky lg:top-24 lg:w-[320px]">
              <BookingCard
                price={room.pricePerNight}
                maxAdults={room.maxAdults}
                maxChildren={room.maxChildren}
                sizeSqm={room.sizeSqm}
                bedType={room.bedType}
                roomId={room.id}
                checkIn={checkIn}
                checkOut={checkOut}
              />
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
