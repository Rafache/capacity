import type { BreakKey, DateRange, SchoolBreak, Zone } from "../types";

export type SchoolCalendar = {
  source: string;
  verifiedAt: string;
  common: Partial<Record<BreakKey, DateRange>>;
  zones: Record<Zone, Partial<Record<BreakKey, DateRange>>>;
};

const BREAK_KEYS: BreakKey[] = ["summer", "allSaints", "christmas", "winter", "spring"];

const COMMON_2026: SchoolCalendar["common"] = {
  summer: { start: "2026-07-04", end: "2026-08-31" },
  allSaints: { start: "2026-10-17", end: "2026-11-02" },
  christmas: { start: "2026-12-19", end: "2027-01-04" },
};

const COMMON_2027: SchoolCalendar["common"] = {
  summer: { start: "2027-07-03", end: "2027-09-01" },
  allSaints: { start: "2027-10-23", end: "2027-11-08" },
  christmas: { start: "2027-12-18", end: "2028-01-03" },
};

const SOURCE = "https://www.education.gouv.fr/calendrier-scolaire";

export const SCHOOL_BREAKS: Record<number, SchoolCalendar> = {
  2026: {
    source: SOURCE,
    verifiedAt: "2026-08-03",
    common: COMMON_2026,
    zones: {
      A: {
        winter: { start: "2027-02-13", end: "2027-03-01" },
        spring: { start: "2027-04-10", end: "2027-04-26" },
      },
      B: {
        winter: { start: "2027-02-20", end: "2027-03-08" },
        spring: { start: "2027-04-17", end: "2027-05-03" },
      },
      C: {
        winter: { start: "2027-02-06", end: "2027-02-22" },
        spring: { start: "2027-04-03", end: "2027-04-19" },
      },
    },
  },
  2027: {
    source: SOURCE,
    verifiedAt: "2026-08-03",
    common: COMMON_2027,
    zones: {
      A: {
        winter: { start: "2028-02-19", end: "2028-03-06" },
        spring: { start: "2028-04-22", end: "2028-05-09" },
      },
      B: {
        winter: { start: "2028-02-05", end: "2028-02-21" },
        spring: { start: "2028-04-08", end: "2028-04-24" },
      },
      C: {
        winter: { start: "2028-02-12", end: "2028-02-28" },
        spring: { start: "2028-04-15", end: "2028-05-02" },
      },
    },
  },
};

function dateValue(value: string) {
  if (typeof value !== "string") return Number.NaN;
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) return Number.NaN;
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const date = Date.UTC(year, month - 1, day);
  const parsed = new Date(date);
  return parsed.getUTCFullYear() === year &&
    parsed.getUTCMonth() === month - 1 &&
    parsed.getUTCDate() === day
    ? date
    : Number.NaN;
}

function completeBreaks(calendar: SchoolCalendar, zone: Zone): SchoolBreak[] {
  return BREAK_KEYS.flatMap((key) => {
    const range = calendar?.zones?.[zone]?.[key] ?? calendar?.common?.[key];
    return range ? [{ key, ...range }] : [];
  });
}

/** Return the published calendar metadata for a fiscal year, if available. */
export function getSchoolCalendar(startYear: number): SchoolCalendar | undefined {
  return SCHOOL_BREAKS[startYear];
}

/** Return the published school breaks for a fiscal year and zone. */
export function getSchoolBreaks(
  startYear: number,
  zone: Zone,
): SchoolBreak[] | undefined {
  const calendar = getSchoolCalendar(startYear);
  return calendar ? completeBreaks(calendar, zone) : undefined;
}

/** Validate the compact school-calendar dataset and return human-readable failures. */
export function validateSchoolCalendars(calendars = SCHOOL_BREAKS): string[] {
  if (!calendars || typeof calendars !== "object") {
    return ["dataset: invalid calendar collection"];
  }
  const errors: string[] = [];
  for (const [yearKey, calendar] of Object.entries(calendars)) {
    const year = Number(yearKey);
    if (!calendar || typeof calendar !== "object") {
      errors.push(`${yearKey}: invalid calendar`);
      continue;
    }
    const zones = calendar.zones ?? {};
    const common = calendar.common ?? {};
    if (
      !/^\d{4}$/.test(yearKey) ||
      !calendar.source ||
      !Number.isFinite(dateValue(calendar.verifiedAt))
    ) {
      errors.push(`${yearKey}: invalid metadata`);
    }

    for (const zone of ["A", "B", "C"] as const) {
      const breaks = completeBreaks(calendar, zone);
      if (breaks.length !== BREAK_KEYS.length) {
        errors.push(`${yearKey}/${zone}: incomplete break list`);
      }
      if (new Set(breaks.map(({ key }) => key)).size !== breaks.length) {
        errors.push(`${yearKey}/${zone}: duplicate break key`);
      }
      for (const item of breaks) {
        const start = dateValue(item.start);
        const end = dateValue(item.end);
        if (!Number.isFinite(start) || !Number.isFinite(end) || start > end) {
          errors.push(`${yearKey}/${zone}/${item.key}: invalid date range`);
        } else if (start < Date.UTC(year, 6, 1) || end > Date.UTC(year + 1, 5, 30)) {
          errors.push(`${yearKey}/${zone}/${item.key}: outside fiscal year`);
        }
      }
      const ordered = [...breaks].sort(
        (left, right) => dateValue(left.start) - dateValue(right.start),
      );
      for (let index = 1; index < ordered.length; index += 1) {
        if (dateValue(ordered[index]!.start) <= dateValue(ordered[index - 1]!.end)) {
          errors.push(`${yearKey}/${zone}: overlapping break ranges`);
        }
      }
    }

    if (Object.keys(zones).sort().join() !== "A,B,C") {
      errors.push(`${yearKey}: zones A, B and C are required`);
    }

    const summer = common.summer;
    if (summer && dateValue(summer.start) < Date.UTC(year, 6, 1)) {
      errors.push(`${yearKey}: summer break starts before the fiscal year`);
    }
  }
  return errors;
}
