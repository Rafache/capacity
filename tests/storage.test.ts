import assert from "node:assert/strict";
import test from "node:test";
import {
  EMPTY_ENTRY,
  loadData,
  parseCapacityData,
  saveData,
} from "../src/domain/capacityData";

test("legacy local data migrates without retaining the removed note field", () => {
  const migrated = parseCapacityData({
    version: 2,
    zone: "B",
    entries: {
      2026: Array.from({ length: 12 }, (_, index) => ({
        workRate: 80,
        leave: index / 2,
        rtt: 1,
        training: 0,
        other: 0,
        note: `Month ${index + 1}`,
      })),
    },
  });

  assert.equal(migrated.data.version, 3);
  assert.equal(migrated.data.zone, "B");
  assert.deepEqual(migrated.data.entries["2026"]?.[11], {
    ...EMPTY_ENTRY,
    workRate: 80,
    leave: 5.5,
    rtt: 1,
  });
  assert.equal("note" in (migrated.data.entries["2026"]?.[11] ?? {}), false);
  assert.deepEqual(parseCapacityData(migrated.data).data, migrated.data);
});

test("corrupt local data is repaired before reaching the domain", () => {
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
  assert.deepEqual(parsed.data.entries["2026"]?.[0], EMPTY_ENTRY);
});

test("unknown and incomplete entries cannot cross the domain boundary", () => {
  const parsed = parseCapacityData({
    version: 3,
    zone: "A",
    entries: {
      1999: Array.from({ length: 12 }, () => ({})),
      2026: [
        "invalid",
        [],
        { workRate: 10_000, leave: 10_000, rtt: Number.NEGATIVE_INFINITY },
      ],
    },
  });

  assert.equal(parsed.repaired, true);
  assert.deepEqual(Object.keys(parsed.data.entries), ["2026"]);
  assert.deepEqual(parsed.data.entries["2026"]?.[0], EMPTY_ENTRY);
  assert.deepEqual(parsed.data.entries["2026"]?.[2], {
    ...EMPTY_ENTRY,
    workRate: 100,
    leave: 22,
  });
});

test("storage failures are reported without breaking the application", () => {
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
  assert.deepEqual(saveData(unavailable, loaded.data), {
    success: false,
    warning: "unavailable",
  });
});

test("a valid stored document can be saved and loaded idempotently", () => {
  const values = new Map<string, string>();
  const storage = {
    getItem: (key: string) => values.get(key) ?? null,
    setItem: (key: string, value: string) => values.set(key, value),
  } as unknown as Storage;
  const data = { version: 3 as const, zone: "A" as const, entries: {} };
  assert.deepEqual(saveData(storage, data), { success: true });
  assert.deepEqual(loadData(storage).data, data);
});
