import type { BreakKey, EntryNumericKey, HolidayKey, SegmentKey } from "../types";

export type TranslationCatalog = {
  app: {
    name: string;
    ariaLabel: string;
    views: string;
  };
  navigation: {
    monthly: string;
    annual: string;
    previousMonth: string;
    nextMonth: string;
  };
  actions: {
    openMenu: string;
    closeMenu: string;
    menuLabel: string;
    fiscalYear: string;
    schoolBreaks: string;
    schoolZone: string;
    zone: string;
    data: string;
    importCsv: string;
    exportCsv: string;
    clearData: string;
  };
  fields: Record<EntryNumericKey, string>;
  segments: Record<SegmentKey, string>;
  months: {
    month: string;
    days: string;
    total: string;
    title: string;
    ariaLabel: string;
    open: string;
    dayUnit: string;
  };
  summary: {
    month: string;
    year: string;
    workingDays: string;
    absences: string;
    capacity: string;
    monthlyBalance: string;
    monthlyBalanceDescription: string;
    distribution: string;
    calendarDetails: string;
    publicHolidays: string;
    schoolBreaks: string;
    noCalendarEvents: string;
    calendarUnpublished: string;
  };
  inputs: {
    absences: string;
    applyToYear: string;
    reduce: string;
    increase: string;
    valueIn: string;
    valueInPercent: string;
    valueInDays: string;
    year: string;
  };
  dialogs: {
    close: string;
    cancel: string;
    clearTitle: string;
    clearDescription: string;
    clearConfirm: string;
    applyTitle: string;
    applyDescription: string;
    applyConfirm: string;
  };
  notices: {
    repaired: string;
    storageUnavailable: string;
    storageSaveUnavailable: string;
    absenceClamped: string;
    exportComplete: string;
    importComplete: string;
    dataCleared: string;
    applied: Record<EntryNumericKey, string>;
  };
  errors: {
    fileTooLarge: string;
    invalidFormat: string;
    invalidColumns: string;
    invalidMonths: string;
    invalidValue: string;
    importFailed: string;
  };
  holidays: Record<HolidayKey, string>;
  schoolBreakNames: Record<BreakKey, string>;
  units: {
    day: string;
    percent: string;
  };
};
