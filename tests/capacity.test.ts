import assert from "node:assert/strict";
import test from "node:test";
import {
  fiscalMonth,
  publicHolidays,
  roundHalf,
  workingDaysInMonth,
} from "../src/capacity.ts";
import {
  EMPTY_ENTRY,
  availableFiscalYears,
  getMonthStats,
  loadData,
  migrateData,
  normalizeMonthlyEntry,
  parseCapacityData,
  saveData,
} from "../src/domain/capacityData.ts";
import { exportCapacityCsv, importCapacityCsv } from "../src/domain/csv.ts";

test("l’année 2026–2027 compte 254 jours ouvrés", () => {
  const total = Array.from({ length: 12 }, (_, index) => {
    const { year, month } = fiscalMonth(2026, index);
    return workingDaysInMonth(year, month);
  }).reduce((sum, value) => sum + value, 0);
  assert.equal(total, 254);
});

test("les années fiscales proposées commencent par l’exercice courant", () => {
  const years = availableFiscalYears(new Date(2026, 7, 2));
  assert.deepEqual(years, [2026, 2027, 2028, 2029]);
  assert.equal(years.includes(2025), false);
});

test("les jours fériés mobiles 2027 sont calculés", () => {
  const holidays = publicHolidays(2027);
  assert.equal(
    holidays
      .find((item) => item.name === "Lundi de Pâques")
      ?.date.toISOString()
      .slice(0, 10),
    "2027-03-29",
  );
  assert.equal(
    holidays
      .find((item) => item.name === "Ascension")
      ?.date.toISOString()
      .slice(0, 10),
    "2027-05-06",
  );
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

test("les anciennes données sont migrées vers la version 3", () => {
  const migrated = migrateData({ zone: "B", entries: { 2026: [{ workRate: 80 }] } });
  assert.equal(migrated.version, 3);
  assert.equal(migrated.zone, "B");
  assert.equal(migrated.entries["2026"].length, 12);
  assert.equal(migrated.entries["2026"][0].note, "");
});

test("les entrées mensuelles sont normalisées et plafonnées à la capacité contractuelle", () => {
  const entry = normalizeMonthlyEntry(
    {
      workRate: 87,
      leave: 11.24,
      rtt: 11.26,
      training: -1,
      other: Number.POSITIVE_INFINITY,
    },
    { baselineDays: 20 },
  );

  assert.deepEqual(entry, {
    workRate: 85,
    leave: 11,
    rtt: 6,
    training: 0,
    other: 0,
    note: "",
  });
});

test("les données locales corrompues sont réparées avant les calculs", () => {
  const parsed = parseCapacityData({
    version: 2,
    zone: "invalid",
    entries: {
      invalid: [{}],
      2026: [{ workRate: Number.NaN, leave: -2, rtt: "4" }, null],
    },
  });

  assert.equal(parsed.repaired, true);
  assert.equal(parsed.data.version, 3);
  assert.equal(parsed.data.zone, "C");
  assert.deepEqual(Object.keys(parsed.data.entries), ["2026"]);
  assert.equal(parsed.data.entries["2026"].length, 12);
  assert.deepEqual(parsed.data.entries["2026"][0], EMPTY_ENTRY);
});

test("le stockage indisponible ne fait pas échouer le chargement ou la sauvegarde", () => {
  const unavailable = {
    getItem() {
      throw new Error("unavailable");
    },
    setItem() {
      throw new Error("quota exceeded");
    },
  } as unknown as Storage;

  const loaded = loadData(unavailable);
  assert.equal(loaded.success, false);
  assert.equal(loaded.warning, "unavailable");
  assert.deepEqual(loaded.data, { version: 3, zone: "C", entries: {} });
  assert.deepEqual(saveData(unavailable, loaded.data), {
    success: false,
    warning: "unavailable",
  });
});

test("un export CSV version 2 peut être réimporté", () => {
  const entries = Array.from({ length: 12 }, (_, index) => ({
    ...EMPTY_ENTRY,
    note: index === 0 ? "Formation; interne" : "",
  }));
  const stats = entries.map((entry, index) => getMonthStats(2026, index, entry));
  const csv = exportCapacityCsv(
    Array.from({ length: 12 }, (_, index) => String(index + 1)),
    entries,
    stats,
  );
  const imported = importCapacityCsv(csv);
  assert.equal(imported.length, 12);
  assert.equal(imported[0].note, "Formation; interne");
});
