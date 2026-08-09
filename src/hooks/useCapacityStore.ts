import { useState } from "react";
import {
  applyFieldToFiscalYear,
  clearData as clearStoredData,
  emptyData,
  loadData,
  saveData,
  updateMonthlyEntry,
} from "../domain/capacityData";
import type { CapacityData, Entry, EntryNumericKey, Zone } from "../types";

type StoreState = {
  data: CapacityData;
  loadWarning?: "repaired" | "unavailable";
};

type WriteResult = {
  saved: boolean;
};

function readInitialState(): StoreState {
  if (typeof window === "undefined") return { data: emptyData() };
  const result = loadData(window.localStorage);
  return { data: result.data, loadWarning: result.warning };
}

/** Keep capacity data in localStorage and expose explicit domain actions. */
export function useCapacityStore() {
  const [state, setState] = useState(readInitialState);

  const commit = (data: CapacityData): WriteResult => {
    setState((previous) => ({ ...previous, data }));
    if (typeof window === "undefined") return { saved: true };
    return { saved: saveData(window.localStorage, data).success };
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
    const data = {
      ...state.data,
      entries: { ...state.data.entries, [String(startYear)]: result.entries },
    };
    return { ...commit(data), clamped: result.clamped };
  };

  const applyField = (startYear: number, monthIndex: number, field: EntryNumericKey) => {
    const data = {
      ...state.data,
      entries: {
        ...state.data.entries,
        [String(startYear)]: applyFieldToFiscalYear(
          state.data.entries[String(startYear)] ?? [],
          startYear,
          monthIndex,
          field,
        ),
      },
    };
    return commit(data);
  };

  const setZone = (zone: Zone) => commit({ ...state.data, zone });

  const clear = () => {
    const removed =
      typeof window === "undefined" || clearStoredData(window.localStorage).success;
    setState((previous) => ({ ...previous, data: emptyData() }));
    return { saved: removed };
  };

  return {
    data: state.data,
    loadWarning: state.loadWarning,
    replaceYear,
    updateEntry,
    applyField,
    setZone,
    clear,
  };
}
