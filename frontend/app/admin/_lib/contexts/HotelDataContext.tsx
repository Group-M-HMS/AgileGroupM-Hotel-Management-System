'use client';

import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { addDays, format } from 'date-fns';
import type { AlertItem, Booking, Experience, Guest, Room, RoomStatus } from '../types/hotel';
import { fetchRooms, createRoom as apiCreateRoom, updateRoom as apiUpdateRoom, deleteRoom as apiDeleteRoom, updateRoomStatus as apiUpdateRoomStatus } from '../api/rooms';
import { fetchBookings, createWalkInBooking, checkInBooking as apiCheckIn, checkOutBooking as apiCheckOut, cancelBooking as apiCancelBooking } from '../api/bookings';
import { fetchGuests, registerGuest, updateGuest as apiUpdateGuest, deleteGuest as apiDeleteGuest } from '../api/guests';
import { fetchExperiences, createExperience as apiCreateExperience, updateExperience as apiUpdateExperience, deleteExperience as apiDeleteExperience } from '../api/experiences';
import { fetchAlerts, resolveAlert as apiResolveAlert } from '../api/alerts';

export interface NewBookingInput {
  guestName: string;
  guestEmail: string;
  guestPhone: string;
  roomId: string;
  checkIn: string;
  checkOut: string;
  guests: number;
  specialRequests: string;
  paid: boolean;
}

interface HotelContextValue {
  rooms: Room[];
  bookings: Booking[];
  guests: Guest[];
  experiences: Experience[];
  alerts: AlertItem[];
  loading: boolean;
  // rooms
  setRoomStatus: (roomId: string, status: RoomStatus) => Promise<void>;
  addRoom: (room: Omit<Room, 'id' | 'status'>) => Promise<void>;
  updateRoom: (roomId: string, patch: Partial<Room>) => Promise<void>;
  deleteRoom: (roomId: string) => Promise<void>;
  // bookings
  createBooking: (input: NewBookingInput) => Promise<void>;
  checkInBooking: (bookingId: string) => Promise<void>;
  checkOutBooking: (bookingId: string) => Promise<void>;
  cancelBooking: (bookingId: string, reason: string) => Promise<void>;
  // guests
  addGuest: (guest: { firstName: string; lastName: string; email: string; phone: string }) => Promise<void>;
  updateGuest: (guestId: string, patch: { firstName: string; lastName: string; email: string; phone: string }) => Promise<void>;
  deleteGuest: (guestId: string) => Promise<void>;
  // experiences
  addExperience: (experience: Omit<Experience, 'id' | 'active' | 'durationHours'>) => Promise<void>;
  updateExperience: (id: string, patch: Partial<Experience>) => Promise<void>;
  deleteExperience: (id: string) => Promise<void>;
  // alerts
  resolveAlert: (id: string, resolution: 'approved' | 'dismissed') => Promise<void>;
}

const HotelContext = createContext<HotelContextValue | null>(null);

