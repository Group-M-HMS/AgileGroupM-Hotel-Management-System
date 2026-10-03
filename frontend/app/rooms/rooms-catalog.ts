// Shape of a room-type card on /rooms and the home Featured Rooms section (NIBM2-534/535/536).
// Data comes live from room-service via ./roomTypes — there is no hardcoded catalog.

export type CatalogRoom = {
  id: string;
  title: string;
  /** Short eyebrow/category label. */
  tagline: string;
  /** Gallery images; index 0 is the lead photo. */
  images: string[];
  pricePerNight: number;
  maxOccupancy: number;
  sizeSqm: number;
  bedType: string;
  amenities: string[];
  /** One-line teaser for the card. */
  summary: string;
  /** Fuller description for the details modal. */
  description: string;
};
