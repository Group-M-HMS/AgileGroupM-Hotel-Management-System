'use client';

import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { addDays, format } from 'date-fns';
import type {
  AlertItem,
  Booking,
  BookingStatus,
  Experience,
  Guest,
  Room,
  RoomStatus,
} from '../types/hotel';
import { initialRooms } from '../data/rooms';
import { initialGuests } from '../data/guests';
import { buildBookings } from '../data/bookings';
import { initialAlerts, initialExperiences } from '../data/experiences';

export interface CustomerProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  memberSince: string;
  tier: string;
}

export interface NewBookingInput {
  guestName: string;
  guestEmail: string;
  guestPhone: string;
  roomId: string;
  checkIn: string;
  checkOut: string;
  guests: number;
  specialRequests: string;
  source: Booking['source'];
  paid: boolean;
  amount: number;
}

interface HotelContextValue {
  rooms: Room[];
  bookings: Booking[];
  guests: Guest[];
  experiences: Experience[];
  alerts: AlertItem[];
  customer: CustomerProfile;
  // rooms
  setRoomStatus: (roomId: string, status: RoomStatus) => void;
  addRoom: (room: Omit<Room, 'id' | 'status'>) => void;
  updateRoom: (roomId: string, patch: Partial<Room>) => void;
  deleteRoom: (roomId: string) => void;
  // bookings
  createBooking: (input: NewBookingInput) => Booking;
  checkInBooking: (bookingId: string) => void;
  checkOutBooking: (bookingId: string) => void;
  cancelBooking: (bookingId: string, reason: string) => void;
  // guests
  addGuest: (guest: Pick<Guest, 'name' | 'email' | 'phone'>) => Guest;
  updateGuest: (guestId: string, patch: Partial<Guest>) => void;
  deleteGuest: (guestId: string) => void;
  // experiences
  addExperience: (experience: Omit<Experience, 'id' | 'active' | 'durationHours'>) => void;
  updateExperience: (id: string, patch: Partial<Experience>) => void;
  deleteExperience: (id: string) => void;
  // alerts
  resolveAlert: (id: string, resolution: 'approved' | 'dismissed') => void;
  updateCustomer: (patch: Partial<CustomerProfile>) => void;
}

const HotelContext = createContext<HotelContextValue | null>(null);

const seedRooms = initialRooms;
const seedGuests = initialGuests;
const seedBookings = buildBookings(seedRooms, seedGuests);

