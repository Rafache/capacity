import type { HolidayKey } from "../types";

export type FiscalMonth = {
  month: number;
  year: number;
};

export type PublicHoliday = {
  key: HolidayKey;
  date: Date;
};

/** Create a date whose calendar fields are interpreted in UTC. */
export function dateUTC(year: number, month: number, day: number) {
  return new Date(Date.UTC(year, month, day));
}

function addDays(date: Date, days: number) {
  const next = new Date(date);
  next.setUTCDate(next.getUTCDate() + days);
  return next;
}

/** Calculate Easter Sunday with the Gregorian computus. */
function easterSunday(year: number) {
  const a = year % 19;
  const b = Math.floor(year / 100);
  const c = year % 100;
  const d = Math.floor(b / 4);
  const e = b % 4;
  const f = Math.floor((b + 8) / 25);
  const g = Math.floor((b - f + 1) / 3);
  const h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4);
  const k = c % 4;
  const l = (32 + 2 * e + 2 * i - h - k) % 7;
  const m = Math.floor((a + 11 * h + 22 * l) / 451);
  return dateUTC(
    year,
    Math.floor((h + l - 7 * m + 114) / 31) - 1,
    ((h + l - 7 * m + 114) % 31) + 1,
  );
}

/** Return national public holidays for metropolitan France. */
export function publicHolidays(year: number): PublicHoliday[] {
  const easter = easterSunday(year);
  return [
    { key: "newYear", date: dateUTC(year, 0, 1) },
    { key: "easterMonday", date: addDays(easter, 1) },
    { key: "labourDay", date: dateUTC(year, 4, 1) },
    { key: "victoryDay", date: dateUTC(year, 4, 8) },
    { key: "ascension", date: addDays(easter, 39) },
    { key: "whitMonday", date: addDays(easter, 50) },
    { key: "nationalDay", date: dateUTC(year, 6, 14) },
    { key: "assumption", date: dateUTC(year, 7, 15) },
    { key: "allSaints", date: dateUTC(year, 10, 1) },
    { key: "armistice", date: dateUTC(year, 10, 11) },
    { key: "christmas", date: dateUTC(year, 11, 25) },
  ];
}

/** Convert a fiscal month index to its civil month and year. */
export function getFiscalMonth(startYear: number, index: number): FiscalMonth {
  return { month: (index + 6) % 12, year: startYear + (index >= 6 ? 1 : 0) };
}

/** Count Monday-to-Friday working days, excluding national public holidays. */
export function workingDaysInMonth(year: number, month: number) {
  const lastDay = new Date(Date.UTC(year, month + 1, 0)).getUTCDate();
  let count = 0;
  for (let day = 1; day <= lastDay; day += 1) {
    const weekday = dateUTC(year, month, day).getUTCDay();
    if (weekday !== 0 && weekday !== 6) count += 1;
  }

  const holidays = publicHolidays(year).filter(
    ({ date }) =>
      date.getUTCMonth() === month && date.getUTCDay() !== 0 && date.getUTCDay() !== 6,
  ).length;
  return count - holidays;
}

/** Round a capacity value to the nearest half day. */
export function roundHalf(value: number) {
  return Math.round(value * 2) / 2;
}
