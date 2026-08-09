import { auth } from "./firebase";

const USER_SERVICE_URL = process.env.NEXT_PUBLIC_USER_SERVICE_URL ?? "http://localhost:8082";

async function authorizedFetch(path: string, init: RequestInit = {}): Promise<Response> {
  const token = await auth.currentUser?.getIdToken();
  if (!token) throw new Error("Not authenticated");

  return fetch(`${USER_SERVICE_URL}${path}`, {
    ...init,
    headers: {
      ...(init.headers ?? {}),
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });
}

export type UserProfile = {
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
};

export async function syncProfile(data: {
  firstName: string;
  lastName: string;
  phone: string;
}): Promise<UserProfile> {
  const response = await authorizedFetch("/api/users/sync", {
    method: "POST",
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error("Failed to sync profile");
  return response.json();
}

export async function fetchProfile(): Promise<UserProfile> {
  const response = await authorizedFetch("/api/users/me", { method: "GET" });
  if (!response.ok) throw new Error("Failed to fetch profile");
  return response.json();
}

export async function logoutBackend(): Promise<void> {
  await authorizedFetch("/api/auth/logout", { method: "POST" });
}
