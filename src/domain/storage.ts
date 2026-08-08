import { calculateFiscalYear, emptyData } from "./capacity";
import type { CapacityData, Entry, Zone } from "../types";

const STORAGE_KEY = "ma-capacite-v3";
const LEGACY_KEYS = ["ma-capacite-v2", "ma-capacite-v1"];

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function normalizeData(raw: unknown): CapacityData {
  if (!isRecord(raw)) return emptyData();
  const zone: Zone = raw.zone === "A" || raw.zone === "B" ? raw.zone : "C";
  const entries: Record<string, Entry[]> = {};

  if (isRecord(raw.entries)) {
    for (const [year, months] of Object.entries(raw.entries)) {
      if (/^\d{4}$/.test(year) && Array.isArray(months)) {
        entries[year] = calculateFiscalYear(Number(year), months).entries;
      }
    }
  }
  return { version: 3, zone, entries };
}

export function loadData(storage: Storage) {
  let raw: string | null;
  try {
    raw =
      storage.getItem(STORAGE_KEY) ??
      LEGACY_KEYS.map((key) => storage.getItem(key)).find(Boolean) ??
      null;
  } catch {
    return { data: emptyData(), storageAvailable: false };
  }

  if (!raw) return { data: emptyData(), storageAvailable: true };
  try {
    return { data: normalizeData(JSON.parse(raw)), storageAvailable: true };
  } catch {
    return { data: emptyData(), storageAvailable: true };
  }
}

export function saveData(storage: Storage, data: CapacityData) {
  try {
    storage.setItem(STORAGE_KEY, JSON.stringify(data));
    return true;
  } catch {
    return false;
  }
}

export function clearData(storage: Storage) {
  try {
    storage.removeItem(STORAGE_KEY);
    for (const key of LEGACY_KEYS) storage.removeItem(key);
    return true;
  } catch {
    return false;
  }
}
