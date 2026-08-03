import { getFiscalMonth } from "../domain/calendar";
import { locale } from "./translate";

type MonthStyle = "short" | "long";
type DateParts = Intl.DateTimeFormatOptions;

const numberFormatters = new Map<string, Intl.NumberFormat>();
const dateFormatters = new Map<string, Intl.DateTimeFormat>();

function numberFormatter(maximumFractionDigits = 1) {
  const key = String(maximumFractionDigits);
  let formatter = numberFormatters.get(key);
  if (!formatter) {
    formatter = new Intl.NumberFormat(locale, {
      maximumFractionDigits,
      minimumFractionDigits: 0,
    });
    numberFormatters.set(key, formatter);
  }
  return formatter;
}

function dateFormatter(options: DateParts) {
  const key = JSON.stringify(options);
  let formatter = dateFormatters.get(key);
  if (!formatter) {
    formatter = new Intl.DateTimeFormat(locale, { ...options, timeZone: "UTC" });
    dateFormatters.set(key, formatter);
  }
  return formatter;
}

export function formatNumber(value: number) {
  return numberFormatter().format(value);
}

export function formatMonthName(startYear: number, index: number, style: MonthStyle) {
  const { year, month } = getFiscalMonth(startYear, index);
  return dateFormatter({ month: style }).format(new Date(Date.UTC(year, month, 1)));
}

export function formatDateLabel(date: Date) {
  return dateFormatter({ weekday: "short", day: "numeric", month: "short" }).format(date);
}

export function formatDatePart(date: Date) {
  return dateFormatter({ day: "numeric", month: "short" }).format(date);
}

function withTerminalPeriod(value: string) {
  return value.endsWith(".") ? value : `${value}.`;
}

export function formatDateRange(start: string, end: string) {
  return `du ${formatDatePart(new Date(`${start}T00:00:00Z`))} au ${withTerminalPeriod(
    formatDatePart(new Date(`${end}T00:00:00Z`)),
  )}`;
}
