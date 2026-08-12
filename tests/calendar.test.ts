import assert from 'node:assert/strict';
import test from 'node:test';
import { getFiscalMonth, publicHolidays, workingDaysInMonth } from '../src/domain/calendar';
import { getSchoolBreaks } from '../src/data/schoolBreaks';
import { availableFiscalYears } from '../src/domain/capacity';

test('the 2026-2027 fiscal year contains 254 working days', () => {
  const total = Array.from({ length: 12 }, (_, index) => {
    const { year, month } = getFiscalMonth(2026, index);
    return workingDaysInMonth(year, month);
  }).reduce((sum, value) => sum + value, 0);
  assert.equal(total, 254);
});

test('mobile public holidays are calculated for 2027', () => {
  const holidays = publicHolidays(2027);
  assert.equal(
    holidays
      .find(({ key }) => key === 'easterMonday')
      ?.date.toISOString()
      .slice(0, 10),
    '2027-03-29',
  );
  assert.equal(
    holidays
      .find(({ key }) => key === 'ascension')
      ?.date.toISOString()
      .slice(0, 10),
    '2027-05-06',
  );
});

test('fiscal years start with the current fiscal year', () => {
  assert.deepEqual(availableFiscalYears(new Date(2026, 7, 2)), [2026, 2027, 2028, 2029]);
});

test('school breaks return the five published dates for each zone', () => {
  const breaks = getSchoolBreaks(2026, 'A')!;
  assert.deepEqual(
    breaks.map(({ key }) => key),
    ['summer', 'allSaints', 'christmas', 'winter', 'spring'],
  );
  assert.deepEqual(breaks[3], {
    key: 'winter',
    start: '2027-02-13',
    end: '2027-03-01',
  });
  assert.equal(getSchoolBreaks(2028, 'A'), undefined);
});
