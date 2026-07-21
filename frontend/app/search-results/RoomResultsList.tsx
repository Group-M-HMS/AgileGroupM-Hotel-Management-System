"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { Room } from "./mockRooms";
import { AmenityIcon } from "@/app/room/amenityIcons";

const PAGE_SIZE = 6;

function RoomThumbnail({ room }: { room: Room }) {
  const [failed, setFailed] = useState(false);

  if (failed) {
    return (
      <div className="flex h-full w-44 shrink-0 items-center justify-center rounded-2xl bg-sand font-outfit text-error text-jungle/50 sm:w-56">
        No image
      </div>
    );
  }

  // eslint-disable-next-line @next/next/no-img-element
  return (
    <img
      src={room.thumbnailUrl}
      alt={room.title}
      loading="lazy"
      onError={() => setFailed(true)}
      className="h-full w-44 shrink-0 self-stretch rounded-2xl object-cover sm:w-56"
    />
  );
}

function RoomCard({
  room,
  checkIn,
  checkOut,
  guests,
}: {
  room: Room;
  checkIn: string;
  checkOut: string;
  guests: number;
}) {
  const detailsHref = `/room/${room.id}?checkIn=${encodeURIComponent(checkIn)}&checkOut=${encodeURIComponent(checkOut)}&guests=${guests}`;

  return (
    <div className="flex h-36 w-full gap-6 rounded-3xl bg-white p-2 shadow-soft transition-shadow hover:shadow-soft-lg">
      <RoomThumbnail room={room} />
      <div className="flex flex-1 flex-col justify-between gap-2 overflow-hidden py-3">
        <h3 className="truncate font-lora text-[20px] font-medium text-jungle-dark">
          {room.title}
        </h3>
        <p className="line-clamp-2 font-outfit text-field text-jungle/70">
          {room.shortDescription}
        </p>
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 overflow-hidden">
          <span className="flex items-center gap-1 font-outfit text-meta text-jungle/50">
            <span
              className="material-symbols-outlined text-jungle/50"
              style={{ fontSize: "16px" }}
              aria-hidden="true"
            >
              group
            </span>
            {room.maxOccupancy} Guests
          </span>
          {room.topAmenities.map(amenity => (
            <span
              key={amenity}
              className="flex items-center gap-1 font-outfit text-meta text-jungle/50"
            >
              <AmenityIcon name={amenity} />
              {amenity}
            </span>
          ))}
        </div>
      </div>
      <div className="flex shrink-0 flex-col items-end justify-between gap-2 py-3 pr-3">
        <p className="whitespace-nowrap font-lora text-[26px] font-normal text-jungle-dark">
          ${room.pricePerNight}{" "}
          <span className="font-outfit text-meta font-normal text-jungle/50">/ night</span>
        </p>
        <Link
          href={detailsHref}
          className="whitespace-nowrap rounded-btn bg-jungle-dark px-6 py-2.5 font-outfit text-meta font-semibold text-sand-light transition-opacity hover:opacity-90"
        >
          Book Now
        </Link>
      </div>
    </div>
  );
}

export function RoomResultsList({
  rooms,
  checkIn,
  checkOut,
  guests,
}: {
  rooms: Room[];
  checkIn: string;
  checkOut: string;
  guests: number;
}) {
  const [page, setPage] = useState(1);
  const totalPages = Math.max(1, Math.ceil(rooms.length / PAGE_SIZE));
  const visibleRooms = rooms.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  useEffect(() => {
    setPage(1);
  }, [rooms]);

  return (
    <div className="flex w-full flex-col gap-6">
      <div className="flex w-full flex-col gap-4">
        {visibleRooms.map(room => (
          <RoomCard key={room.id} room={room} checkIn={checkIn} checkOut={checkOut} guests={guests} />
        ))}
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <button
            type="button"
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
            className="rounded-full px-4 py-2 font-outfit text-meta text-jungle-dark transition-opacity hover:opacity-70 disabled:opacity-30"
          >
            Prev
          </button>
          {Array.from({ length: totalPages }).map((_, i) => {
            const pageNumber = i + 1;
            return (
              <button
                key={pageNumber}
                type="button"
                onClick={() => setPage(pageNumber)}
                aria-current={page === pageNumber ? "page" : undefined}
                className={`h-9 w-9 rounded-full font-outfit text-meta transition-colors ${
                  page === pageNumber
                    ? "bg-jungle-dark text-sand-light"
                    : "text-jungle-dark hover:bg-sand"
                }`}
              >
                {pageNumber}
              </button>
            );
          })}
          <button
            type="button"
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="rounded-full px-4 py-2 font-outfit text-meta text-jungle-dark transition-opacity hover:opacity-70 disabled:opacity-30"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
