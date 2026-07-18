"use client";

import { useState } from "react";
import Link from "next/link";
import type { Room } from "./mockRooms";

const PAGE_SIZE = 6;

const AMENITY_ICONS: Record<string, string> = {
  "Free Wi-Fi": "wifi",
  "Air Conditioning": "ac_unit",
  "Garden View": "yard",
  "River View": "water",
  Minibar: "local_bar",
  "Private Balcony": "balcony",
  "Two Bedrooms": "bed",
  "Waterfall View": "water_drop",
  "Meditation Corner": "self_improvement",
  "Forest View": "forest",
  "Sunrise View": "wb_twilight",
  "Living Area": "weekend",
  "Valley View": "landscape",
};

function AmenityIcon({ name }: { name: string }) {
  const icon = AMENITY_ICONS[name] ?? "check_circle";
  return (
    <span
      className="material-symbols-outlined text-jungle/50"
      style={{ fontSize: "14px" }}
      aria-hidden="true"
    >
      {icon}
    </span>
  );
}

function RoomThumbnail({ room }: { room: Room }) {
  const [failed, setFailed] = useState(false);

  if (failed) {
    return (
      <div className="flex h-28 w-40 shrink-0 items-center justify-center rounded-2xl bg-sand font-outfit text-error text-jungle/50">
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
      className="h-full min-h-32 w-36 shrink-0 self-stretch rounded-2xl object-cover sm:w-44"
    />
  );
}

function RoomCard({ room }: { room: Room }) {
  return (
    <div className="flex w-full gap-4 rounded-3xl bg-white p-4 shadow-soft transition-shadow hover:shadow-soft-lg">
      <RoomThumbnail room={room} />
      <div className="flex flex-1 flex-col justify-center gap-2">
        <h3 className="font-lora text-[20px] font-medium text-jungle-dark">
          {room.title}
        </h3>
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
          <span className="flex items-center gap-1 font-outfit text-[12px] text-jungle/50">
            <span
              className="material-symbols-outlined text-jungle/50"
              style={{ fontSize: "14px" }}
              aria-hidden="true"
            >
              group
            </span>
            {room.maxOccupancy} Guests
          </span>
          {room.topAmenities.map(amenity => (
            <span
              key={amenity}
              className="flex items-center gap-1 font-outfit text-[12px] text-jungle/50"
            >
              <AmenityIcon name={amenity} />
              {amenity}
            </span>
          ))}
        </div>
        <p className="font-outfit text-meta text-jungle/70">
          {room.shortDescription}
        </p>
      </div>
      <div className="flex shrink-0 flex-col items-end justify-center gap-2">
        <p className="whitespace-nowrap font-outfit text-field font-semibold text-jungle-dark">
          ${room.pricePerNight}{" "}
          <span className="text-[12px] font-normal text-jungle/50">/ night</span>
        </p>
        <Link
          href={`/room/${room.id}`}
          className="whitespace-nowrap rounded-btn bg-jungle-dark px-6 py-2.5 font-outfit text-meta font-semibold text-sand-light transition-opacity hover:opacity-90"
        >
          Book Now
        </Link>
      </div>
    </div>
  );
}

export function RoomResultsList({ rooms }: { rooms: Room[] }) {
  const [page, setPage] = useState(1);
  const totalPages = Math.max(1, Math.ceil(rooms.length / PAGE_SIZE));
  const visibleRooms = rooms.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <div className="flex w-full flex-col gap-6">
      <div className="flex w-full flex-col gap-4">
        {visibleRooms.map(room => (
          <RoomCard key={room.id} room={room} />
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
