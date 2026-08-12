import Link from "next/link";

export function EmptyResultsState({
  checkIn,
  checkOut,
  guests,
}: {
  checkIn: string;
  checkOut: string;
  guests: number;
}) {
  const changeDatesHref = `/?checkIn=${encodeURIComponent(checkIn)}&checkOut=${encodeURIComponent(checkOut)}&guests=${guests}`;

  return (
    <div className="flex w-full flex-col items-center gap-6 rounded-3xl bg-white px-6 py-16 text-center shadow-soft">
      <h2 className="font-fraunces text-[24px] font-medium text-jungle-dark">
        No rooms available
      </h2>
      <p className="max-w-md font-jakarta text-field text-jungle/70">
        We couldn&apos;t find any rooms for those dates and guest count. Try
        adjusting your search.
      </p>
      <Link
        href={changeDatesHref}
        className="rounded-btn bg-primary px-8 py-3 font-jakarta text-field font-semibold text-sand-light transition-opacity hover:opacity-90"
      >
        Change Dates
      </Link>
    </div>
  );
}
