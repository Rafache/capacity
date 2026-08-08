import { Clock3 } from "lucide-react";
import { AnnualDistributionChart } from "../components/AnnualDistributionChart";
import { CapacityEvolutionChart } from "../components/CapacityEvolutionChart";
import { CapacitySummary } from "../components/CapacitySummary";
import { CAPACITY_SEGMENTS } from "../components/capacitySegments";
import { getAbsenceTotal } from "../domain/capacity";
import { formatMonthName, formatNumber } from "../i18n/formatters";
import { t } from "../i18n/fr";
import type { CapacityTotals, Entry, MonthStats } from "../types";

type Props = {
  entries: Entry[];
  stats: MonthStats[];
  summary: CapacityTotals;
  currentMonthIndex: number | null;
  onMonthOpen: (index: number) => void;
};

export function AnnualView({
  entries,
  stats,
  summary,
  currentMonthIndex,
  onMonthOpen,
}: Props) {
  return (
    <div className="space-y-3 sm:space-y-5">
      <CapacitySummary
        title={t.summary.year}
        baseline={summary.baseline}
        absences={getAbsenceTotal(summary)}
        available={summary.available}
        values={summary}
        showDistribution={false}
      />

      <section>
        <div className="mb-2 sm:mb-3">
          <h2 className="text-base font-black tracking-tight text-slate-950 sm:text-xl">
            {t.months.days}
            <span className="ml-1.5 text-xs font-bold text-slate-400 sm:text-sm">
              · {t.months.inDays}
            </span>
          </h2>
        </div>

        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm sm:rounded-2xl">
          <table className="w-full table-fixed" aria-label={t.months.title}>
            <caption className="sr-only">{t.months.title}</caption>
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-center">
                <th
                  className="sticky left-0 z-10 w-14 bg-slate-50 px-1.5 py-2 text-left text-[8px] font-black uppercase tracking-wide text-slate-400 sm:w-24 sm:px-3 sm:text-[10px]"
                  scope="col"
                >
                  {t.months.month}
                </th>
                <th
                  className="px-0.5 py-2 text-blue-600"
                  scope="col"
                  aria-label={t.table.workRate}
                  title={t.table.workRate}
                >
                  <Clock3 className="mx-auto size-3.5" aria-hidden="true" />
                  <span className="mt-0.5 block text-[6px] font-black leading-tight sm:text-[8px]">
                    {t.table.workRate}
                  </span>
                </th>
                {CAPACITY_SEGMENTS.map(({ key, icon: Icon, textClass }) => (
                  <th
                    className={`px-0.5 py-2 ${textClass}`}
                    key={key}
                    scope="col"
                    aria-label={t.table[key]}
                    title={t.table[key]}
                  >
                    <Icon className="mx-auto size-3.5" aria-hidden="true" />
                    <span className="mt-0.5 block text-[6px] font-black leading-tight sm:text-[8px]">
                      {t.table[key]}
                    </span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {stats.map((item, index) => {
                const month = formatMonthName(index, "short");
                const isCurrent = currentMonthIndex === index;
                const workRate = entries[index]?.workRate ?? 100;
                const rowBackground = isCurrent ? "bg-blue-50/60" : "bg-white";

                return (
                  <tr
                    className={`cursor-pointer border-b border-slate-100 transition hover:bg-slate-50 ${rowBackground}`}
                    key={month}
                    role="button"
                    tabIndex={0}
                    aria-label={`${t.months.open} ${month}`}
                    onClick={() => onMonthOpen(index)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter" || event.key === " ") {
                        event.preventDefault();
                        onMonthOpen(index);
                      }
                    }}
                  >
                    <th
                      className={`sticky left-0 z-10 px-1.5 py-2 text-left sm:px-3 sm:py-2.5 ${rowBackground}`}
                      scope="row"
                    >
                      <span className="block truncate whitespace-nowrap text-[10px] font-black leading-none text-slate-950 sm:text-xs">
                        {month}
                      </span>
                    </th>
                    <td className="whitespace-nowrap px-0.5 text-center text-[9px] font-extrabold leading-none text-blue-700 sm:text-xs">
                      {formatNumber(workRate)}%
                    </td>
                    {CAPACITY_SEGMENTS.map((segment) => {
                      const value = item[segment.key];
                      const display =
                        segment.key !== "available" && value === 0
                          ? "—"
                          : formatNumber(value);
                      return (
                        <td
                          className={`min-w-0 whitespace-nowrap px-0.5 text-center text-[9px] font-extrabold leading-none sm:text-xs ${segment.textClass}`}
                          key={segment.key}
                        >
                          {display}
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
              <tr className="bg-slate-950 text-white">
                <th
                  className="sticky left-0 z-10 bg-slate-950 px-1.5 py-2.5 text-left sm:px-3 sm:py-3"
                  scope="row"
                >
                  {t.months.total}
                </th>
                <td className="whitespace-nowrap px-0.5 text-center text-[9px] font-black leading-none text-slate-400 sm:text-xs">
                  —
                </td>
                {CAPACITY_SEGMENTS.map((segment) => (
                  <td
                    className="whitespace-nowrap px-0.5 text-center text-[9px] font-black leading-none sm:text-xs"
                    key={segment.key}
                  >
                    {formatNumber(summary[segment.key])}
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>

        <CapacityEvolutionChart stats={stats} />
        <AnnualDistributionChart summary={summary} />

        <div className="mt-3 flex flex-wrap justify-center gap-x-4 gap-y-2 rounded-2xl border border-slate-200 bg-white px-3 py-3 shadow-sm sm:mt-5 sm:gap-x-6">
          {CAPACITY_SEGMENTS.map(({ key, barClass }) => (
            <span
              className="flex items-center gap-1.5 text-[10px] font-semibold text-slate-600 sm:text-xs"
              key={key}
            >
              <span className={`size-2 shrink-0 rounded-full ${barClass}`} />
              {t.segments[key]}
            </span>
          ))}
        </div>
      </section>
    </div>
  );
}
