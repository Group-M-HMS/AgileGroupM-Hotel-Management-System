import Link from "next/link";
import { CalendarPlus } from "lucide-react";

export function EmptyBookingsState() {
  return (
    <section className="flex flex-col items-center gap-5 rounded-[30px] border border-sand bg-white px-8 py-16 text-center shadow-sm">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-sage/15">
        <CalendarPlus size={30} className="text-sage" />
      </div>
      <div>
        <h2 className="font-fraunces text-3xl text-jungle-dark">No reservations yet</h2>
        <p className="mt-2 max-w-md font-jakarta text-jungle/70">
          You haven&apos;t made any bookings with us yet. Find your perfect stay and start
          planning your escape into the rainforest.
        </p>
      </div>
      <Link
        href="/search-results"
        className="rounded-full bg-sage px-7 py-3 font-jakarta font-semibold text-jungle-dark transition hover:bg-sage/90"
      >
        Book a Room
      </Link>
    </section>
  );
}
