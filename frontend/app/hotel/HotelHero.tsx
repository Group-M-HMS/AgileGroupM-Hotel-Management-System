"use client";

// Hero for "The Hotel" page — welcome statement + an image gallery carousel
// (NIBM2-520). Deliberately distinct from the home page's dark full-bleed hero:
// light background, copy above a rounded gallery slider with arrows + dots.
import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

const IMAGES = [
  {
    src: "https://images.unsplash.com/photo-1587061949409-02df41d5e562?q=80&w=2574&auto=format&fit=crop",
    alt: "River Nest eco-hotel nestled in the rainforest canopy",
  },
  {
    src: "https://images.unsplash.com/photo-1590073844006-332e0787caa5?q=80&w=2574&auto=format&fit=crop",
    alt: "Misty rainforest treetops surrounding the property",
  },
  {
    src: "https://images.unsplash.com/photo-1510798831971-661eb04b3739?q=80&w=2574&auto=format&fit=crop",
    alt: "River running through the Kitulgala jungle beside the hotel",
  },
];

export default function HotelHero() {
  const [current, setCurrent] = useState(0);
  const next = () => setCurrent((i) => (i + 1) % IMAGES.length);
  const prev = () => setCurrent((i) => (i - 1 + IMAGES.length) % IMAGES.length);

  return (
    <section className="bg-white pt-28 lg:pt-32">
      <div className="mx-auto max-w-7xl px-page-x lg:px-page-x-lg">
        {/* Welcome statement */}
        <div className="max-w-3xl">
          <p className="font-jakarta text-[12px] font-medium uppercase tracking-[3px] text-sage">
            The Hotel · Kitulgala
          </p>
          <h1 className="mt-4 font-fraunces text-[42px] leading-[50px] text-jungle-dark lg:text-[58px] lg:leading-[64px]">
            A rainforest retreat, built to disappear into the trees
          </h1>
          <p className="mt-6 max-w-2xl font-jakarta text-[16px] leading-[30px] text-jungle/75">
            River Nest Eco Villa is a secluded rainforest hotel on the edge of
            Sri Lanka&apos;s Kitulgala jungle — a collection of rooms and suites
            designed for quiet, privacy, and an unbroken connection to nature.
          </p>
        </div>

        {/* Gallery carousel */}
        <div className="group relative mt-10 h-[58vh] overflow-hidden rounded-[32px] lg:h-[70vh]">
          {IMAGES.map((img, i) => (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img
              key={img.src}
              src={img.src}
              alt={img.alt}
              aria-hidden={i !== current}
              className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-700 ${
                i === current ? "opacity-100" : "opacity-0"
              }`}
            />
          ))}

          {/* Subtle tint for control contrast */}
          <div className="pointer-events-none absolute inset-0 bg-jungle-dark/10" />

          {/* Prev / next */}
          <button
            type="button"
            onClick={prev}
            aria-label="Previous image"
            className="absolute left-5 top-1/2 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-white/25 text-sand-light backdrop-blur-md transition hover:bg-white/40 focus-visible:opacity-100 md:opacity-0 md:group-hover:opacity-100"
          >
            <ChevronLeft size={24} />
          </button>
          <button
            type="button"
            onClick={next}
            aria-label="Next image"
            className="absolute right-5 top-1/2 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-white/25 text-sand-light backdrop-blur-md transition hover:bg-white/40 focus-visible:opacity-100 md:opacity-0 md:group-hover:opacity-100"
          >
            <ChevronRight size={24} />
          </button>

          {/* Dots */}
          <div className="absolute bottom-6 left-1/2 flex -translate-x-1/2 gap-2">
            {IMAGES.map((img, i) => (
              <button
                key={img.src}
                type="button"
                onClick={() => setCurrent(i)}
                aria-label={`Go to image ${i + 1}`}
                aria-current={i === current}
                className={`h-2 rounded-full transition-all ${
                  i === current ? "w-6 bg-sand-light" : "w-2 bg-sand-light/50 hover:bg-sand-light/80"
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
