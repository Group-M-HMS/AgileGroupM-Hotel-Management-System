"use client";

import { useState } from "react";

function GalleryImage({
  src,
  alt,
  className,
}: {
  src: string;
  alt: string;
  className: string;
}) {
  const [failed, setFailed] = useState(false);

  if (failed) {
    return (
      <div
        className={`${className} flex items-center justify-center bg-sand font-outfit text-jungle/50`}
      >
        No image
      </div>
    );
  }

  // eslint-disable-next-line @next/next/no-img-element
  return (
    <img
      src={src}
      alt={alt}
      onError={() => setFailed(true)}
      className={`${className} object-cover`}
    />
  );
}

export function RoomGallery({ images, alt }: { images: string[]; alt: string }) {
  const [large, small1, small2] = images;

  return (
    <div className="flex flex-col gap-3 sm:flex-row">
      <div className="min-w-0 flex-[2]">
        <GalleryImage
          src={large}
          alt={alt}
          className="aspect-[4/3] h-full w-full rounded-3xl sm:aspect-auto sm:h-[420px]"
        />
      </div>
      <div className="min-w-0 flex-1">
        <GalleryImage
          src={small1}
          alt={alt}
          className="aspect-[4/3] h-full w-full rounded-3xl sm:aspect-auto sm:h-[420px]"
        />
      </div>
      <div className="min-w-0 flex-1">
        <GalleryImage
          src={small2}
          alt={alt}
          className="aspect-[4/3] h-full w-full rounded-3xl sm:aspect-auto sm:h-[420px]"
        />
      </div>
    </div>
  );
}
