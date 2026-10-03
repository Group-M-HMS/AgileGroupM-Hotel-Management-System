// Live room-type catalog from room-service (GET /api/rooms/types), shared by the /rooms page and
// the home Featured Rooms section so both always show the same data and anchor ids.
import type { CatalogRoom } from "./rooms-catalog";

const ROOM_SERVICE_URL = process.env.NEXT_PUBLIC_ROOM_SERVICE_URL ?? "http://localhost:8081";

type ApiRoomType = {
  roomType: string | null;
  title: string;
  shortDescription: string | null;
  fullDescription: string | null;
  pricePerNight: number;
  maxOccupancy: number | null;
  sizeSqm: number | null;
  bedType: string | null;
  gallery: string[];
  amenities: string[];
};

const slug = (value: string) =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

function toCatalogRoom(t: ApiRoomType): CatalogRoom {
  return {
    id: slug(t.roomType ?? t.title),
    title: t.title,
    tagline: t.roomType ?? "Room",
    images: t.gallery,
    pricePerNight: t.pricePerNight,
    maxOccupancy: t.maxOccupancy ?? 1,
    sizeSqm: t.sizeSqm ?? 0,
    bedType: t.bedType ?? "",
    amenities: t.amenities,
    summary: t.shortDescription ?? "",
    description: t.fullDescription || t.shortDescription || "",
  };
}

export async function fetchRoomTypes(): Promise<CatalogRoom[]> {
  const res = await fetch(`${ROOM_SERVICE_URL}/api/rooms/types`);
  if (!res.ok) throw new Error(`Room types failed with status ${res.status}`);
  return ((await res.json()) as ApiRoomType[]).map(toCatalogRoom);
}

/** The three highest-priced types (our premium rooms), shown cheapest-first. */
export function pickFeatured(rooms: CatalogRoom[]): CatalogRoom[] {
  return [...rooms]
    .sort((a, b) => b.pricePerNight - a.pricePerNight)
    .slice(0, 3)
    .reverse();
}
