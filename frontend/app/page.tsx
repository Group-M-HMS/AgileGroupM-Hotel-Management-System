import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";

import HomeHero from "./HomeHero";
import QuickActions from "./QuickActions";
import VillaSpotlight from "./VillaSpotlight";
import FeaturedRooms from "./FeaturedRooms";
import RecommendedExperiences from "./RecommendedExperiences";
import Gallery from "./Gallery";

export default function Home() {
  return (
    <>
      <Navbar />

      <main className="min-h-screen bg-sand-light">
        {/* Full-bleed hero — breaks out of the constrained column and
            handles its own navbar clearance. */}
        <HomeHero />

        {/* Constrained marketing sections below the hero. */}
        <div className="mx-auto max-w-7xl space-y-16 px-page-x py-16 lg:px-page-x-lg">
          <VillaSpotlight />

          <FeaturedRooms />

          <QuickActions />

          <RecommendedExperiences />

          <Gallery />
        </div>
      </main>

      <Footer />
    </>
  );
}
