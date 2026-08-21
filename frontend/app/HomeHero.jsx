"use client";

import { useState, useRef, useEffect } from "react";
import { CalendarDays, Search, Users, ChevronDown, Star, Check } from "lucide-react";
import { useRouter } from "next/navigation";

// How much of the search card peeks into the first (full-screen) viewport,
// as a fraction of the card's own height. 0.5 = top half; lower = pushed down.
const PEEK_FRACTION = 0.4;

// Extra pixels to nudge the card upward (shows a little more of it).
const PEEK_NUDGE = 30;

export default function HomeHero() {
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [guests, setGuests] = useState(1);

  // Inline search validation — { field, message } or null.
  const [error, setError] = useState(null);

  // Dynamically compute how far to pull the card up so a fixed fraction of it
  // peeks into the full-screen hero, regardless of viewport / card height.
  const heroRef = useRef(null);
  const cardRef = useRef(null);
  const [cardOffset, setCardOffset] = useState(null);

  useEffect(() => {
    const compute = () => {
      const hero = heroRef.current;
      const card = cardRef.current;
      if (!hero || !card) return;
      const peek = card.offsetHeight * PEEK_FRACTION;
      // Card's natural top is at hero's bottom; shift it so its top lands at
      // (viewport bottom − peek). Negative result = pulled up into the hero.
      setCardOffset(window.innerHeight - peek - hero.offsetHeight - PEEK_NUDGE);
    };

    compute();
    window.addEventListener("resize", compute);
    const ro = new ResizeObserver(compute);
    if (cardRef.current) ro.observe(cardRef.current);
    return () => {
      window.removeEventListener("resize", compute);
      ro.disconnect();
    };
  }, []);

  const router = useRouter();

  // Get today's date in YYYY-MM-DD format
  const today = new Date().toLocaleDateString("en-CA");

  // Get the day after check-in for minimum check-out date
  function getMinCheckOutDate() {
    if (!checkIn) return today;

    const date = new Date(`${checkIn}T00:00:00`);
    date.setDate(date.getDate() + 1);

    return date.toLocaleDateString("en-CA");
  }

  const minCheckOutDate = getMinCheckOutDate();

  // Handle room search — validate and surface a message instead of no-op.
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
      `/search-results?checkIn=${encodeURIComponent(
        checkIn
      )}&checkOut=${encodeURIComponent(
        checkOut
      )}&guests=${encodeURIComponent(guests)}`
    );
  }

  // Border colour for a field: red when it's the one flagged, sage on focus otherwise.
  const borderCls = (field) =>
    error?.field === field
      ? "border-red-400 focus:border-red-400"
      : "border-sand focus:border-sage";

  return (
    <section className="relative w-full">

      {/* ══════════════════════════════════════════
          Full-bleed hero image band
          Bleeds edge-to-edge (and under the fixed navbar);
          content is constrained to the page column inside.
          ══════════════════════════════════════════ */}
      <div
        ref={heroRef}
        className="relative flex min-h-screen items-center bg-primary bg-cover bg-center"
        style={{
          backgroundImage:
            "url('https://images.unsplash.com/photo-1758438919146-f3f59a6d2544?q=80&w=2070&auto=format&fit=crop')",
        }}
      >

        {/* Gradient scrim — keeps a floor tint at the top for legibility and
            darkens toward the bottom where the search card overlaps. */}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-primary/90 via-primary/45 to-primary/30" />

        {/* Hero content — constrained column.
            Bottom padding lifts the copy above the card that peeks up below. */}
        <div className="relative z-10 mx-auto w-full max-w-7xl px-page-x pb-40 pt-24 lg:px-page-x-lg lg:pb-48 lg:pt-28">

          <div className="max-w-3xl">

            <p className="font-jakarta text-[12px] font-medium uppercase tracking-[3px] text-sage">
              Eco Villa · Kitulgala
            </p>

            <h1 className="mt-4 font-fraunces text-[42px] leading-[50px] text-sand-light lg:text-[58px] lg:leading-[64px]">
              Escape into the heart of the rainforest
            </h1>

            <p className="mt-6 max-w-2xl font-jakarta text-[16px] leading-[30px] text-sand-light/85">
              Find your perfect stay, discover unforgettable experiences, and
              reconnect with nature at River Nest Eco Villa.
            </p>

            <div className="mt-8 flex flex-wrap gap-4">

              {/* Book Stay — scrolls down to the search card */}
              <button
                type="button"
                onClick={() =>
                  document
                    .getElementById("search-stay")
                    ?.scrollIntoView({ behavior: "smooth" })
                }
                className="rounded-full bg-sage px-7 py-3 font-jakarta font-semibold text-jungle-dark transition hover:bg-sage/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sand-light focus-visible:ring-offset-2 focus-visible:ring-offset-primary"
              >
                Book Your Stay
              </button>

              {/* Explore Experiences */}
              <button
                type="button"
                onClick={() => router.push("/experiences")}
                className="rounded-full border border-sand-light/60 px-7 py-3 font-jakarta font-semibold text-sand-light transition hover:bg-sand-light hover:text-jungle-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sand-light focus-visible:ring-offset-2 focus-visible:ring-offset-primary"
              >
                Explore Experiences
              </button>

            </div>

          </div>

        </div>

      </div>


      {/* ══════════════════════════════════════════
          Search widget — constrained card pulled up so only its
          top portion peeks into the first (full-screen) viewport,
          cueing the visitor to scroll.
          ══════════════════════════════════════════ */}
      <div
        ref={cardRef}
        style={cardOffset !== null ? { marginTop: `${cardOffset}px` } : undefined}
        className="relative z-20 mx-auto -mt-52 max-w-7xl px-page-x lg:-mt-64 lg:px-page-x-lg"
      >

        <section
          id="search-stay"
          className="rounded-[28px] border border-sand bg-white p-6 lg:p-8"
        >

          <div className="flex flex-col gap-6">

            {/* Heading row — copy on the left, trust signals on the right */}
            <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">

              {/* Search Heading */}
              <div className="max-w-md xl:max-w-lg">

                <p className="font-jakarta text-[12px] font-medium uppercase tracking-[3px] text-sage">
                  Plan Your Stay
                </p>

                <h2 className="mt-2 font-fraunces text-[28px] font-medium text-jungle-dark lg:text-[32px] xl:whitespace-nowrap">
                  When would you like to visit?
                </h2>

                <p className="mt-2 font-jakarta text-[14px] leading-[22px] text-jungle/60 md:whitespace-nowrap">
                  Select your travel dates and number of guests to discover available rooms for your stay.
                </p>

              </div>

              {/* Trust / value signals */}
              <div className="flex shrink-0 flex-col gap-3 lg:items-end">

                {/* Rating */}
                <div className="flex items-center gap-2">
                  <div className="flex gap-0.5" aria-hidden="true">
                    {[0, 1, 2, 3, 4].map((i) => (
                      <Star key={i} size={16} className="fill-clay text-clay" />
                    ))}
                  </div>
                  <span className="font-jakarta text-[14px] font-semibold text-jungle-dark">
                    4.9
                  </span>
                  <span className="font-jakarta text-[13px] text-jungle/60">
                    · 300+ happy guests
                  </span>
                </div>

                {/* Value chips */}
                <div className="flex flex-wrap gap-2 lg:justify-end">
                  {["Free cancellation", "Best-rate guarantee"].map((label) => (
                    <span
                      key={label}
                      className="inline-flex items-center gap-1.5 rounded-full border border-sand bg-sand-light px-3 py-1.5 font-jakarta text-[12px] font-medium text-jungle"
                    >
                      <Check size={14} className="text-sage" />
                      {label}
                    </span>
                  ))}
                </div>

              </div>

            </div>


            {/* ══════════════════════════════════════════
                Search Fields
                ══════════════════════════════════════════ */}
            <div className="flex w-full flex-col gap-4 md:flex-row md:items-end">


              {/* ────────────────────────────────────────
                  Check-In
                  ──────────────────────────────────────── */}
              <div className="min-w-[200px] md:flex-1">

                <label
                  htmlFor="check-in"
                  className="mb-2 block font-jakarta text-[12px] font-medium uppercase tracking-[1.5px] text-jungle/60"
                >
                  Check-In
                </label>

                <div className="relative">

                  <CalendarDays
                    size={19}
                    className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-sage"
                  />

                  <input
                    id="check-in"
                    type="date"
                    value={checkIn}
                    aria-invalid={error?.field === "checkIn"}

                    // Disable all past dates
                    min={today}

                    onChange={(e) => {
                      const selectedDate = e.target.value;

                      setCheckIn(selectedDate);
                      setError(null);

                      // If the current checkout is no longer valid,
                      // clear it and ask the user to select again.
                      if (
                        checkOut &&
                        checkOut <= selectedDate
                      ) {
                        setCheckOut("");
                      }
                    }}

                    className={`h-[52px] w-full rounded-full border bg-sand-light pl-12 pr-5 font-jakarta text-[14px] text-jungle-dark outline-none transition focus:border-sage focus-visible:ring-2 focus-visible:ring-sage/50 ${borderCls("checkIn")}`}
                  />

                </div>

              </div>


              {/* ────────────────────────────────────────
                  Check-Out
                  ──────────────────────────────────────── */}
              <div className="min-w-[200px] md:flex-1">

                <label
                  htmlFor="check-out"
                  className="mb-2 block font-jakarta text-[12px] font-medium uppercase tracking-[1.5px] text-jungle/60"
                >
                  Check-Out
                </label>

                <div className="relative">

                  <CalendarDays
                    size={19}
                    className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-sage"
                  />

                  <input
                    id="check-out"
                    type="date"
                    value={checkOut}
                    aria-invalid={error?.field === "checkOut"}

                    // Checkout must be after check-in
                    min={minCheckOutDate}

                    onChange={(e) => {
                      setCheckOut(e.target.value);
                      setError(null);
                    }}

                    className={`h-[52px] w-full rounded-full border bg-sand-light pl-12 pr-5 font-jakarta text-[14px] text-jungle-dark outline-none transition focus:border-sage focus-visible:ring-2 focus-visible:ring-sage/50 ${borderCls("checkOut")}`}
                  />

                </div>

              </div>


              {/* ────────────────────────────────────────
                  Guests
                  NIBM2-142
                  ──────────────────────────────────────── */}
              <div className="min-w-[170px] md:flex-1">

                <label
                  htmlFor="guests"
                  className="mb-2 block font-jakarta text-[12px] font-medium uppercase tracking-[1.5px] text-jungle/60"
                >
                  Guests
                </label>

                <div className="relative">

                  {/* Guest Icon */}
                  <Users
                    size={19}
                    className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-sage"
                  />

                  {/* Guest Selection */}
                  <select
                    id="guests"
                    value={guests}
                    onChange={(e) =>
                      setGuests(Number(e.target.value))
                    }
                    className="h-[52px] w-full appearance-none rounded-full border border-sand bg-sand-light pl-12 pr-10 font-jakarta text-[14px] text-jungle-dark outline-none transition focus:border-sage focus-visible:ring-2 focus-visible:ring-sage/50"
                  >
                    <option value={1}>
                      1 Guest
                    </option>

                    <option value={2}>
                      2 Guests
                    </option>

                    <option value={3}>
                      3 Guests
                    </option>

                    <option value={4}>
                      4 Guests
                    </option>
                  </select>

                  {/* Dropdown Icon */}
                  <ChevronDown
                    size={17}
                    className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-jungle/50"
                  />

                </div>

              </div>


              {/* ────────────────────────────────────────
                  Search Button
                  ──────────────────────────────────────── */}
              <div className="flex items-end">

                <button
                  type="button"
                  onClick={handleSearch}
                  className="flex h-[52px] w-full items-center justify-center gap-2 whitespace-nowrap rounded-full bg-primary px-7 font-jakarta text-[14px] font-semibold text-sand-light transition hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-white md:w-auto md:min-w-[200px] md:px-12"
                >

                  <Search size={18} />

                  Search Rooms

                </button>

              </div>

            </div>

            {/* Inline validation message — announced to assistive tech. */}
            {error && (
              <p
                role="alert"
                aria-live="assertive"
                className="font-jakarta text-[13px] font-medium text-red-500"
              >
                {error.message}
              </p>
            )}

          </div>

        </section>

      </div>

    </section>
  );
}
