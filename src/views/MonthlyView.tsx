import {
  CalendarRange,
  ChevronLeft,
  ChevronRight,
  Clock3,
  Sun,
  type LucideIcon,
} from 'lucide-react';
import { getFiscalMonth, publicHolidays } from '../domain/calendar';
import { ENTRY_RULES, getAbsenceTotal, getEntryLimits } from '../domain/capacity';
import { getSchoolBreaks } from '../data/schoolBreaks';
import { CapacitySummary } from '../components/CapacitySummary';
import { ABSENCE_SEGMENTS } from '../components/capacitySegments';
import { InputRow } from '../components/InputRow';
import {
  formatHolidayDateLabel,
  formatMonthName,
  formatSchoolBreakDateRange,
} from '../i18n/formatters';
import { t } from '../i18n/fr';
import type { Entry, EntryNumericKey, MonthStats, Zone } from '../types';

type Props = {
  startYear: number;
  monthIndex: number;
  entry: Entry;
  stats: MonthStats;
  zone: Zone;
  onMonthChange: (index: number) => void;
  onRequestApplyToYear: (field: EntryNumericKey) => void;
  onChange: (field: EntryNumericKey, value: number) => void;
};

type CalendarItem = {
  key: string;
  dateTime?: string;
  label: string;
  detail?: string;
};

type CalendarSection = {
  key: string;
  title: string;
  icon: LucideIcon;
  iconClass: string;
  items: CalendarItem[];
};

