import { getFiscalMonth, roundHalf, workingDaysInMonth } from "./calendar";
import type {
  AbsenceKey,
  CapacityData,
  CapacityTotals,
  Entry,
  EntryNumericKey,
  MonthStats,
  Zone,
} from "../types";

const ABSENCE_FIELDS = ["leave", "rtt", "training", "other"] as const;
const TOTAL_FIELDS = ["baseline", "available", ...ABSENCE_FIELDS] as const;

export const EMPTY_ENTRY: Entry = {
  workRate: 100,
  leave: 0,
  rtt: 0,
  training: 0,
  other: 0,
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function normalizeNumber(
  value: unknown,
  fallback: number,
  minimum: number,
  maximum: number,
  step: number,
) {
  if (typeof value !== "number" || !Number.isFinite(value)) return fallback;
  return Math.min(maximum, Math.max(minimum, Math.round(value / step) * step));
}

function baselineDays(startYear: number, index: number) {
  const { year, month } = getFiscalMonth(startYear, index);
  return workingDaysInMonth(year, month);
}

export function getAbsenceTotal(
  value: Pick<Entry, "leave" | "rtt" | "training" | "other">,
) {
  return ABSENCE_FIELDS.reduce((total, field) => total + value[field], 0);
}

function normalizeEntry(input: unknown, baseline?: number): Entry {
  const value = isRecord(input) ? input : {};
  const entry: Entry = {
    workRate: normalizeNumber(value.workRate, 100, 20, 100, 5),
    leave: normalizeNumber(value.leave, 0, 0, 366, 0.5),
    rtt: normalizeNumber(value.rtt, 0, 0, 366, 0.5),
    training: normalizeNumber(value.training, 0, 0, 366, 0.5),
    other: normalizeNumber(value.other, 0, 0, 366, 0.5),
  };
  if (baseline === undefined) return entry;

  let remaining = roundHalf(baseline * (entry.workRate / 100));
  for (const field of ABSENCE_FIELDS) {
    entry[field] = Math.min(entry[field], remaining);
    remaining = roundHalf(remaining - entry[field]);
  }
  return entry;
}

function normalizeYear(startYear: number, source: unknown[]) {
  return Array.from({ length: 12 }, (_, index) =>
    normalizeEntry(source[index], baselineDays(startYear, index)),
  );
}

function monthStats(startYear: number, index: number, entry: Entry): MonthStats {
  const baseline = baselineDays(startYear, index);
  const contracted = roundHalf(baseline * (entry.workRate / 100));
  return {
    baseline,
    contracted,
    available: Math.max(0, roundHalf(contracted - getAbsenceTotal(entry))),
    leave: entry.leave,
    rtt: entry.rtt,
    training: entry.training,
    other: entry.other,
  };
}

export function getEntryLimits(startYear: number, index: number, entry: Entry) {
  const baseline = baselineDays(startYear, index);
  const absenceTotal = getAbsenceTotal(entry);
  const contracted = roundHalf(baseline * (entry.workRate / 100));
  const requiredRate = baseline > 0 ? (absenceTotal / baseline) * 100 : 20;
  const minWorkRate = Math.min(100, Math.max(20, Math.ceil(requiredRate / 5) * 5));
  const absenceMax = Object.fromEntries(
    ABSENCE_FIELDS.map((field) => [
      field,
      roundHalf(Math.max(0, contracted - (absenceTotal - entry[field]))),
    ]),
  ) as Record<AbsenceKey, number>;

  return { minWorkRate, absenceMax };
}

function updateNormalizedEntry(
  startYear: number,
  index: number,
  entry: Entry,
  field: EntryNumericKey,
  value: number,
) {
  const limits = getEntryLimits(startYear, index, entry);
  const nextValue =
    field === "workRate"
      ? normalizeNumber(value, entry.workRate, limits.minWorkRate, 100, 5)
      : normalizeNumber(value, entry[field], 0, limits.absenceMax[field], 0.5);

  return {
    entry: { ...entry, [field]: nextValue },
    clamped: nextValue !== value,
  };
}

export function calculateFiscalYear(startYear: number, source: unknown[] = []) {
  const entries = normalizeYear(startYear, source);
  const summary: CapacityTotals = {
    baseline: 0,
    available: 0,
    leave: 0,
    rtt: 0,
    training: 0,
    other: 0,
  };
  const stats = entries.map((entry, index) => {
    const stats = monthStats(startYear, index, entry);
    for (const field of TOTAL_FIELDS) summary[field] += stats[field];
    return stats;
  });
  return { entries, stats, summary };
}

export function updateMonthlyEntry(
  entries: Entry[],
  startYear: number,
  index: number,
  field: EntryNumericKey,
  value: number,
) {
  const next = normalizeYear(startYear, entries);
  const result = updateNormalizedEntry(startYear, index, next[index]!, field, value);
  next[index] = result.entry;
  return { entries: next, clamped: result.clamped };
}

export function applyFieldToFiscalYear(
  entries: Entry[],
  startYear: number,
  sourceIndex: number,
  field: EntryNumericKey,
) {
  const normalized = normalizeYear(startYear, entries);
  const value = normalized[sourceIndex]?.[field] ?? EMPTY_ENTRY[field];
  return normalized.map(
    (entry, index) => updateNormalizedEntry(startYear, index, entry, field, value).entry,
  );
}

function currentFiscalYear(today = new Date()) {
  return today.getMonth() >= 6 ? today.getFullYear() : today.getFullYear() - 1;
}

export function availableFiscalYears(today = new Date()) {
  const current = currentFiscalYear(today);
  return Array.from({ length: 4 }, (_, index) => current + index);
}

export function emptyData(zone: Zone = "C"): CapacityData {
  return { version: 3 as const, zone, entries: {} };
}
