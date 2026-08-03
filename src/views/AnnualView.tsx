import { CalendarDays, CalendarX2, Gauge } from "lucide-react";
import { CapacityEvolutionChart } from "../components/CapacityEvolutionChart";
import { CapacitySummary } from "../components/CapacitySummary";
import { CAPACITY_SEGMENTS } from "../components/capacitySegments";
import { getAbsenceTotal } from "../domain/capacityData";
import { formatMonthName, formatNumber } from "../i18n/formatters";
import { t } from "../i18n/translate";
import type { AnnualSummary, MonthStats, SegmentKey } from "../types";

type Props = {
  startYear: number;
  stats: MonthStats[];
  summary: AnnualSummary;
  onMonthOpen: (index: number) => void;
};

export function AnnualView({ startYear, stats, summary, onMonthOpen }: Props) {
  const annualStats = {
    available: summary.available,
    leave: summary.leave,
    rtt: summary.rtt,
    training: summary.training,
    other: summary.other,
  } satisfies Record<SegmentKey, number>;

  return (
    <div className="space-y-3 sm:space-y-5">
      <CapacitySummary
        title={t.summary.year}
        barValues={annualStats}
        items={[
          {
            icon: CalendarDays,
            label: t.summary.workingDays,
            value: summary.baseline,
            unit: t.units.day,
            tone: "neutral",
          },
          {
            icon: CalendarX2,
            label: t.summary.absences,
            value: formatNumber(getAbsenceTotal(summary)),
            unit: t.units.day,
            tone: "negative",
          },
          {
            icon: Gauge,
            label: t.summary.capacity,
            value: formatNumber(summary.available),
            unit: t.units.day,
            tone: "positive",
          },
        ]}
      />

      <section>
        <div className="mb-2 sm:mb-3">
          <h2 className="text-base font-black tracking-tight text-slate-950 sm:text-xl">
            {t.months.days}
          </h2>
        </div>

        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm sm:rounded-2xl">
          <table className="w-full table-fixed" aria-label={t.months.ariaLabel}>
            <caption className="sr-only">{t.months.title}</caption>
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-center">
                <th
                  className="sticky left-0 z-10 w-16 bg-slate-50 px-2 py-2 text-left text-[9px] font-black uppercase tracking-wide text-slate-400 sm:w-28 sm:px-3 sm:text-[10px]"
                  scope="col"
                >
                  {t.months.month}
                </th>
                {CAPACITY_SEGMENTS.map(({ key, icon: Icon, textClass }) => (
                  <th
                    className={`px-1 py-2 ${textClass}`}
                    key={key}
                    scope="col"
                    aria-label={t.segments[key]}
                    title={t.segments[key]}
                  >
                    <Icon className="mx-auto size-3.5" aria-hidden="true" />
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {stats.map((item, index) => {
                const month = formatMonthName(startYear, index, "short");

                return (
                  <tr className="border-b border-slate-100" key={month}>
                    <th
                      className="sticky left-0 z-10 bg-white px-2 py-2 text-left sm:px-3 sm:py-2.5"
                      scope="row"
                    >
                      <button
                        className="w-full truncate whitespace-nowrap text-left text-[11px] font-black leading-none text-slate-950 transition hover:text-blue-700 focus-visible:rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-300 sm:text-xs"
                        type="button"
                        onClick={() => onMonthOpen(index)}
                        aria-label={`${t.months.open} ${month}`}
                      >
                        {month}
                      </button>
                    </th>
                    {CAPACITY_SEGMENTS.map((segment) => (
                      <td
                        className={`min-w-0 whitespace-nowrap px-1 text-center text-[10px] font-extrabold leading-none sm:text-xs ${segment.textClass}`}
                        key={segment.key}
                      >
                        {formatNumber(item[segment.key])}
                        <small className="ml-px text-[8px] text-slate-400">
                          {t.units.day}
                        </small>
                      </td>
                    ))}
                  </tr>
                );
              })}
              <tr className="bg-slate-950 text-white">
                <th
                  className="sticky left-0 z-10 bg-slate-950 px-2 py-2.5 text-left sm:px-3 sm:py-3"
                  scope="row"
                >
                  {t.months.total}
                </th>
                {CAPACITY_SEGMENTS.map((segment) => (
                  <td
                    className="whitespace-nowrap px-1 text-center text-[10px] font-black leading-none sm:text-xs"
                    key={segment.key}
                  >
                    {formatNumber(annualStats[segment.key])}
                    <small className="ml-px text-[8px] text-slate-400">
                      {t.units.day}
                    </small>
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
        <CapacityEvolutionChart startYear={startYear} stats={stats} />
      </section>
    </div>
  );
}
