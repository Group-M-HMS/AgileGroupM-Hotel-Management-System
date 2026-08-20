import { differenceInCalendarDays, format, parseISO } from 'date-fns';

export const money = (value: number) =>
  value.toLocaleString('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2 });

export const moneyShort = (value: number) =>
  value.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });

export const prettyDate = (isoDate: string) => {
  try {
    return format(parseISO(isoDate), 'd MMM yyyy');
  } catch {
    return isoDate;
  }
};

export const shortDate = (isoDate: string) => {
  try {
    return format(parseISO(isoDate), 'd MMM');
  } catch {
    return isoDate;
  }
};

export const nightsBetween = (checkIn: string, checkOut: string) => {
  if (!checkIn || !checkOut) return 0;
  try {
    return Math.max(0, differenceInCalendarDays(parseISO(checkOut), parseISO(checkIn)));
  } catch {
    return 0;
  }
};

export const TAX_RATE = 0.12;

export const isValidEmail = (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value.trim());