function CalendarDetails({
  sections,
  emptyMessage,
}: {
  sections: CalendarSection[];
  emptyMessage: string;
}) {
  return (
    <section
      className="rounded-xl border border-slate-200/80 bg-white p-3 shadow-sm sm:rounded-2xl sm:p-4"
      aria-label={t.summary.calendarDetails}
    >
      <div className="flex items-center gap-2">
        <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-slate-100 text-slate-700 sm:size-9">
          <CalendarRange className="size-4" aria-hidden="true" />
        </span>
        <h2 className="text-sm font-black text-slate-950 sm:text-base">
          {t.summary.calendarDetails}
        </h2>
      </div>
      {sections.length ? (
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          {sections.map(({ key, title, icon: Icon, iconClass, items }) => (
            <div className="min-w-0" key={key}>
              <h3 className="flex items-center gap-1.5 text-xs font-black text-slate-950 sm:text-sm">
                <Icon className={'size-3.5 ' + iconClass} aria-hidden="true" />
                {title}
              </h3>
              <ul className="mt-1.5 grid gap-1.5 text-[11px] leading-snug text-slate-600 sm:text-sm">
                {items.map(({ key: itemKey, dateTime, label, detail }) => (
                  <li className="flex min-w-0 items-start gap-2" key={itemKey}>
                    <span
                      className="mt-1.5 size-1.5 shrink-0 rounded-full bg-slate-300"
                      aria-hidden="true"
                    />
                    <span className="min-w-0">
                      {dateTime ? <time dateTime={dateTime}>{label}</time> : label}
                      {detail ? (
                        <span className="font-semibold text-slate-900"> ({detail})</span>
                      ) : null}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      ) : (
        <p className="mt-3 text-[11px] font-medium text-slate-500 sm:text-sm">{emptyMessage}</p>
      )}
    </section>
  );
}

export function MonthlyView({
  startYear,
  monthIndex,
  entry,
  stats,
  zone,
  onMonthChange,
  onRequestApplyToYear,
  onChange,
}: Props) {
  const { month, year } = getFiscalMonth(startYear, monthIndex);
  const monthStart = Date.UTC(year, month, 1);
  const monthEnd = Date.UTC(year, month + 1, 0);
  const calendarBreaks = getSchoolBreaks(startYear, zone);
  const schoolBreaks = calendarBreaks?.filter(
    (item) =>
      Date.parse(`${item.start}T00:00:00Z`) <= monthEnd &&
      Date.parse(`${item.end}T00:00:00Z`) >= monthStart,
  );
  const isFrench = document.documentElement.lang.toLowerCase().startsWith('fr');
  const holidays = publicHolidays(year).filter(({ date }) => date.getUTCMonth() === month);

  const calendarSections: Array<CalendarSection | null> = [
    holidays.length
      ? {
          key: 'holidays',
          title: t.summary.publicHolidays,
          icon: Sun,
          iconClass: 'text-amber-600',
          items: holidays.map(({ key, date }) => ({
            key,
            dateTime: date.toISOString().slice(0, 10),
            label: formatHolidayDateLabel(date),
            detail: t.holidays[key],
          })),
        }
      : null,
    schoolBreaks?.length
      ? {
          key: 'school-breaks',
          title: `${t.summary.schoolBreaks} (zone ${zone})`,
          icon: CalendarRange,
          iconClass: 'text-blue-600',
          items: schoolBreaks.map(({ key, start, end }) => ({
            key,
            label: t.schoolBreakNames[key] + ' du ' + formatSchoolBreakDateRange(start, end),
          })),
        }
      : null,
  ];

  const visibleCalendarSections = calendarSections.filter(
    (section): section is CalendarSection => section !== null,
  );

  const absenceTotal = getAbsenceTotal(stats);
  const limits = getEntryLimits(startYear, monthIndex, entry);
  const monthLabel = `${formatMonthName(monthIndex, 'long')} ${year}`;

  return (
    <div className="space-y-3 sm:space-y-4">
      <div className="monthly-month-nav grid grid-cols-[2.25rem_minmax(0,1fr)_2.25rem] items-center gap-2">
        <button
          className="grid size-9 place-items-center rounded-lg border border-slate-200 bg-white text-slate-700 shadow-sm transition hover:border-slate-300 hover:bg-slate-50 focus:outline-none focus:ring-4 focus:ring-blue-100"
          type="button"
          onClick={() => onMonthChange((monthIndex + 11) % 12)}
          aria-label={t.navigation.previousMonth}
        >
          <ChevronLeft className="size-4" aria-hidden="true" />
        </button>
        <label className="relative grid min-w-0 place-items-center text-center">
          <span className="sr-only">{t.navigation.chooseMonth}</span>
          <strong className="whitespace-nowrap text-lg font-black tracking-tight text-slate-950 sm:text-xl">
            {monthLabel}
          </strong>
          <select
            className="absolute inset-0 size-full cursor-pointer opacity-0"
            value={monthIndex}
            aria-label={t.navigation.chooseMonth}
            onChange={(event) => onMonthChange(Number(event.target.value))}
          >
            {Array.from({ length: 12 }, (_, index) => {
              const fiscalMonth = getFiscalMonth(startYear, index);
              return (
                <option key={index} value={index}>
                  {formatMonthName(index, 'long')} {fiscalMonth.year}
                </option>
              );
            })}
          </select>
        </label>
        <button
          className="grid size-9 place-items-center rounded-lg border border-slate-200 bg-white text-slate-700 shadow-sm transition hover:border-slate-300 hover:bg-slate-50 focus:outline-none focus:ring-4 focus:ring-blue-100"
          type="button"
          onClick={() => onMonthChange((monthIndex + 1) % 12)}
          aria-label={t.navigation.nextMonth}
        >
          <ChevronRight className="size-4" aria-hidden="true" />
        </button>
      </div>

      <CapacitySummary
        title={t.summary.month}
        baseline={stats.baseline}
        absences={absenceTotal}
        available={stats.available}
        values={stats}
      />

      <section aria-label={t.inputs.absences}>
        <div className="divide-y divide-slate-100 overflow-hidden rounded-xl border border-slate-200/80 bg-white shadow-sm sm:rounded-2xl">
          <InputRow
            grouped
            icon={Clock3}
            iconClass="bg-blue-50 text-blue-600"
            label={t.fields.workRate}
            value={entry.workRate}
            min={limits.minWorkRate}
            max={ENTRY_RULES.workRate.max}
            step={ENTRY_RULES.workRate.step}
            unit={t.units.percent}
            onChange={(value) => onChange('workRate', value)}
            onApplyToYear={() => onRequestApplyToYear('workRate')}
          />
          {ABSENCE_SEGMENTS.map(({ key, icon: Icon, softClass }) => (
            <InputRow
              grouped
              icon={Icon}
              iconClass={softClass}
              key={key}
              label={t.fields[key]}
              value={entry[key]}
              min={ENTRY_RULES.absence.min}
              max={limits.absenceMax[key]}
              step={ENTRY_RULES.absence.step}
              unit={t.units.day}
              onChange={(value) => onChange(key, value)}
              onApplyToYear={() => onRequestApplyToYear(key)}
            />
          ))}
        </div>
      </section>

      {isFrench ? (
        <CalendarDetails
          sections={visibleCalendarSections}
          emptyMessage={calendarBreaks ? t.summary.noCalendarEvents : t.summary.calendarUnpublished}
        />
      ) : null}
    </div>
  );
}
