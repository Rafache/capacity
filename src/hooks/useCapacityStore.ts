import { useState } from "react";
import {
  applyFieldToFiscalYear,
  emptyData,
  updateMonthlyEntry,
} from "../domain/capacity";
import { clearData, loadData, saveData } from "../domain/storage";
import type { CapacityData, Entry, EntryNumericKey, Zone } from "../types";

function readInitialState() {
  return typeof window === "undefined"
    ? { data: emptyData(), storageAvailable: true }
    : loadData(window.localStorage);
}

/** Keep capacity data in localStorage and expose explicit domain actions. */
export function useCapacityStore() {
  const [state, setState] = useState(readInitialState);

  const commit = (data: CapacityData) => {
    setState((previous) => ({ ...previous, data }));
    return typeof window === "undefined" || saveData(window.localStorage, data);
  };

  const replaceYear = (startYear: number, entries: Entry[]) => {
    const data = {
      ...state.data,
      entries: { ...state.data.entries, [String(startYear)]: entries },
    };
    return commit(data);
  };

  const updateEntry = (
    startYear: number,
    monthIndex: number,
    field: EntryNumericKey,
    value: number,
  ) => {
    const result = updateMonthlyEntry(
      state.data.entries[String(startYear)] ?? [],
      startYear,
      monthIndex,
      field,
      value,
    );
    return {
      saved: replaceYear(startYear, result.entries),
      clamped: result.clamped,
    };
  };

  const applyField = (startYear: number, monthIndex: number, field: EntryNumericKey) => {
    return replaceYear(
      startYear,
      applyFieldToFiscalYear(
        state.data.entries[String(startYear)] ?? [],
        startYear,
        monthIndex,
        field,
      ),
    );
  };

  const setZone = (zone: Zone) => commit({ ...state.data, zone });

  const clear = () => {
    const removed = typeof window === "undefined" || clearData(window.localStorage);
    setState((previous) => ({ ...previous, data: emptyData() }));
    return removed;
  };

  return {
    data: state.data,
    storageAvailable: state.storageAvailable,
    replaceYear,
    updateEntry,
    applyField,
    setZone,
    clear,
  };
}
