export default function PaymentHero() {
  return (
    <section className="relative overflow-hidden bg-jungle-dark">

      {/* Decorative Ellipse */}
      <img
        src="/icons/ellipse.svg"
        alt=""
        aria-hidden="true"
        className="pointer-events-none absolute right-[-120px] top-[-80px] w-[500px] opacity-40 select-none"
      />

      <div className="relative z-10 mx-auto max-w-7xl px-6 py-14 lg:px-14 lg:py-16">

        <p className="font-outfit text-[12px] font-medium uppercase tracking-[3px] text-sage">
          Secure Checkout
        </p>

        <h1 className="mt-3 font-lora text-[40px] leading-[48px] text-sand-light lg:text-[52px] lg:leading-[60px]">
          Complete Your Payment
        </h1>

        <p className="mt-5 max-w-2xl font-outfit text-[16px] leading-[30px] text-sand-light/80">
          Your booking is almost complete. Enter your payment details
          securely to confirm your reservation at River Nest Eco Villa.
          Once your payment is processed, your booking will be confirmed
          and a confirmation email will be sent.
        </p>

        {/* Progress */}
        <div className="mt-10 flex flex-wrap items-center gap-4">

          {/* Booking */}
          <div className="flex items-center gap-3">

            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-sage font-outfit font-semibold text-jungle-dark">
              ✓
            </div>

            <div>
              <p className="font-outfit text-[12px] uppercase tracking-[2px] text-sand-light/60">
                Step 1
              </p>

              <p className="font-outfit text-sand-light">
                Booking Details
              </p>
            </div>

          </div>

          <div className="h-[2px] w-10 bg-sage/50" />

          {/* Payment */}
          <div className="flex items-center gap-3">

            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-sage font-outfit font-semibold text-jungle-dark">
              2
            </div>

            <div>
              <p className="font-outfit text-[12px] uppercase tracking-[2px] text-sand-light/60">
                Step 2
              </p>

              <p className="font-outfit text-sand-light">
                Payment
              </p>
            </div>

          </div>

          <div className="h-[2px] w-10 bg-sand-light/20" />

          {/* Confirmation */}
          <div className="flex items-center gap-3 opacity-60">

            <div className="flex h-10 w-10 items-center justify-center rounded-full border border-sand-light/30 text-sand-light">
              3
            </div>

            <div>
              <p className="font-outfit text-[12px] uppercase tracking-[2px] text-sand-light/50">
                Step 3
              </p>

              <p className="font-outfit text-sand-light">
                Confirmation
              </p>
            </div>

          </div>

        </div>

      </div>

    </section>
  );
}