export function HotelDataProvider({ children }: { children: React.ReactNode }) {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [guests, setGuests] = useState<Guest[]>([]);
  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [alerts, setAlerts] = useState<AlertItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      // Each domain loads independently — e.g. an unauthenticated admin still sees
      // Rooms/Bookings/Experiences/Alerts even though Guests (Firebase-gated) fails.
      const results = await Promise.allSettled([
        fetchRooms(),
        fetchBookings(),
        fetchGuests(),
        fetchExperiences(),
        fetchAlerts(),
      ]);
      if (cancelled) return;
      const [roomsRes, bookingsRes, guestsRes, experiencesRes, alertsRes] = results;
      if (roomsRes.status === 'fulfilled') setRooms(roomsRes.value);
      else console.error('Failed to load rooms', roomsRes.reason);
      if (bookingsRes.status === 'fulfilled') setBookings(bookingsRes.value);
      else console.error('Failed to load bookings', bookingsRes.reason);
      if (guestsRes.status === 'fulfilled') setGuests(guestsRes.value);
      else console.error('Failed to load guests', guestsRes.reason);
      if (experiencesRes.status === 'fulfilled') setExperiences(experiencesRes.value);
      else console.error('Failed to load experiences', experiencesRes.reason);
      if (alertsRes.status === 'fulfilled') setAlerts(alertsRes.value);
      else console.error('Failed to load alerts', alertsRes.reason);
      setLoading(false);
    }
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const setRoomStatus = useCallback(async (roomId: string, status: RoomStatus) => {
    await apiUpdateRoomStatus(roomId, status);
    setRooms((prev) => prev.map((r) => (r.id === roomId ? { ...r, status } : r)));
  }, []);

  const addRoom = useCallback(async (room: Omit<Room, 'id' | 'status'>) => {
    const created = await apiCreateRoom(room);
    setRooms((prev) => [created, ...prev]);
  }, []);

  const updateRoom = useCallback(
    async (roomId: string, patch: Partial<Room>) => {
      const current = rooms.find((r) => r.id === roomId);
      if (!current) return;
      const merged = { ...current, ...patch };
      const updated = await apiUpdateRoom(roomId, merged);
      setRooms((prev) => prev.map((r) => (r.id === roomId ? updated : r)));
    },
    [rooms]
  );

  const deleteRoom = useCallback(async (roomId: string) => {
    await apiDeleteRoom(roomId);
    setRooms((prev) => prev.filter((r) => r.id !== roomId));
  }, []);

  const createBooking = useCallback(async (input: NewBookingInput) => {
    await createWalkInBooking(input);
    const refreshed = await fetchBookings();
    setBookings(refreshed);
    const refreshedRooms = await fetchRooms();
    setRooms(refreshedRooms);
  }, []);

  const checkInBooking = useCallback(async (bookingId: string) => {
    await apiCheckIn(bookingId);
    const [refreshedBookings, refreshedRooms] = await Promise.all([fetchBookings(), fetchRooms()]);
    setBookings(refreshedBookings);
    setRooms(refreshedRooms);
  }, []);

  const checkOutBooking = useCallback(async (bookingId: string) => {
    await apiCheckOut(bookingId);
    const [refreshedBookings, refreshedRooms] = await Promise.all([fetchBookings(), fetchRooms()]);
    setBookings(refreshedBookings);
    setRooms(refreshedRooms);
  }, []);

  const cancelBooking = useCallback(async (bookingId: string, reason: string) => {
    await apiCancelBooking(bookingId, reason);
    const [refreshedBookings, refreshedRooms] = await Promise.all([fetchBookings(), fetchRooms()]);
    setBookings(refreshedBookings);
    setRooms(refreshedRooms);
  }, []);

  const addGuest = useCallback(
    async (guest: { firstName: string; lastName: string; email: string; phone: string }) => {
      const created = await registerGuest(guest);
      setGuests((prev) => [created, ...prev]);
    },
    []
  );

  const updateGuest = useCallback(
    async (guestId: string, patch: { firstName: string; lastName: string; email: string; phone: string }) => {
      const updated = await apiUpdateGuest(guestId, patch);
      setGuests((prev) => prev.map((g) => (g.id === guestId ? { ...updated, stays: g.stays } : g)));
    },
    []
  );

  const deleteGuest = useCallback(async (guestId: string) => {
    await apiDeleteGuest(guestId);
    setGuests((prev) => prev.filter((g) => g.id !== guestId));
  }, []);

  const addExperience = useCallback(async (experience: Omit<Experience, 'id' | 'active' | 'durationHours'>) => {
    const created = await apiCreateExperience(experience);
    setExperiences((prev) => [created, ...prev]);
  }, []);

  const updateExperience = useCallback(
    async (id: string, patch: Partial<Experience>) => {
      const current = experiences.find((e) => e.id === id);
      if (!current) return;
      const merged = { ...current, ...patch };
      const updated = await apiUpdateExperience(id, merged);
      setExperiences((prev) => prev.map((e) => (e.id === id ? updated : e)));
    },
    [experiences]
  );

  const deleteExperience = useCallback(async (id: string) => {
    await apiDeleteExperience(id);
    setExperiences((prev) => prev.filter((e) => e.id !== id));
  }, []);

  const resolveAlert = useCallback(async (id: string, resolution: 'approved' | 'dismissed') => {
    await apiResolveAlert(id, resolution);
    setAlerts((prev) => prev.map((a) => (a.id === id ? { ...a, resolved: resolution } : a)));
  }, []);

  const value = useMemo<HotelContextValue>(
    () => ({
      rooms,
      bookings,
      guests,
      experiences,
      alerts,
      loading,
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
    }),
    [
      rooms,
      bookings,
      guests,
      experiences,
      alerts,
      loading,
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
