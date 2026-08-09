import { getFiscalMonth, roundHalf, workingDaysInMonth } from "./calendar";
import type {
  AnnualSummary,
  CapacityData,
  Entry,
  EntryNumericKey,
  MonthStats,
  Zone,
} from "../types";

export const STORAGE_KEY = "ma-capacite-v3";
export const DATA_VERSION = 3 as const;
const LEGACY_STORAGE_KEYS = ["ma-capacite-v2", "ma-capacite-v1"];
const YEAR_KEY = /^\d{4}$/;
const MIN_FISCAL_YEAR = 2000;
const MAX_FISCAL_YEAR = 9999;
const MAX_ABSENCE_DAYS = 366;
const ABSENCE_FIELDS = ["leave", "rtt", "training", "other"] as const;
const SUMMARY_FIELDS = [
  "baseline",
  "contracted",
  "partTime",
  "available",
  "leave",
  "rtt",
  "training",
  "other",
] as const;

export const EMPTY_ENTRY: Entry = {
  workRate: 100,
  leave: 0,
  rtt: 0,
  training: 0,
  other: 0,
};

export type MonthlyLimits = {
  baselineDays?: number;
};

export type ParsedCapacityData = {
  data: CapacityData;
  repaired: boolean;
};

export type StorageLoadResult = {
  data: CapacityData;
  success: boolean;
  warning?: "repaired" | "unavailable";
};

export type StorageSaveResult =
  { success: true } | { success: false; warning: "unavailable" };

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

/** Sum the absence segments of a normalized entry or statistics object. */
export function getAbsenceTotal(
  entry: Pick<Entry, "leave" | "rtt" | "training" | "other">,
) {
  return ABSENCE_FIELDS.reduce((total, field) => total + entry[field], 0);
}

function capAbsences(entry: Entry, maximum: number): Entry {
  let remaining = maximum;
  const normalized = { ...entry };
  for (const field of ABSENCE_FIELDS) {
    const value = Math.min(normalized[field], remaining);
    remaining = roundHalf(Math.max(0, remaining - value));
    normalized[field] = value;
  }
  return normalized;
}

/** Normalize untrusted entry data and cap absences to the contracted capacity. */
export function normalizeMonthlyEntry(input: unknown, limits: MonthlyLimits = {}): Entry {
  const value = isRecord(input) ? input : {};
  const entry: Entry = {
    workRate: normalizeNumber(value.workRate, 100, 20, 100, 5),
    leave: normalizeNumber(value.leave, 0, 0, MAX_ABSENCE_DAYS, 0.5),
    rtt: normalizeNumber(value.rtt, 0, 0, MAX_ABSENCE_DAYS, 0.5),
    training: normalizeNumber(value.training, 0, 0, MAX_ABSENCE_DAYS, 0.5),
    other: normalizeNumber(value.other, 0, 0, MAX_ABSENCE_DAYS, 0.5),
  };

  if (limits.baselineDays === undefined) return entry;

  const contractedDays = roundHalf(limits.baselineDays * (entry.workRate / 100));
  return capAbsences(entry, contractedDays);
}

/** Return the working-day limit for one fiscal month. */
export function getFiscalMonthLimits(startYear: number, index: number): MonthlyLimits {
  const { year, month } = getFiscalMonth(startYear, index);
  return { baselineDays: workingDaysInMonth(year, month) };
}

/** Calculate display statistics for one normalized fiscal month. */
export function getMonthStats(
  startYear: number,
  index: number,
  entry: Entry,
): MonthStats {
  const { baselineDays: baseline = 0 } = getFiscalMonthLimits(startYear, index);
  return calculateMonthStats(
    baseline,
    normalizeMonthlyEntry(entry, { baselineDays: baseline }),
  );
}

function calculateMonthStats(baseline: number, normalized: Entry): MonthStats {
  const contracted = roundHalf(baseline * (normalized.workRate / 100));
  const absences = getAbsenceTotal(normalized);
  return {
    baseline,
    contracted,
    partTime: roundHalf(baseline - contracted),
    available: Math.max(0, roundHalf(contracted - absences)),
    leave: normalized.leave,
    rtt: normalized.rtt,
    training: normalized.training,
    other: normalized.other,
  };
}

export type FiscalYearModel = {
  entries: Entry[];
  stats: MonthStats[];
  summary: AnnualSummary;
};

function normalizeFiscalYearEntries(startYear: number, source: Entry[]) {
  return Array.from({ length: 12 }, (_, index) =>
    normalizeMonthlyEntry(source[index], getFiscalMonthLimits(startYear, index)),
  );
}

/** Normalize twelve entries and calculate the complete fiscal-year display model. */
export function calculateFiscalYear(
  startYear: number,
  source: Entry[] = [],
): FiscalYearModel {
  const entries = normalizeFiscalYearEntries(startYear, source);
  const stats: MonthStats[] = [];
  const summary: AnnualSummary = {
    baseline: 0,
    contracted: 0,
    partTime: 0,
    available: 0,
    leave: 0,
    rtt: 0,
    training: 0,
    other: 0,
  };

  entries.forEach((entry, index) => {
    const { baselineDays: baseline = 0 } = getFiscalMonthLimits(startYear, index);
    const month = calculateMonthStats(baseline, entry);
    stats.push(month);
    for (const field of SUMMARY_FIELDS) summary[field] += month[field];
  });

  return { entries, stats, summary };
}

