import assert from 'node:assert/strict';
import test from 'node:test';
import { formatHolidayDateLabel, formatMonthName, formatNumber } from '../src/i18n/formatters';
import { t } from '../src/i18n/fr';

test('French labels and date formats remain stable', () => {
  assert.equal(t.segments.available, 'Capacité');
  assert.equal(t.schoolBreakNames.summer, 'Vacances d’été');
  assert.equal(t.schoolBreakNames.allSaints, 'Vacances de la Toussaint');
  assert.equal(t.schoolBreakNames.winter, 'Vacances d’hiver');
  assert.equal(t.holidays.ascension, 'Ascension');
  assert.equal(formatNumber(12.5), '12,5');
  assert.equal(formatMonthName(0, 'long'), 'juillet');
  assert.equal(formatHolidayDateLabel(new Date('2026-11-01T00:00:00Z')), 'dim. 1 novembre');
});
