"use client";

import { useState } from "react";
import { CalendarDays, Search } from "lucide-react";
import { useRouter } from "next/navigation";

export default function DashboardHero() {
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");

  const router = useRouter();

  const canSearch = Boolean(checkIn && checkOut);

  function handleSearch() {
    if (!canSearch) return;

    router.push(
      `/search-results?checkIn=${encodeURIComponent(
        checkIn
      )}&checkOut=${encodeURIComponent(checkOut)}`
    );
  }

  return (
    <div className="space-y-6">

      {/* ══════════════════════════════════════════
          Guest Welcome Hero
          ══════════════════════════════════════════ */}
      <section className="relative overflow-hidden rounded-[32px] bg-jungle-dark px-8 py-12 lg:px-12 lg:py-16">

        {/* Decorative Ellipse */}
        <img
          src="/icons/ellipse.svg"
          alt=""
          aria-hidden="true"
          className="pointer-events-none absolute right-[-120px] top-[-80px] w-[460px] select-none opacity-40"
        />

        <div className="relative z-10 max-w-3xl">

          <p className="font-outfit text-[12px] font-medium uppercase tracking-[3px] text-sage">
            Welcome to River Nest
          </p>

          <h1 className="mt-4 font-lora text-[42px] leading-[50px] text-sand-light lg:text-[52px] lg:leading-[60px]">
            Hi, Guest
          </h1>

          <p className="mt-6 max-w-2xl font-outfit text-[16px] leading-[30px] text-sand-light/80">
            Escape into the heart of nature. Find your perfect stay,
            explore unforgettable experiences, and discover the beauty
            of River Nest Eco Villa.
          </p>

          <div className="mt-8 flex flex-wrap gap-4">

            <button
              type="button"
              onClick={() =>
                document
                  .getElementById("search-stay")
                  ?.scrollIntoView({ behavior: "smooth" })
              }
              className="rounded-full bg-sage px-7 py-3 font-outfit font-semibold text-jungle-dark transition hover:bg-sage/90"
            >
              Book Your Stay
            </button>

            <button
              type="button"
              onClick={() => router.push("/experiences")}
              className="rounded-full border border-sage px-7 py-3 font-outfit font-semibold text-sand-light transition hover:bg-sage hover:text-jungle-dark"
            >
              Explore Experiences
            </button>

          </div>

        </div>

      </section>


      {/* ══════════════════════════════════════════
          Travel Date Search
          ══════════════════════════════════════════ */}
      <section
        id="search-stay"
        className="rounded-[28px] border border-sand bg-white p-6 shadow-sm lg:p-8"
      >

        <div className="flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">

          {/* Heading */}
          <div className="max-w-md">

            <p className="font-outfit text-[12px] font-medium uppercase tracking-[3px] text-sage">
              Plan Your Stay
            </p>

            <h2 className="mt-2 font-lora text-[28px] font-medium text-jungle-dark lg:text-[32px]">
              When would you like to visit?
            </h2>

            <p className="mt-2 font-outfit text-[14px] leading-[22px] text-jungle/60">
              Select your check-in and check-out dates to discover available
              rooms for your stay.
            </p>

          </div>


          {/* Search Fields */}
          <div className="flex w-full flex-col gap-4 md:flex-row xl:w-auto">

            {/* Check-In */}
            <div className="min-w-[220px]">

              <label className="mb-2 block font-outfit text-[12px] font-medium uppercase tracking-[1.5px] text-jungle/60">
                Check-In
              </label>

              <div className="relative">

                <CalendarDays
                  size={19}
                  className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-sage"
                />

                <input
                  type="date"
                  value={checkIn}
                  onChange={(e) => {
                    const selectedDate = e.target.value;

                    setCheckIn(selectedDate);

                    if (checkOut && selectedDate >= checkOut) {
                      setCheckOut("");
                    }
                  }}
                  className="h-[52px] w-full rounded-full border border-sand bg-sand-light pl-12 pr-5 font-outfit text-[14px] text-jungle-dark outline-none transition focus:border-sage"
                />

              </div>

            </div>


            {/* Check-Out */}
            <div className="min-w-[220px]">

              <label className="mb-2 block font-outfit text-[12px] font-medium uppercase tracking-[1.5px] text-jungle/60">
                Check-Out
              </label>

              <div className="relative">

                <CalendarDays
                  size={19}
                  className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-sage"
                />

                <input
                  type="date"
                  value={checkOut}
                  min={checkIn}
                  disabled={!checkIn}
                  onChange={(e) => setCheckOut(e.target.value)}
                  className="h-[52px] w-full rounded-full border border-sand bg-sand-light pl-12 pr-5 font-outfit text-[14px] text-jungle-dark outline-none transition focus:border-sage disabled:cursor-not-allowed disabled:opacity-50"
                />

              </div>

            </div>


            {/* Search Button */}
            <div className="flex items-end">

              <button
                type="button"
                disabled={!canSearch}
                onClick={handleSearch}
                className="flex h-[52px] w-full items-center justify-center gap-2 rounded-full bg-sage px-7 font-outfit text-[14px] font-semibold text-jungle-dark transition hover:bg-sage/90 disabled:cursor-not-allowed disabled:opacity-40 md:w-auto"
              >
                <Search size={18} />
                Search Rooms
              </button>

            </div>

          </div>

        </div>

      </section>

    </div>
  );
}