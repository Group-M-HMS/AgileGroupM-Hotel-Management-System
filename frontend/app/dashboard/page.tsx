import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";

import { DashboardContent } from "./DashboardContent";

export const metadata = {
  title: "My Dashboard — River Nest Eco Villa",
};

export default function DashboardPage() {
  return (
    <>
      <Navbar />

      <div className="pt-16 bg-sand-light min-h-screen">
        <div className="mx-auto max-w-7xl px-page-x py-10 lg:px-page-x-lg space-y-10">
          <DashboardContent />
        </div>
      </div>

      <Footer />
    </>
  );
}
