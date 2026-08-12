import type { Metadata } from "next";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import RoomsCatalog from "./RoomsCatalog";

export const metadata: Metadata = {
  title: "Rooms & Suites — River Nest Eco Villa",
  description:
    "Browse the room types and suites at River Nest Eco Villa — compare nightly rates, occupancy, size and amenities before you book.",
};

export default function RoomsPage() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-white pt-28 lg:pt-32">
        <div className="mx-auto max-w-7xl px-page-x pb-24 lg:px-page-x-lg">
          {/* Page header */}
          <header className="max-w-2xl">
            <p className="font-jakarta text-[12px] font-medium uppercase tracking-[3px] text-sage">
              Rooms & Suites
            </p>
            <h1 className="mt-4 font-fraunces text-[42px] leading-[50px] text-jungle-dark lg:text-[52px] lg:leading-[58px]">
              Find your perfect stay
            </h1>
            <p className="mt-5 font-jakarta text-[16px] leading-[30px] text-jungle/75">
              Every room at River Nest is built into the rainforest, not on top of
              it. Compare our room types and suites below, then check live
              availability for your dates.
            </p>
          </header>

          {/* Catalog */}
          <div className="mt-14">
            <RoomsCatalog />
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
