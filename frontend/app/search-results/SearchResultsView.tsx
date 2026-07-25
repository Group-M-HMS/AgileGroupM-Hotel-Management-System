"use client";

import { useEffect, useMemo, useState } from "react";
import type { Room } from "./mockRooms";
import { ResultsLoadingSkeleton } from "./ResultsLoadingSkeleton";
import { RoomResultsList } from "./RoomResultsList";
import { EmptyResultsState } from "./EmptyResultsState";
import { SortFilterBar, type SortOption } from "./SortFilterBar";

type Status = "loading" | "success" | "empty" | "timeout" | "error";

const TIMEOUT_MS = 10_000;
const ROOM_SERVICE_URL = process.env.NEXT_PUBLIC_ROOM_SERVICE_URL ?? "http://localhost:8081";

// Fields the search endpoint still doesn't return (full room-detail lookup owns these);
// filled with safe defaults so RoomResultsList/SortFilterBar don't crash.
// `id` comes back as a numeric Long from the backend; coerced to string to match
// the Room type and the string-keyed lookups used throughout the frontend.
function toRoom(apiRoom: {
  id: number;
  title: string;
  thumbnailUrl: string;
  shortDescription: string;
  pricePerNight: number;
  maxOccupancy: number;
  topAmenities: string[];
}): Room {
  return {
    ...apiRoom,
    id: String(apiRoom.id),
    galleryImages: [],
    sizeSqm: 0,
    bedType: { count: 0, type: "" },
    fullDescription: "",
    amenities: {},
    rating: 0,
    reviewCount: 0,
  };
}

async function fetchAvailableRooms(checkIn: string, checkOut: string, guests: number): Promise<Room[]> {
  const params = new URLSearchParams({ checkIn, checkOut, guests: String(guests) });
  const response = await fetch(`${ROOM_SERVICE_URL}/api/rooms/search?${params}`);

  if (!response.ok) {
    throw new Error(`Room search failed with status ${response.status}`);
  }

  const apiRooms = await response.json();
  return apiRooms.map(toRoom);
}

export function SearchResultsView({
  guests,
  checkIn,
  checkOut,
}: {
  guests: number;
  checkIn: string;
  checkOut: string;
}) {
  const [status, setStatus] = useState<Status>("loading");
  const [rooms, setRooms] = useState<Room[]>([]);
  const [sortBy, setSortBy] = useState<SortOption>("recommended");
  const [selectedAmenities, setSelectedAmenities] = useState<Set<string>>(new Set());

  const availableAmenities = useMemo(() => {
    const unique = new Set<string>();
    rooms.forEach(room => room.topAmenities.forEach(amenity => unique.add(amenity)));
    return Array.from(unique);
  }, [rooms]);

  const visibleRooms = useMemo(() => {
    const filtered =
      selectedAmenities.size === 0
        ? rooms
        : rooms.filter(room =>
            Array.from(selectedAmenities).every(amenity => room.topAmenities.includes(amenity))
          );

    if (sortBy === "price-asc") {
      return [...filtered].sort((a, b) => a.pricePerNight - b.pricePerNight);
    }
    if (sortBy === "price-desc") {
      return [...filtered].sort((a, b) => b.pricePerNight - a.pricePerNight);
    }
    return filtered;
  }, [rooms, selectedAmenities, sortBy]);

  function toggleAmenity(amenity: string) {
    setSelectedAmenities(prev => {
      const next = new Set(prev);
      if (next.has(amenity)) {
        next.delete(amenity);
      } else {
        next.add(amenity);
      }
      return next;
    });
  }

  useEffect(() => {
    let cancelled = false;

    const timeoutId = setTimeout(() => {
      if (!cancelled) setStatus("timeout");
    }, TIMEOUT_MS);

    fetchAvailableRooms(checkIn, checkOut, guests)
      .then(result => {
        if (cancelled) return;
        clearTimeout(timeoutId);
        setRooms(result);
        setStatus(result.length > 0 ? "success" : "empty");
      })
      .catch(() => {
        if (cancelled) return;
        clearTimeout(timeoutId);
        setStatus("error");
      });

    return () => {
      cancelled = true;
      clearTimeout(timeoutId);
    };
  }, [checkIn, checkOut, guests]);

  if (status === "loading") return <ResultsLoadingSkeleton />;

  if (status === "timeout") {
    return (
      <div className="flex w-full flex-col items-center gap-4 rounded-3xl bg-white px-6 py-16 text-center shadow-soft">
        <h2 className="font-lora text-[24px] font-medium text-jungle-dark">
          This is taking longer than expected
        </h2>
        <p className="max-w-md font-outfit text-field text-jungle/70">
          Please try your search again in a moment.
        </p>
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="flex w-full flex-col items-center gap-4 rounded-3xl bg-white px-6 py-16 text-center shadow-soft">
        <h2 className="font-lora text-[24px] font-medium text-jungle-dark">
          Something went wrong
        </h2>
        <p className="max-w-md font-outfit text-field text-jungle/70">
          We couldn&apos;t load rooms right now. Please try your search again.
        </p>
      </div>
    );
  }

  if (status === "empty") {
    return <EmptyResultsState checkIn={checkIn} checkOut={checkOut} guests={guests} />;
  }

  return (
    <div className="flex w-full flex-col">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <h1 className="font-lora text-[24px] font-medium text-jungle-dark sm:text-[28px]">
          We found {rooms.length} {rooms.length === 1 ? "room" : "rooms"} for you
        </h1>

        <SortFilterBar
          sortBy={sortBy}
          onSortChange={setSortBy}
          availableAmenities={availableAmenities}
          selectedAmenities={selectedAmenities}
          onToggleAmenity={toggleAmenity}
        />
      </div>

      {visibleRooms.length === 0 ? (
        <div className="flex w-full flex-col items-center gap-2 rounded-3xl bg-white px-6 py-16 text-center shadow-soft">
          <h2 className="font-lora text-[24px] font-medium text-jungle-dark">
            No rooms match those filters
          </h2>
          <p className="max-w-md font-outfit text-field text-jungle/70">
            Try removing a filter to see more rooms.
          </p>
        </div>
      ) : (
        <RoomResultsList rooms={visibleRooms} checkIn={checkIn} checkOut={checkOut} guests={guests} />
      )}
    </div>
  );
}
