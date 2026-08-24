import { format } from 'date-fns';
import type { Guest } from '../types/hotel';
import { rawFetch, USER_SERVICE_URL, userServiceFetch } from './config';

interface UserResponseDto {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  createdAt: string | null;
}

interface BookingDto {
  id: number;
  status: string;
}

function toGuest(dto: UserResponseDto, stays = 0): Guest {
  return {
    id: dto.id,
    name: `${dto.firstName} ${dto.lastName}`.trim(),
    email: dto.email,
    phone: dto.phone,
    stays,
    joined: dto.createdAt ? format(new Date(dto.createdAt), 'MMM yyyy') : '—',
    country: 'Sri Lanka',
  };
}

export async function fetchGuests(): Promise<Guest[]> {
  const guests = await userServiceFetch<UserResponseDto[]>('/api/users');
  return guests.map((g) => toGuest(g));
}

/** Public endpoint (no auth) for registering walk-in/offline guests who never created an account. */
export async function registerGuest(input: {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
}): Promise<Guest> {
  const dto = await rawFetch<UserResponseDto>(`${USER_SERVICE_URL}/api/users/register`, {
    method: 'POST',
    body: JSON.stringify(input),
  });
  return toGuest(dto);
}

export async function fetchGuestStayCount(guestId: string): Promise<number> {
  const bookings = await userServiceFetch<BookingDto[]>(`/api/users/${guestId}/bookings`);
  return bookings.filter((b) => b.status === 'CHECKED_OUT').length;
}

export async function updateGuest(
  guestId: string,
  patch: { firstName: string; lastName: string; email: string; phone: string }
): Promise<Guest> {
  const dto = await userServiceFetch<UserResponseDto>(`/api/users/${guestId}`, {
    method: 'PUT',
    body: JSON.stringify(patch),
  });
  return toGuest(dto);
}

export async function deleteGuest(guestId: string): Promise<void> {
  await userServiceFetch<void>(`/api/users/${guestId}`, { method: 'DELETE' });
}
