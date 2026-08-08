import { CalendarRange, ChevronLeft, ChevronRight, Clock3, Sun } from "lucide-react";
import { getFiscalMonth, publicHolidays } from "../domain/calendar";
import { getAbsenceTotal } from "../domain/capacity";
import { getSchoolBreaks } from "../data/schoolBreaks";
import { CapacitySummary } from "../components/CapacitySummary";
import { ABSENCE_SEGMENTS } from "../components/capacitySegments";
import { InputRow } from "../components/InputRow";
import { formatDateLabel, formatDateRange, formatMonthName } from "../i18n/formatters";
import { t } from "../i18n/fr";
import type { Entry, EntryNumericKey, MonthStats, Zone } from "../types";

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
  const holidays = publicHolidays(year).filter(
    ({ date }) => date.getUTCMonth() === month,
  );
  const absenceTotal = getAbsenceTotal(stats);
  const monthName = formatMonthName(monthIndex, "long");

  return (
    <div className="space-y-4 sm:space-y-5">
      <div className="monthly-month-nav grid grid-cols-[3rem_minmax(0,1fr)_3rem] items-center gap-3">
        <button
          className="grid size-12 place-items-center rounded-2xl border border-slate-200 bg-white text-slate-700 shadow-sm transition hover:border-slate-300 hover:bg-slate-50 focus:outline-none focus:ring-4 focus:ring-blue-100"
          type="button"
          onClick={() => onMonthChange((monthIndex + 11) % 12)}
          aria-label={t.navigation.previousMonth}
        >
          <ChevronLeft className="size-5" aria-hidden="true" />
        </button>
        <div className="min-w-0 text-center">
          <strong className="block truncate text-2xl font-black tracking-tight text-slate-950 sm:text-3xl">
            {monthName} {year}
          </strong>
        </div>
        <button
          className="grid size-12 place-items-center rounded-2xl border border-slate-200 bg-white text-slate-700 shadow-sm transition hover:border-slate-300 hover:bg-slate-50 focus:outline-none focus:ring-4 focus:ring-blue-100"
          type="button"
          onClick={() => onMonthChange((monthIndex + 1) % 12)}
          aria-label={t.navigation.nextMonth}
        >
          <ChevronRight className="size-5" aria-hidden="true" />
        </button>
      </div>

      <CapacitySummary
        title={t.summary.month}
        baseline={stats.baseline}
        absences={absenceTotal}
        available={stats.available}
        values={stats}
      >
        <div
          className="space-y-1.5 text-[11px] leading-snug sm:space-y-2 sm:text-sm"
          aria-label={t.summary.calendarDetails}
        >
          {holidays.length ? (
            <p className="flex min-w-0 items-start gap-1.5 text-slate-300">
              <Sun
                className="mt-0.5 size-3.5 shrink-0 text-amber-300"
                aria-hidden="true"
              />
              <span className="min-w-0 flex-1">
                <strong className="font-extrabold text-white/90">
                  {t.summary.publicHolidays}:{" "}
                </strong>
                <span className="font-medium">
                  {holidays
                    .map(
                      ({ key, date }) => `${t.holidays[key]} · ${formatDateLabel(date)}`,
                    )
                    .join(" · ")}
                </span>
              </span>
            </p>
          ) : null}

          {schoolBreaks?.length ? (
            <p className="flex min-w-0 items-start gap-1.5 text-slate-300">
              <CalendarRange
                className="mt-0.5 size-3.5 shrink-0 text-blue-300"
                aria-hidden="true"
              />
              <span className="min-w-0 flex-1 font-medium">
                {schoolBreaks
                  .map(
                    ({ key, start, end }) =>
                      `${t.schoolBreakNames[key]} ${formatDateRange(start, end)}`,
                  )
                  .join(" · ")}
              </span>
            </p>
          ) : null}

          {calendarBreaks && !holidays.length && !schoolBreaks?.length ? (
            <p className="font-medium text-slate-400">{t.summary.noCalendarEvents}</p>
          ) : null}
          {!calendarBreaks ? (
            <p className="font-medium text-slate-400">{t.summary.calendarUnpublished}</p>
          ) : null}
        </div>
      </CapacitySummary>

      <InputRow
        icon={Clock3}
        iconClass="bg-blue-50 text-blue-600"
        label={t.fields.workRate}
        value={entry.workRate}
        min={20}
        max={100}
        step={5}
        unit={t.units.percent}
        onChange={(value) => onChange("workRate", value)}
        onApplyToYear={() => onRequestApplyToYear("workRate")}
      />

      <section aria-label={t.inputs.absences}>
        <div className="space-y-2.5">
          {ABSENCE_SEGMENTS.map(({ key, icon: Icon, softClass }) => (
            <InputRow
              icon={Icon}
              iconClass={softClass}
              key={key}
              label={t.fields[key]}
              value={entry[key]}
              max={stats.contracted}
              unit={t.units.day}
              onChange={(value) => onChange(key, value)}
              onApplyToYear={() => onRequestApplyToYear(key)}
            />
          ))}
        </div>
      </section>
    </div>
  );
}
