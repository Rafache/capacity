import { getFiscalMonth, roundHalf, workingDaysInMonth } from './calendar';
import type {
  AbsenceKey,
  CapacityData,
  CapacityTotals,
  Entry,
  EntryNumericKey,
  MonthStats,
  Zone,
} from '../types';

const ABSENCE_FIELDS = ['leave', 'rtt', 'training', 'other'] as const;
const TOTAL_FIELDS = ['baseline', 'available', ...ABSENCE_FIELDS] as const;

export const ENTRY_RULES = {
  workRate: { min: 20, max: 100, step: 5 },
  absence: { min: 0, max: 366, step: 0.5 },
} as const;

export const EMPTY_ENTRY: Entry = {
  workRate: 100,
  leave: 0,
  rtt: 0,
  training: 0,
  other: 0,
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function normalizeNumber(
  value: unknown,
  fallback: number,
  minimum: number,
  maximum: number,
  step: number,
) {
  if (typeof value !== 'number' || !Number.isFinite(value)) return fallback;
  return Math.min(maximum, Math.max(minimum, Math.round(value / step) * step));
}

function baselineDays(startYear: number, index: number) {
  const { year, month } = getFiscalMonth(startYear, index);
  return workingDaysInMonth(year, month);
}

export function getAbsenceTotal(value: Pick<Entry, 'leave' | 'rtt' | 'training' | 'other'>) {
  return ABSENCE_FIELDS.reduce((total, field) => total + value[field], 0);
}

function normalizeAbsence(value: unknown) {
  const { min, max, step } = ENTRY_RULES.absence;
  return normalizeNumber(value, min, min, max, step);
}

function normalizeEntry(input: unknown, baseline?: number): Entry {
  const value = isRecord(input) ? input : {};
  const entry: Entry = {
    workRate: normalizeNumber(
      value.workRate,
      ENTRY_RULES.workRate.max,
      ENTRY_RULES.workRate.min,
      ENTRY_RULES.workRate.max,
      ENTRY_RULES.workRate.step,
    ),
    leave: normalizeAbsence(value.leave),
    rtt: normalizeAbsence(value.rtt),
    training: normalizeAbsence(value.training),
    other: normalizeAbsence(value.other),
  };
  if (baseline === undefined) return entry;

  let remaining = roundHalf(baseline * (entry.workRate / ENTRY_RULES.workRate.max));
  for (const field of ABSENCE_FIELDS) {
    entry[field] = Math.min(entry[field], remaining);
    remaining = roundHalf(remaining - entry[field]);
  }
  return entry;
}

function yearBaselines(startYear: number) {
  return Array.from({ length: 12 }, (_, index) => baselineDays(startYear, index));
}

function normalizeYear(startYear: number, source: unknown[], baselines = yearBaselines(startYear)) {
  return Array.from({ length: 12 }, (_, index) => normalizeEntry(source[index], baselines[index]));
}

function monthStats(baseline: number, entry: Entry): MonthStats {
  const contracted = roundHalf(baseline * (entry.workRate / ENTRY_RULES.workRate.max));
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
  const contracted = roundHalf(baseline * (entry.workRate / ENTRY_RULES.workRate.max));
  const requiredRate =
    baseline > 0 ? (absenceTotal / baseline) * ENTRY_RULES.workRate.max : ENTRY_RULES.workRate.min;
  const minWorkRate = Math.min(
    ENTRY_RULES.workRate.max,
    Math.max(
      ENTRY_RULES.workRate.min,
      Math.ceil(requiredRate / ENTRY_RULES.workRate.step) * ENTRY_RULES.workRate.step,
    ),
  );
  const absenceMax = Object.fromEntries(
    ABSENCE_FIELDS.map((field) => [
      field,
      roundHalf(
        Math.min(
          ENTRY_RULES.absence.max,
          Math.max(ENTRY_RULES.absence.min, contracted - (absenceTotal - entry[field])),
        ),
      ),
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
    field === 'workRate'
      ? normalizeNumber(
          value,
          entry.workRate,
          limits.minWorkRate,
          ENTRY_RULES.workRate.max,
          ENTRY_RULES.workRate.step,
        )
      : normalizeNumber(
          value,
          entry[field],
          ENTRY_RULES.absence.min,
          limits.absenceMax[field],
          ENTRY_RULES.absence.step,
        );

  return {
    entry: { ...entry, [field]: nextValue },
    clamped: nextValue !== value,
  };
}

export function calculateFiscalYear(startYear: number, source: unknown[] = []) {
  const baselines = yearBaselines(startYear);
  const entries = normalizeYear(startYear, source, baselines);
  const summary: CapacityTotals = {
    baseline: 0,
    available: 0,
    leave: 0,
    rtt: 0,
    training: 0,
    other: 0,
  };
  const stats = entries.map((entry, index) => {
    const stats = monthStats(baselines[index]!, entry);
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

export function getCurrentFiscalPosition(today = new Date()) {
  const month = today.getMonth();
  return {
    startYear: month >= 6 ? today.getFullYear() : today.getFullYear() - 1,
    monthIndex: (month + 6) % 12,
  };
}

export function availableFiscalYears(today = new Date()) {
  const { startYear: current } = getCurrentFiscalPosition(today);
  return Array.from({ length: 4 }, (_, index) => current + index);
}

export function emptyData(zone: Zone = 'C'): CapacityData {
  return { version: 3 as const, zone, entries: {} };
}
