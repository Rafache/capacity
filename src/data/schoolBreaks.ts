import type { SchoolBreak, Zone } from "../types";

export const SCHOOL_BREAKS: Record<string, Record<Zone, SchoolBreak[]>> = {
  "2026": {
    A: [
      { name: "Vacances d’été", start: "2026-07-04", end: "2026-08-31" },
      { name: "Toussaint", start: "2026-10-17", end: "2026-11-02" },
      { name: "Noël", start: "2026-12-19", end: "2027-01-04" },
      { name: "Hiver", start: "2027-02-13", end: "2027-03-01" },
      { name: "Printemps", start: "2027-04-10", end: "2027-04-26" },
    ],
    B: [
      { name: "Vacances d’été", start: "2026-07-04", end: "2026-08-31" },
      { name: "Toussaint", start: "2026-10-17", end: "2026-11-02" },
      { name: "Noël", start: "2026-12-19", end: "2027-01-04" },
      { name: "Hiver", start: "2027-02-20", end: "2027-03-08" },
      { name: "Printemps", start: "2027-04-17", end: "2027-05-03" },
    ],
    C: [
      { name: "Vacances d’été", start: "2026-07-04", end: "2026-08-31" },
      { name: "Toussaint", start: "2026-10-17", end: "2026-11-02" },
      { name: "Noël", start: "2026-12-19", end: "2027-01-04" },
      { name: "Hiver", start: "2027-02-06", end: "2027-02-22" },
      { name: "Printemps", start: "2027-04-03", end: "2027-04-19" },
    ],
  },
  "2027": {
    A: [
      { name: "Vacances d’été", start: "2027-07-03", end: "2027-09-01" },
      { name: "Toussaint", start: "2027-10-23", end: "2027-11-08" },
      { name: "Noël", start: "2027-12-18", end: "2028-01-03" },
      { name: "Hiver", start: "2028-02-19", end: "2028-03-06" },
      { name: "Printemps", start: "2028-04-22", end: "2028-05-09" },
    ],
    B: [
      { name: "Vacances d’été", start: "2027-07-03", end: "2027-09-01" },
      { name: "Toussaint", start: "2027-10-23", end: "2027-11-08" },
      { name: "Noël", start: "2027-12-18", end: "2028-01-03" },
      { name: "Hiver", start: "2028-02-05", end: "2028-02-21" },
      { name: "Printemps", start: "2028-04-08", end: "2028-04-24" },
    ],
    C: [
      { name: "Vacances d’été", start: "2027-07-03", end: "2027-09-01" },
      { name: "Toussaint", start: "2027-10-23", end: "2027-11-08" },
      { name: "Noël", start: "2027-12-18", end: "2028-01-03" },
      { name: "Hiver", start: "2028-02-12", end: "2028-02-28" },
      { name: "Printemps", start: "2028-04-15", end: "2028-05-02" },
    ],
  },
  "2028": { A: [], B: [], C: [] },
};
