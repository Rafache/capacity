import assert from "node:assert/strict";
import test from "node:test";
import {
  getFiscalMonth,
  publicHolidays,
  roundHalf,
  workingDaysInMonth,
} from "../src/domain/calendar";
import {
  getSchoolBreaks,
  getSchoolCalendar,
  validateSchoolCalendars,
} from "../src/data/schoolBreaks";
import { availableFiscalYears } from "../src/domain/capacityData";

test("the 2026-2027 fiscal year contains 254 working days", () => {
  const total = Array.from({ length: 12 }, (_, index) => {
    const { year, month } = getFiscalMonth(2026, index);
    return workingDaysInMonth(year, month);
  }).reduce((sum, value) => sum + value, 0);
  assert.equal(total, 254);
});

test("working-day totals remain stable across several fiscal years", () => {
  const totals = [2025, 2026, 2027, 2028, 2029].map((startYear) =>
    Array.from({ length: 12 }, (_, index) => {
      const { year, month } = getFiscalMonth(startYear, index);
      return workingDaysInMonth(year, month);
    }).reduce((sum, value) => sum + value, 0),
  );

  assert.deepEqual(totals, [251, 254, 254, 250, 251]);
});

test("fiscal years start with the current fiscal year", () => {
  assert.deepEqual(availableFiscalYears(new Date(2026, 7, 2)), [2026, 2027, 2028, 2029]);
});

test("mobile public holidays are calculated for 2027", () => {
  const holidays = publicHolidays(2027);
  assert.equal(
    holidays
      .find(({ key }) => key === "easterMonday")
      ?.date.toISOString()
      .slice(0, 10),
    "2027-03-29",
  );
  assert.equal(
    holidays
      .find(({ key }) => key === "ascension")
      ?.date.toISOString()
      .slice(0, 10),
    "2027-05-06",
  );
});

test("rounding uses half-day increments", () => {
  assert.equal(roundHalf(12.24), 12);
  assert.equal(roundHalf(12.26), 12.5);
});

test("published school calendars are compact and valid", () => {
  assert.deepEqual(validateSchoolCalendars(), []);
  assert.equal(Object.keys(getSchoolCalendar(2026)?.common ?? {}).length, 3);
  assert.equal(getSchoolBreaks(2026, "A")?.length, 5);
  assert.equal(getSchoolBreaks(2028, "A"), undefined);
});

test("invalid school-calendar dates are rejected", () => {
  const errors = validateSchoolCalendars({
    2026: {
      source: "source",
      verifiedAt: "2026-08-03",
      common: { summer: { start: "2026-08-40", end: "2026-08-31" } },
      zones: { A: {}, B: {}, C: {} },
    },
  });
  assert.ok(errors.length > 0);
});

test("malformed school-calendar documents return validation errors", () => {
  assert.doesNotThrow(() => validateSchoolCalendars({ 2026: null } as never));
  assert.ok(validateSchoolCalendars({ 2026: null } as never).length > 0);
  assert.deepEqual(validateSchoolCalendars(null as never), [
    "dataset: invalid calendar collection",
  ]);
});
