export type Zone = "A" | "B" | "C";

export type SegmentKey = "available" | "leave" | "rtt" | "training" | "other";

export type Entry = {
  workRate: number;
  leave: number;
  rtt: number;
  training: number;
  other: number;
  note: string;
};

export type EntryNumericKey = Exclude<keyof Entry, "note">;

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

export type CapacityData = {
  version: 3;
  zone: Zone;
  entries: Record<string, Entry[]>;
};

export type SchoolBreak = {
  name: string;
  start: string;
  end: string;
};
