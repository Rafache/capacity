import { ABSENCE_SEGMENTS } from "./capacitySegments";
import { formatMonthName, formatNumber } from "../i18n/formatters";
import { t } from "../i18n/fr";
import type { MonthStats } from "../types";

type Props = {
  stats: MonthStats[];
};

/** Show the monthly balance without introducing a charting dependency. */
export function CapacityEvolutionChart({ stats }: Props) {
  const absenceTotals = stats.map((item) =>
    ABSENCE_SEGMENTS.reduce((sum, segment) => sum + item[segment.key], 0),
  );
  const availableTotal = stats.reduce((sum, item) => sum + item.available, 0);
  const absenceTotal = absenceTotals.reduce((sum, value) => sum + value, 0);
  const scale = Math.max(
    ...stats.map((item, index) => Math.max(item.available, absenceTotals[index] ?? 0)),
    1,
  );

  return (
    <section
      className="mt-3.5 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm sm:mt-5 sm:rounded-3xl sm:p-5"
      aria-label={t.summary.monthlyBalance}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-sm font-black tracking-tight text-slate-950 sm:text-base">
            {t.summary.monthlyBalance}
          </h3>
          <p className="mt-0.5 text-[10px] font-medium text-slate-500 sm:text-xs">
            {t.summary.monthlyBalanceDescription}
          </p>
        </div>
        <div className="flex shrink-0 flex-col gap-1 text-right">
          <span className="whitespace-nowrap rounded-full bg-emerald-50 px-2 py-1 text-[9px] font-extrabold text-emerald-700 sm:px-2.5 sm:text-[10px]">
            + {formatNumber(availableTotal)} {t.units.day}
          </span>
          <span className="whitespace-nowrap rounded-full bg-red-50 px-2 py-1 text-[9px] font-extrabold text-red-700 sm:px-2.5 sm:text-[10px]">
            − {formatNumber(absenceTotal)} {t.units.day}
          </span>
        </div>
      </div>

      <div
        className="mt-4 grid h-72 grid-cols-12 gap-1 sm:mt-5 sm:h-80 sm:gap-2.5"
        role="list"
        aria-label={t.summary.monthlyBalance}
      >
        {stats.map((item, index) => {
          const month = formatMonthName(index, "short");
          const absenceTotalForMonth = absenceTotals[index] ?? 0;
          const availableHeight = (item.available / scale) * 100;
          const absenceHeight = (absenceTotalForMonth / scale) * 100;

          return (
            <div
              className="flex min-w-0 flex-col items-center"
              key={month}
              role="listitem"
              aria-label={`${month} : ${formatNumber(item.available)} ${t.units.day} ${t.summary.capacity.toLowerCase()}, ${formatNumber(absenceTotalForMonth)} ${t.units.day} ${t.summary.absences.toLowerCase()}`}
            >
              <div className="flex min-h-0 w-full flex-1 flex-col">
                <div className="flex min-h-0 flex-1 items-end">
                  <span
                    className="flex w-full items-center justify-center overflow-hidden rounded-t-lg bg-capacity-available px-px text-center text-[7px] font-black leading-none text-white sm:rounded-t-xl sm:text-[9px]"
                    style={{ height: `${availableHeight}%` }}
                    title={`${t.summary.capacity} : ${formatNumber(item.available)} ${t.units.day}`}
                  >
                    {item.available >= 2 ? formatNumber(item.available) : null}
                  </span>
                </div>

                <span className="h-px w-full shrink-0 bg-slate-300" aria-hidden="true" />

                <div className="flex min-h-0 flex-1 items-start">
                  <div
                    className="flex w-full flex-col overflow-hidden rounded-b-lg sm:rounded-b-xl"
                    style={{ height: `${absenceHeight}%` }}
                  >
                    {ABSENCE_SEGMENTS.map((segment) => {
                      const value = item[segment.key];
                      const segmentHeight =
                        absenceTotalForMonth > 0
                          ? (value / absenceTotalForMonth) * 100
                          : 0;
                      const canShowValue = value >= 2 && segmentHeight >= 18;

                      return (
                        <span
                          className={`flex min-h-0 w-full items-center justify-center overflow-hidden px-px text-center text-[7px] font-black leading-none text-white sm:text-[9px] ${segment.barClass}`}
                          key={segment.key}
                          style={{ height: `${segmentHeight}%` }}
                          title={`${t.segments[segment.key]} : ${formatNumber(value)} ${t.units.day}`}
                        >
                          {canShowValue ? formatNumber(value) : null}
                        </span>
                      );
                    })}
                  </div>
                </div>
              </div>

              <span className="mt-1.5 flex h-14 w-full shrink-0 items-start justify-center sm:mt-2 sm:h-16">
                <span className="text-center text-[8px] font-bold leading-tight text-slate-500 sm:text-[10px]">
                  {month}
                </span>
              </span>
            </div>
          );
        })}
      </div>

      <div className="mt-3 flex flex-wrap gap-x-3 gap-y-1.5 border-t border-slate-100 pt-3">
        <span className="flex items-center gap-1.5 text-[9px] font-semibold text-slate-500 sm:text-[10px]">
          <span className="size-1.5 shrink-0 rounded-full bg-capacity-available" />
          {t.segments.available}
        </span>
        {ABSENCE_SEGMENTS.map((segment) => (
          <span
            className="flex items-center gap-1.5 text-[9px] font-semibold text-slate-500 sm:text-[10px]"
            key={segment.key}
          >
            <span className={`size-1.5 shrink-0 rounded-full ${segment.barClass}`} />
            {t.segments[segment.key]}
          </span>
        ))}
      </div>
    </section>
  );
}
