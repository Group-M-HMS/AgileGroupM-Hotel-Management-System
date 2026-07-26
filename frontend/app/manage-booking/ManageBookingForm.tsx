"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { FieldError } from "@/components/FieldError";

// ── Types ─────────────────────────────────────────────────────────────────────

type Fields = {
  email: string;
  bookingReference: string;
};

type Errors = Partial<Record<keyof Fields, string>>;

// ── Validation ────────────────────────────────────────────────────────────────

function validate(f: Fields): Errors {
  const e: Errors = {};

  if (!f.email.trim()) e.email = "Email is required";
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.email)) e.email = "Enter a valid email address";

  if (!f.bookingReference.trim()) e.bookingReference = "Booking reference is required";

  return e;
}

// ── Styles ────────────────────────────────────────────────────────────────────

function fieldCls(hasError?: string) {
  return `input-field ${hasError ? "border-red-400 focus:border-red-400" : "border-sand focus:border-sage"}`;
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function ManageBookingForm() {
  const router = useRouter();
  const [fields, setFields] = useState<Fields>({ email: "", bookingReference: "" });
  const [errors, setErrors] = useState<Errors>({});
  const [touched, setTouched] = useState<Partial<Record<keyof Fields, boolean>>>({});
  const [lookupError, setLookupError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  function set(field: keyof Fields, value: string) {
    const next = { ...fields, [field]: value };
    setFields(next);
    setLookupError(null);
    if (touched[field]) {
      const e = validate(next);
      setErrors(prev => ({ ...prev, [field]: e[field] }));
    }
  }

  function touch(field: keyof Fields) {
    setTouched(prev => ({ ...prev, [field]: true }));
    const e = validate(fields);
    setErrors(prev => ({ ...prev, [field]: e[field] }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const allTouched = Object.fromEntries(
      Object.keys(fields).map(k => [k, true])
    ) as Record<keyof Fields, boolean>;
    setTouched(allTouched);
    const errs = validate(fields);
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    setSubmitting(true);
    setLookupError(null);
    try {
      const response = await fetch("/api/manage-booking/lookup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(fields),
      });
      if (!response.ok) {
        setLookupError("No booking matches those details.");
        return;
      }
      router.push(
        `/manage-booking/itinerary?email=${encodeURIComponent(fields.email)}&reference=${encodeURIComponent(fields.bookingReference)}`
      );
    } catch {
      setLookupError("No booking matches those details.");
    } finally {
      setSubmitting(false);
    }
  }

  const err = (field: keyof Fields) => (touched[field] ? errors[field] : undefined);

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      className="flex w-full flex-col items-start gap-[24px] px-6 sm:px-10 lg:px-0"
    >

      {/* ── Heading ── */}
      <div className="flex w-full flex-col items-start gap-[10px] leading-[normal]">
        <h1 className="font-lora text-heading-sm font-medium tracking-[-0.5px] text-jungle-dark sm:text-heading-md lg:text-heading-lg">
          Manage Booking
        </h1>
        <p className="font-outfit text-field font-normal text-jungle/65 lg:text-[16px]">
          Enter your email and booking reference number to find your reservation.
        </p>
      </div>

      {/* ── Lookup error ── */}
      {lookupError && (
        <div className="w-full rounded-input border border-red-400 bg-red-50 px-4 py-3 font-outfit text-meta text-red-600">
          {lookupError}
        </div>
      )}

      {/* ── Fields ── */}
      <div className="flex w-full flex-col items-start gap-[14px]">
        <div className="flex w-full flex-col gap-[4px]">
          <input
            type="email"
            placeholder="Email*"
            value={fields.email}
            onChange={e => set("email", e.target.value)}
            onBlur={() => touch("email")}
            className={fieldCls(err("email"))}
          />
          <FieldError message={err("email")} />
        </div>
        <div className="flex w-full flex-col gap-[4px]">
          <input
            type="text"
            placeholder="Booking Reference Number*"
            value={fields.bookingReference}
            onChange={e => set("bookingReference", e.target.value)}
            onBlur={() => touch("bookingReference")}
            className={fieldCls(err("bookingReference"))}
          />
          <FieldError message={err("bookingReference")} />
        </div>
      </div>

      {/* ── Find Booking ── */}
      <button type="submit" className="btn-primary" disabled={submitting}>
        {submitting ? "SEARCHING..." : "FIND BOOKING"}
      </button>
    </form>
  );
}
