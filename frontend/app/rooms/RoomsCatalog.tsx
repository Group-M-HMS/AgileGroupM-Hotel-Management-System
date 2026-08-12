"use client";

// Rooms catalog grid (NIBM2-535) + room details modal (NIBM2-536).
import { useEffect, useState } from "react";
import Link from "next/link";
import { Users, Ruler, BedDouble, X, CalendarCheck } from "lucide-react";
import { catalogRooms, type CatalogRoom } from "./rooms-catalog";
import { RoomCard } from "./RoomCard";
import { RoomGalleryCompact } from "./RoomGalleryCompact";

export default function RoomsCatalog() {
  const [selected, setSelected] = useState<CatalogRoom | null>(null);

  useEffect(() => {
    if (!selected) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setSelected(null);
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [selected]);

  return (
    <>
      <div className="grid gap-8 lg:grid-cols-2">
        {catalogRooms.map((room) => (
          <RoomCard key={room.id} room={room} onView={() => setSelected(room)} />
        ))}
      </div>

      {selected && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="room-modal-title"
          onClick={() => setSelected(null)}
          className="fixed inset-0 z-[60] flex items-center justify-center bg-jungle-dark/60 p-4 backdrop-blur-sm"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative max-h-[90vh] w-full max-w-4xl overflow-hidden rounded-[28px] bg-white shadow-soft-lg"
          >
            <button
              type="button"
              onClick={() => setSelected(null)}
              aria-label="Close details"
              className="absolute right-4 top-4 z-20 flex h-10 w-10 items-center justify-center rounded-full bg-white/80 text-jungle-dark backdrop-blur-md transition hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sage"
            >
              <X size={20} />
            </button>

            <div className="grid w-full sm:grid-cols-2">
              <RoomGalleryCompact
                images={selected.images}
                alt={selected.title}
                heightClass="h-52 sm:h-full"
              />

              <div className="flex flex-col p-6 sm:p-8">
                <p className="pr-10 font-jakarta text-[12px] font-medium uppercase tracking-[3px] text-sage">
                  {selected.tagline}
                </p>
                <h2
                  id="room-modal-title"
                  className="mt-1 pr-10 font-fraunces text-[26px] leading-tight text-jungle-dark"
                >
                  {selected.title}
                </h2>

                <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 font-jakarta text-[13.5px] text-jungle/70">
                  <span className="inline-flex items-center gap-1.5">
                    <Users size={16} className="text-sage" />
                    Up to {selected.maxOccupancy} guests
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <Ruler size={16} className="text-sage" />
                    {selected.sizeSqm} m²
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <BedDouble size={16} className="text-sage" />
                    {selected.bedType}
                  </span>
                </div>

                <p className="mt-4 font-jakarta text-[14.5px] leading-[26px] text-jungle/75">
                  {selected.description}
                </p>

                <div className="mt-4 flex flex-wrap gap-2">
                  {selected.amenities.map((amenity) => (
                    <span
                      key={amenity}
                      className="rounded-full border border-sand bg-sand-light px-3 py-1 font-jakarta text-[12px] font-medium text-jungle"
                    >
                      {amenity}
                    </span>
                  ))}
                </div>

                <div className="mt-auto flex items-center justify-between gap-4 pt-6">
                  <p className="font-fraunces text-[24px] leading-none text-jungle-dark">
                    ${selected.pricePerNight}
                    <span className="font-jakarta text-[12px] font-normal text-jungle/55">
                      {" "}
                      / night
                    </span>
                  </p>
                  <Link
                    href="/#search-stay"
                    className="inline-flex items-center justify-center gap-2 rounded-full bg-primary px-6 py-3 font-jakarta text-[14px] font-semibold text-sand-light transition hover:opacity-90"
                  >
                    <CalendarCheck size={17} />
                    Check availability
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
