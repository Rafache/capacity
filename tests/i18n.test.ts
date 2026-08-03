import assert from "node:assert/strict";
import test from "node:test";
import { formatDateLabel, formatMonthName, formatNumber } from "../src/i18n/formatters";
import { t } from "../src/i18n/translate";

test("the French catalogue contains stable keys for every domain identifier", () => {
  assert.equal(t.segments.available, "Disponible");
  assert.equal(t.schoolBreakNames.summer, "Vacances d’été");
  assert.equal(t.holidays.ascension, "Ascension");
});

test("Intl formatters are locale-aware and reusable", () => {
  assert.equal(formatNumber(12.5), "12,5");
  assert.equal(formatMonthName(2026, 0, "long"), "juillet");
  assert.match(formatDateLabel(new Date("2026-07-14T00:00:00Z")), /14/);
});
