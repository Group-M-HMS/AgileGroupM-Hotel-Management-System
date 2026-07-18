import type { Metadata } from "next";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { SearchResultsView } from "./SearchResultsView";

export const metadata: Metadata = {
  title: "Search Results — River Nest Eco Villa",
};

function parseGuests(value: string | string[] | undefined): number {
  const parsed = Number(Array.isArray(value) ? value[0] : value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 1;
}

function parseDateParam(value: string | string[] | undefined): string {
  return typeof value === "string" ? value : "";
}

export default async function SearchResultsPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;
  const guests = parseGuests(params.guests);
  const checkIn = parseDateParam(params.checkIn);
  const checkOut = parseDateParam(params.checkOut);

  return (
    <>
      <Navbar />
      <div className="pt-16">
        <div className="mx-auto max-w-7xl px-page-x pt-12 pb-24 lg:px-page-x-lg">
          <SearchResultsView guests={guests} checkIn={checkIn} checkOut={checkOut} />
        </div>
      </div>
      <Footer />
    </>
  );
}
