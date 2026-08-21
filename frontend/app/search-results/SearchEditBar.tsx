"use client";

import { useState, type ReactNode } from "react";
import { CalendarDays, Search, Users, ChevronDown } from "lucide-react";
import { useRouter } from "next/navigation";

// Compact "edit your search" bar for the results page. Prefills the current
// query params so visitors can adjust dates/guests and re-run the search
// without navigating back to the home page. Re-navigating to /search-results
// with new params re-triggers the fetch in SearchResultsView.
export function SearchEditBar({
  checkIn: initialCheckIn,
  checkOut: initialCheckOut,
  guests: initialGuests,
  sortBar,
}: {
  checkIn: string;
  checkOut: string;
  guests: number;
  sortBar?: ReactNode;
}) {
  const router = useRouter();

  const [checkIn, setCheckIn] = useState(initialCheckIn);
  const [checkOut, setCheckOut] = useState(initialCheckOut);
  const [guests, setGuests] = useState(initialGuests);

  // Inline validation — { field, message } or null.
  const [error, setError] = useState<{ field: string; message: string } | null>(null);

  // Today in YYYY-MM-DD (local).
  const today = new Date().toLocaleDateString("en-CA");

  // Day after check-in — the earliest valid check-out.
  function getMinCheckOutDate() {
    if (!checkIn) return today;
    const date = new Date(`${checkIn}T00:00:00`);
    date.setDate(date.getDate() + 1);
    return date.toLocaleDateString("en-CA");
  }

  const minCheckOutDate = getMinCheckOutDate();

  function handleSearch() {
    if (!checkIn) {
      setError({ field: "checkIn", message: "Please select a check-in date to search." });
      return;
    }
    if (!checkOut) {
      setError({ field: "checkOut", message: "Please select a check-out date to search." });
      return;
    }

    setError(null);

    router.push(
      `/search-results?checkIn=${encodeURIComponent(checkIn)}&checkOut=${encodeURIComponent(
        checkOut
      )}&guests=${encodeURIComponent(guests)}`
    );
  }

  // Border colour for a field: red when flagged, sage on focus otherwise.
  const borderCls = (field: string) =>
    error?.field === field
      ? "border-red-400 focus:border-red-400"
      : "border-sand focus:border-sage";

  return (
    <section
      aria-label="Edit your search"
      className="mb-8 rounded-[24px] border border-sand bg-white p-4 shadow-soft lg:p-5"
    >
      <div className="flex w-full flex-col gap-3 md:flex-row md:items-end">

        {/* Check-In */}
        <div className="min-w-[170px] md:flex-1">
          <label
            htmlFor="edit-check-in"
            className="mb-1.5 block font-jakarta text-[11px] font-medium uppercase tracking-[1.5px] text-jungle/60"
          >
            Check-In
          </label>
          <div className="relative">
            <CalendarDays
              size={18}
              className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-sage"
            />
            <input
              id="edit-check-in"
              type="date"
              value={checkIn}
              aria-invalid={error?.field === "checkIn"}
              min={today}
              onChange={(e) => {
                const selectedDate = e.target.value;
                setCheckIn(selectedDate);
                setError(null);
                if (checkOut && checkOut <= selectedDate) setCheckOut("");
              }}
              className={`h-[48px] w-full rounded-full border bg-sand-light pl-11 pr-4 font-jakarta text-[14px] text-jungle-dark outline-none transition focus:border-sage focus-visible:ring-2 focus-visible:ring-sage/50 ${borderCls("checkIn")}`}
            />
          </div>
        </div>

        {/* Check-Out */}
        <div className="min-w-[170px] md:flex-1">
          <label
            htmlFor="edit-check-out"
            className="mb-1.5 block font-jakarta text-[11px] font-medium uppercase tracking-[1.5px] text-jungle/60"
          >
            Check-Out
          </label>
          <div className="relative">
            <CalendarDays
              size={18}
              className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-sage"
            />
            <input
              id="edit-check-out"
              type="date"
              value={checkOut}
              aria-invalid={error?.field === "checkOut"}
              min={minCheckOutDate}
              onChange={(e) => {
                setCheckOut(e.target.value);
                setError(null);
              }}
              className={`h-[48px] w-full rounded-full border bg-sand-light pl-11 pr-4 font-jakarta text-[14px] text-jungle-dark outline-none transition focus:border-sage focus-visible:ring-2 focus-visible:ring-sage/50 ${borderCls("checkOut")}`}
            />
          </div>
        </div>

        {/* Guests */}
        <div className="min-w-[150px] md:flex-1">
          <label
            htmlFor="edit-guests"
            className="mb-1.5 block font-jakarta text-[11px] font-medium uppercase tracking-[1.5px] text-jungle/60"
          >
            Guests
          </label>
          <div className="relative">
            <Users
              size={18}
              className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-sage"
            />
            <select
              id="edit-guests"
              value={guests}
              onChange={(e) => setGuests(Number(e.target.value))}
              className="h-[48px] w-full appearance-none rounded-full border border-sand bg-sand-light pl-11 pr-10 font-jakarta text-[14px] text-jungle-dark outline-none transition focus:border-sage focus-visible:ring-2 focus-visible:ring-sage/50"
            >
              <option value={1}>1 Guest</option>
              <option value={2}>2 Guests</option>
              <option value={3}>3 Guests</option>
              <option value={4}>4 Guests</option>
            </select>
            <ChevronDown
              size={17}
              className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-jungle/50"
            />
          </div>
        </div>

        {/* Update Search */}
        <div className="flex items-end">
          <button
            type="button"
            onClick={handleSearch}
            className="flex h-[48px] w-full items-center justify-center gap-2 whitespace-nowrap rounded-full bg-primary px-7 font-jakarta text-[14px] font-semibold text-sand-light transition hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-white md:w-auto md:min-w-[170px]"
          >
            <Search size={18} />
            Update Search
          </button>
        </div>
      </div>

      {/* Sort + filter controls — second row inside the same card. */}
      {sortBar && (
        <div className="mt-4 flex justify-end border-t border-sand pt-4">
          {sortBar}
        </div>
      )}

      {/* Inline validation message — announced to assistive tech. */}
      {error && (
        <p
          role="alert"
          aria-live="assertive"
          className="mt-2 font-jakarta text-[13px] font-medium text-red-500"
        >
          {error.message}
        </p>
      )}
    </section>
  );
}
