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
  /** Large hero photo for the room-details page (`/room/:id`). */
  heroImageUrl: string;
  /** Full-length description paragraph for the room-details page. */
  fullDescription: string;
  /** Every amenity the hotel tracks for this room; only `true` entries render. Data-driven — a new key added here renders without a code change. */
  amenities: Record<string, boolean>;
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
    heroImageUrl:
      "https://images.unsplash.com/photo-1611892440504-42a792e24d32?q=80&w=1200&auto=format&fit=crop",
    fullDescription:
      "Tucked beneath the rainforest canopy, the Standard Jungle View Room pairs simple, comfortable furnishings with a wall of green just outside your window. Fall asleep to the sound of birdsong and wake to filtered morning light — ideal for guests who want an authentic jungle stay without giving up modern comforts.",
    amenities: {
      "Free Wi-Fi": true,
      "Air Conditioning": true,
      "Garden View": true,
      Minibar: false,
      "Private Balcony": false,
      "River View": false,
    },
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
    heroImageUrl:
      "https://images.unsplash.com/photo-1618773928121-c32242e63f39?q=80&w=1200&auto=format&fit=crop",
    fullDescription:
      "Positioned to catch the Kitulgala river at its widest bend, the Deluxe River View Room offers a private seating nook facing the water and a bed dressed in locally woven linens. The sound of the current carries through the open window screens each evening — a favourite for guests chasing a slower pace.",
    amenities: {
      "Free Wi-Fi": true,
      "River View": true,
      Minibar: true,
      "Air Conditioning": true,
      "Private Balcony": false,
      "Garden View": false,
    },
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
    heroImageUrl:
      "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?q=80&w=1200&auto=format&fit=crop",
    fullDescription:
      "Raised above the treeline on stilted decking, the Premier Canopy Room gives you a private balcony looking straight into the rainforest crown. It's the quietest room on the property, popular with guests who want total privacy and unobstructed canopy views at sunrise.",
    amenities: {
      "Free Wi-Fi": true,
      "Private Balcony": true,
      "Air Conditioning": true,
      Minibar: true,
      "River View": false,
      "Garden View": false,
    },
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
    heroImageUrl:
      "https://images.unsplash.com/photo-1591088398332-8a7791972843?q=80&w=1200&auto=format&fit=crop",
    fullDescription:
      "The Family Suite spans two connected sleeping areas around a shared living space, giving parents and children their own corners while staying close. Large windows keep the suite bright through the day, and the layout comfortably sleeps up to five without feeling cramped.",
    amenities: {
      "Free Wi-Fi": true,
      "Two Bedrooms": true,
      "Air Conditioning": true,
      Minibar: false,
      "Private Balcony": false,
      "Garden View": true,
    },
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
    heroImageUrl:
      "https://images.unsplash.com/photo-1590490360182-c33d57733427?q=80&w=1200&auto=format&fit=crop",
    fullDescription:
      "Named for the seasonal waterfall visible from its window, this room pairs a cool stone-tiled floor with warm timber furnishings. Guests often describe the sound of falling water as the best part of the stay — bring earplugs only if you're a very light sleeper.",
    amenities: {
      "Free Wi-Fi": true,
      "Waterfall View": true,
      Minibar: true,
      "Air Conditioning": false,
      "Private Balcony": false,
      "Garden View": false,
    },
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
    heroImageUrl:
      "https://images.unsplash.com/photo-1595576508898-0ad5c879a061?q=80&w=1200&auto=format&fit=crop",
    fullDescription:
      "Designed for solo travellers, the Single Wellness Room includes a dedicated meditation corner with floor cushions and soft natural light. Everything about the room — from the muted palette to the minimal furnishings — is built around quiet and rest.",
    amenities: {
      "Free Wi-Fi": true,
      "Meditation Corner": true,
      "Air Conditioning": true,
      Minibar: false,
      "Private Balcony": false,
      "Garden View": false,
    },
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
    heroImageUrl:
      "https://images.unsplash.com/photo-1611892440504-42a792e24d32?q=80&w=1201&auto=format&fit=crop",
    fullDescription:
      "Surrounded on three sides by dense forest, the Deluxe Rainforest Room feels fully immersed in greenery while still offering the comfort of a proper deluxe stay. A private forest-facing window seat is the best spot in the house for an afternoon read.",
    amenities: {
      "Free Wi-Fi": true,
      "Forest View": true,
      Minibar: true,
      "Air Conditioning": true,
      "Private Balcony": false,
      "River View": false,
    },
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
    heroImageUrl:
      "https://images.unsplash.com/photo-1611892440504-42a792e24d32?q=80&w=1202&auto=format&fit=crop",
    fullDescription:
      "East-facing and simply furnished, the Standard Sunrise Room is built for early risers — the window frames the sunrise directly over the ridge line each morning. A dependable, comfortable choice for guests who prioritise a good night's sleep over extra frills.",
    amenities: {
      "Free Wi-Fi": true,
      "Air Conditioning": true,
      "Sunrise View": true,
      Minibar: false,
      "Private Balcony": false,
      "Garden View": false,
    },
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
    heroImageUrl:
      "https://images.unsplash.com/photo-1590490360182-c33d57733427?q=80&w=1201&auto=format&fit=crop",
    fullDescription:
      "The Grand Executive Suite is the villa's largest room, built around a separate living area and a private balcony that wraps two sides of the suite. It comfortably accommodates groups or long stays, with enough space to work, relax, and entertain without leaving the room.",
    amenities: {
      "Free Wi-Fi": true,
      "Living Area": true,
      "Private Balcony": true,
      "Air Conditioning": true,
      Minibar: true,
      "River View": false,
    },
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
    heroImageUrl:
      "https://images.unsplash.com/photo-1618773928121-c32242e63f39?q=80&w=1201&auto=format&fit=crop",
    fullDescription:
      "Built almost entirely from locally sourced bamboo, this room is the villa's showcase of sustainable construction. The finish is simple and unpolished by design, letting the natural material and the surrounding garden do the talking.",
    amenities: {
      "Free Wi-Fi": true,
      "Air Conditioning": true,
      "Garden View": true,
      Minibar: false,
      "Private Balcony": false,
      "River View": false,
    },
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
    heroImageUrl:
      "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?q=80&w=1201&auto=format&fit=crop",
    fullDescription:
      "Set into the slope above the main villa, the Hillside Eco Room looks out over the valley through a wide picture window. The elevation keeps the room noticeably cooler in the afternoon heat, even before the ceiling fan kicks in.",
    amenities: {
      "Free Wi-Fi": true,
      "Valley View": true,
      "Air Conditioning": true,
      Minibar: false,
      "Private Balcony": false,
      "Garden View": false,
    },
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
    heroImageUrl:
      "https://images.unsplash.com/photo-1591088398332-8a7791972843?q=80&w=1201&auto=format&fit=crop",
    fullDescription:
      "Combining river views with the space of a family suite, this room sits closest to the water's edge on the property. Two sleeping areas open onto a shared balcony, making it easy to keep an eye on younger guests while still enjoying the view.",
    amenities: {
      "Free Wi-Fi": true,
      "River View": true,
      "Two Bedrooms": true,
      "Air Conditioning": true,
      Minibar: false,
      "Private Balcony": true,
    },
  },
];
