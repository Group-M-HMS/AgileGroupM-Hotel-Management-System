/** Formats an ISO date string (e.g. "2026-07-20") as "Jul 20, 2026"; falls back to the raw value if unparsable. */
export function formatDate(value: string): string {
  if (!value) return "—";
  const date = new Date(`${value}T00:00:00`);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}
