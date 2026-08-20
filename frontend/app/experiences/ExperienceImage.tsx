"use client";

// Image with graceful fallback for user-facing/external URLs (per the repo's
// image-load fallback pattern, cf. RoomGallery). Swaps in a branded placeholder
// if the photo fails to load.
import { useState } from "react";

export function ExperienceImage({
  src,
  alt,
  className = "",
}: {
  src: string;
  alt: string;
  className?: string;
}) {
  const [failed, setFailed] = useState(false);

  if (failed) {
    return (
      <div
        className={`flex items-center justify-center bg-sand font-jakarta text-jungle/50 ${className}`}
      >
        No image
      </div>
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={alt}
      onError={() => setFailed(true)}
      className={className}
    />
  );
}

const DIFFICULTY_STYLES: Record<string, string> = {
  Easy: "bg-sage/20 text-jungle",
  Moderate: "bg-clay/15 text-clay",
  Challenging: "bg-jungle-dark/10 text-jungle-dark",
};

export function difficultyClasses(difficulty: string): string {
  return DIFFICULTY_STYLES[difficulty] ?? "bg-sand text-jungle";
}
