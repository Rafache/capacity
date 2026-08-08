import assert from "node:assert/strict";
import test from "node:test";
import { clearData, loadData, saveData } from "../src/domain/storage";
import { emptyData, EMPTY_ENTRY } from "../src/domain/capacity";

function memoryStorage(initial: Record<string, string> = {}) {
  const values = new Map(Object.entries(initial));
  return {
    getItem: (key: string) => values.get(key) ?? null,
    setItem: (key: string, value: string) => values.set(key, value),
    removeItem: (key: string) => values.delete(key),
  } as unknown as Storage;
}

test("legacy and incompatible local data are ignored", () => {
  const storage = memoryStorage({
    "ma-capacite-v3": JSON.stringify({
      version: 2,
      zone: "B",
      entries: { 2026: [{ ...EMPTY_ENTRY, leave: 2 }] },
    }),
    "ma-capacite-v2": JSON.stringify({ version: 2, zone: "B", entries: {} }),
  });
  const loaded = loadData(storage);
  assert.equal(loaded.storageAvailable, true);
  assert.deepEqual(loaded.data, emptyData());
});

test("malformed local data is ignored", () => {
  const loaded = loadData(memoryStorage({ "ma-capacite-v3": "invalid json" }));
  assert.equal(loaded.storageAvailable, true);
  assert.deepEqual(loaded.data, emptyData());
});

test("storage failures never break the application", () => {
  const unavailable = {
    getItem() {
      throw new Error("unavailable");
    },
    setItem() {
      throw new Error("unavailable");
    },
    removeItem() {
      throw new Error("unavailable");
    },
  } as unknown as Storage;
  assert.equal(loadData(unavailable).storageAvailable, false);
  assert.equal(saveData(unavailable, emptyData()), false);
  assert.equal(clearData(unavailable), false);
});

test("current data can be saved, loaded and cleared", () => {
  const storage = memoryStorage();
  const data = { version: 3 as const, zone: "A" as const, entries: {} };
  assert.equal(saveData(storage, data), true);
  assert.deepEqual(loadData(storage).data, data);
  assert.equal(clearData(storage), true);
  assert.deepEqual(loadData(storage).data, emptyData());
});
