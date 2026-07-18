const MS_PER_NIGHT = 1000 * 60 * 60 * 24;

/** Number of nights between two ISO date strings (e.g. "2026-07-20"); 0 if either is missing/unparsable. */
export function nightsBetween(checkIn: string, checkOut: string): number {
  const start = new Date(`${checkIn}T00:00:00`);
  const end = new Date(`${checkOut}T00:00:00`);
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return 0;
  const nights = Math.round((end.getTime() - start.getTime()) / MS_PER_NIGHT);
  return nights > 0 ? nights : 0;
}
