import type { Metadata } from "next";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";

export const metadata: Metadata = {
  title: "The Hotel — River Nest Eco Villa",
  description:
    "Discover the story, philosophy and sustainability commitments behind River Nest Eco Villa in Kitulgala, Sri Lanka.",
};

export default function HotelPage() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-sand-light pt-16">
        <div className="mx-auto max-w-7xl px-page-x py-24 lg:px-page-x-lg">
          <p className="font-jakarta text-[12px] font-medium uppercase tracking-[3px] text-sage">
            The Hotel · Kitulgala
          </p>
          <h1 className="mt-4 max-w-3xl font-fraunces text-[42px] leading-[50px] text-jungle-dark lg:text-[58px] lg:leading-[64px]">
            Our story, rooted in the rainforest
          </h1>
          <p className="mt-6 max-w-2xl font-jakarta text-[16px] leading-[30px] text-jungle/70">
            This page is coming soon — the property overview, eco-commitments,
            amenities and location details will live here.
          </p>
        </div>
      </main>
      <Footer />
    </>
  );
}
