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
        <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
          <h1 className="mb-8 font-lora text-heading-sm font-medium text-jungle-dark sm:text-heading-md">
            Available Rooms
          </h1>
          <SearchResultsView guests={guests} checkIn={checkIn} checkOut={checkOut} />
        </div>
      </div>
      <Footer />
    </>
  );
}
