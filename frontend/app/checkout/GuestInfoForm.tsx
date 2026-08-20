"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/lib/AuthContext";

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

export function GuestInfoForm({
  roomId,
  checkIn,
  checkOut,
  guests,
  quote,
}: {
  roomId: string;
  checkIn: string;
  checkOut: string;
  guests: string;
  quote: Quote | null;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const currentUrl = searchParams.toString()
    ? `${pathname}?${searchParams.toString()}`
    : pathname;

  const loginRedirectUrl = `/login?redirect=${encodeURIComponent(currentUrl)}`;

  const auth = useAuth() as any;
  const user = auth?.user;
  const authLoading = auth?.loading ?? auth?.isLoading ?? false;

  const [fields, setFields] = useState<Fields>({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    specialRequests: "",
  });

  const [errors, setErrors] = useState<Errors>({});
  const [touched, setTouched] = useState<Partial<Record<keyof Fields, boolean>>>(
    {}
  );
  const [agreedTerms, setAgreedTerms] = useState(false);
  const [termsError, setTermsError] = useState("");
  const [submitError, setSubmitError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [paymentStep, setPaymentStep] = useState<
    "idle" | "processing" | "saving"
  >("idle");

  useEffect(() => {
    if (user) {
      const u = user as Record<string, any>;
      const fullName = u.name || u.fullName || "";
      const nameParts = fullName.split(" ");

      setFields((prev) => ({
        ...prev,
        firstName: u.firstName || nameParts[0] || prev.firstName,
        lastName: u.lastName || nameParts.slice(1).join(" ") || prev.lastName,
        email: u.email || prev.email,
        phone:
          u.phone ||
          u.phoneNumber ||
          u.phone_number ||
          u.mobile ||
          u.contact ||
          u.phoneNo ||
          prev.phone,
      }));
    }
  }, [user]);

  function set(field: keyof Fields, value: string) {
    const next = { ...fields, [field]: value };
    setFields(next);

    if (touched[field]) {
      const e = validate(next);
      setErrors((prev) => ({ ...prev, [field]: e[field] }));
    }
  }

  function touch(field: keyof Fields) {
    setTouched((prev) => ({ ...prev, [field]: true }));
    const e = validate(fields);
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
      Object.keys(fields).map((k) => [k, true])
    ) as Record<keyof Fields, boolean>;
    setTouched(allTouched);

    const errs = validate(fields);
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

    setIsSubmitting(true);

    try {
      setPaymentStep("processing");
      await new Promise((resolve) => setTimeout(resolve, 1500));

      const mockPaymentResult = {
        status: "COMPLETED",
        transactionId: `TXN_MOCK_${Date.now()}`,
        paidAmount: quote?.total || 0,
      };

      setPaymentStep("saving");
      const response = await fetch("/api/bookings/confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          roomId,
          checkIn,
          checkOut,
          guests,
          quote,
          guest: fields,
          termsAccepted: agreedTerms,
          payment: mockPaymentResult,
        }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => null);
        throw new Error(data?.message || "Server failed to record booking.");
      }

      router.push("/dashboard/bookings?status=success");
    } catch (error: any) {
      console.error("Booking failed:", error);
      setSubmitError(
        error.message || "Failed to complete booking. Please try again."
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
              value={fields.firstName}
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
              value={fields.lastName}
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
              value={fields.email}
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
              value={fields.phone}
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
            value={fields.specialRequests}
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
              {fields.specialRequests.length}/500
            </span>
          </div>
        </div>
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
          ? "Authorizing Payment Gateway..."
          : paymentStep === "saving"
          ? "Confirming Booking..."
          : "Pay & Book"}
      </button>
    </form>
  );
}