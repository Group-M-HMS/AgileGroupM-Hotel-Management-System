"use client";

// Compact image gallery/carousel for the room cards and details modal
// (NIBM2-535, satisfies the "image gallery" per-card AC). Fade transition,
// arrows + dots, and the repo's image-load fallback per slide.
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

export function RoomGalleryCompact({
  images,
  alt,
  heightClass = "h-56",
}: {
  images: string[];
  alt: string;
  heightClass?: string;
}) {
  const [current, setCurrent] = useState(0);
  const slides = images.filter(Boolean);

  if (slides.length === 0) {
    return (
      <div
        className={`flex w-full items-center justify-center bg-sand font-jakarta text-jungle/50 ${heightClass}`}
      >
        No images
      </div>
    );
  }

  const go = (dir: number) =>
    setCurrent((prev) => (prev + dir + slides.length) % slides.length);

  return (
    <div className={`group/gallery relative w-full overflow-hidden ${heightClass}`}>
      {slides.map((src, i) => (
        <Slide key={`${src}-${i}`} src={src} alt={alt} active={i === current} />
      ))}

      <div className="pointer-events-none absolute inset-0 bg-jungle-dark/10" />

      {slides.length > 1 && (
        <>
          <button
            type="button"
            onClick={() => go(-1)}
            aria-label="Previous image"
            className="absolute left-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-white/25 text-white backdrop-blur-md transition hover:bg-white/40 focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white md:opacity-0 md:group-hover/gallery:opacity-100"
          >
            <ChevronLeft size={18} />
          </button>
          <button
            type="button"
            onClick={() => go(1)}
            aria-label="Next image"
            className="absolute right-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-white/25 text-white backdrop-blur-md transition hover:bg-white/40 focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white md:opacity-0 md:group-hover/gallery:opacity-100"
          >
            <ChevronRight size={18} />
          </button>
          <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-1.5">
            {slides.map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setCurrent(i)}
                aria-label={`Go to image ${i + 1}`}
                aria-current={i === current}
                className={`h-1.5 rounded-full transition-all ${
                  i === current ? "w-5 bg-white" : "w-1.5 bg-white/50 hover:bg-white/80"
                }`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
