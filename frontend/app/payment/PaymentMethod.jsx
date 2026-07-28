"use client";

import { CreditCard, CheckCircle2 } from "lucide-react";

export default function PaymentMethod() {
  return (
    <section className="rounded-3xl bg-white p-8 shadow-sm border border-stone-200">

      <div className="mb-8">
        <p className="font-outfit text-sm uppercase tracking-[3px] text-sage">
          Payment Method
        </p>

        <h2 className="mt-2 font-lora text-3xl text-jungle-dark">
          Choose Your Payment Method
        </h2>

        <p className="mt-3 font-outfit text-stone-600 leading-7">
          Your payment is securely processed. We currently support secure
          credit card payments.
        </p>
      </div>

      <div className="space-y-5">

        {/* Credit Card Option */}

        <label
          className="
            flex
            cursor-pointer
            items-center
            justify-between
            rounded-2xl
            border-2
            border-sage
            bg-sage/5
            p-6
            transition-all
            hover:bg-sage/10
          "
        >
          <div className="flex items-center gap-5">

            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-sage/15">
              <CreditCard
                size={28}
                className="text-jungle-dark"
              />
            </div>

            <div>

              <h3 className="font-lora text-xl text-jungle-dark">
                Credit / Debit Card
              </h3>

              <p className="mt-1 font-outfit text-sm text-stone-600">
                Visa, Mastercard and American Express
              </p>

              <div className="mt-4 flex flex-wrap gap-2">

                <span className="rounded-full bg-white px-3 py-1 text-xs font-medium text-stone-600 shadow-sm border">
                  VISA
                </span>

                <span className="rounded-full bg-white px-3 py-1 text-xs font-medium text-stone-600 shadow-sm border">
                  Mastercard
                </span>

                <span className="rounded-full bg-white px-3 py-1 text-xs font-medium text-stone-600 shadow-sm border">
                  AMEX
                </span>

              </div>

            </div>

          </div>

          <CheckCircle2
            size={30}
            className="text-sage"
          />

        </label>

      </div>

      {/* Secure Notice */}

      <div className="mt-8 rounded-2xl bg-jungle-dark p-5">

        <div className="flex items-start gap-4">

          <div className="text-2xl">
            🔒
          </div>

          <div>

            <h4 className="font-lora text-lg text-white">
              Secure Payment
            </h4>

            <p className="mt-2 font-outfit leading-7 text-sand-light/80">
              Your payment information is encrypted using industry-standard
              security protocols. River Nest does not permanently store your
              card information.
            </p>

          </div>

        </div>

      </div>

    </section>
  );
}