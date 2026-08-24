import type { Room, RoomStatus } from '../types/hotel';
import { roomFetch } from './config';

interface RoomInventoryResponse {
  id: number;
  title: string;
  roomNumber: string;
  roomType: string;
  shortDescription: string;
  fullDescription: string;
  pricePerNight: number;
  maxOccupancy: number;
  sizeSqm: number;
  bedCount: number;
  bedType: string;
  thumbnailUrl: string;
  gallery: string[];
  amenities: string[];
  status?: string;
}

function toStatus(status: string | undefined): RoomStatus {
  const normalized = (status ?? 'AVAILABLE').toLowerCase();
  if (normalized === 'occupied') return 'occupied';
  if (normalized === 'cleaning' || normalized === 'needs_cleaning') return 'cleaning';
  if (normalized === 'maintenance') return 'maintenance';
  return 'available';
}

function toStatusApiValue(status: RoomStatus): string {
  return { available: 'AVAILABLE', occupied: 'OCCUPIED', cleaning: 'CLEANING', maintenance: 'MAINTENANCE' }[status];
}

function toRoom(dto: RoomInventoryResponse): Room {
  return {
    id: String(dto.id),
    number: dto.roomNumber ?? '—',
    title: dto.title,
    type: dto.roomType ?? '',
    bedType: dto.bedType ?? '',
    price: dto.pricePerNight,
    capacity: dto.maxOccupancy,
    sqm: dto.sizeSqm ?? 0,
    image: dto.thumbnailUrl ?? '',
    gallery: dto.gallery?.length ? dto.gallery : [dto.thumbnailUrl ?? ''],
    description: dto.fullDescription ?? dto.shortDescription ?? '',
    amenities: dto.amenities ?? [],
    status: toStatus(dto.status),
  };
}

export async function fetchRooms(): Promise<Room[]> {
  const rooms = await roomFetch<RoomInventoryResponse[]>('/api/rooms');
  return rooms.map(toRoom);
}

export interface RoomFormInput {
  title: string;
  number: string;
  type: string;
  bedType: string;
  price: number;
  capacity: number;
  sqm: number;
  image: string;
  gallery: string[];
  description: string;
  amenities: string[];
}

function toRoomRequestBody(room: RoomFormInput) {
  return {
    title: room.title,
    roomNumber: room.number,
    roomType: room.type,
    shortDescription: room.description.slice(0, 140),
    fullDescription: room.description,
    pricePerNight: room.price,
    maxOccupancy: room.capacity,
    sizeSqm: room.sqm,
    bedCount: 1,
    bedType: room.bedType,
    thumbnailUrl: room.image,
    gallery: room.gallery,
    amenities: room.amenities,
  };
}

export async function createRoom(room: RoomFormInput): Promise<Room> {
  const dto = await roomFetch<RoomInventoryResponse>('/api/rooms', {
    method: 'POST',
    body: JSON.stringify(toRoomRequestBody(room)),
  });
  return toRoom(dto);
}

export async function updateRoom(roomId: string, room: RoomFormInput): Promise<Room> {
  const dto = await roomFetch<RoomInventoryResponse>(`/api/rooms/${roomId}`, {
    method: 'PUT',
    body: JSON.stringify(toRoomRequestBody(room)),
  });
  return toRoom(dto);
}

export async function deleteRoom(roomId: string): Promise<void> {
  await roomFetch<void>(`/api/rooms/${roomId}`, { method: 'DELETE' });
}

export async function updateRoomStatus(roomId: string, status: RoomStatus, guestName?: string): Promise<void> {
  await roomFetch<unknown>(`/api/rooms/${roomId}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status: toStatusApiValue(status), guestName: guestName ?? null }),
  });
}
