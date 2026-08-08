import assert from "node:assert/strict";
import test from "node:test";
import {
  EMPTY_ENTRY,
  applyFieldToFiscalYear,
  calculateFiscalYear,
  getEntryLimits,
  updateMonthlyEntry,
} from "../src/domain/capacity";

test("monthly capacity respects working time and absences", () => {
  const stats = calculateFiscalYear(2026, [{ ...EMPTY_ENTRY, workRate: 80, leave: 2 }])
    .stats[0]!;
  assert.equal(stats.available, stats.contracted - 2);
});

test("entries use valid increments and cannot exceed contracted capacity", () => {
  assert.deepEqual(
    calculateFiscalYear(2026, [
      {
        workRate: 87,
        leave: 11.24,
        rtt: 11.26,
        training: -1,
        other: Number.POSITIVE_INFINITY,
      },
    ]).entries[0],
    { workRate: 85, leave: 11, rtt: 7.5, training: 0, other: 0 },
  );
});

test("a fiscal year always contains twelve months and the expected total", () => {
  const model = calculateFiscalYear(2026, [{ ...EMPTY_ENTRY, leave: 1 }]);
  assert.equal(model.entries.length, 12);
  assert.equal(model.stats.length, 12);
  assert.equal(model.summary.leave, 1);
  assert.equal(model.summary.baseline, 254);
});

test("updating a month reports a capped absence", () => {
  const result = updateMonthlyEntry([], 2026, 0, "leave", 100);
  assert.equal(result.clamped, true);
  assert.equal(result.entries[0]?.leave, 22);
});

test("editing one absence never reduces another absence", () => {
  const entries = [{ ...EMPTY_ENTRY, leave: 8, rtt: 6 }];
  const result = updateMonthlyEntry(entries, 2026, 0, "leave", 20);
  assert.equal(result.entries[0]?.leave, 16);
  assert.equal(result.entries[0]?.rtt, 6);
  assert.equal(result.clamped, true);
});

test("working time cannot fall below existing absences", () => {
  const entry = { ...EMPTY_ENTRY, leave: 10, rtt: 5 };
  const limits = getEntryLimits(2026, 0, entry);
  const result = updateMonthlyEntry([entry], 2026, 0, "workRate", 20);
  assert.equal(limits.minWorkRate, 70);
  assert.equal(result.entries[0]?.workRate, 70);
  assert.equal(result.entries[0]?.leave, 10);
  assert.equal(result.entries[0]?.rtt, 5);
});

test("replication preserves unrelated monthly values", () => {
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
