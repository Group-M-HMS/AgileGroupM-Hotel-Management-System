export type RoomStatus = 'available' | 'occupied' | 'cleaning' | 'maintenance';

export type BookingStatus = 'confirmed' | 'checked-in' | 'checked-out' | 'cancelled';

export type ExperienceCategory = 'Rainforest' | 'Adventure' | 'River' | 'Wellness';

export interface Room {
  id: string;
  number: string;
  title: string;
  type: string;
  bedType: string;
  price: number;
  capacity: number;
  sqm: number;
  image: string;
  gallery: string[];
  description: string;
  amenities: string[];
  status: RoomStatus;
  guestName?: string;
}

export interface Booking {
  id: string;
  ref: string;
  guestId: string;
  guestName: string;
  guestEmail: string;
  guestPhone: string;
  roomId: string;
  roomTitle: string;
  roomNumber: string;
  checkIn: string;
  checkOut: string;
  guests: number;
  amount: number;
  paid: boolean;
  status: BookingStatus;
  specialRequests: string;
  source: 'Website' | 'Walk-in' | 'Agent';
  cancelReason?: string;
}

export interface Guest {
  id: string;
  name: string;
  email: string;
  phone: string;
  stays: number;
  joined: string;
  country: string;
}

export interface Experience {
  id: string;
  title: string;
  category: ExperienceCategory;
  duration: string;
  durationHours: number;
  difficulty: 'Easy' | 'Moderate' | 'Challenging';
  image: string;
  summary: string;
  description: string;
  price: number;
  active: boolean;
}

export interface AlertItem {
  id: string;
  kind: 'payment' | 'request' | 'system';
  title: string;
  detail: string;
  time: string;
  resolved: 'pending' | 'approved' | 'dismissed';
}
