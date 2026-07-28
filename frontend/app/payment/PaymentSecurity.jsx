import {
  ShieldCheck,
  Lock,
  BadgeCheck,
  CreditCard,
} from "lucide-react";

export default function PaymentSecurity() {
  return (
    <section className="rounded-3xl border border-stone-200 bg-white p-8 shadow-sm">

      <div className="mb-8">

        <p className="font-outfit text-sm uppercase tracking-[3px] text-sage">
          Payment Security
        </p>

        <h2 className="mt-2 font-lora text-3xl text-jungle-dark">
          Shop With Confidence
        </h2>

        <p className="mt-4 max-w-3xl font-outfit leading-7 text-stone-600">
          River Nest Eco Villa uses secure payment technologies to protect
          your personal and payment information throughout the checkout
          process.
        </p>

      </div>

      {/* Security Features */}

      <div className="grid gap-6 md:grid-cols-2">

        {/* SSL */}

        <div className="rounded-2xl border border-stone-200 p-6">

          <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-sage/10">
            <ShieldCheck
              className="text-sage"
              size={30}
            />
          </div>

          <h3 className="font-lora text-xl text-jungle-dark">
            SSL Encryption
          </h3>

          <p className="mt-3 font-outfit leading-7 text-stone-600">
            Every transaction is protected using secure SSL encryption to
            safeguard your payment information.
          </p>

        </div>

        {/* Data Protection */}

        <div className="rounded-2xl border border-stone-200 p-6">

          <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-sage/10">
            <Lock
              className="text-sage"
              size={30}
            />
          </div>

          <h3 className="font-lora text-xl text-jungle-dark">
            Data Privacy
          </h3>

          <p className="mt-3 font-outfit leading-7 text-stone-600">
            Your card details are encrypted during processing and are never
            permanently stored by River Nest Eco Villa.
          </p>

        </div>

        {/* Verified */}

        <div className="rounded-2xl border border-stone-200 p-6">

          <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-sage/10">
            <BadgeCheck
              className="text-sage"
              size={30}
            />
          </div>

          <h3 className="font-lora text-xl text-jungle-dark">
            Trusted Booking
          </h3>

          <p className="mt-3 font-outfit leading-7 text-stone-600">
            Your reservation is confirmed immediately after successful
            payment and a booking confirmation will be sent to your email.
          </p>

        </div>

        {/* Accepted Cards */}

        <div className="rounded-2xl border border-stone-200 p-6">

          <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-sage/10">
            <CreditCard
              className="text-sage"
              size={30}
            />
          </div>

          <h3 className="font-lora text-xl text-jungle-dark">
            Accepted Cards
          </h3>

          <div className="mt-4 flex flex-wrap gap-3">

            <span className="rounded-full border bg-sand-light px-4 py-2 text-sm font-medium">
              VISA
            </span>

            <span className="rounded-full border bg-sand-light px-4 py-2 text-sm font-medium">
              Mastercard
            </span>

            <span className="rounded-full border bg-sand-light px-4 py-2 text-sm font-medium">
              American Express
            </span>

          </div>

        </div>

      </div>

      {/* Bottom Notice */}

      <div className="mt-8 rounded-2xl bg-jungle-dark p-6">

        <div className="flex items-start gap-4">

          <ShieldCheck
            size={34}
            className="text-sage"
          />

          <div>

            <h3 className="font-lora text-2xl text-white">
              100% Secure Checkout
            </h3>

            <p className="mt-3 font-outfit leading-7 text-sand-light/80">
              All payments are securely processed using encrypted connections.
              Your financial information remains protected throughout the
              transaction.
            </p>

          </div>

        </div>

      </div>

    </section>
  );
}