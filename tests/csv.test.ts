import assert from "node:assert/strict";
import test from "node:test";
import { exportCapacityCsv, importCapacityCsv } from "../src/domain/csv";
import { calculateFiscalYear, EMPTY_ENTRY } from "../src/domain/capacity";

test("the current CSV format round-trips twelve months", () => {
  const model = calculateFiscalYear(
    2026,
    Array.from({ length: 12 }, (_, index) => ({
      ...EMPTY_ENTRY,
      leave: index / 2,
    })),
  );
  const csv = exportCapacityCsv(2026, model.entries, model.stats);
  const imported = importCapacityCsv(csv, 2026);

  assert.match(csv, /^\uFEFF# capacity;version=3/m);
  assert.equal(imported.length, 12);
  assert.equal(imported[11]?.leave, 5.5);
});

test("invalid CSV headers, months and numeric values are rejected", () => {
  const model = calculateFiscalYear(2026);
  const csv = exportCapacityCsv(2026, model.entries, model.stats);
  assert.throws(() => importCapacityCsv(csv.replace("version=3", "version=2"), 2026));
  assert.throws(() => importCapacityCsv(csv.replace("2026-07", "2026-08"), 2026));
  assert.throws(() => importCapacityCsv(csv.replace('"100"', '"=SUM(A1:A2)"'), 2026));
});
