"use client";

import { CheckCircle2 } from "lucide-react";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function PaymentSuccessModal({
  open,
  bookingReference = "RN-2026-0001",
  onClose,
}) {
  const router = useRouter();

  useEffect(() => {
    if (!open) return;

    const timer = setTimeout(() => {
      router.push("/booking-confirmation");
    }, 3000);

    return () => clearTimeout(timer);
  }, [open, router]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">

      <div className="w-full max-w-md rounded-3xl bg-white p-10 text-center shadow-2xl">

        <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-green-100">

          <CheckCircle2
            size={60}
            className="text-green-600"
          />

        </div>

        <h2 className="mt-6 font-lora text-3xl text-jungle-dark">
          Payment Successful
        </h2>

        <p className="mt-4 leading-7 text-stone-600">
          Thank you for choosing River Nest Eco Villa.
          Your booking has been confirmed successfully.
        </p>

        <div className="mt-8 rounded-2xl bg-sand-light p-5">

          <p className="text-sm uppercase tracking-[3px] text-stone-500">
            Booking Reference
          </p>

          <p className="mt-2 font-lora text-2xl text-sage">
            {bookingReference}
          </p>

        </div>

        <p className="mt-8 text-sm text-stone-500">
          Redirecting to your booking confirmation...
        </p>

        <button
          onClick={() => {
            if (onClose) onClose();
            router.push("/booking-confirmation");
          }}
          className="mt-8 w-full rounded-xl bg-jungle-dark py-4 font-semibold text-white transition hover:bg-sage hover:text-jungle-dark"
        >
          View Booking
        </button>

      </div>

    </div>
  );
}