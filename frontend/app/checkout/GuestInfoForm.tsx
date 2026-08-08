"use client";

import { useState } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import Link from "next/link";
import { loadStripe } from "@stripe/stripe-js";
import {
  Elements,
  CardElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import { useAuth } from "@/lib/AuthContext";
import { submitBookingAndPayment } from "@/lib/checkout";

// Loaded once at module scope so Stripe.js isn't re-fetched on every render.
const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ?? ""
);

type GuestInfoFormProps = {
  roomId: string;
  checkIn: string;
  checkOut: string;
  guests: string;
  quote: Quote | null;
};

type Quote = {
  nightlyRate: number;
  nights: number;
  subtotal: number;
  tax: number;
  total: number;
};

type Fields = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  specialRequests: string;
};

type Errors = Partial<Record<keyof Fields, string>>;

type AuthLikeUser = {
  name?: string;
  fullName?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  phoneNumber?: string;
  phone_number?: string;
  mobile?: string;
  contact?: string;
  phoneNo?: string;
};

const FIELD_KEYS: Array<keyof Fields> = [
  "firstName",
  "lastName",
  "email",
  "phone",
  "specialRequests",
];

function validate(f: Fields): Errors {
  const e: Errors = {};

  if (!f.firstName.trim()) e.firstName = "First name is required";
  if (!f.lastName.trim()) e.lastName = "Last name is required";

  if (!f.email.trim()) {
    e.email = "Email is required";
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.email)) {
    e.email = "Enter a valid email address";
  }

  if (!f.phone.trim()) {
    e.phone = "Phone number is required";
  } else if (!/^\+?[\d\s\-()]{7,15}$/.test(f.phone)) {
    e.phone = "Enter a valid phone number";
  }

  if (f.specialRequests.length > 500) {
    e.specialRequests = "Special requests cannot exceed 500 characters";
  }

  return e;
}

function fieldCls(hasError?: string) {
  return `input-field w-full rounded-md border-2 bg-white px-4 py-3 font-outfit text-sm transition-colors focus:outline-none ${
    hasError
      ? "border-red-400 focus:border-red-500"
      : "border-sand focus:border-sage"
  }`;
}

