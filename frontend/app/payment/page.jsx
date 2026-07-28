import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";

import PaymentHero from "./PaymentHero";
import PaymentMethod from "./PaymentMethod";
import CreditCardForm from "./CreditCardForm";
import PaymentSummary from "./PaymentSummary";
import PaymentSecurity from "./PaymentSecurity";

export const metadata = {
  title: "Payment — River Nest Eco Villa",
};

export default function PaymentPage() {
  return (
    <>
      <Navbar />

      <main className="min-h-screen bg-sand-light pt-16">

        {/* Hero */}
        <PaymentHero />

        {/* Payment Content */}
        <section className="px-6 py-10 lg:px-14">

          <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[1fr_380px]">

            {/* Left Side */}

            <div className="space-y-8">

              <PaymentMethod />

              <CreditCardForm />

              <PaymentSecurity />

            </div>

            {/* Right Side */}

            <PaymentSummary />

          </div>

        </section>

      </main>

      <Footer />
    </>
  );
}