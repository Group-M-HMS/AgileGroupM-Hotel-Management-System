// TODO(NIBM2-460): once room-service (or a dedicated auth service) has real user accounts and
// password hashing, delete this fixture module and call the real endpoint instead. Passwords
// here are compared in plaintext — mock-only, never a real auth scheme.

export type MockUser = {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
};

export type PublicUser = Omit<MockUser, "password">;

// Anchored on `globalThis` for the same reason as MOCK_BOOKINGS in
// app/manage-booking/mockBookings.ts: Next.js's dev bundler compiles Server Components and
// Route Handlers into separate module graphs, so a plain top-level array isn't guaranteed to
// be the same instance across both.
const globalForMockUsers = globalThis as unknown as { __MOCK_USERS__?: MockUser[] };

export const MOCK_USERS: MockUser[] =
  globalForMockUsers.__MOCK_USERS__ ??
  (globalForMockUsers.__MOCK_USERS__ = [
    {
      email: "test@example.com",
      password: "Passw0rd",
      firstName: "Test",
      lastName: "User",
    },
  ]);

function toPublicUser(user: MockUser): PublicUser {
  const { password: _password, ...publicUser } = user;
  return publicUser;
}

export function findMockUserByEmail(email: string): MockUser | null {
  const match = MOCK_USERS.find(u => u.email.toLowerCase() === email.toLowerCase());
  return match ?? null;
}

export function verifyMockUser(email: string, password: string): PublicUser | null {
  const user = findMockUserByEmail(email);
  if (!user || user.password !== password) return null;
  return toPublicUser(user);
}

export function createMockUser(input: {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}): PublicUser | null {
  if (findMockUserByEmail(input.email)) return null;
  const user: MockUser = { ...input };
  MOCK_USERS.push(user);
  return toPublicUser(user);
}
