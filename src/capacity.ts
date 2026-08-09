export function dateUTC(year: number, month: number, day: number) {
  return new Date(Date.UTC(year, month, day));
}

function addDays(date: Date, days: number) {
  const next = new Date(date);
  next.setUTCDate(next.getUTCDate() + days);
  return next;
}

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
  return dateUTC(year, Math.floor((h + l - 7 * m + 114) / 31) - 1, ((h + l - 7 * m + 114) % 31) + 1);
}

export function publicHolidays(year: number) {
  const easter = easterSunday(year);
  return [
    { name: "Jour de l’An", date: dateUTC(year, 0, 1) },
    { name: "Lundi de Pâques", date: addDays(easter, 1) },
    { name: "Fête du Travail", date: dateUTC(year, 4, 1) },
    { name: "Victoire 1945", date: dateUTC(year, 4, 8) },
    { name: "Ascension", date: addDays(easter, 39) },
    { name: "Lundi de Pentecôte", date: addDays(easter, 50) },
    { name: "Fête nationale", date: dateUTC(year, 6, 14) },
    { name: "Assomption", date: dateUTC(year, 7, 15) },
    { name: "Toussaint", date: dateUTC(year, 10, 1) },
    { name: "Armistice", date: dateUTC(year, 10, 11) },
    { name: "Noël", date: dateUTC(year, 11, 25) },
  ];
}

export function workingDaysInMonth(year: number, month: number) {
  const lastDay = new Date(Date.UTC(year, month + 1, 0)).getUTCDate();
  let count = 0;
  for (let day = 1; day <= lastDay; day += 1) {
    const weekday = dateUTC(year, month, day).getUTCDay();
    if (weekday !== 0 && weekday !== 6) count += 1;
  }
  const holidays = publicHolidays(year).filter(
    (item) => item.date.getUTCMonth() === month && item.date.getUTCDay() !== 0 && item.date.getUTCDay() !== 6,
  ).length;
  return count - holidays;
}

export function fiscalMonth(startYear: number, index: number) {
  return { month: (index + 6) % 12, year: startYear + (index >= 6 ? 1 : 0) };
}

export function roundHalf(value: number) {
  return Math.round(value * 2) / 2;
}
