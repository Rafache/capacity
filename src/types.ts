export type Zone = "A" | "B" | "C";

export type SegmentKey = "available" | "leave" | "rtt" | "training" | "other";

export type BreakKey = "summer" | "allSaints" | "christmas" | "winter" | "spring";

export type HolidayKey =
  | "newYear"
  | "easterMonday"
  | "labourDay"
  | "victoryDay"
  | "ascension"
  | "whitMonday"
  | "nationalDay"
  | "assumption"
  | "allSaints"
  | "armistice"
  | "christmas";

export type Entry = {
  workRate: number;
  leave: number;
  rtt: number;
  training: number;
  other: number;
};

export type EntryNumericKey = keyof Entry;

export type MonthStats = {
  baseline: number;
  contracted: number;
  partTime: number;
  available: number;
  leave: number;
  rtt: number;
  training: number;
  other: number;
};

export type AnnualSummary = {
  baseline: number;
  contracted: number;
  partTime: number;
  available: number;
  leave: number;
  rtt: number;
  training: number;
  other: number;
};

export type CapacityData = {
  version: 3;
  zone: Zone;
  entries: Record<string, Entry[]>;
};

export type DateRange = {
  start: string;
  end: string;
};

export type SchoolBreak = DateRange & {
  key: BreakKey;
};
