import type { Metadata } from "next";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";

export const metadata: Metadata = {
  title: "Experiences — River Nest Eco Villa",
  description:
    "Explore the activities and tours available during your stay at River Nest Eco Villa — jungle walks, river bathing, bird watching and more.",
};

export default function ExperiencesPage() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-sand-light pt-16">
        <div className="mx-auto max-w-7xl px-page-x py-24 lg:px-page-x-lg">
          <p className="font-jakarta text-[12px] font-medium uppercase tracking-[3px] text-sage">
            Experiences
          </p>
          <h1 className="mt-4 max-w-3xl font-fraunces text-[42px] leading-[50px] text-jungle-dark lg:text-[58px] lg:leading-[64px]">
            Unforgettable moments in nature
          </h1>
          <p className="mt-6 max-w-2xl font-jakarta text-[16px] leading-[30px] text-jungle/70">
            This page is coming soon — the activities and tours catalog will live
            here.
          </p>
        </div>
      </main>
      <Footer />
    </>
  );
}