function GuestInfoFormInner({
  roomId,
  checkIn,
  checkOut,
  guests,
  quote,
}: GuestInfoFormProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const stripe = useStripe();
  const elements = useElements();

  const currentUrl = searchParams.toString()
    ? `${pathname}?${searchParams.toString()}`
    : pathname;

  const loginRedirectUrl = `/login?redirect=${encodeURIComponent(currentUrl)}`;

  const auth = useAuth() as {
    user?: AuthLikeUser | null;
    loading?: boolean;
    isLoading?: boolean;
  };
  const user = auth?.user;
  const authLoading = auth?.loading ?? auth?.isLoading ?? false;

  const [fields, setFields] = useState<Partial<Fields>>({});

  const [errors, setErrors] = useState<Errors>({});
  const [touched, setTouched] = useState<Partial<Record<keyof Fields, boolean>>>(
    {}
  );
  const [agreedTerms, setAgreedTerms] = useState(false);
  const [termsError, setTermsError] = useState("");
  const [submitError, setSubmitError] = useState("");
  const [cardError, setCardError] = useState<string | undefined>(undefined);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [paymentStep, setPaymentStep] = useState<
    "idle" | "processing" | "confirming" | "saving"
  >("idle");

  const fullName = user?.name || user?.fullName || "";
  const nameParts = fullName.split(" ");
  const userPrefill = {
    firstName: user?.firstName || nameParts[0] || "",
    lastName: user?.lastName || nameParts.slice(1).join(" ") || "",
    email: user?.email || "",
    phone:
      user?.phone ||
      user?.phoneNumber ||
      user?.phone_number ||
      user?.mobile ||
      user?.contact ||
      user?.phoneNo ||
      "",
  };
  const resolvedFields: Fields = {
    firstName: fields.firstName ?? userPrefill.firstName,
    lastName: fields.lastName ?? userPrefill.lastName,
    email: fields.email ?? userPrefill.email,
    phone: fields.phone ?? userPrefill.phone,
    specialRequests: fields.specialRequests ?? "",
  };

  function set(field: keyof Fields, value: string) {
    const next = { ...fields, [field]: value };
    setFields(next);

    if (touched[field]) {
      const e = validate({
        firstName: next.firstName ?? userPrefill.firstName,
        lastName: next.lastName ?? userPrefill.lastName,
        email: next.email ?? userPrefill.email,
        phone: next.phone ?? userPrefill.phone,
        specialRequests: next.specialRequests ?? "",
      });
      setErrors((prev) => ({ ...prev, [field]: e[field] }));
    }
  }

  function touch(field: keyof Fields) {
    setTouched((prev) => ({ ...prev, [field]: true }));
    const e = validate(resolvedFields);
    setErrors((prev) => ({ ...prev, [field]: e[field] }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    // ⛔ Block proceeding if user is NOT logged in
    if (!user) {
      router.push(loginRedirectUrl);
      return;
    }

    if (isSubmitting) return;

    setSubmitError("");

    const allTouched = Object.fromEntries(
      FIELD_KEYS.map((k) => [k, true])
    ) as Record<keyof Fields, boolean>;
    setTouched(allTouched);

    const errs = validate(resolvedFields);
    setErrors(errs);

    if (!agreedTerms) {
      setTermsError("Please accept the Terms & Conditions before continuing");
      return;
    } else {
      setTermsError("");
    }

    if (Object.keys(errs).length > 0) {
      return;
    }

    if (!stripe || !elements) {
      setSubmitError("Payment form is still loading. Please try again in a moment.");
      return;
    }

    const cardElement = elements.getElement(CardElement);
    if (!cardElement) {
      setCardError("Please enter your card details.");
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await submitBookingAndPayment(
        {
          roomId,
          checkIn,
          checkOut,
          guests,
          specialRequests: resolvedFields.specialRequests,
          termsAccepted: agreedTerms,
        },
        stripe,
        cardElement,
        setPaymentStep
      );

      const successParams = new URLSearchParams({
        roomId,
        checkIn,
        checkOut,
        guests,
      });
      if (result.bookingReference) successParams.set("ref", result.bookingReference);
      if (quote?.total != null) successParams.set("total", String(quote.total));
      router.push(`/checkout/success?${successParams.toString()}`);
    } catch (error: unknown) {
      console.error("Booking failed:", error);
      const message =
        error instanceof Error
          ? error.message
          : "Failed to complete booking. Please try again.";
      setSubmitError(
        message || "Failed to complete booking. Please try again."
      );
      setIsSubmitting(false);
      setPaymentStep("idle");
    }
  }

  const err = (field: keyof Fields) =>
    touched[field] ? errors[field] : undefined;

  if (authLoading) {
    return (
      <div className="p-6 font-outfit text-sm text-jungle/60">
        Loading guest details...
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      className="flex w-full max-w-2xl flex-col gap-6"
    >
      {!user && (
        <div className="flex items-center justify-between rounded-lg border border-amber-200 bg-amber-50/80 p-4 font-outfit text-sm text-amber-900">
          <span>Already have an account with us?</span>
          <Link
            href={loginRedirectUrl}
            className="font-medium text-emerald-800 underline hover:text-emerald-950"
          >
            Sign in to autofill details →
          </Link>
        </div>
      )}

      <div className="flex flex-col gap-1.5">
        <h2 className="font-lora text-2xl font-medium text-jungle-dark">
          Guest Information
        </h2>
        <p className="font-outfit text-sm text-jungle/60">
          We will use these details to send your booking confirmation and
          contact you if needed.
        </p>
      </div>

      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
          <div className="flex flex-1 flex-col">
            <input
              type="text"
              placeholder="First Name*"
              autoComplete="given-name"
              aria-label="First Name"
              aria-invalid={!!err("firstName")}
              value={resolvedFields.firstName}
              onChange={(e) => set("firstName", e.target.value)}
              onBlur={() => touch("firstName")}
              className={fieldCls(err("firstName"))}
            />
            {err("firstName") && (
              <span className="mt-1 font-outfit text-xs text-red-500">
                {err("firstName")}
              </span>
            )}
          </div>

          <div className="flex flex-1 flex-col">
            <input
              type="text"
              placeholder="Last Name*"
              autoComplete="family-name"
              aria-label="Last Name"
              aria-invalid={!!err("lastName")}
              value={resolvedFields.lastName}
              onChange={(e) => set("lastName", e.target.value)}
              onBlur={() => touch("lastName")}
              className={fieldCls(err("lastName"))}
            />
            {err("lastName") && (
              <span className="mt-1 font-outfit text-xs text-red-500">
                {err("lastName")}
              </span>
            )}
          </div>
        </div>

        <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
          <div className="flex flex-1 flex-col">
            <input
              type="email"
              placeholder="Email Address*"
              autoComplete="email"
              aria-label="Email Address"
              aria-invalid={!!err("email")}
              value={resolvedFields.email}
              onChange={(e) => set("email", e.target.value)}
              onBlur={() => touch("email")}
              className={fieldCls(err("email"))}
            />
            {err("email") && (
              <span className="mt-1 font-outfit text-xs text-red-500">
                {err("email")}
              </span>
            )}
          </div>

          <div className="flex flex-1 flex-col">
            <input
              type="tel"
              placeholder="Phone Number*"
              autoComplete="tel"
              aria-label="Phone Number"
              aria-invalid={!!err("phone")}
              value={resolvedFields.phone}
              onChange={(e) => set("phone", e.target.value)}
              onBlur={() => touch("phone")}
              className={fieldCls(err("phone"))}
            />
            {err("phone") && (
              <span className="mt-1 font-outfit text-xs text-red-500">
                {err("phone")}
              </span>
            )}
          </div>
        </div>

        <div className="flex flex-col gap-1">
          <textarea
            placeholder="Special Requests (optional)"
            aria-label="Special Requests"
            value={resolvedFields.specialRequests}
            onChange={(e) => set("specialRequests", e.target.value)}
            onBlur={() => touch("specialRequests")}
            rows={4}
            maxLength={500}
            className={`w-full resize-none rounded-md border-2 bg-white px-4 py-3 font-outfit text-sm transition-colors focus:outline-none ${
              err("specialRequests")
                ? "border-red-400 focus:border-red-500"
                : "border-sand focus:border-sage"
            }`}
          />
          <div className="flex items-center justify-between">
            {err("specialRequests") ? (
              <span className="font-outfit text-xs text-red-500">
                {err("specialRequests")}
              </span>
            ) : (
              <span />
            )}
            <span className="font-outfit text-xs text-jungle/45">
              {resolvedFields.specialRequests.length}/500
            </span>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="font-outfit text-sm font-medium text-jungle">
          Card details
        </label>
        <div className={fieldCls(cardError)}>
          <CardElement
            options={{
              hidePostalCode: true,
              style: {
                base: {
                  fontSize: "14px",
                  color: "#1f2d27",
                  fontFamily: "Outfit, sans-serif",
                  "::placeholder": { color: "#9ca3af" },
                },
                invalid: { color: "#ef4444" },
              },
            }}
            onChange={(e) => setCardError(e.error?.message)}
          />
        </div>
        {cardError ? (
          <p className="font-outfit text-sm text-red-500">{cardError}</p>
        ) : (
          <p className="font-outfit text-xs text-jungle/45">
            Test mode — use 4242 4242 4242 4242, any future expiry, any CVC.
          </p>
        )}
      </div>

      <div className="flex flex-col gap-2">
        <label className="flex items-start gap-3 font-outfit text-sm text-jungle cursor-pointer select-none">
          <input
            type="checkbox"
            checked={agreedTerms}
            onChange={(e) => {
              setAgreedTerms(e.target.checked);
              if (e.target.checked) setTermsError("");
            }}
            className="mt-1 h-4 w-4 rounded border-sand text-sage focus:ring-sage"
          />
          <span>
            I agree to the{" "}
            <a
              href="/terms"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 underline"
            >
              Terms & Conditions
            </a>{" "}
            and confirm that my booking details are correct.
          </span>
        </label>
        {termsError && (
          <p className="font-outfit text-sm text-red-500">{termsError}</p>
        )}
      </div>

      {submitError && (
        <div className="rounded-md border border-red-300 bg-red-50 p-3 font-outfit text-sm text-red-600">
          {submitError}
        </div>
      )}

      {/* Warning prompt if user is not signed in */}
      {!user && (
        <p className="font-outfit text-xs text-amber-800">
          * You must be signed in to complete your booking.
        </p>
      )}

      <button
        type="submit"
        disabled={isSubmitting}
        className="btn-primary sm:w-auto sm:self-start sm:px-10 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {!user
          ? "Sign In to Pay & Book"
          : paymentStep === "processing"
          ? "Reserving Your Room..."
          : paymentStep === "confirming"
          ? "Authorizing Payment..."
          : paymentStep === "saving"
          ? "Confirming Booking..."
          : "Pay & Book"}
      </button>
    </form>
  );
}

// Stripe's useStripe/useElements hooks only work inside <Elements>, so the form
// body lives in GuestInfoFormInner and this wrapper provides the Stripe context.
export function GuestInfoForm(props: GuestInfoFormProps) {
  return (
    <Elements stripe={stripePromise}>
      <GuestInfoFormInner {...props} />
    </Elements>
  );
}