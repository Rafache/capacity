import assert from "node:assert/strict";
import test from "node:test";
import { fiscalMonth, workingDaysInMonth } from "../src/capacity.ts";

test("l’année 2026–2027 compte 254 jours ouvrés", () => {
  const total = Array.from({ length: 12 }, (_, index) => {
    const { year, month } = fiscalMonth(2026, index);
    return workingDaysInMonth(year, month);
  }).reduce((sum, value) => sum + value, 0);
  assert.equal(total, 254);
});
