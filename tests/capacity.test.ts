import assert from "node:assert/strict";
import test from "node:test";
import { fiscalMonth, publicHolidays, roundHalf, workingDaysInMonth } from "../src/capacity.ts";
import { EMPTY_ENTRY, getMonthStats, migrateData } from "../src/domain/capacityData.ts";
import { exportCapacityCsv, importCapacityCsv } from "../src/domain/csv.ts";

test("l’année 2026–2027 compte 254 jours ouvrés", () => {
  const total = Array.from({ length: 12 }, (_, index) => {
    const { year, month } = fiscalMonth(2026, index);
    return workingDaysInMonth(year, month);
  }).reduce((sum, value) => sum + value, 0);
  assert.equal(total, 254);
});

test("les jours fériés mobiles 2027 sont calculés", () => {
  const holidays = publicHolidays(2027);
  assert.equal(holidays.find((item) => item.name === "Lundi de Pâques")?.date.toISOString().slice(0, 10), "2027-03-29");
  assert.equal(holidays.find((item) => item.name === "Ascension")?.date.toISOString().slice(0, 10), "2027-05-06");
});

test("les arrondis utilisent la demi-journée", () => {
  assert.equal(roundHalf(12.24), 12);
  assert.equal(roundHalf(12.26), 12.5);
});

test("le calcul mensuel distingue temps partiel et capacité", () => {
  const stats = getMonthStats(2026, 0, { ...EMPTY_ENTRY, workRate: 80, leave: 2 });
  assert.equal(stats.partTime, roundHalf(stats.baseline - stats.contracted));
  assert.equal(stats.available, roundHalf(stats.contracted - 2));
});

test("les anciennes données sont migrées vers la version 2", () => {
  const migrated = migrateData({ zone: "B", entries: { 2026: [{ workRate: 80 }] } });
  assert.equal(migrated.version, 2);
  assert.equal(migrated.zone, "B");
  assert.equal(migrated.entries["2026"].length, 12);
  assert.equal(migrated.entries["2026"][0].note, "");
});

test("un export CSV version 2 peut être réimporté", () => {
  const entries = Array.from({ length: 12 }, (_, index) => ({ ...EMPTY_ENTRY, note: index === 0 ? "Formation; interne" : "" }));
  const stats = entries.map((entry, index) => getMonthStats(2026, index, entry));
  const csv = exportCapacityCsv(Array.from({ length: 12 }, (_, index) => String(index + 1)), entries, stats);
  const imported = importCapacityCsv(csv);
  assert.equal(imported.length, 12);
  assert.equal(imported[0].note, "Formation; interne");
});
