// Featured Rooms showcase for the home page (NIBM2-536).
// Pulls from the shared room catalog so the home page and /rooms stay in sync;
// each card links to that room's card on the /rooms page.
import Link from "next/link";
import { ArrowRight, Users, Ruler } from "lucide-react";
import { featuredRooms } from "./rooms/rooms-catalog";
import { RoomImage } from "./rooms/RoomImage";

export default function FeaturedRooms() {
  return (
    <section>
      <div className="mb-8 flex items-end justify-between">
        <div>
          <p className="font-jakarta text-sm uppercase tracking-[3px] text-sage">
            Where You&apos;ll Stay
          </p>
          <h2 className="mt-2 font-fraunces text-4xl text-jungle-dark">
            Featured Rooms
          </h2>
        </div>

        <Link
          href="/rooms"
          className="hidden rounded-full font-semibold text-jungle transition hover:text-jungle-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sage focus-visible:ring-offset-2 lg:flex"
        >
          View All Rooms
        </Link>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        {featuredRooms.map((room) => (
          <Link
            key={room.id}
            href={`/rooms#${room.id}`}
            className="group flex flex-col overflow-hidden rounded-[30px] border border-sand bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sage focus-visible:ring-offset-2"
          >
            <div className="relative h-64 overflow-hidden">
              <RoomImage
                src={room.images[0]}
                alt={room.title}
                className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-105 motion-reduce:transition-none motion-reduce:group-hover:scale-100"
              />
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
              <span className="absolute right-4 top-4 rounded-full bg-sand-light/90 px-3 py-1 font-jakarta text-[13px] font-semibold text-jungle-dark backdrop-blur-sm">
                ${room.pricePerNight}
                <span className="font-normal text-jungle/60"> / night</span>
              </span>
            </div>

            <div className="flex flex-1 flex-col p-8">
              <h3 className="font-fraunces text-3xl text-jungle-dark">
                {room.title}
              </h3>

              <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2 font-jakarta text-[13px] text-jungle/70">
                <span className="inline-flex items-center gap-1.5">
                  <Users size={15} className="text-sage" />
                  Up to {room.maxOccupancy}
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <Ruler size={15} className="text-sage" />
                  {room.sizeSqm} m²
                </span>
              </div>

              <p className="mt-4 font-jakarta leading-7 text-jungle/70">
                {room.summary}
              </p>

              <span className="mt-6 inline-flex items-center gap-2 font-jakarta font-semibold text-jungle transition-colors group-hover:text-jungle-dark">
                <span className="relative after:absolute after:-bottom-0.5 after:left-0 after:h-[2px] after:w-0 after:bg-current after:transition-[width] after:duration-300 after:content-[''] group-hover:after:w-full motion-reduce:after:transition-none">
                  View details
                </span>
                <ArrowRight size={18} />
              </span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
