import type { Stripe, StripeCardElement } from "@stripe/stripe-js";
import { auth } from "./firebase";

// The frontend talks to the booking/payment services directly, the same way the
// dashboard and apiClient talk to room-service/user-service (no BFF proxy layer).
const BOOKING_SERVICE_URL =
  process.env.NEXT_PUBLIC_BOOKING_SERVICE_URL ?? "http://168.138.170.92:8085";
const PAYMENT_SERVICE_URL =
  process.env.NEXT_PUBLIC_PAYMENT_SERVICE_URL ?? "http://168.138.170.92:8084";

type ApiEnvelope<T> = { success: boolean; message: string | null; data: T };

async function unwrap<T>(res: Response): Promise<T> {
  const body = (await res.json().catch(() => null)) as ApiEnvelope<T> | null;
  if (!res.ok || !body?.success) {
    throw new Error(body?.message || `Request failed (${res.status}).`);
  }
  return body.data;
}

export type CheckoutStep = "processing" | "confirming" | "saving";

export type BookingPaymentInput = {
  roomId: string;
  checkIn: string; // YYYY-MM-DD
  checkOut: string; // YYYY-MM-DD
  guests: string;
  specialRequests: string;
  termsAccepted: boolean;
};

export type BookingPaymentResult = {
  bookingId: number;
  bookingStatus: string;
  paymentStatus: string;
  bookingReference: string | null;
};

/**
 * Runs the full checkout pipeline against the real backend services:
 *   1. booking-service   creates a PENDING booking (X-User-Id = Firebase UID)
 *   2. payment-service   creates a Stripe PaymentIntent, returns its clientSecret
 *   3. Stripe.js         confirms the card the customer entered (Stripe Elements)
 *   4. payment-service   verifies the intent succeeded and flips the booking to CONFIRMED
 */
export async function submitBookingAndPayment(
  input: BookingPaymentInput,
  stripe: Stripe,
  cardElement: StripeCardElement,
  onStep?: (step: CheckoutStep) => void
): Promise<BookingPaymentResult> {
  const uid = auth.currentUser?.uid;
  if (!uid) throw new Error("You must be signed in to complete a booking.");

  // 1. Create the booking (PENDING).
  onStep?.("processing");
  const bookingRes = await fetch(`${BOOKING_SERVICE_URL}/api/v1/bookings`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "X-User-Id": uid },
    body: JSON.stringify({
      roomId: Number(input.roomId),
      checkInDate: input.checkIn,
      checkOutDate: input.checkOut,
      numberOfGuests: Number(input.guests),
      specialRequests: input.specialRequests || null,
      termsAccepted: input.termsAccepted,
    }),
  });
  // CreateBookingResponse names the booking id `uuid`, though it is a numeric id.
  const booking = await unwrap<{ uuid: number }>(bookingRes);
  const bookingId = booking.uuid;

  // 2. Create the Stripe PaymentIntent for that booking.
  const paymentRes = await fetch(`${PAYMENT_SERVICE_URL}/api/v1/payments/create`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ bookingId, paymentMethod: "card" }),
  });
  const payment = await unwrap<{ paymentId: number; clientSecret: string }>(
    paymentRes
  );

  // 3. Confirm the card the customer entered via Stripe Elements.
  onStep?.("confirming");
  const { error, paymentIntent } = await stripe.confirmCardPayment(
    payment.clientSecret,
    { payment_method: { card: cardElement } }
  );
  if (error) throw new Error(error.message || "Card payment was declined.");
  if (paymentIntent?.status !== "succeeded") {
    throw new Error(
      `Payment did not complete (status: ${paymentIntent?.status ?? "unknown"}).`
    );
  }

  // 4. Confirm server-side -> booking becomes CONFIRMED and gets its reference.
  onStep?.("saving");
  const confirmRes = await fetch(`${PAYMENT_SERVICE_URL}/api/v1/payments/confirm`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      paymentId: payment.paymentId,
      transactionReference: paymentIntent.id,
    }),
  });
  const confirmed = await unwrap<{
    status: string;
    bookingStatus: string;
    bookingReference: string | null;
  }>(confirmRes);

  return {
    bookingId,
    bookingStatus: confirmed.bookingStatus,
    paymentStatus: confirmed.status,
    bookingReference: confirmed.bookingReference,
  };
}
