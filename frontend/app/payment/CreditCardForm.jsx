"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  User,
  CreditCard,
  Calendar,
  Lock,
  Loader2,
} from "lucide-react";

import PaymentSuccessModal from "./PaymentSuccessModal";

export default function CreditCardForm() {
  const router = useRouter();

  const [processing, setProcessing] = useState(false);

  const [showSuccess, setShowSuccess] = useState(false);

  const [form, setForm] = useState({
    cardholder: "",
    cardNumber: "",
    expiryMonth: "",
    expiryYear: "",
    cvv: "",
  });

  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;

    let newValue = value;

    switch (name) {
      case "cardNumber":
        newValue = value
          .replace(/\D/g, "")
          .slice(0, 16);
        break;

      case "cvv":
        newValue = value
          .replace(/\D/g, "")
          .slice(0, 4);
        break;

      default:
        break;
    }

    setForm((prev) => ({
      ...prev,
      [name]: newValue,
    }));

    setErrors((prev) => ({
      ...prev,
      [name]: "",
    }));
  };

  const validate = () => {
    const newErrors = {};

    if (!form.cardholder.trim()) {
      newErrors.cardholder =
        "Cardholder name is required.";
    }

    if (!form.cardNumber) {
      newErrors.cardNumber =
        "Card number is required.";
    } else if (!/^\d{16}$/.test(form.cardNumber)) {
      newErrors.cardNumber =
        "Card number must contain exactly 16 digits.";
    }

    if (!form.expiryMonth) {
      newErrors.expiryMonth =
        "Please select the expiry month.";
    }

    if (!form.expiryYear) {
      newErrors.expiryYear =
        "Please select the expiry year.";
    }

    if (!form.cvv) {
      newErrors.cvv =
        "CVV is required.";
    } else if (!/^\d{3,4}$/.test(form.cvv)) {
      newErrors.cvv =
        "CVV must contain 3 or 4 digits.";
    }

    if (
      form.expiryMonth &&
      form.expiryYear
    ) {
      const today = new Date();

      const currentMonth =
        today.getMonth() + 1;

      const currentYear =
        today.getFullYear();

      if (
        Number(form.expiryYear) <
          currentYear ||
        (Number(form.expiryYear) ===
          currentYear &&
          Number(form.expiryMonth) <
            currentMonth)
      ) {
        newErrors.expiryYear =
          "Card has expired.";
      }
    }

    setErrors(newErrors);

    return (
      Object.keys(newErrors).length === 0
    );
  };

  const handlePayment = async (e) => {
    e.preventDefault();

    if (!validate()) return;

    setProcessing(true);

    // Simulate payment

    setTimeout(() => {
      setProcessing(false);
      setShowSuccess(true);
    }, 2500);
  };

  return (
    <>
      <section className="rounded-3xl border border-stone-200 bg-white p-8 shadow-sm">

        <div className="mb-8">

          <p className="font-outfit text-sm uppercase tracking-[3px] text-sage">
            Card Details
          </p>

          <h2 className="mt-2 font-lora text-3xl text-jungle-dark">
            Enter Your Card Information
          </h2>

          <p className="mt-3 text-stone-600 leading-7">
            Complete your reservation by securely
            entering your payment details below.
          </p>

        </div>

        <form
          onSubmit={handlePayment}
          className="space-y-6"
        >
          {/* Cardholder */}

          <div>

            <label className="mb-2 block font-medium text-jungle-dark">
              Cardholder Name
            </label>

            <div className="flex items-center rounded-xl border border-stone-300 px-4 focus-within:border-sage">

              <User
                size={20}
                className="text-stone-500"
              />

              <input
                type="text"
                name="cardholder"
                value={form.cardholder}
                onChange={handleChange}
                placeholder="John Smith"
                className="w-full bg-transparent px-3 py-4 outline-none"
              />

            </div>

            {errors.cardholder && (
              <p className="mt-2 text-sm text-red-500">
                {errors.cardholder}
              </p>
            )}

          </div>

          {/* Card Number */}

          <div>

            <label className="mb-2 block font-medium text-jungle-dark">
              Card Number
            </label>

            <div className="flex items-center rounded-xl border border-stone-300 px-4 focus-within:border-sage">

              <CreditCard
                size={20}
                className="text-stone-500"
              />

              <input
                type="text"
                name="cardNumber"
                value={form.cardNumber}
                onChange={handleChange}
                placeholder="1234123412341234"
                className="w-full bg-transparent px-3 py-4 outline-none"
              />

            </div>

            {errors.cardNumber && (
              <p className="mt-2 text-sm text-red-500">
                {errors.cardNumber}
              </p>
            )}

          </div>
                    {/* Expiry Date */}

          <div className="grid gap-6 md:grid-cols-2">

            {/* Month */}

            <div>

              <label className="mb-2 block font-medium text-jungle-dark">
                Expiry Month
              </label>

              <div className="flex items-center rounded-xl border border-stone-300 px-4 focus-within:border-sage">

                <Calendar
                  size={20}
                  className="text-stone-500"
                />

                <select
                  name="expiryMonth"
                  value={form.expiryMonth}
                  onChange={handleChange}
                  className="w-full bg-transparent px-3 py-4 outline-none"
                >
                  <option value="">
                    Select Month
                  </option>

                  {Array.from({ length: 12 }, (_, i) => (
                    <option
                      key={i + 1}
                      value={String(i + 1).padStart(2, "0")}
                    >
                      {String(i + 1).padStart(2, "0")}
                    </option>
                  ))}
                </select>

              </div>

              {errors.expiryMonth && (
                <p className="mt-2 text-sm text-red-500">
                  {errors.expiryMonth}
                </p>
              )}

            </div>

            {/* Year */}

            <div>

              <label className="mb-2 block font-medium text-jungle-dark">
                Expiry Year
              </label>

              <div className="flex items-center rounded-xl border border-stone-300 px-4 focus-within:border-sage">

                <Calendar
                  size={20}
                  className="text-stone-500"
                />

                <select
                  name="expiryYear"
                  value={form.expiryYear}
                  onChange={handleChange}
                  className="w-full bg-transparent px-3 py-4 outline-none"
                >
                  <option value="">
                    Select Year
                  </option>

                  {Array.from({ length: 12 }, (_, i) => {
                    const year = new Date().getFullYear() + i;

                    return (
                      <option
                        key={year}
                        value={year}
                      >
                        {year}
                      </option>
                    );
                  })}
                </select>

              </div>

              {errors.expiryYear && (
                <p className="mt-2 text-sm text-red-500">
                  {errors.expiryYear}
                </p>
              )}

            </div>

          </div>

          {/* CVV */}

          <div>

            <label className="mb-2 block font-medium text-jungle-dark">
              Security Code (CVV)
            </label>

            <div className="flex items-center rounded-xl border border-stone-300 px-4 focus-within:border-sage">

              <Lock
                size={20}
                className="text-stone-500"
              />

              <input
                type="password"
                name="cvv"
                value={form.cvv}
                onChange={handleChange}
                placeholder="123"
                maxLength={4}
                className="w-full bg-transparent px-3 py-4 outline-none"
              />

            </div>

            {errors.cvv && (
              <p className="mt-2 text-sm text-red-500">
                {errors.cvv}
              </p>
            )}

          </div>

          {/* Billing Information */}

          <div className="rounded-2xl bg-sand-light p-6">

            <h3 className="font-lora text-xl text-jungle-dark">
              Billing Information
            </h3>

            <p className="mt-2 text-stone-600 leading-7">
              The billing address associated with your card may be requested
              during payment verification.
            </p>

            <div className="mt-5 grid gap-5 md:grid-cols-2">

              <div>

                <label className="mb-2 block text-sm font-medium text-jungle-dark">
                  Country
                </label>

                <input
                  type="text"
                  placeholder="United Kingdom"
                  className="w-full rounded-xl border border-stone-300 bg-white px-4 py-3 outline-none focus:border-sage"
                />

              </div>

              <div>

                <label className="mb-2 block text-sm font-medium text-jungle-dark">
                  Postcode
                </label>

                <input
                  type="text"
                  placeholder="AB12 3CD"
                  className="w-full rounded-xl border border-stone-300 bg-white px-4 py-3 outline-none focus:border-sage"
                />

              </div>

            </div>

          </div>

          {/* Payment Notice */}

          <div className="rounded-2xl border border-sage/30 bg-sage/5 p-5">

            <p className="text-sm leading-7 text-stone-700">
              🔒 By clicking <strong>Pay Now</strong>, you authorise River Nest
              Eco Villa to securely process your payment and confirm your
              reservation. Your payment details are encrypted and handled
              securely.
            </p>

          </div>          {/* Pay Button */}

          <button
            type="submit"
            disabled={processing}
            className="
              flex
              w-full
              items-center
              justify-center
              rounded-xl
              bg-jungle-dark
              px-6
              py-4
              font-outfit
              text-lg
              font-semibold
              text-white
              transition-all
              duration-300
              hover:bg-sage
              hover:text-jungle-dark
              disabled:cursor-not-allowed
              disabled:opacity-70
            "
          >
            {processing ? (
              <>
                <Loader2
                  size={22}
                  className="mr-3 animate-spin"
                />

                Processing Payment...
              </>
            ) : (
              <>
                <Lock
                  size={20}
                  className="mr-2"
                />

                Pay Securely
              </>
            )}
          </button>

        </form>

      </section>

      {/* Success Modal */}

      <PaymentSuccessModal
        open={showSuccess}
        bookingReference="RN-2026-01524"
        onClose={() => {
          setShowSuccess(false);
          router.push("/booking-confirmation");
        }}
      />

    </>
  );
}