"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

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
  return `input-field w-full ${
    hasError
      ? "border-red-400 focus:border-red-400"
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

  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);

  const [fields, setFields] = useState<Fields>({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    specialRequests: "",
  });

  const [errors, setErrors] = useState<Errors>({});
  const [touched, setTouched] = useState<Partial<Record<keyof Fields, boolean>>>({});
  const [agreedTerms, setAgreedTerms] = useState(false);
  const [termsError, setTermsError] = useState("");
  const [submitError, setSubmitError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Unified initialization effect to prevent state race conditions
  useEffect(() => {
    let isMounted = true;

    async function initSession() {
      let initialFields: Fields = {
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        specialRequests: "",
      };

      try {
        const res = await fetch("/api/auth/session");
        if (res.ok) {
          const data = await res.json();
          if (data.authenticated) {
            setIsAuthenticated(true);
            initialFields = {
              firstName: data.user?.firstName || "",
              lastName: data.user?.lastName || "",
              email: data.user?.email || "",
              phone: data.user?.phone || "",
              specialRequests: "",
            };
          }
        }
      } catch (error) {
        console.error("Auth check failed", error);
      }

      // Restore unsaved checkout data after auth check (gives preference to saved drafts)
      const saved = localStorage.getItem("checkoutData");
      if (saved) {
        try {
          const data = JSON.parse(saved);
          if (data.fields) {
            initialFields = { ...initialFields, ...data.fields };
          }
          localStorage.removeItem("checkoutData");
        } catch (error) {
          console.error("Restore failed", error);
        }
      }

      if (isMounted) {
        setFields(initialFields);
        setCheckingAuth(false);
      }
    }

    initSession();

    return () => {
      isMounted = false;
    };
  }, []);

  function saveCheckoutState() {
    localStorage.setItem(
      "checkoutData",
      JSON.stringify({ roomId, checkIn, checkOut, guests, quote, fields })
    );
  }

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
    if (isSubmitting) return;

    setSubmitError("");

    if (!isAuthenticated) {
      saveCheckoutState();
      router.push("/login?redirect=/checkout");
      return;
    }

    const allTouched = Object.fromEntries(
      Object.keys(fields).map((k) => [k, true])
    ) as Record<keyof Fields, boolean>;
    setTouched(allTouched);

    const errs = validate(fields);
    setErrors(errs);

    if (!agreedTerms) {
      setTermsError("Please accept the Terms & Conditions before continuing");
    } else {
      setTermsError("");
    }

    if (Object.keys(errs).length > 0 || !agreedTerms) {
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/bookings/confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          roomId,
          checkIn,
          checkOut,
          guests,
          quote,
          guest: fields,
          termsAccepted: agreedTerms,
        }),
      });

      if (!response.ok) {
        throw new Error("Booking request failed");
      }

      router.push("/my-bookings");
    } catch (error) {
      console.error("Booking failed", error);
      setSubmitError("Failed to complete booking. Please try again.");
      setIsSubmitting(false);
    }
  }

  const err = (field: keyof Fields) => (touched[field] ? errors[field] : undefined);

  return (
    <form onSubmit={handleSubmit} noValidate className="flex w-full max-w-2xl flex-col gap-[24px]">
      {!checkingAuth && !isAuthenticated && (
        <div className="rounded-lg border border-sand bg-white p-5">
          <h3 className="font-lora text-lg font-medium text-jungle-dark">Login Required</h3>
          <p className="mt-2 font-outfit text-sm text-jungle/70">
            Please login or create an account before confirming your booking.
          </p>
          <button
            type="button"
            onClick={() => {
              saveCheckoutState();
              router.push("/login?redirect=/checkout");
            }}
            className="btn-primary mt-4"
          >
            Login / Sign Up
          </button>
        </div>
      )}

      <div className="flex flex-col gap-[6px]">
        <h2 className="font-lora text-[24px] font-medium text-jungle-dark">Guest Information</h2>
        <p className="font-outfit text-field text-jungle/60">
          We will use these details to send your booking confirmation and contact you if needed.
        </p>
      </div>

      <div className="flex flex-col gap-[14px]">
        <div className="flex flex-col gap-[14px] sm:flex-row sm:items-start">
          <div className="flex flex-1 flex-col">
            <input
              type="text"
              placeholder="First Name*"
              aria-label="First Name"
              aria-invalid={!!err("firstName")}
              value={fields.firstName}
              onChange={(e) => set("firstName", e.target.value)}
              onBlur={() => touch("firstName")}
              className={fieldCls(err("firstName"))}
            />
            {err("firstName") && <span className="mt-1 font-outfit text-xs text-red-500">{err("firstName")}</span>}
          </div>

          <div className="flex flex-1 flex-col">
            <input
              type="text"
              placeholder="Last Name*"
              aria-label="Last Name"
              aria-invalid={!!err("lastName")}
              value={fields.lastName}
              onChange={(e) => set("lastName", e.target.value)}
              onBlur={() => touch("lastName")}
              className={fieldCls(err("lastName"))}
            />
            {err("lastName") && <span className="mt-1 font-outfit text-xs text-red-500">{err("lastName")}</span>}
          </div>
        </div>

        <div className="flex flex-col gap-[14px] sm:flex-row sm:items-start">
          <div className="flex flex-1 flex-col">
            <input
              type="email"
              placeholder="Email Address*"
              aria-label="Email Address"
              aria-invalid={!!err("email")}
              value={fields.email}
              onChange={(e) => set("email", e.target.value)}
              onBlur={() => touch("email")}
              className={fieldCls(err("email"))}
            />
            {err("email") && <span className="mt-1 font-outfit text-xs text-red-500">{err("email")}</span>}
          </div>

          <div className="flex flex-1 flex-col">
            <input
              type="tel"
              placeholder="Phone Number*"
              aria-label="Phone Number"
              aria-invalid={!!err("phone")}
              value={fields.phone}
              onChange={(e) => set("phone", e.target.value)}
              onBlur={() => touch("phone")}
              className={fieldCls(err("phone"))}
            />
            {err("phone") && <span className="mt-1 font-outfit text-xs text-red-500">{err("phone")}</span>}
          </div>
        </div>

        <div className="flex flex-col gap-[4px]">
          <textarea
            placeholder="Special Requests (optional)"
            aria-label="Special Requests"
            value={fields.specialRequests}
            onChange={(e) => set("specialRequests", e.target.value)}
            onBlur={() => touch("specialRequests")}
            rows={4}
            maxLength={500}
            className={`w-full resize-none rounded-input border-2 bg-white px-field-x py-4 font-outfit text-field text-jungle ${
              err("specialRequests") ? "border-red-400 focus:border-red-400" : "border-sand focus:border-sage"
            }`}
          />
          <div className="flex items-center justify-between">
            {err("specialRequests") ? (
              <span className="font-outfit text-xs text-red-500">{err("specialRequests")}</span>
            ) : <span />}
            <span className="font-outfit text-[12px] text-jungle/45">
              {fields.specialRequests.length}/500
            </span>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <label className="flex items-start gap-3 font-outfit text-sm text-jungle">
          <input
            type="checkbox"
            checked={agreedTerms}
            onChange={(e) => {
              setAgreedTerms(e.target.checked);
              if (e.target.checked) setTermsError("");
            }}
            className="mt-1 h-4 w-4"
          />
          <span>
            I agree to the{" "}
            <a href="/terms" target="_blank" className="text-blue-600 underline">
              Terms & Conditions
            </a>{" "}
            and confirm that my booking details are correct.
          </span>
        </label>
        {termsError && <p className="font-outfit text-sm text-red-500">{termsError}</p>}
      </div>

      {submitError && <p className="font-outfit text-sm text-red-500">{submitError}</p>}

      <button
        type="submit"
        disabled={checkingAuth || isSubmitting}
        className="btn-primary sm:w-auto sm:self-start sm:px-10 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {checkingAuth
          ? "Checking Account..."
          : isSubmitting
          ? "Processing Payment..."
          : !isAuthenticated
          ? "Login to Continue"
          : "Pay & Book"}
      </button>
    </form>
  );
}