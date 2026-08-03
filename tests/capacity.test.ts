import assert from "node:assert/strict";
import test from "node:test";
import {
  EMPTY_ENTRY,
  applyFieldToFiscalYear,
  calculateFiscalYear,
  getMonthStats,
  normalizeMonthlyEntry,
  updateMonthlyEntry,
} from "../src/domain/capacityData";

test("monthly capacity separates part-time time from available capacity", () => {
  const stats = getMonthStats(2026, 0, { ...EMPTY_ENTRY, workRate: 80, leave: 2 });
  assert.equal(stats.partTime, stats.baseline - stats.contracted);
  assert.equal(stats.available, stats.contracted - 2);
});

test("monthly entries are normalized and capped at contracted capacity", () => {
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

  assert.deepEqual(entry, { workRate: 85, leave: 11, rtt: 6, training: 0, other: 0 });
});

test("the fiscal-year model normalizes twelve months and aggregates once", () => {
  const model = calculateFiscalYear(2026, [{ ...EMPTY_ENTRY, leave: 1 }]);
  assert.equal(model.entries.length, 12);
  assert.equal(model.stats.length, 12);
  assert.equal(model.summary.leave, 1);
  assert.equal(model.summary.baseline, 254);
});

test("updating a month reports when the domain clamps an absence", () => {
  const result = updateMonthlyEntry([], 2026, 0, "leave", 100);
  assert.equal(result.clamped, true);
  assert.equal(result.entries[0]?.leave, 22);
});

test("replicating a field preserves unrelated values", () => {
  const entries = Array.from({ length: 12 }, (_, index) => ({
    ...EMPTY_ENTRY,
    workRate: 80,
    leave: index / 2,
    other: index === 1 ? 2 : 0,
  }));
  const updated = applyFieldToFiscalYear(entries, 2026, 1, "leave");
  assert.deepEqual(
    updated.map(({ leave }) => leave),
    Array(12).fill(0.5),
  );
  assert.equal(updated[1]?.other, 2);
  assert.equal(updated[0]?.workRate, 80);
});

test("replicating a field also initializes an unedited fiscal year", () => {
  const updated = applyFieldToFiscalYear([], 2026, 0, "workRate");
  assert.equal(updated.length, 12);
  assert.equal(
    updated.every(({ workRate }) => workRate === 100),
    true,
  );
});
