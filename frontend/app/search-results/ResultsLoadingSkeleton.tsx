function SkeletonCard() {
  return (
    <div className="flex w-full gap-6 rounded-3xl bg-white p-4 shadow-soft">
      <div className="h-28 w-40 shrink-0 animate-pulse rounded-2xl bg-sand" />
      <div className="flex flex-1 flex-col justify-center gap-3">
        <div className="h-4 w-1/3 animate-pulse rounded-full bg-sand" />
        <div className="h-3 w-1/4 animate-pulse rounded-full bg-sand" />
      </div>
    </div>
  );
}

export function ResultsLoadingSkeleton() {
  return (
    <div
      className="flex w-full flex-col gap-4"
      role="status"
      aria-label="Searching for available rooms"
    >
      {Array.from({ length: 4 }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  );
}
