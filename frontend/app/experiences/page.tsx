import type { Metadata } from "next";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import ExperiencesGrid from "./ExperiencesGrid";

export const metadata: Metadata = {
  title: "Experiences — River Nest Eco Villa",
  description:
    "Explore the activities and tours available during your stay at River Nest Eco Villa — jungle treks, white-water rafting, river bathing, bird watching, wellness and more.",
};

export default function ExperiencesPage() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-white pt-28 lg:pt-32">
        <div className="mx-auto max-w-7xl px-page-x pb-24 lg:px-page-x-lg">
          {/* Page header */}
          <header className="max-w-2xl">
            <p className="font-jakarta text-[12px] font-medium uppercase tracking-[3px] text-sage">
              Experiences
            </p>
            <h1 className="mt-4 font-fraunces text-[42px] leading-[50px] text-jungle-dark lg:text-[52px] lg:leading-[58px]">
              Adventures at your doorstep
            </h1>
            <p className="mt-5 font-jakarta text-[16px] leading-[30px] text-jungle/75">
              From misty dawn treks to white-water rapids and riverside yoga,
              every experience at River Nest is led by people who know and love
              the Kitulgala rainforest. Browse below and enquire about anything
              that catches your eye.
            </p>
          </header>

          {/* Activity catalog */}
          <div className="mt-14">
            <ExperiencesGrid />
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
