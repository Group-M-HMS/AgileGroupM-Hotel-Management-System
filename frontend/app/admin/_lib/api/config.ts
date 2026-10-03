import { auth } from '@/lib/firebase';

export const ROOM_SERVICE_URL = process.env.NEXT_PUBLIC_ROOM_SERVICE_URL ?? 'http://localhost:8081';
export const BOOKING_SERVICE_URL = process.env.NEXT_PUBLIC_BOOKING_SERVICE_URL ?? 'http://localhost:8085';
export const USER_SERVICE_URL = process.env.NEXT_PUBLIC_USER_SERVICE_URL ?? 'http://localhost:8082';

export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

async function parseError(response: Response): Promise<string> {
  try {
    const body = await response.json();
    return body?.message || body?.error || response.statusText;
  } catch {
    return response.statusText;
  }
}

/** Plain (unwrapped) JSON endpoints on room-service's public RoomController and user-service's UserController. */
export async function rawFetch<T>(url: string, init: RequestInit = {}): Promise<T> {
  const response = await fetch(url, {
    ...init,
    headers: { 'Content-Type': 'application/json', ...(init.headers ?? {}) },
  });
  if (!response.ok) throw new ApiError(await parseError(response), response.status);
  if (response.status === 204) return undefined as T;
  return response.json();
}

/** Resolves the signed-in admin's Firebase ID token, waiting out the async session restore. */
async function adminBearerToken(): Promise<string> {
  await auth.authStateReady();
  const token = await auth.currentUser?.getIdToken();
  if (!token) throw new ApiError('Not authenticated', 401);
  return token;
}

/**
 * room-service calls for RoomController (list/create/update/delete/status/audit-logs) -
 * all admin-only now. Attaches a bearer token when the caller is signed in.
 */
export async function roomFetch<T>(path: string, init: RequestInit = {}): Promise<T> {
  await auth.authStateReady();
  const token = await auth.currentUser?.getIdToken();
  const response = await fetch(`${ROOM_SERVICE_URL}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(init.headers ?? {}),
    },
  });
  if (!response.ok) throw new ApiError(await parseError(response), response.status);
  if (response.status === 204) return undefined as T;
  return response.json();
}

type Envelope<T> = { success: boolean; message: string | null; data: T };

/** Admin endpoints wrapped in { success, message, data } and gated by a Firebase admin claim. */
async function adminEnvelopeFetch<T>(baseUrl: string, path: string, init: RequestInit = {}): Promise<T> {
  const token = await adminBearerToken();
  const response = await fetch(`${baseUrl}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      ...(init.headers ?? {}),
    },
  });
  if (!response.ok) throw new ApiError(await parseError(response), response.status);
  if (response.status === 204) return undefined as T;
  const envelope: Envelope<T> = await response.json();
  return envelope.data;
}

/** room-service /api/admin/experiences (ExperienceAdminController). */
export function roomAdminFetch<T>(path: string, init: RequestInit = {}): Promise<T> {
  return adminEnvelopeFetch<T>(ROOM_SERVICE_URL, path, init);
}

/** booking-service /api/admin/* (BookingAdminController, DashboardMetricsController, GuestRequestController, GlobalSearchController). */
export function bookingAdminFetch<T>(path: string, init: RequestInit = {}): Promise<T> {
  return adminEnvelopeFetch<T>(BOOKING_SERVICE_URL, path, init);
}

/** user-service calls requiring a real Firebase Bearer token (UserController's admin guest-directory endpoints). */
export async function userServiceFetch<T>(path: string, init: RequestInit = {}): Promise<T> {
  // HotelDataProvider fires this on mount, before Firebase's async session
  // restore (onAuthStateChanged) has resolved -- without this, auth.currentUser
  // is still null on a fresh page load even for a signed-in admin.
  await auth.authStateReady();
  const token = await auth.currentUser?.getIdToken();
  if (!token) throw new ApiError('Not authenticated', 401);
  const response = await fetch(`${USER_SERVICE_URL}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      ...(init.headers ?? {}),
    },
  });
  if (!response.ok) throw new ApiError(await parseError(response), response.status);
  if (response.status === 204) return undefined as T;
  return response.json();
}
