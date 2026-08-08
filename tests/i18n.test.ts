import assert from "node:assert/strict";
import test from "node:test";
import {
  formatDateLabel,
  formatDateRange,
  formatMonthName,
  formatNumber,
} from "../src/i18n/formatters";
import { t } from "../src/i18n/fr";

test("French labels and date formats remain stable", () => {
  assert.equal(t.segments.available, "Disponible");
  assert.equal(t.schoolBreakNames.summer, "Vacances d’été");
  assert.equal(t.schoolBreakNames.allSaints, "Vacances de la Toussaint");
  assert.equal(t.schoolBreakNames.winter, "Vacances d’hiver");
  assert.equal(t.holidays.ascension, "Ascension");
  assert.equal(formatNumber(12.5), "12,5");
  assert.equal(formatMonthName(0, "long"), "juillet");
  assert.equal(formatDateLabel(new Date("2026-07-14T00:00:00Z")), "mar. 14 juil.");
  assert.equal(formatDateRange("2026-07-04", "2026-08-31"), "du 4 juil. au 31 août.");
  assert.equal(formatDateRange("2026-10-17", "2026-11-02"), "du 17 oct. au 2 nov.");
});
