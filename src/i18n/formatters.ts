import { getFiscalMonth } from "../domain/calendar";

type MonthStyle = "short" | "long";
const locale = "fr-FR";
const numberFormatter = new Intl.NumberFormat(locale, { maximumFractionDigits: 1 });
const monthFormatters = {
  short: new Intl.DateTimeFormat(locale, { month: "short", timeZone: "UTC" }),
  long: new Intl.DateTimeFormat(locale, { month: "long", timeZone: "UTC" }),
};
const dateLabelFormatter = new Intl.DateTimeFormat(locale, {
  weekday: "short",
  day: "numeric",
  month: "short",
  timeZone: "UTC",
});
const holidayDateLabelFormatter = new Intl.DateTimeFormat(locale, {
  weekday: "short",
  day: "numeric",
  month: "long",
  timeZone: "UTC",
});
const datePartFormatter = new Intl.DateTimeFormat(locale, {
  day: "numeric",
  month: "short",
  timeZone: "UTC",
});

export function formatNumber(value: number) {
  return numberFormatter.format(value);
}

export function formatMonthName(index: number, style: MonthStyle) {
  const { month } = getFiscalMonth(2000, index);
  return monthFormatters[style].format(new Date(Date.UTC(2000, month, 1)));
}

export function formatDateLabel(date: Date) {
  return dateLabelFormatter.format(date);
}

export function formatHolidayDateLabel(date: Date) {
  return holidayDateLabelFormatter.format(date);
}

function withTerminalPeriod(value: string) {
  return value.endsWith(".") ? value : `${value}.`;
}

export function formatDateRange(start: string, end: string) {
  return `du ${datePartFormatter.format(new Date(`${start}T00:00:00Z`))} au ${withTerminalPeriod(
    datePartFormatter.format(new Date(`${end}T00:00:00Z`)),
  )}`;
}
