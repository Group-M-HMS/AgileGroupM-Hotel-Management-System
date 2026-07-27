import type { Metadata } from "next";
import ManageBookingForm from "./ManageBookingForm";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";

export const metadata: Metadata = {
  title: "Manage Booking — River Nest Eco Villa",
};

function CheckIcon() {
  // eslint-disable-next-line @next/next/no-img-element
  return (
    <img src="/icons/check.svg" alt="" aria-hidden="true" className="h-4 w-4" />
  );
}

const facts = [
  "Find your reservation in seconds",
  "No account needed — just your email and reference",
  "View, print, or cancel your stay",
];

export default function ManageBookingPage() {
  return (
    <>
      <Navbar />
      <div className="pt-16">
      <div className="flex flex-col lg:h-[calc(100vh-4rem)] lg:flex-row">

      {/* ══════════════════════════════════════════
          Brand Panel — desktop only, left 50%
          ══════════════════════════════════════════ */}
      <div className="relative hidden h-full w-1/2 shrink-0 flex-col items-start justify-around overflow-hidden bg-jungle-dark p-[56px] lg:flex">

        {/* Decorative ellipse */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/icons/ellipse.svg"
          alt=""
          aria-hidden="true"
          className="pointer-events-none absolute left-[280px] top-[-160px] h-[420px] w-[520px] select-none"
        />

        {/* Tagline */}
        <div className="relative z-10 flex shrink-0 flex-col items-start gap-[20px]">
          <p className="font-outfit text-[12px] font-medium leading-[normal] tracking-[3px] text-sage">
            ECO VILLA · KITULGALA
          </p>
          <div className="flex flex-col items-start gap-[2px] font-lora text-[40px] font-normal leading-[46px]">
            <p className="text-sand-light">Already booked your stay?</p>
            <p className="text-sage">Find it right here.</p>
          </div>
          <p className="w-[432px] font-outfit text-field font-normal leading-[26px] text-sand-light/85">
            Enter the email and booking reference you used at checkout to view your
            reservation details, print your itinerary, or manage your stay.
          </p>
        </div>

        {/* Feature bullets */}
        <div className="relative z-10 flex shrink-0 flex-col items-start gap-[16px]">
          {facts.map(fact => (
            <div key={fact} className="flex items-center gap-[14px]">
              <div className="flex h-[36px] w-[36px] shrink-0 items-center justify-center rounded-[18px] border-[0.8px] border-sage/40 bg-sage/16">
                <CheckIcon />
              </div>
              <p className="font-outfit text-meta font-normal leading-[normal] text-sand-light/85">
                {fact}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* ══════════════════════════════════════════
          Form Panel — right 50% on desktop, full width on mobile
          ══════════════════════════════════════════ */}
      <div className="flex flex-1 flex-col items-center overflow-y-auto bg-sand-light px-6 py-10 sm:px-10 lg:w-1/2 lg:shrink-0 lg:justify-center lg:overflow-hidden lg:px-14 lg:py-0">
        <ManageBookingForm />
      </div>

    </div>
      </div>
      <Footer />
    </>
  );
}
