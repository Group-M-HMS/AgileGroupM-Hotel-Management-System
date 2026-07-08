export type Room = {
  id: string;
  title: string;
  thumbnailUrl: string;
  pricePerNight: number;
  maxOccupancy: number;
  /** One-line teaser for the results card — kept distinct from the room-details page's long-form `description` field (Group 2) so there's no data to keep in sync. */
  shortDescription: string;
  /** 2-3 headline amenities for the results card — kept distinct from the room-details page's full amenities list (Group 2). */
  topAmenities: string[];
};

export const mockRooms: Room[] = [
  {
    id: "standard-jungle-view",
    title: "Standard Jungle View Room",
    thumbnailUrl:
      "https://images.unsplash.com/photo-1611892440504-42a792e24d32?q=80&w=600&auto=format&fit=crop",
    pricePerNight: 120,
    maxOccupancy: 2,
    shortDescription: "A cosy room overlooking the rainforest canopy.",
    topAmenities: ["Free Wi-Fi", "Air Conditioning", "Garden View"],
  },
  {
    id: "deluxe-river-view",
    title: "Deluxe River View Room",
    thumbnailUrl:
      "https://images.unsplash.com/photo-1618773928121-c32242e63f39?q=80&w=600&auto=format&fit=crop",
    pricePerNight: 165,
    maxOccupancy: 3,
    shortDescription: "Wake up to river views and the sound of flowing water.",
    topAmenities: ["Free Wi-Fi", "River View", "Minibar"],
  },
  {
    id: "premier-canopy-room",
    title: "Premier Canopy Room",
    thumbnailUrl:
      "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?q=80&w=600&auto=format&fit=crop",
    pricePerNight: 210,
    maxOccupancy: 2,
    shortDescription: "Elevated views above the treeline for total privacy.",
    topAmenities: ["Free Wi-Fi", "Private Balcony", "Air Conditioning"],
  },
  {
    id: "family-suite",
    title: "Family Suite",
    thumbnailUrl:
      "https://images.unsplash.com/photo-1591088398332-8a7791972843?q=80&w=600&auto=format&fit=crop",
    pricePerNight: 245,
    maxOccupancy: 5,
    shortDescription: "Spacious suite with room to relax as a family.",
    topAmenities: ["Free Wi-Fi", "Two Bedrooms", "Air Conditioning"],
  },
  {
    id: "waterfall-view-room",
    title: "Waterfall View Room",
    thumbnailUrl:
      "https://images.unsplash.com/photo-1590490360182-c33d57733427?q=80&w=600&auto=format&fit=crop",
    pricePerNight: 180,
    maxOccupancy: 2,
    shortDescription: "Fall asleep to the sound of a nearby waterfall.",
    topAmenities: ["Free Wi-Fi", "Waterfall View", "Minibar"],
  },
  {
    id: "single-wellness-room",
    title: "Single Wellness Room",
    thumbnailUrl:
      "https://images.unsplash.com/photo-1595576508898-0ad5c879a061?q=80&w=600&auto=format&fit=crop",
    pricePerNight: 95,
    maxOccupancy: 1,
    shortDescription: "A quiet retreat designed for solo relaxation.",
    topAmenities: ["Free Wi-Fi", "Meditation Corner", "Air Conditioning"],
  },
  {
    id: "deluxe-rainforest-room",
    title: "Deluxe Rainforest Room",
    thumbnailUrl:
      "https://images.unsplash.com/photo-1611892440504-42a792e24d32?q=80&w=601&auto=format&fit=crop",
    pricePerNight: 155,
    maxOccupancy: 3,
    shortDescription: "Immersed in greenery with a private forest view.",
    topAmenities: ["Free Wi-Fi", "Forest View", "Minibar"],
  },
  {
    id: "standard-sunrise-room",
    title: "Standard Sunrise Room",
    thumbnailUrl:
      "https://images.unsplash.com/photo-1611892440504-42a792e24d32?q=80&w=602&auto=format&fit=crop",
    pricePerNight: 135,
    maxOccupancy: 2,
    shortDescription: "East-facing room with beautiful morning light.",
    topAmenities: ["Free Wi-Fi", "Air Conditioning", "Sunrise View"],
  },
  {
    id: "grand-executive-suite",
    title: "Grand Executive Suite",
    thumbnailUrl:
      "https://images.unsplash.com/photo-1590490360182-c33d57733427?q=80&w=601&auto=format&fit=crop",
    pricePerNight: 320,
    maxOccupancy: 6,
    shortDescription: "Our largest suite, built for groups and long stays.",
    topAmenities: ["Free Wi-Fi", "Living Area", "Private Balcony"],
  },
  {
    id: "standard-bamboo-room",
    title: "Standard Bamboo Room",
    thumbnailUrl:
      "https://images.unsplash.com/photo-1618773928121-c32242e63f39?q=80&w=601&auto=format&fit=crop",
    pricePerNight: 110,
    maxOccupancy: 2,
    shortDescription: "Simple, sustainable comfort built from local bamboo.",
    topAmenities: ["Free Wi-Fi", "Air Conditioning", "Garden View"],
  },
  {
    id: "hillside-eco-room",
    title: "Hillside Eco Room",
    thumbnailUrl:
      "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?q=80&w=601&auto=format&fit=crop",
    pricePerNight: 140,
    maxOccupancy: 2,
    shortDescription: "Tucked into the hillside with sweeping valley views.",
    topAmenities: ["Free Wi-Fi", "Valley View", "Air Conditioning"],
  },
  {
    id: "riverside-family-suite",
    title: "Riverside Family Suite",
    thumbnailUrl:
      "https://images.unsplash.com/photo-1591088398332-8a7791972843?q=80&w=601&auto=format&fit=crop",
    pricePerNight: 275,
    maxOccupancy: 4,
    shortDescription: "Riverfront suite with space for the whole family.",
    topAmenities: ["Free Wi-Fi", "River View", "Two Bedrooms"],
  },
];
