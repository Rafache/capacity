import type { SchoolBreak, Zone } from "../types";

type SchoolCalendar = {
  common: SchoolBreak[];
  zones: Record<Zone, SchoolBreak[]>;
};

const SCHOOL_BREAKS: Partial<Record<number, SchoolCalendar>> = {
  2026: {
    common: [
      { key: "summer", start: "2026-07-04", end: "2026-08-31" },
      { key: "allSaints", start: "2026-10-17", end: "2026-11-02" },
      { key: "christmas", start: "2026-12-19", end: "2027-01-04" },
    ],
    zones: {
      A: [
        { key: "winter", start: "2027-02-13", end: "2027-03-01" },
        { key: "spring", start: "2027-04-10", end: "2027-04-26" },
      ],
      B: [
        { key: "winter", start: "2027-02-20", end: "2027-03-08" },
        { key: "spring", start: "2027-04-17", end: "2027-05-03" },
      ],
      C: [
        { key: "winter", start: "2027-02-06", end: "2027-02-22" },
        { key: "spring", start: "2027-04-03", end: "2027-04-19" },
      ],
    },
  },
  2027: {
    common: [
      { key: "summer", start: "2027-07-03", end: "2027-09-01" },
      { key: "allSaints", start: "2027-10-23", end: "2027-11-08" },
      { key: "christmas", start: "2027-12-18", end: "2028-01-03" },
    ],
    zones: {
      A: [
        { key: "winter", start: "2028-02-19", end: "2028-03-06" },
        { key: "spring", start: "2028-04-22", end: "2028-05-09" },
      ],
      B: [
        { key: "winter", start: "2028-02-05", end: "2028-02-21" },
        { key: "spring", start: "2028-04-08", end: "2028-04-24" },
      ],
      C: [
        { key: "winter", start: "2028-02-12", end: "2028-02-28" },
        { key: "spring", start: "2028-04-15", end: "2028-05-02" },
      ],
    },
  },
};

/** Return the published school breaks for a fiscal year and zone. */
export function getSchoolBreaks(startYear: number, zone: Zone) {
  const calendar = SCHOOL_BREAKS[startYear];
  return calendar ? [...calendar.common, ...calendar.zones[zone]] : undefined;
}
