import { addDays, format } from 'date-fns';
import type { Booking, BookingStatus, Guest, Room } from '../types/hotel';

const requests = [
  'Late arrival, approx. 23:00. Please leave the deck lights on.',
  'Vegetarian breakfast for both guests, no dairy.',
  'Celebrating a 10th anniversary — flowers on arrival if possible.',
  'Requesting an extra mattress for a child.',
  'Airport transfer already arranged, no pickup needed.',
  '',
  'Allergic to citronella — please use alternative repellent.',
  'Would like the guided trek booked for the first morning.',
];

const iso = (d: Date) => format(d, 'yyyy-MM-dd');

/**
 * Builds a 128-booking ledger that is consistent with live room state:
 * 34 checked-in bookings sit on the 34 occupied rooms, 64 are future confirmed
 * arrivals and 30 are completed stays.
 */
export function buildBookings(rooms: Room[], guests: Guest[]): Booking[] {
  const today = new Date();
  const occupied = rooms.filter((r) => r.status === 'occupied');
  const bookings: Booking[] = [];
  let refSeed = 9021;

  const push = (status: BookingStatus, room: Room, guest: Guest, offset: number, nights: number, i: number) => {
    const checkIn = addDays(today, offset);
    bookings.push({
      id: `bk-${refSeed}`,
      ref: `#REF-${refSeed++}`,
      guestId: guest.id,
      guestName: status === 'checked-in' ? room.guestName || guest.name : guest.name,
      guestEmail: guest.email,
      guestPhone: guest.phone,
      roomId: room.id,
      roomTitle: room.title,
      roomNumber: room.number,
      checkIn: iso(checkIn),
      checkOut: iso(addDays(checkIn, nights)),
      guests: 1 + (i % room.capacity),
      amount: room.price * nights,
      paid: status !== 'confirmed' ? true : i % 5 !== 0,
      status,
      specialRequests: requests[i % requests.length],
      source: i % 9 === 0 ? 'Walk-in' : i % 13 === 0 ? 'Agent' : 'Website',
    });
  };

  // In-house guests
  occupied.forEach((room, i) => {
    push('checked-in', room, guests[i], -1 - (i % 3), 2 + (i % 4), i);
  });

  // Upcoming confirmed arrivals
  for (let i = 0; i < 64; i++) {
    const room = rooms[(i * 3) % rooms.length];
    push('confirmed', room, guests[40 + i], (i % 14) + (i < 12 ? 0 : 1), 2 + (i % 5), i);
  }

  // Completed stays
  for (let i = 0; i < 30; i++) {
    const room = rooms[(i * 7) % rooms.length];
    push('checked-out', room, guests[150 + i], -(4 + (i % 20)), 2 + (i % 3), i);
  }

  return bookings;
}
