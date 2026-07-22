"use client";

import { Suspense, useMemo, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {
  User,
  Mail,
  Phone,
  MessageSquare,
  Users,
  CalendarDays,
  ShieldCheck,
  ArrowLeft,
  CheckCircle2,
} from "lucide-react";

import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";

export default function CheckoutPage() {
  return (
    <Suspense fallback={null}>
      <CheckoutPageContent />
    </Suspense>
  );
}

function CheckoutPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  // ─────────────────────────────────────────────
  // Booking Details from URL
  // ─────────────────────────────────────────────

  const roomId = searchParams.get("roomId") || "";
  const roomName =
    searchParams.get("roomName") || "River Nest Villa";

  const checkIn = searchParams.get("checkIn") || "";
  const checkOut = searchParams.get("checkOut") || "";

  const guests = Number(
    searchParams.get("guests") || "1"
  );

  const pricePerNight = Number(
    searchParams.get("price") || "0"
  );

  // ─────────────────────────────────────────────
  // Guest Form
  // ─────────────────────────────────────────────

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    specialRequests: "",
  });

  const [errors, setErrors] = useState({});

  // ─────────────────────────────────────────────
  // Calculate Nights
  // ─────────────────────────────────────────────

  const nights = useMemo(() => {
    if (!checkIn || !checkOut) {
      return 0;
    }

    const start = new Date(
      `${checkIn}T00:00:00`
    );

    const end = new Date(
      `${checkOut}T00:00:00`
    );

    const difference =
      end.getTime() - start.getTime();

    return Math.max(
      0,
      Math.round(
        difference / (1000 * 60 * 60 * 24)
      )
    );
  }, [checkIn, checkOut]);

  // ─────────────────────────────────────────────
  // Price Calculation
  // ─────────────────────────────────────────────

  const subtotal = pricePerNight * nights;

  // Temporary 10% tax
  // Later this should come from backend pricing service
  const taxRate = 0.1;

  const tax = subtotal * taxRate;

  const total = subtotal + tax;

  // ─────────────────────────────────────────────
  // Handle Input
  // ─────────────────────────────────────────────

  function handleChange(e) {
    const { name, value } = e.target;

    let newValue = value;

    // Allow numbers, spaces, + and -
    if (name === "phone") {
      newValue = value.replace(
        /[^0-9+\-\s]/g,
        ""
      );
    }

    setFormData((previous) => ({
      ...previous,
      [name]: newValue,
    }));

    // Clear error while correcting field
    if (errors[name]) {
      setErrors((previous) => ({
        ...previous,
        [name]: undefined,
      }));
    }
  }

  // ─────────────────────────────────────────────
  // Form Validation
  // ─────────────────────────────────────────────

  function validateForm() {
    const newErrors = {};

    // First Name
    if (!formData.firstName.trim()) {
      newErrors.firstName =
        "First name is required.";
    }

    // Last Name
    if (!formData.lastName.trim()) {
      newErrors.lastName =
        "Last name is required.";
    }

    // Email
    if (!formData.email.trim()) {
      newErrors.email =
        "Email address is required.";
    } else if (
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
        formData.email
      )
    ) {
      newErrors.email =
        "Please enter a valid email address.";
    }

    // Phone
    if (!formData.phone.trim()) {
      newErrors.phone =
        "Phone number is required.";
    } else {
      const phoneDigits =
        formData.phone.replace(/\D/g, "");

      if (
        phoneDigits.length < 9 ||
        phoneDigits.length > 15
      ) {
        newErrors.phone =
          "Please enter a valid phone number.";
      }
    }

    // Special Requests
    if (
      formData.specialRequests.length > 500
    ) {
      newErrors.specialRequests =
        "Special requests cannot exceed 500 characters.";
    }

    setErrors(newErrors);

    return (
      Object.keys(newErrors).length === 0
    );
  }

  // ─────────────────────────────────────────────
  // Confirm Booking
  // ─────────────────────────────────────────────

  function handleSubmit(e) {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    const bookingData = {
      roomId,
      roomName,
      checkIn,
      checkOut,
      guests,
      nights,
      pricePerNight,
      subtotal,
      tax,
      total,

      guest: {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone: formData.phone,
        specialRequests:
          formData.specialRequests,
      },
    };

    console.log(
      "Booking Data:",
      bookingData
    );

    // TODO:
    // Connect backend booking API here

    alert(
      "Booking details are valid and ready to submit."
    );
  }

  // ─────────────────────────────────────────────
  // Date Formatting
  // ─────────────────────────────────────────────

  function formatDate(date) {
    if (!date) {
      return "Not selected";
    }

    return new Date(
      `${date}T00:00:00`
    ).toLocaleDateString(
      "en-US",
      {
        day: "numeric",
        month: "short",
        year: "numeric",
      }
    );
  }

  return (
    <>
      <Navbar />

      <main className="min-h-screen bg-sand-light pt-16">

        {/* ════════════════════════════════════════
            Checkout Header
            ════════════════════════════════════════ */}

        <section className="bg-jungle-dark">

          <div className="mx-auto max-w-7xl px-6 py-12 lg:px-14">

            <button
              type="button"
              onClick={() => router.back()}
              className="mb-7 flex items-center gap-2 font-outfit text-sm text-sand-light/70 transition hover:text-sage"
            >
              <ArrowLeft size={17} />

              Back to Room
            </button>

            <p className="font-outfit text-[12px] font-medium uppercase tracking-[3px] text-sage">
              Complete Your Reservation
            </p>

            <h1 className="mt-3 font-lora text-[38px] text-sand-light lg:text-[48px]">
              Checkout
            </h1>

            <p className="mt-4 max-w-2xl font-outfit text-[15px] leading-7 text-sand-light/70">
              You&apos;re almost there. Enter
              your details, review your stay,
              and confirm your reservation at
              River Nest Eco Villa.
            </p>

          </div>

        </section>


        {/* ════════════════════════════════════════
            Checkout Content
            ════════════════════════════════════════ */}

        <div className="mx-auto grid max-w-7xl gap-8 px-6 py-10 lg:grid-cols-[1fr_420px] lg:px-14 lg:py-14">


          {/* ══════════════════════════════════════
              LEFT SIDE
              Guest Information
              ══════════════════════════════════════ */}

          <form
            id="checkout-form"
            onSubmit={handleSubmit}
            className="space-y-8"
          >

            <section className="rounded-[28px] border border-sand bg-white p-6 shadow-sm sm:p-8">

              {/* Section Heading */}

              <div className="mb-8">

                <p className="font-outfit text-[12px] font-medium uppercase tracking-[2.5px] text-sage">
                  Guest Information
                </p>

                <h2 className="mt-2 font-lora text-[28px] text-jungle-dark">
                  Who&apos;s making this booking?
                </h2>

                <p className="mt-2 font-outfit text-sm text-jungle/60">
                  We&apos;ll use these details
                  to send your booking
                  confirmation and contact you
                  if needed.
                </p>

              </div>


              {/* First Name + Last Name */}

              <div className="grid gap-5 sm:grid-cols-2">

                <InputField
                  label="First Name"
                  name="firstName"
                  placeholder="Enter first name"
                  value={formData.firstName}
                  onChange={handleChange}
                  error={errors.firstName}
                  icon={
                    <User size={18} />
                  }
                />

                <InputField
                  label="Last Name"
                  name="lastName"
                  placeholder="Enter last name"
                  value={formData.lastName}
                  onChange={handleChange}
                  error={errors.lastName}
                  icon={
                    <User size={18} />
                  }
                />

              </div>


              {/* Email */}

              <div className="mt-5">

                <InputField
                  label="Email Address"
                  name="email"
                  type="email"
                  placeholder="you@example.com"
                  value={formData.email}
                  onChange={handleChange}
                  error={errors.email}
                  icon={
                    <Mail size={18} />
                  }
                />

              </div>


              {/* Phone */}

              <div className="mt-5">

                <InputField
                  label="Phone Number"
                  name="phone"
                  type="tel"
                  placeholder="+94 77 123 4567"
                  value={formData.phone}
                  onChange={handleChange}
                  error={errors.phone}
                  icon={
                    <Phone size={18} />
                  }
                />

              </div>


              {/* Special Requests */}

              <div className="mt-5">

                <label className="mb-2 block font-outfit text-[12px] font-medium uppercase tracking-[1.5px] text-jungle/60">

                  Special Requests

                  <span className="ml-2 normal-case tracking-normal text-jungle/40">
                    Optional
                  </span>

                </label>


                <div className="relative">

                  <MessageSquare
                    size={18}
                    className="absolute left-4 top-4 text-sage"
                  />

                  <textarea
                    name="specialRequests"
                    value={
                      formData.specialRequests
                    }
                    onChange={handleChange}
                    rows={5}
                    maxLength={500}
                    placeholder="Tell us about any special requests or preferences..."
                    className={`w-full resize-none rounded-[20px] border bg-sand-light py-4 pl-12 pr-4 font-outfit text-[14px] text-jungle-dark outline-none transition ${
                      errors.specialRequests
                        ? "border-red-400"
                        : "border-sand focus:border-sage"
                    }`}
                  />

                </div>


                <div className="mt-2 flex justify-between">

                  <p className="font-outfit text-xs text-red-500">
                    {errors.specialRequests ||
                      ""}
                  </p>

                  <p className="font-outfit text-xs text-jungle/40">
                    {
                      formData
                        .specialRequests
                        .length
                    }
                    /500
                  </p>

                </div>

              </div>

            </section>


            {/* Secure Booking Note */}

            <section className="flex gap-4 rounded-[24px] border border-sage/30 bg-sage/10 p-5">

              <ShieldCheck
                size={24}
                className="shrink-0 text-jungle-dark"
              />

              <div>

                <h3 className="font-outfit font-semibold text-jungle-dark">
                  Your booking details are
                  secure
                </h3>

                <p className="mt-1 font-outfit text-sm leading-6 text-jungle/60">
                  Please review your
                  reservation details before
                  confirming your booking.
                </p>

              </div>

            </section>


            {/* Mobile Confirm Button */}

            <button
              type="submit"
              className="flex h-[54px] w-full items-center justify-center gap-2 rounded-full bg-sage font-outfit font-semibold text-jungle-dark transition hover:bg-sage/90 lg:hidden"
            >

              <CheckCircle2
                size={19}
              />

              Confirm Booking

            </button>

          </form>


          {/* ══════════════════════════════════════
              RIGHT SIDE
              Booking Summary
              ══════════════════════════════════════ */}

          <aside>

            <div className="sticky top-24 overflow-hidden rounded-[28px] border border-sand bg-white shadow-sm">


              {/* Summary Header */}

              <div className="bg-jungle-dark p-6">

                <p className="font-outfit text-[11px] font-medium uppercase tracking-[2.5px] text-sage">
                  Your Reservation
                </p>

                <h2 className="mt-2 font-lora text-[26px] text-sand-light">
                  {roomName}
                </h2>

              </div>


              {/* Stay Details */}

              <div className="border-b border-sand p-6">

                <h3 className="mb-5 font-outfit text-sm font-semibold text-jungle-dark">
                  Stay Details
                </h3>


                {/* Check-In */}

                <div className="flex gap-3">

                  <CalendarDays
                    size={19}
                    className="mt-1 shrink-0 text-sage"
                  />

                  <div>

                    <p className="font-outfit text-xs uppercase tracking-wider text-jungle/50">
                      Check-In
                    </p>

                    <p className="mt-1 font-outfit text-sm font-medium text-jungle-dark">
                      {
                        formatDate(
                          checkIn
                        )
                      }
                    </p>

                  </div>

                </div>


                {/* Check-Out */}

                <div className="mt-5 flex gap-3">

                  <CalendarDays
                    size={19}
                    className="mt-1 shrink-0 text-sage"
                  />

                  <div>

                    <p className="font-outfit text-xs uppercase tracking-wider text-jungle/50">
                      Check-Out
                    </p>

                    <p className="mt-1 font-outfit text-sm font-medium text-jungle-dark">
                      {
                        formatDate(
                          checkOut
                        )
                      }
                    </p>

                  </div>

                </div>


                {/* Guests */}

                <div className="mt-5 flex gap-3">

                  <Users
                    size={19}
                    className="mt-1 shrink-0 text-sage"
                  />

                  <div>

                    <p className="font-outfit text-xs uppercase tracking-wider text-jungle/50">
                      Guests
                    </p>

                    <p className="mt-1 font-outfit text-sm font-medium text-jungle-dark">
                      {guests}{" "}
                      {guests === 1
                        ? "Guest"
                        : "Guests"}
                    </p>

                  </div>

                </div>

              </div>


              {/* ══════════════════════════════════
                  Price Summary
                  NIBM2-136
                  ══════════════════════════════════ */}

              <div className="p-6">

                <h3 className="mb-5 font-outfit text-sm font-semibold text-jungle-dark">
                  Price Summary
                </h3>


                {/* Subtotal */}

                <div className="space-y-4">

                  <div className="flex justify-between font-outfit text-sm text-jungle/65">

                    <span>
                      $
                      {pricePerNight.toFixed(
                        2
                      )}{" "}
                      × {nights}{" "}
                      {nights === 1
                        ? "night"
                        : "nights"}
                    </span>

                    <span>
                      $
                      {subtotal.toFixed(
                        2
                      )}
                    </span>

                  </div>


                  {/* Tax */}

                  <div className="flex justify-between font-outfit text-sm text-jungle/65">

                    <span>
                      Taxes & Fees
                    </span>

                    <span>
                      $
                      {tax.toFixed(2)}
                    </span>

                  </div>

                </div>


                {/* Final Amount */}

                <div className="mt-6 border-t border-sand pt-5">

                  <div className="flex items-end justify-between">

                    <div>

                      <p className="font-outfit text-xs uppercase tracking-wider text-jungle/50">
                        Total Amount
                      </p>

                      <p className="mt-1 font-outfit text-xs text-jungle/45">
                        Including taxes
                      </p>

                    </div>

                    <p className="font-lora text-[30px] font-medium text-jungle-dark">
                      $
                      {total.toFixed(2)}
                    </p>

                  </div>

                </div>


                {/* Desktop Confirm Button */}

                <button
                  type="button"
                  onClick={() => {
                    const form =
                      document.getElementById(
                        "checkout-form"
                      );

                    if (form) {
                      form.requestSubmit();
                    }
                  }}
                  className="mt-7 hidden h-[54px] w-full items-center justify-center gap-2 rounded-full bg-sage font-outfit font-semibold text-jungle-dark transition hover:bg-sage/90 lg:flex"
                >

                  <CheckCircle2
                    size={19}
                  />

                  Confirm Booking

                </button>


                <p className="mt-4 text-center font-outfit text-xs leading-5 text-jungle/45">
                  Please verify your stay and
                  guest information before
                  confirming.
                </p>

              </div>

            </div>

          </aside>

        </div>

      </main>

      <Footer />
    </>
  );
}


// ═════════════════════════════════════════════════
// Reusable Input Field
// ═════════════════════════════════════════════════

function InputField({
  label,
  name,
  type = "text",
  placeholder,
  value,
  error,
  icon,
  onChange,
}) {
  return (
    <div>

      <label
        htmlFor={name}
        className="mb-2 block font-outfit text-[12px] font-medium uppercase tracking-[1.5px] text-jungle/60"
      >
        {label}
      </label>


      <div className="relative">

        <div className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-sage">
          {icon}
        </div>

        <input
          id={name}
          name={name}
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className={`h-[52px] w-full rounded-full border bg-sand-light pl-12 pr-5 font-outfit text-[14px] text-jungle-dark outline-none transition ${
            error
              ? "border-red-400 focus:border-red-400"
              : "border-sand focus:border-sage"
          }`}
        />

      </div>


      {error && (
        <p className="mt-2 font-outfit text-xs text-red-500">
          {error}
        </p>
      )}

    </div>
  );
}