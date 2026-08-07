"use client";

import { useState } from "react";

export function RoomThumbnail({ src, alt }: { src: string; alt: string }) {
  const [failed, setFailed] = useState(false);

  if (failed) {
    return (
      <div className="flex h-20 w-28 shrink-0 items-center justify-center rounded-2xl bg-sand font-outfit text-[11px] text-jungle/50 sm:h-24 sm:w-32">
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
      className="h-20 w-28 shrink-0 rounded-2xl object-cover sm:h-24 sm:w-32"
    />
  );
}
