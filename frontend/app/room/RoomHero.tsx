"use client";

import { useState } from "react";

export function RoomHero({ src, alt }: { src: string; alt: string }) {
  const [failed, setFailed] = useState(false);

  if (failed) {
    return (
      <div className="flex aspect-[16/9] w-full items-center justify-center rounded-3xl bg-sand font-outfit text-jungle/50">
        No image available
      </div>
    );
  }

  // eslint-disable-next-line @next/next/no-img-element
  return (
    <img
      src={src}
      alt={alt}
      onError={() => setFailed(true)}
      className="aspect-[16/9] w-full rounded-3xl object-cover"
    />
  );
}
