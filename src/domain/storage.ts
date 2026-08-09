import { emptyData } from "./capacity";
import type { CapacityData } from "../types";

const STORAGE_KEY = "ma-capacite-v3";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isCurrentData(value: unknown): value is CapacityData {
  return (
    isRecord(value) &&
    value.version === 3 &&
    (value.zone === "A" || value.zone === "B" || value.zone === "C") &&
    isRecord(value.entries) &&
    Object.entries(value.entries).every(
      ([year, entries]) => /^\d{4}$/.test(year) && Array.isArray(entries),
    )
  );
}

export function loadData(storage: Storage) {
  let raw: string | null;
  try {
    raw = storage.getItem(STORAGE_KEY);
  } catch {
    return { data: emptyData(), storageAvailable: false };
  }

  if (!raw) return { data: emptyData(), storageAvailable: true };
  try {
    const data: unknown = JSON.parse(raw);
    return { data: isCurrentData(data) ? data : emptyData(), storageAvailable: true };
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
    return true;
  } catch {
    return false;
  }
}
