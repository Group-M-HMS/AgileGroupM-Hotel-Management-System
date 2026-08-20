// Curated room-type catalog for the /rooms page and the home Featured Rooms
// section (NIBM2-534/535/536). This is a marketing catalog of room *types*,
// separate from the live room-service booking funnel — cards route into the
// funnel (/search-results) to check live availability by date.

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
  /** Whether this type appears in the home Featured Rooms showcase. */
  featured: boolean;
};

const img = (id: string, w = 1200) =>
  `https://images.unsplash.com/${id}?q=80&w=${w}&auto=format&fit=crop`;

export const catalogRooms: CatalogRoom[] = [
  {
    id: "deluxe-villa-room",
    title: "Deluxe Villa Room",
    tagline: "River view",
    images: [
      img("photo-1618773928121-c32242e63f39"),
      img("photo-1631049307264-da0ec9d70304"),
      img("photo-1591088398332-8a7791972843"),
    ],
    pricePerNight: 165,
    maxOccupancy: 2,
    sizeSqm: 34,
    bedType: "1 King bed",
    amenities: ["Free Wi-Fi", "River View", "Air Conditioning", "Minibar"],
    summary: "A refined room facing the river, dressed in locally woven linens.",
    description:
      "Positioned to catch the Kitulgala river at its widest bend, the Deluxe Villa Room offers a private seating nook facing the water and a bed dressed in locally woven linens. The sound of the current carries through the screened windows each evening — a favourite for guests chasing a slower pace.",
    featured: true,
  },
  {
    id: "forest-suite",
    title: "Forest Suite",
    tagline: "Canopy view",
    images: [
      img("photo-1631049307264-da0ec9d70304"),
      img("photo-1590490360182-c33d57733427"),
      img("photo-1611892440504-42a792e24d32"),
    ],
    pricePerNight: 210,
    maxOccupancy: 2,
    sizeSqm: 42,
    bedType: "1 King bed",
    amenities: ["Free Wi-Fi", "Private Balcony", "Forest View", "Air Conditioning"],
    summary: "Raised into the treeline with a private balcony over the canopy.",
    description:
      "Raised above the treeline on stilted decking, the Forest Suite gives you a private balcony looking straight into the rainforest crown. It's the quietest suite on the property, popular with couples who want total privacy and unobstructed canopy views at sunrise.",
    featured: true,
  },
  {
    id: "family-canopy-suite",
    title: "Family Canopy Suite",
    tagline: "Sleeps five",
    images: [
      img("photo-1591088398332-8a7791972843"),
      img("photo-1595576508898-0ad5c879a061"),
      img("photo-1618773928121-c32242e63f39"),
    ],
    pricePerNight: 275,
    maxOccupancy: 5,
    sizeSqm: 55,
    bedType: "2 Queen beds",
    amenities: ["Free Wi-Fi", "Two Bedrooms", "Garden View", "Air Conditioning"],
    summary: "Two connected sleeping areas with room for the whole family.",
    description:
      "The Family Canopy Suite spans two connected sleeping areas around a shared living space, giving parents and children their own corners while staying close. Large windows keep the suite bright through the day, and the layout comfortably sleeps up to five without feeling cramped.",
    featured: true,
  },
  {
    id: "luxury-river-villa",
    title: "Luxury River Villa",
    tagline: "Private plunge pool",
    images: [
      img("photo-1590490360182-c33d57733427"),
      img("photo-1591088398332-8a7791972843"),
      img("photo-1611892440504-42a792e24d32"),
    ],
    pricePerNight: 360,
    maxOccupancy: 4,
    sizeSqm: 72,
    bedType: "1 King + 1 Queen bed",
    amenities: [
      "Free Wi-Fi",
      "Private Plunge Pool",
      "River View",
      "Private Balcony",
      "Minibar",
    ],
    summary: "Our flagship villa — riverfront, with a private plunge pool.",
    description:
      "The Luxury River Villa is River Nest's flagship, sitting closest to the water with a private plunge pool on a wraparound deck. A separate living area, an outdoor rain shower and uninterrupted river views make it the standout choice for a special occasion.",
    featured: false,
  },
];

export const featuredRooms = catalogRooms.filter((room) => room.featured);
