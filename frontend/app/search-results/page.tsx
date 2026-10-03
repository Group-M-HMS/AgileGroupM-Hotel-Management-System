import type { Metadata } from "next";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { SearchResultsView } from "./SearchResultsView";
import { cleanGuests, cleanStay } from "@/lib/funnelParams";

export const metadata: Metadata = {
  title: "Search Results — River Nest Eco Villa",
};

// Human-readable summary of the current search, e.g.
// "Aug 11 – Aug 14, 2026 · 3 nights · 2 guests". Dates are optional; falls
// back to just the guest count when they're missing.
function formatStaySummary(checkIn: string, checkOut: string, guests: number): string {
  const guestLabel = `${guests} ${guests === 1 ? "guest" : "guests"}`;

  if (!checkIn || !checkOut) return guestLabel;

  const ci = new Date(`${checkIn}T00:00:00`);
  const co = new Date(`${checkOut}T00:00:00`);
  if (Number.isNaN(ci.getTime()) || Number.isNaN(co.getTime())) return guestLabel;

  const dayMonth: Intl.DateTimeFormatOptions = { month: "short", day: "numeric" };
  const dateRange = `${ci.toLocaleDateString("en-US", dayMonth)} – ${co.toLocaleDateString(
    "en-US",
    { ...dayMonth, year: "numeric" }
  )}`;

  const nights = Math.max(1, Math.round((co.getTime() - ci.getTime()) / 86_400_000));
  const nightLabel = `${nights} ${nights === 1 ? "night" : "nights"}`;

  return `${dateRange} · ${nightLabel} · ${guestLabel}`;
}

export default async function SearchResultsPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;
  const guests = cleanGuests(params.guests);
  const { checkIn, checkOut } = cleanStay(params.checkIn, params.checkOut);
  const staySummary = formatStaySummary(checkIn, checkOut, guests);

  return (
    <>
      <Navbar />
      <div className="pt-16">
        <div className="mx-auto max-w-7xl px-page-x pt-8 pb-24 lg:px-page-x-lg">
          <SearchResultsView
            guests={guests}
            checkIn={checkIn}
            checkOut={checkOut}
            staySummary={staySummary}
          />
        </div>
      </div>
      <Footer />
    </>
  );
}