export function HotelDataProvider({ children }: { children: React.ReactNode }) {
  const [rooms, setRooms] = useState<Room[]>(seedRooms);
  const [bookings, setBookings] = useState<Booking[]>(seedBookings);
  const [guests, setGuests] = useState<Guest[]>(seedGuests);
  const [experiences, setExperiences] = useState<Experience[]>(initialExperiences);
  const [alerts, setAlerts] = useState<AlertItem[]>(initialAlerts);
  const [customer, setCustomer] = useState<CustomerProfile>({
    id: 'guest-1000',
    name: 'Amara Silva',
    email: 'amara.silva@example.com',
    phone: '+94 77 214 8890',
    memberSince: 'Mar 2024',
    tier: 'Nest Circle · Gold',
  });

  const setRoomStatus = useCallback((roomId: string, status: RoomStatus) => {
    setRooms((prev) =>
      prev.map((r) =>
        r.id === roomId
          ? { ...r, status, guestName: status === 'occupied' ? r.guestName || 'Walk-in Guest' : undefined }
          : r
      )
    );
  }, []);

  const addRoom = useCallback((room: Omit<Room, 'id' | 'status'>) => {
    setRooms((prev) => [
      {
        ...room,
        id: `room-${room.number}-${prev.length}`,
        status: 'available' as RoomStatus,
      },
      ...prev,
    ]);
  }, []);

  const updateRoom = useCallback((roomId: string, patch: Partial<Room>) => {
    setRooms((prev) => prev.map((r) => (r.id === roomId ? { ...r, ...patch } : r)));
  }, []);

  const deleteRoom = useCallback((roomId: string) => {
    setRooms((prev) => prev.filter((r) => r.id !== roomId));
  }, []);

  const createBooking = useCallback(
    (input: NewBookingInput) => {
      const room = rooms.find((r) => r.id === input.roomId);
      const ref = `#REF-${9200 + Math.floor(Math.random() * 799)}`;
      let guestId = guests.find((g) => g.email.toLowerCase() === input.guestEmail.toLowerCase())?.id;
      if (!guestId) {
        guestId = `guest-${2000 + Math.floor(Math.random() * 8999)}`;
        setGuests((prev) => [
          {
            id: guestId as string,
            name: input.guestName,
            email: input.guestEmail,
            phone: input.guestPhone,
            stays: 1,
            joined: format(new Date(), 'MMM yyyy'),
            country: 'Sri Lanka',
          },
          ...prev,
        ]);
      }
      const booking: Booking = {
        id: `bk-${Date.now()}`,
        ref,
        guestId,
        guestName: input.guestName,
        guestEmail: input.guestEmail,
        guestPhone: input.guestPhone,
        roomId: input.roomId,
        roomTitle: room?.title ?? 'Room',
        roomNumber: room?.number ?? '—',
        checkIn: input.checkIn,
        checkOut: input.checkOut,
        guests: input.guests,
        amount: input.amount,
        paid: input.paid,
        status: 'confirmed',
        specialRequests: input.specialRequests,
        source: input.source,
      };
      setBookings((prev) => [booking, ...prev]);
      return booking;
    },
    [guests, rooms]
  );

  const setStatus = (bookingId: string, status: BookingStatus, extra: Partial<Booking> = {}) =>
    setBookings((prev) => prev.map((b) => (b.id === bookingId ? { ...b, status, ...extra } : b)));

  const checkInBooking = useCallback(
    (bookingId: string) => {
      const booking = bookings.find((b) => b.id === bookingId);
      setStatus(bookingId, 'checked-in', { paid: true });
      if (booking) {
        setRooms((prev) =>
          prev.map((r) =>
            r.id === booking.roomId ? { ...r, status: 'occupied', guestName: booking.guestName } : r
          )
        );
      }
    },
    [bookings]
  );

  const checkOutBooking = useCallback(
    (bookingId: string) => {
      const booking = bookings.find((b) => b.id === bookingId);
      setStatus(bookingId, 'checked-out');
      if (booking) {
        setRooms((prev) =>
          prev.map((r) => (r.id === booking.roomId ? { ...r, status: 'cleaning', guestName: undefined } : r))
        );
      }
    },
    [bookings]
  );

  const cancelBooking = useCallback(
    (bookingId: string, reason: string) => {
      const booking = bookings.find((b) => b.id === bookingId);
      setStatus(bookingId, 'cancelled', { cancelReason: reason });
      if (booking) {
        setRooms((prev) =>
          prev.map((r) =>
            r.id === booking.roomId && r.status === 'occupied'
              ? { ...r, status: 'available', guestName: undefined }
              : r
          )
        );
      }
    },
    [bookings]
  );

  const addGuest = useCallback((guest: Pick<Guest, 'name' | 'email' | 'phone'>) => {
    const created: Guest = {
      ...guest,
      id: `guest-${3000 + Math.floor(Math.random() * 8999)}`,
      stays: 0,
      joined: format(new Date(), 'MMM yyyy'),
      country: 'Sri Lanka',
    };
    setGuests((prev) => [created, ...prev]);
    return created;
  }, []);

  const updateGuest = useCallback((guestId: string, patch: Partial<Guest>) => {
    setGuests((prev) => prev.map((g) => (g.id === guestId ? { ...g, ...patch } : g)));
  }, []);

  const deleteGuest = useCallback((guestId: string) => {
    setGuests((prev) => prev.filter((g) => g.id !== guestId));
  }, []);

  const addExperience = useCallback((experience: Omit<Experience, 'id' | 'active' | 'durationHours'>) => {
    const hours = parseFloat(experience.duration) || 2;
    setExperiences((prev) => [
      { ...experience, id: `exp-${Date.now()}`, active: true, durationHours: hours },
      ...prev,
    ]);
  }, []);

  const updateExperience = useCallback((id: string, patch: Partial<Experience>) => {
    setExperiences((prev) =>
      prev.map((e) =>
        e.id === id
          ? { ...e, ...patch, durationHours: patch.duration ? parseFloat(patch.duration) || e.durationHours : e.durationHours }
          : e
      )
    );
  }, []);

  const deleteExperience = useCallback((id: string) => {
    setExperiences((prev) => prev.filter((e) => e.id !== id));
  }, []);

  const resolveAlert = useCallback((id: string, resolution: 'approved' | 'dismissed') => {
    setAlerts((prev) => prev.map((a) => (a.id === id ? { ...a, resolved: resolution } : a)));
  }, []);

  const updateCustomer = useCallback((patch: Partial<CustomerProfile>) => {
    setCustomer((prev) => ({ ...prev, ...patch }));
  }, []);

  const value = useMemo<HotelContextValue>(
    () => ({
      rooms,
      bookings,
      guests,
      experiences,
      alerts,
      customer,
      setRoomStatus,
      addRoom,
      updateRoom,
      deleteRoom,
      createBooking,
      checkInBooking,
      checkOutBooking,
      cancelBooking,
      addGuest,
      updateGuest,
      deleteGuest,
      addExperience,
      updateExperience,
      deleteExperience,
      resolveAlert,
      updateCustomer,
    }),
    [
      rooms,
      bookings,
      guests,
      experiences,
      alerts,
      customer,
      setRoomStatus,
      addRoom,
      updateRoom,
      deleteRoom,
      createBooking,
      checkInBooking,
      checkOutBooking,
      cancelBooking,
      addGuest,
      updateGuest,
      deleteGuest,
      addExperience,
      updateExperience,
      deleteExperience,
      resolveAlert,
      updateCustomer,
    ]
  );

  return <HotelContext.Provider value={value}>{children}</HotelContext.Provider>;
}

export function useHotel() {
  const ctx = useContext(HotelContext);
  if (!ctx) throw new Error('useHotel must be used inside HotelDataProvider');
  return ctx;
}

export const todayISO = () => format(new Date(), 'yyyy-MM-dd');
export const tomorrowISO = () => format(addDays(new Date(), 1), 'yyyy-MM-dd');
export const defaultStay = () => ({ checkIn: todayISO(), checkOut: format(addDays(new Date(), 3), 'yyyy-MM-dd') });
