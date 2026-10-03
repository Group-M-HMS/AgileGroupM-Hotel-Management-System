// The booking funnel keeps its state in URL query params, so anyone can type anything into them.
// These helpers reduce a raw param to a safe value (or "" / a default) before a page uses it.
// They are a UX guard only: booking-service, pricing-service and room-service validate again.

export const MAX_GUESTS = 20;
export const MAX_NIGHTS = 30;

type Param = string | string[] | undefined;

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

function first(value: Param): string {
  return typeof value === "string" ? value : Array.isArray(value) ? (value[0] ?? "") : "";
}

/** Today's date at the hotel (Asia/Colombo) as YYYY-MM-DD, matching the backend's day boundary. */
export function hotelToday(): string {
  return new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Colombo" });
}

/** A real calendar date in YYYY-MM-DD form, else "". Rejects things like 2026-02-31. */
export function cleanDate(value: Param): string {
  const raw = first(value);
  if (!ISO_DATE.test(raw)) return "";
  const d = new Date(`${raw}T00:00:00Z`);
  return Number.isNaN(d.getTime()) || d.toISOString().slice(0, 10) !== raw ? "" : raw;
}

function nightsBetween(checkIn: string, checkOut: string): number {
  return Math.round((Date.parse(`${checkOut}T00:00:00Z`) - Date.parse(`${checkIn}T00:00:00Z`)) / 86_400_000);
}

/**
 * A usable stay: check-in not in the past, check-out after it, at most MAX_NIGHTS long.
 * Anything else yields empty strings so the page behaves as if no dates were chosen.
 */
export function cleanStay(checkInParam: Param, checkOutParam: Param): { checkIn: string; checkOut: string } {
  const checkIn = cleanDate(checkInParam);
  const checkOut = cleanDate(checkOutParam);
  if (!checkIn || !checkOut || checkIn < hotelToday()) return { checkIn: "", checkOut: "" };
  const nights = nightsBetween(checkIn, checkOut);
  return nights >= 1 && nights <= MAX_NIGHTS ? { checkIn, checkOut } : { checkIn: "", checkOut: "" };
}

/** A whole number of guests between 1 and MAX_GUESTS, else the fallback. */
export function cleanGuests(value: Param, fallback = 1): number {
  const raw = first(value);
  if (!/^\d{1,2}$/.test(raw)) return fallback;
  const n = Number(raw);
  return n >= 1 && n <= MAX_GUESTS ? n : fallback;
}

/** A positive whole-number id (room ids), else "". */
export function cleanId(value: Param): string {
  const raw = first(value);
  return /^[1-9]\d{0,17}$/.test(raw) ? raw : "";
}
