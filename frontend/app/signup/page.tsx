import type { Metadata } from "next";
import SignUpForm from "./SignUpForm";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";

export const metadata: Metadata = {
  title: "Sign Up — River Nest Eco Villa",
};

function CheckIcon() {
  // eslint-disable-next-line @next/next/no-img-element
  return (
    <img src="/icons/check.svg" alt="" aria-hidden="true" className="h-4 w-4" />
  );
}

const facts = [
  "Free cancellation up to 7 days before",
  "Private river access & guided jungle trails",
  "Organic breakfast included with every stay",
];

export default function SignUpPage() {
  return (
    <>
      <Navbar />
      <div className="min-h-[calc(100vh-4rem)] bg-sand-light pt-16">
        <div className="mx-auto max-w-7xl px-page-x py-8 lg:px-page-x-lg lg:py-12">

          {/* Single card — the forest image is the card background; the brand
              copy and the sign-up form both sit inside it. */}
          <div
            className="relative overflow-hidden rounded-[32px] border border-sand bg-primary bg-cover bg-center shadow-soft-lg"
            style={{
              backgroundImage:
                "url('https://images.unsplash.com/photo-1553755322-56baa43a31d7?q=80&w=1200&auto=format&fit=crop')",
            }}
          >
            <div className="grid grid-cols-1 lg:grid-cols-2">

              {/* Brand side — sits over the image, desktop only */}
              <div className="relative hidden flex-col justify-between gap-10 p-[56px] lg:flex lg:min-h-[620px]">

                {/* Dark overlay for text legibility */}
                <div className="pointer-events-none absolute inset-0 bg-primary/55" />

                {/* Tagline */}
                <div className="relative z-10 flex shrink-0 flex-col items-start gap-[20px]">
                  <p className="font-jakarta text-[12px] font-medium leading-[normal] tracking-[3px] text-sage">
                    ECO VILLA · KITULGALA
                  </p>
                  <div className="flex flex-col items-start gap-[2px] font-fraunces text-[40px] font-normal leading-[46px]">
                    <p className="text-sand-light">Disconnect from noise.</p>
                    <p className="text-sage">Reconnect with nature.</p>
                  </div>
                  <p className="max-w-[432px] font-jakarta text-field font-normal leading-[26px] text-sand-light/85">
                    A sustainable eco-retreat nestled in the heart of Sri Lanka&apos;s
                    lush rainforests. Create your account to plan stays, curate
                    experiences, and track your bookings.
                  </p>
                </div>

                {/* Feature bullets */}
                <div className="relative z-10 flex shrink-0 flex-col items-start gap-[16px]">
                  {facts.map(fact => (
                    <div key={fact} className="flex items-center gap-[14px]">
                      <div className="flex h-[36px] w-[36px] shrink-0 items-center justify-center rounded-[18px] border-[0.8px] border-sage/40 bg-sage/16">
                        <CheckIcon />
                      </div>
                      <p className="font-jakarta text-meta font-normal leading-[normal] text-sand-light/85">
                        {fact}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Form side — solid light panel inside the card */}
              <div className="relative flex items-center justify-center bg-sand-light px-6 py-12 sm:px-10 lg:px-14 lg:py-16">
                <SignUpForm />
              </div>

            </div>
          </div>

        </div>
      </div>
      <Footer />
    </>
  );
}
