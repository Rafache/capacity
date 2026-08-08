import { CalendarRange, ChevronLeft, ChevronRight, Clock3, Sun } from "lucide-react";
import { getFiscalMonth, publicHolidays } from "../domain/calendar";
import { getAbsenceTotal, getEntryLimits } from "../domain/capacity";
import { getSchoolBreaks } from "../data/schoolBreaks";
import { CapacitySummary } from "../components/CapacitySummary";
import { ABSENCE_SEGMENTS } from "../components/capacitySegments";
import { InputRow } from "../components/InputRow";
import {
  formatDateRange,
  formatHolidayDateLabel,
  formatMonthName,
} from "../i18n/formatters";
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
  const limits = getEntryLimits(startYear, monthIndex, entry);
  const monthLabel = `${formatMonthName(monthIndex, "long")} ${year}`;

  return (
    <div className="space-y-3 sm:space-y-4">
      <div className="monthly-month-nav grid grid-cols-[2.5rem_minmax(0,1fr)_2.5rem] items-center gap-1.5 sm:gap-2">
        <button
          className="grid size-10 place-items-center rounded-xl border border-slate-200 bg-white text-slate-700 shadow-sm transition hover:border-slate-300 hover:bg-slate-50 focus:outline-none focus:ring-4 focus:ring-blue-100"
          type="button"
          onClick={() => onMonthChange((monthIndex + 11) % 12)}
          aria-label={t.navigation.previousMonth}
        >
          <ChevronLeft className="size-4.5" aria-hidden="true" />
        </button>
        <label className="relative grid min-w-0 place-items-center text-center">
          <span className="sr-only">{t.navigation.chooseMonth}</span>
          <strong className="block w-full truncate text-center text-xl font-black tracking-tight text-slate-950 sm:text-2xl">
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
                  {formatMonthName(index, "long")} {fiscalMonth.year}
                </option>
              );
            })}
          </select>
        </label>
        <button
          className="grid size-10 place-items-center rounded-xl border border-slate-200 bg-white text-slate-700 shadow-sm transition hover:border-slate-300 hover:bg-slate-50 focus:outline-none focus:ring-4 focus:ring-blue-100"
          type="button"
          onClick={() => onMonthChange((monthIndex + 1) % 12)}
          aria-label={t.navigation.nextMonth}
        >
          <ChevronRight className="size-4.5" aria-hidden="true" />
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
                      ({ key, date }) =>
                        `${formatHolidayDateLabel(date)} (${t.holidays[key]})`,
                    )
                    .join(", ")}
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
                <strong className="font-extrabold text-white/90">
                  Vacances Zone {zone} ·{" "}
                </strong>
                {schoolBreaks
                  .map(({ key, start, end }) => {
                    const name = t.schoolBreakNames[key].replace(/^Vacances (de la |d’|d')?/u, "");
                    const range = formatDateRange(start, end)
                      .replace(/^du /, "")
                      .replace(/\.$/, "")
                      .replace(/\boct\./, "octobre")
                      .replace(/\bnov\./, "novembre")
                      .replace(/\bdéc\./, "décembre")
                      .replace(/\bjanv\./, "janvier")
                      .replace(/\bfévr\./, "février")
                      .replace(/\bavr\./, "avril")
                      .replace(/\bjuil\./, "juillet")
                      .replace(/\bsept\./, "septembre");
                    return `Vacances : ${range} (${name} - Zone ${zone})`;
                  })
                  .join(", ")}
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

      <section aria-label={t.inputs.absences}>
        <div className="divide-y divide-slate-100 overflow-hidden rounded-xl border border-slate-200/80 bg-white shadow-sm sm:rounded-2xl">
          <InputRow
            grouped
            icon={Clock3}
            iconClass="bg-blue-50 text-blue-600"
            label={t.fields.workRate}
            value={entry.workRate}
            min={limits.minWorkRate}
            max={100}
            step={5}
            unit={t.units.percent}
            onChange={(value) => onChange("workRate", value)}
            onApplyToYear={() => onRequestApplyToYear("workRate")}
          />
          {ABSENCE_SEGMENTS.map(({ key, icon: Icon, softClass }) => (
            <InputRow
              grouped
              icon={Icon}
              iconClass={softClass}
              key={key}
              label={t.fields[key]}
              value={entry[key]}
              max={limits.absenceMax[key]}
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
