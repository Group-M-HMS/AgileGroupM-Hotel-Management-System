"use client";

import { useEffect, useState } from "react";
import { mockRooms, type Room } from "./mockRooms";
import { ResultsLoadingSkeleton } from "./ResultsLoadingSkeleton";
import { RoomResultsList } from "./RoomResultsList";
import { EmptyResultsState } from "./EmptyResultsState";

type Status = "loading" | "success" | "empty" | "timeout";

const FETCH_DELAY_MS = 700;
const TIMEOUT_MS = 10_000;

// TODO: replace with a real call to GET /rooms/search once NIBM2-199 ships.
function fetchAvailableRooms(guests: number): Promise<Room[]> {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve(mockRooms.filter(room => room.maxOccupancy >= guests));
    }, FETCH_DELAY_MS);
  });
}

export function SearchResultsView({ guests }: { guests: number }) {
  const [status, setStatus] = useState<Status>("loading");
  const [rooms, setRooms] = useState<Room[]>([]);

  useEffect(() => {
    let cancelled = false;

    const timeoutId = setTimeout(() => {
      if (!cancelled) setStatus("timeout");
    }, TIMEOUT_MS);

    fetchAvailableRooms(guests).then(result => {
      if (cancelled) return;
      clearTimeout(timeoutId);
      setRooms(result);
      setStatus(result.length > 0 ? "success" : "empty");
    });

    return () => {
      cancelled = true;
      clearTimeout(timeoutId);
    };
  }, [guests]);

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

  if (status === "empty") return <EmptyResultsState />;

  return <RoomResultsList rooms={rooms} />;
}
