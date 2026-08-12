"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

function Slide({ src, alt, active }: { src: string; alt: string; active: boolean }) {
  const [failed, setFailed] = useState(false);

  return (
    <div
      aria-hidden={!active}
      className={`absolute inset-0 transition-opacity duration-500 ease-out ${
        active ? "opacity-100" : "opacity-0"
      }`}
    >
      {failed ? (
        <div className="flex h-full w-full items-center justify-center bg-sand font-jakarta text-jungle/50">
          No image
        </div>
      ) : (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={src}
          alt={alt}
          onError={() => setFailed(true)}
          className="h-full w-full object-cover"
        />
      )}
    </div>
  );
}

export function RoomGallery({ images, alt }: { images: string[]; alt: string }) {
  const [current, setCurrent] = useState(0);
  const slides = images.filter(Boolean);

  if (slides.length === 0) {
    return (
      <div className="flex h-[56vh] w-full items-center justify-center rounded-[2rem] bg-sand font-jakarta text-jungle/50 md:h-[64vh]">
        No images available
      </div>
    );
  }

  const go = (dir: number) =>
    setCurrent((prev) => (prev + dir + slides.length) % slides.length);

  return (
    <div className="group relative h-[56vh] w-full overflow-hidden rounded-[2rem] md:h-[64vh]">
      {slides.map((src, i) => (
        <Slide key={`${src}-${i}`} src={src} alt={alt} active={i === current} />
      ))}

      {/* Subtle darkening so the controls stay legible over bright imagery. */}
      <div className="pointer-events-none absolute inset-0 bg-jungle-dark/10" />

      {slides.length > 1 && (
        <>
          <button
            type="button"
            onClick={() => go(-1)}
            aria-label="Previous image"
            className="absolute left-5 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/25 text-white backdrop-blur-md transition hover:bg-white/40 focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white md:opacity-0 md:group-hover:opacity-100"
          >
            <ChevronLeft size={22} />
          </button>

          <button
            type="button"
            onClick={() => go(1)}
            aria-label="Next image"
            className="absolute right-5 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/25 text-white backdrop-blur-md transition hover:bg-white/40 focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white md:opacity-0 md:group-hover:opacity-100"
          >
            <ChevronRight size={22} />
          </button>

          <div className="absolute bottom-5 left-1/2 flex -translate-x-1/2 gap-2">
            {slides.map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setCurrent(i)}
                aria-label={`Go to image ${i + 1}`}
                aria-current={i === current}
                className={`h-2 rounded-full transition-all ${
                  i === current ? "w-6 bg-white" : "w-2 bg-white/50 hover:bg-white/80"
                }`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
