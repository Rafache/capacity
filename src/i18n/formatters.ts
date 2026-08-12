import { getFiscalMonth } from '../domain/calendar';

type MonthStyle = 'short' | 'long';
const locale = 'fr-FR';
const numberFormatter = new Intl.NumberFormat(locale, {
  maximumFractionDigits: 1,
});
const monthFormatters = {
  short: new Intl.DateTimeFormat(locale, { month: 'short', timeZone: 'UTC' }),
  long: new Intl.DateTimeFormat(locale, { month: 'long', timeZone: 'UTC' }),
};
const holidayDateLabelFormatter = new Intl.DateTimeFormat(locale, {
  weekday: 'short',
  day: 'numeric',
  month: 'long',
  timeZone: 'UTC',
});
const schoolBreakDatePartFormatter = new Intl.DateTimeFormat(locale, {
  day: 'numeric',
  month: 'long',
  timeZone: 'UTC',
});

export function formatNumber(value: number) {
  return numberFormatter.format(value);
}

export function formatMonthName(index: number, style: MonthStyle) {
  const { month } = getFiscalMonth(2000, index);
  return monthFormatters[style].format(new Date(Date.UTC(2000, month, 1)));
}

export function formatHolidayDateLabel(date: Date) {
  return holidayDateLabelFormatter.format(date);
}

export function formatSchoolBreakDateRange(start: string, end: string) {
  return `${schoolBreakDatePartFormatter.format(new Date(`${start}T00:00:00Z`))} au ${schoolBreakDatePartFormatter.format(
    new Date(`${end}T00:00:00Z`),
  )}`;
}
