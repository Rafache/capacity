import { roundHalf, workingDaysInMonth } from "../capacity.ts";
import type { CapacityData, Entry, MonthStats, Zone } from "../types";

export const STORAGE_KEY = "ma-capacite-v3";
export const DATA_VERSION = 3 as const;
const LEGACY_STORAGE_KEYS = ["ma-capacite-v2", "ma-capacite-v1"];
const YEAR_KEY = /^\d{4}$/;
const MIN_FISCAL_YEAR = 2000;
const MAX_FISCAL_YEAR = 9999;
const MAX_ABSENCE_DAYS = 366;
const ABSENCE_FIELDS = ["leave", "rtt", "training", "other"] as const;

export const EMPTY_ENTRY: Entry = {
  workRate: 100,
  leave: 0,
  rtt: 0,
  training: 0,
  other: 0,
  note: "",
};

export const createEntries = () => Array.from({ length: 12 }, () => ({ ...EMPTY_ENTRY }));

type MonthlyLimits = {
  baselineDays?: number;
};

type ParsedCapacityData = {
  data: CapacityData;
  repaired: boolean;
};

export type StorageLoadResult = {
  data: CapacityData;
  success: boolean;
  warning?: "repaired" | "unavailable";
};

export type StorageSaveResult =
  | { success: true }
  | { success: false; warning: "unavailable" };

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

function getAbsenceTotal(entry: Entry) {
  return ABSENCE_FIELDS.reduce((total, field) => total + entry[field], 0);
}

function capAbsences(entry: Entry, maximum: number): Entry {
  let remaining = maximum;
  return ABSENCE_FIELDS.reduce<Entry>(
    (normalized, field) => {
      const value = Math.min(normalized[field], remaining);
      remaining = roundHalf(Math.max(0, remaining - value));
      return { ...normalized, [field]: value };
    },
    entry,
  );
}

export function normalizeMonthlyEntry(input: unknown, limits: MonthlyLimits = {}): Entry {
  const value = isRecord(input) ? input : {};
  const entry: Entry = {
    workRate: normalizeNumber(value.workRate, 100, 20, 100, 5),
    leave: normalizeNumber(value.leave, 0, 0, MAX_ABSENCE_DAYS, 0.5),
    rtt: normalizeNumber(value.rtt, 0, 0, MAX_ABSENCE_DAYS, 0.5),
    training: normalizeNumber(value.training, 0, 0, MAX_ABSENCE_DAYS, 0.5),
    other: normalizeNumber(value.other, 0, 0, MAX_ABSENCE_DAYS, 0.5),
    note: typeof value.note === "string" ? value.note : "",
  };

  if (limits.baselineDays === undefined) return entry;

  const contractedDays = roundHalf(limits.baselineDays * (entry.workRate / 100));
  return capAbsences(entry, contractedDays);
}

export function normalizeEntry(input?: unknown): Entry {
  return normalizeMonthlyEntry(input);
}

export function validateMonthlyEntry(entry: Entry, contractedDays: number) {
  return getAbsenceTotal(entry) <= contractedDays;
}

export function getFiscalMonthLimits(startYear: number, index: number): MonthlyLimits {
  const month = (index + 6) % 12;
  const year = startYear + (index >= 6 ? 1 : 0);
  return { baselineDays: workingDaysInMonth(year, month) };
}

export function getMonthStats(
  startYear: number,
  index: number,
  entry: Entry,
): MonthStats {
  const { baselineDays: baseline = 0 } = getFiscalMonthLimits(startYear, index);
  const normalized = normalizeMonthlyEntry(entry, { baselineDays: baseline });
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

export function currentFiscalYear(today = new Date()) {
  const year = today.getFullYear();
  return today.getMonth() >= 6 ? year : year - 1;
}

export function availableFiscalYears(today = new Date()) {
  const current = currentFiscalYear(today);
  return Array.from({ length: 4 }, (_, index) => current + index);
}

export function emptyData(zone: Zone = "C"): CapacityData {
  return { version: DATA_VERSION, zone, entries: {} };
}

export function parseCapacityData(raw: unknown): ParsedCapacityData {
  if (!isRecord(raw)) return { data: emptyData(), repaired: true };

  const zone = raw.zone === "A" || raw.zone === "B" || raw.zone === "C" ? raw.zone : "C";
  const rawEntries = isRecord(raw.entries) ? raw.entries : {};
  let repaired = raw.version !== DATA_VERSION || zone !== raw.zone || rawEntries !== raw.entries;
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
      const normalized = normalizeMonthlyEntry(months[index], getFiscalMonthLimits(year, index));
      if (JSON.stringify(normalized) !== JSON.stringify(months[index])) repaired = true;
      return normalized;
    });
    if (months.length !== 12) repaired = true;
    entries[yearKey] = normalizedMonths;
  }

  return { data: { version: DATA_VERSION, zone, entries }, repaired };
}

export function migrateData(raw: unknown): CapacityData {
  return parseCapacityData(raw).data;
}

export function loadData(storage: Storage): StorageLoadResult {
  try {
    const current = storage.getItem(STORAGE_KEY);
    const legacy = LEGACY_STORAGE_KEYS.map((key) => storage.getItem(key)).find(Boolean);
    const source = current ?? legacy;
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

export function saveData(storage: Storage, data: CapacityData): StorageSaveResult {
  try {
    storage.setItem(STORAGE_KEY, JSON.stringify(parseCapacityData(data).data));
    return { success: true };
  } catch {
    return { success: false, warning: "unavailable" };
  }
}
