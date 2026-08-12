"use client";

import { useState } from "react";
import { BedDouble } from "lucide-react";

// Room photography via <img> + onError fallback, per the repo's image-load pattern.
// `className` sizes/shapes it so both the card and the table can reuse this.
export function BookingThumbnail({
  src,
  alt,
  className = "",
}: {
  src: string | null | undefined;
  alt: string;
  className?: string;
}) {
  const [failed, setFailed] = useState(false);

  if (!src || failed) {
    return (
      <div
        className={`flex shrink-0 items-center justify-center bg-sage/20 ${className}`}
        aria-hidden="true"
      >
        <BedDouble className="text-sage" size={22} />
      </div>
    );
  }

  // eslint-disable-next-line @next/next/no-img-element
  return (
    <img
      src={src}
      alt={alt}
      onError={() => setFailed(true)}
      className={`shrink-0 object-cover ${className}`}
    />
  );
}
