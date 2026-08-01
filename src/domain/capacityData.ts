import { roundHalf, workingDaysInMonth } from "../capacity";
import type { CapacityData, Entry, MonthStats, Zone } from "../types";

export const STORAGE_KEY = "ma-capacite-v2";
export const DATA_VERSION = 2 as const;

export const EMPTY_ENTRY: Entry = {
  workRate: 100,
  leave: 0,
  rtt: 0,
  training: 0,
  other: 0,
  note: "",
};

export const createEntries = () =>
  Array.from({ length: 12 }, () => ({ ...EMPTY_ENTRY }));

export const normalizeEntry = (entry?: Partial<Entry>): Entry => ({
  ...EMPTY_ENTRY,
  ...entry,
  note: typeof entry?.note === "string" ? entry.note : "",
});

export function getMonthStats(
  startYear: number,
  index: number,
  entry: Entry,
): MonthStats {
  const month = (index + 6) % 12;
  const year = startYear + (index >= 6 ? 1 : 0);
  const baseline = workingDaysInMonth(year, month);
  const contracted = roundHalf(baseline * (entry.workRate / 100));
  const absences = entry.leave + entry.rtt + entry.training + entry.other;
  return {
    baseline,
    contracted,
    partTime: roundHalf(baseline - contracted),
    available: Math.max(0, roundHalf(contracted - absences)),
    leave: entry.leave,
    rtt: entry.rtt,
    training: entry.training,
    other: entry.other,
  };
}

export function currentFiscalYear(today = new Date()) {
  const year = today.getFullYear();
  return today.getMonth() >= 6 ? year : year - 1;
}

export function availableFiscalYears(today = new Date()) {
  const current = currentFiscalYear(today);
  return Array.from({ length: 5 }, (_, index) => current - 1 + index);
}

export function emptyData(zone: Zone = "C"): CapacityData {
  return { version: DATA_VERSION, zone, entries: {} };
}

export function migrateData(raw: unknown): CapacityData {
  if (!raw || typeof raw !== "object") return emptyData();
  const value = raw as Record<string, unknown>;
  const legacyEntries = (value.entries ?? {}) as Record<string, Partial<Entry>[]>;
  const entries = Object.fromEntries(
    Object.entries(legacyEntries).map(([year, months]) => [
      year,
      Array.from({ length: 12 }, (_, index) => normalizeEntry(months?.[index])),
    ]),
  );
  const zone = ["A", "B", "C"].includes(String(value.zone))
    ? (value.zone as Zone)
    : "C";
  return { version: DATA_VERSION, zone, entries };
}

export function loadData(storage: Storage): CapacityData {
  try {
    const current = storage.getItem(STORAGE_KEY);
    const legacy = storage.getItem("ma-capacite-v1");
    return migrateData(JSON.parse(current ?? legacy ?? "{}"));
  } catch {
    return emptyData();
  }
}

export function saveData(storage: Storage, data: CapacityData) {
  storage.setItem(STORAGE_KEY, JSON.stringify(data));
}