export type EntryUpdate = {
  entries: Entry[];
  clamped: boolean;
};

/** Update one month while preserving the domain limits for that fiscal month. */
export function updateMonthlyEntry(
  entries: Entry[],
  startYear: number,
  index: number,
  field: EntryNumericKey,
  value: number,
): EntryUpdate {
  const next = normalizeFiscalYearEntries(startYear, entries);
  const current = next[index] ?? { ...EMPTY_ENTRY };
  const requested = { ...current, [field]: value };
  const normalized = normalizeMonthlyEntry(
    requested,
    getFiscalMonthLimits(startYear, index),
  );
  next[index] = normalized;
  return { entries: next, clamped: normalized[field] !== value };
}

/** Copy one field from a selected month to every month in the fiscal year. */
export function applyFieldToFiscalYear(
  entries: Entry[],
  startYear: number,
  sourceIndex: number,
  field: EntryNumericKey,
) {
  const normalizedEntries = normalizeFiscalYearEntries(startYear, entries);
  const source = normalizedEntries[sourceIndex] ?? EMPTY_ENTRY;
  return normalizedEntries.map((entry, index) =>
    normalizeMonthlyEntry(
      { ...entry, [field]: source[field] },
      getFiscalMonthLimits(startYear, index),
    ),
  );
}

/** Return the fiscal year containing a calendar date. */
export function currentFiscalYear(today = new Date()) {
  const year = today.getFullYear();
  return today.getMonth() >= 6 ? year : year - 1;
}

/** Return the current fiscal year and the next three selectable years. */
export function availableFiscalYears(today = new Date()) {
  const current = currentFiscalYear(today);
  return Array.from({ length: 4 }, (_, index) => current + index);
}

/** Create an empty versioned document for a school zone. */
export function emptyData(zone: Zone = "C"): CapacityData {
  return { version: DATA_VERSION, zone, entries: {} };
}

/** Parse and repair untrusted local-storage data at the application boundary. */
export function parseCapacityData(raw: unknown): ParsedCapacityData {
  if (!isRecord(raw)) return { data: emptyData(), repaired: true };

  const zone = raw.zone === "A" || raw.zone === "B" || raw.zone === "C" ? raw.zone : "C";
  const rawEntries = isRecord(raw.entries) ? raw.entries : {};
  let repaired =
    raw.version !== DATA_VERSION || zone !== raw.zone || rawEntries !== raw.entries;
  const entries: Record<string, Entry[]> = {};

  for (const [yearKey, months] of Object.entries(rawEntries)) {
    const year = Number(yearKey);
    if (
      !YEAR_KEY.test(yearKey) ||
      year < MIN_FISCAL_YEAR ||
      year > MAX_FISCAL_YEAR ||
      !Array.isArray(months)
    ) {
      repaired = true;
      continue;
    }

    const normalizedMonths = Array.from({ length: 12 }, (_, index) => {
      const normalized = normalizeMonthlyEntry(
        months[index],
        getFiscalMonthLimits(year, index),
      );
      if (JSON.stringify(normalized) !== JSON.stringify(months[index])) repaired = true;
      return normalized;
    });
    if (months.length !== 12) repaired = true;
    entries[yearKey] = normalizedMonths;
  }

  return { data: { version: DATA_VERSION, zone, entries }, repaired };
}

/** Load, migrate and validate a document without allowing storage errors to escape. */
export function loadData(storage: Storage): StorageLoadResult {
  try {
    const current = storage.getItem(STORAGE_KEY);
    const source =
      current ?? LEGACY_STORAGE_KEYS.map((key) => storage.getItem(key)).find(Boolean);
    if (!source) return { data: emptyData(), success: true };

    const parsed = parseCapacityData(JSON.parse(source));
    return {
      data: parsed.data,
      success: true,
      warning: parsed.repaired || !current ? "repaired" : undefined,
    };
  } catch {
    return { data: emptyData(), success: false, warning: "unavailable" };
  }
}

/** Serialize normalized data and report quota or unavailable-storage failures. */
export function saveData(storage: Storage, data: CapacityData): StorageSaveResult {
  try {
    storage.setItem(STORAGE_KEY, JSON.stringify(parseCapacityData(data).data));
    return { success: true };
  } catch {
    return { success: false, warning: "unavailable" };
  }
}

/** Remove current and legacy documents without allowing storage errors to escape. */
export function clearData(storage: Storage) {
  try {
    storage.removeItem(STORAGE_KEY);
    for (const key of LEGACY_STORAGE_KEYS) storage.removeItem(key);
    return { success: true } as const;
  } catch {
    return { success: false, warning: "unavailable" } as const;
  }
}
