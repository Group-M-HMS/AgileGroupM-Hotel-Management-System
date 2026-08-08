import type { Metadata } from "next";
import { Suspense } from "react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { ItineraryContent } from "./ItineraryContent";

export const metadata: Metadata = {
  title: "Your Itinerary — River Nest Eco Villa",
};

export default function ItineraryPage() {
  return (
    <>
      <div className="no-print">
        <Navbar />
      </div>
      <div className="bg-sand-light pt-16">
        <div className="mx-auto max-w-7xl px-page-x pt-12 pb-24 lg:px-page-x-lg">
          <div className="mx-auto max-w-3xl">
            <Suspense>
              <ItineraryContent />
            </Suspense>
          </div>
        </div>
      </div>
      <div className="no-print">
        <Footer />
      </div>
    </>
  );
}
