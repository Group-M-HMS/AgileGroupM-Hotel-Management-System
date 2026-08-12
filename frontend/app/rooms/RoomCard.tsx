// Room catalog card (NIBM2-535): image gallery, title, nightly rate, occupancy,
// size, bed type and amenity badges, with details + availability actions.
import Link from "next/link";
import { Users, Ruler, BedDouble } from "lucide-react";
import type { CatalogRoom } from "./rooms-catalog";
import { RoomGalleryCompact } from "./RoomGalleryCompact";

export function RoomCard({
  room,
  onView,
}: {
  room: CatalogRoom;
  onView: () => void;
}) {
  const { title, tagline, images, pricePerNight, maxOccupancy, sizeSqm, bedType, amenities } = room;

  return (
    <article
      id={room.id}
      className="flex scroll-mt-24 flex-col overflow-hidden rounded-[30px] border border-sand bg-white"
    >
      <div className="relative">
        <RoomGalleryCompact images={images} alt={title} heightClass="h-60" />
        <span className="absolute left-4 top-4 z-10 rounded-full bg-sand-light/90 px-3 py-1 font-jakarta text-[12px] font-semibold tracking-wide text-jungle-dark backdrop-blur-sm">
          {tagline}
        </span>
      </div>

      <div className="flex flex-1 flex-col p-6">
        <div className="flex items-start justify-between gap-4">
          <h3 className="font-fraunces text-[24px] leading-tight text-jungle-dark">
            {title}
          </h3>
          <div className="shrink-0 text-right">
            <p className="font-fraunces text-[24px] leading-none text-jungle-dark">
              ${pricePerNight}
            </p>
            <p className="font-jakarta text-[12px] text-jungle/55">/ night</p>
          </div>
        </div>

        {/* Specs */}
        <div className="mt-4 flex flex-wrap items-center gap-x-6 gap-y-2 font-jakarta text-[13px] text-jungle/70">
          <span className="inline-flex items-center gap-1.5">
            <Users size={15} className="text-sage" />
            Up to {maxOccupancy} guests
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Ruler size={15} className="text-sage" />
            {sizeSqm} m²
          </span>
          <span className="inline-flex items-center gap-1.5">
            <BedDouble size={15} className="text-sage" />
            {bedType}
          </span>
        </div>

        {/* Amenities */}
        <div className="mt-4 flex flex-wrap gap-2">
          {amenities.map((amenity) => (
            <span
              key={amenity}
              className="rounded-full border border-sand bg-sand-light px-3 py-1 font-jakarta text-[12px] font-medium text-jungle"
            >
              {amenity}
            </span>
          ))}
        </div>

        {/* Actions */}
        <div className="mt-6 flex items-center gap-3 border-t border-sand pt-5">
          <button
            type="button"
            onClick={onView}
            className="font-jakarta text-[14px] font-semibold text-jungle transition-colors hover:text-jungle-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sage focus-visible:ring-offset-2"
          >
            View details
          </button>
          <Link
            href="/#search-stay"
            className="ml-auto inline-flex items-center justify-center rounded-full bg-primary px-5 py-2.5 font-jakarta text-[14px] font-semibold text-sand-light transition hover:opacity-90"
          >
            Check availability
          </Link>
        </div>
      </div>
    </article>
  );
}
