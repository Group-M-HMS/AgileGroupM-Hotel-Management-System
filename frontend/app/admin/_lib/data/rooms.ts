import type { Room, RoomStatus } from '../types/hotel';

export const IMAGES = {
  hero: '/admin-prototype/2dbe78f5-7e13-45a9-a4bc-3f3c50ac2b65.jpg',
  villa: '/admin-prototype/a2932c42-0cd9-4a93-944c-5c2b1ab2dc4f.jpg',
  suite: '/admin-prototype/3db84adb-f14e-475a-85b1-8a2a36d45334.jpg',
  standard: '/admin-prototype/056253df-4c34-44ab-9fcb-21d5709ac055.jpg',
  trek: '/admin-prototype/6dd303c4-7831-4b36-bb6d-e13809449b12.jpg',
  rafting: '/admin-prototype/79e86b58-27d0-4794-8830-2aa3ff1d1f50.jpg',
  river: '/admin-prototype/efc7e85c-1852-409d-bfe3-90b18163d1fc.jpg',
  birds: '/admin-prototype/0420bf18-8632-4b95-aa98-8859a9a80d1c.jpg',
  yoga: '/admin-prototype/ee357a15-51e0-4b1b-9a3e-067433ced52e.jpg',
  tea: '/admin-prototype/650c3077-68f6-4588-8ef6-dde4c1a8d7ce.jpg',
};

interface Template {
  title: string;
  type: string;
  bedType: string;
  price: number;
  capacity: number;
  sqm: number;
  image: string;
  description: string;
  amenities: string[];
}

const templates: Template[] = [
  {
    title: 'Overwater Villa',
    type: 'Villa',
    bedType: '1 King Bed',
    price: 450,
    capacity: 3,
    sqm: 68,
    image: IMAGES.villa,
    description:
      'Suspended on hardwood stilts directly above the Kelani, the Overwater Villa is our signature retreat. Wake to river mist below the glass floor panel, soak in a private plunge pool carved from local stone, and fall asleep to the sound of the rapids.',
    amenities: ['Private Pool', 'River View', 'Free WiFi', 'Air Conditioning', 'Outdoor Rain Shower', 'Butler Service'],
  },
  {
    title: 'Deluxe Ocean View Suite',
    type: 'Suite',
    bedType: '1 King Bed + Daybed',
    price: 320,
    capacity: 4,
    sqm: 52,
    image: IMAGES.suite,
    description:
      'A generous corner suite with a wraparound balcony framing the valley where the rainforest opens toward the distant coast. Handwoven textiles, a deep soaking tub, and a reading nook set into the window bay.',
    amenities: ['Ocean View', 'Free WiFi', 'Air Conditioning', 'Soaking Tub', 'Balcony', 'Minibar'],
  },
  {
    title: 'Standard Rainforest Room',
    type: 'Room',
    bedType: '1 Queen Bed',
    price: 180,
    capacity: 2,
    sqm: 34,
    image: IMAGES.standard,
    description:
      'Quiet, cool and canopy-facing. Rattan headboard, polished concrete floors, and a louvred window wall that opens straight into the green. The most sustainable footprint on the property.',
    amenities: ['Jungle View', 'Free WiFi', 'Air Conditioning', 'Desk', 'Tea Station'],
  },
  {
    title: 'Canopy Loft',
    type: 'Loft',
    bedType: '2 Twin Beds',
    price: 260,
    capacity: 3,
    sqm: 44,
    image: IMAGES.suite,
    description:
      'A split-level treetop loft reached by a suspended walkway. Sleeping platform above, lounge below, and a netted hammock deck that puts you level with the hornbills.',
    amenities: ['Canopy Deck', 'Free WiFi', 'Air Conditioning', 'Hammock', 'Tea Station'],
  },
  {
    title: 'Riverside Cabana',
    type: 'Cabana',
    bedType: '1 Queen Bed',
    price: 215,
    capacity: 2,
    sqm: 38,
    image: IMAGES.villa,
    description:
      'Thatched, low and private, a few steps from the bathing pools. Outdoor shower fed by spring water and a private timber sundeck on the riverbank.',
    amenities: ['River Access', 'Free WiFi', 'Outdoor Shower', 'Sundeck', 'Fan Cooled'],
  },
];

const occupants = [
  'Amara Silva', 'Jonas Weber', 'Priya Nair', 'Liam O’Connell', 'Sofia Ferreira',
  'Kenji Tanaka', 'Nadia Haddad', 'Tom Whitfield', 'Elena Petrova', 'Marcus Bell',
  'Chandi Perera', 'Anya Novak', 'Diego Morales', 'Grace Adeyemi', 'Ravi Kumar',
  'Ingrid Larsen', 'Omar Faruk', 'Beatrice Lund', 'Noah Kimura', 'Zara Malik',
  'Hugo Martin', 'Leila Rahman', 'Peter Lindqvist', 'Mira Costa', 'Sam Okafor',
  'Isabel Rojas', 'Aiden Clarke', 'Hana Yusuf', 'Felix Braun', 'Tara Singh',
  'Bruno Sant', 'Yuki Mori', 'Clara Dubois', 'Ethan Reed',
];

function statusOrder(): RoomStatus[] {
  const pool: RoomStatus[] = [
    ...Array<RoomStatus>(34).fill('occupied'),
    ...Array<RoomStatus>(8).fill('available'),
    ...Array<RoomStatus>(6).fill('cleaning'),
    ...Array<RoomStatus>(2).fill('maintenance'),
  ];

  // Deterministic spread so the grid never reads as sorted blocks.
  const out: RoomStatus[] = [];
  const taken = new Set<number>();
  for (let i = 0; i < pool.length; i++) {
    let idx = (i * 17) % pool.length;
    while (taken.has(idx)) idx = (idx + 1) % pool.length;
    taken.add(idx);
    out[idx] = pool[i];
  }
  return out;
}

export function buildRooms(): Room[] {
  const statuses = statusOrder();
  let occupantCursor = 0;
  return Array.from({ length: 50 }, (_, i) => {
    const t = templates[i % templates.length];
    const floor = Math.floor(i / 10) + 1;
    const number = `${floor}${String((i % 10) + 1).padStart(2, '0')}`;
    const status = statuses[i];
    const guestName = status === 'occupied' ? occupants[occupantCursor++ % occupants.length] : undefined;
    return {
      id: `room-${number}`,
      number,
      title: t.title,
      type: t.type,
      bedType: t.bedType,
      price: t.price + (floor - 1) * 15,
      capacity: t.capacity,
      sqm: t.sqm,
      image: t.image,
      gallery: [t.image, IMAGES.hero, IMAGES.river],
      description: t.description,
      amenities: t.amenities,
      status,
      guestName,
    };
  });
}

export const initialRooms: Room[] = buildRooms();

/** The three rooms showcased on the marketing site. */
export const featuredRoomIds = ['room-101', 'room-102', 'room-103'];
