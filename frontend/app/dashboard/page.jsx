import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";

import DashboardHero from "./DashboardHero";
import DashboardStats from "./DashboardStats";
import UpcomingBooking from "./UpcomingBooking";
import QuickActions from "./QuickActions";
import RecommendedExperiences from "./RecommendedExperiences";
import BookingHistory from "./BookingHistory";

export const metadata = {
  title: "My Dashboard — River Nest Eco Villa",
};

export default function DashboardPage() {
  return (
    <>
      <Navbar />

      <div className="pt-16 bg-sand-light min-h-screen">
        <div className="px-6 py-10 lg:px-14 space-y-10">

          <DashboardHero />

          <QuickActions />

          <RecommendedExperiences />

        </div>
      </div>

      <Footer />
    </>
  );
}