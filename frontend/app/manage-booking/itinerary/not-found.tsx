import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";

export default function ItineraryNotFound() {
  return (
    <>
      <Navbar />
      <div className="pt-16">
        <div className="mx-auto flex max-w-2xl flex-col items-center gap-4 px-page-x py-24 text-center lg:px-page-x-lg">
          <h1 className="font-lora text-heading-sm font-medium text-jungle-dark sm:text-heading-md">
            Booking not found
          </h1>
          <p className="font-outfit text-field text-jungle/70">
            We couldn&apos;t find a booking for those details. Please try your lookup again.
          </p>
          <Link
            href="/dashboard"
            className="rounded-btn bg-jungle-dark px-6 py-2.5 font-outfit text-meta font-semibold text-sand-light transition-opacity hover:opacity-90"
          >
            Back to My Bookings
          </Link>
        </div>
      </div>
      <Footer />
    </>
  );
}
