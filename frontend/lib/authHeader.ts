import { auth } from "./firebase";

/**
 * Authorization header carrying the signed-in user's Firebase ID token. Booking and payment
 * services take the customer's identity from this verified token, never from a client-supplied id.
 */
export async function bearerHeader(): Promise<{ Authorization: string }> {
  const token = await auth.currentUser?.getIdToken();
  if (!token) throw new Error("You must be signed in to do that.");
  return { Authorization: `Bearer ${token}` };
}
