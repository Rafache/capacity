import { MONTHS_LONG } from "../data/months";
import {
  ABSENCE_SEGMENTS,
  CAPACITY_SEGMENTS,
  type CapacitySegment,
} from "./capacitySegments";
import type { MonthStats } from "../types";

type Props = {
  stats: MonthStats[];
  variant?: "capacity" | "absence";
};

const formatNumber = (value: number) =>
  Number.isInteger(value) ? String(value) : value.toFixed(1).replace(".", ",");

export function CapacityEvolutionChart({ stats, variant = "capacity" }: Props) {
  const isAbsenceChart = variant === "absence";
  const segments: CapacitySegment[] = isAbsenceChart
    ? ABSENCE_SEGMENTS
    : CAPACITY_SEGMENTS.filter((segment) => segment.key === "available");
  const getTotal = (item: MonthStats) =>
    segments.reduce((sum, segment) => sum + item[segment.key], 0);
  const totals = stats.map(getTotal);
  const scale = Math.max(...totals, 1);
  const total = totals.reduce((sum, value) => sum + value, 0);
  const title = isAbsenceChart ? "Évolution des absences" : "Évolution de la capacité";
  const subtitle = isAbsenceChart
    ? "Jours d’absence par mois"
    : "Jours disponibles par mois";
  const chartLabel = isAbsenceChart
    ? "Absences par mois"
    : "Capacité disponible par mois";

  return (
    <section
      className="mt-4 rounded-2xl border border-slate-200 bg-white p-3.5 shadow-sm sm:mt-5 sm:rounded-3xl sm:p-5"
      aria-label={title}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-sm font-black tracking-tight text-slate-950 sm:text-base">
            {title}
          </h3>
          <p className="mt-0.5 text-[10px] font-medium text-slate-500 sm:text-xs">
            {subtitle}
          </p>
        </div>
        <span
          className={`whitespace-nowrap rounded-full px-2 py-1 text-[9px] font-extrabold sm:px-2.5 sm:text-[10px] ${
            isAbsenceChart ? "bg-red-50 text-red-700" : "bg-emerald-50 text-emerald-700"
          }`}
        >
          Total {formatNumber(total)} j
        </span>
      </div>

      <div
        className="mt-5 grid h-56 grid-cols-12 gap-1 sm:h-64 sm:gap-2.5"
        role="list"
        aria-label={chartLabel}
      >
        {stats.map((item, index) => {
          const itemTotal = totals[index];
          const height = itemTotal > 0 ? Math.max((itemTotal / scale) * 100, 6) : 0;

          return (
            <div
              className="flex min-w-0 flex-col items-center"
              key={MONTHS_LONG[index]}
              role="listitem"
              aria-label={`${MONTHS_LONG[index]} : ${formatNumber(itemTotal)} ${isAbsenceChart ? "jours d’absence" : "jours disponibles"}`}
            >
              <span
                className={`min-h-4 whitespace-nowrap text-[9px] font-black sm:text-[10px] ${
                  isAbsenceChart ? "text-red-700" : "text-emerald-700"
                }`}
              >
                {formatNumber(itemTotal)}
              </span>
              <div className="relative mt-1 min-h-0 w-full flex-1 overflow-hidden rounded-t-lg bg-emerald-50 sm:rounded-t-xl">
                <div
                  className="absolute inset-x-0 bottom-0 flex flex-col-reverse overflow-hidden rounded-t-lg transition-[height] sm:rounded-t-xl"
                  style={{ height: `${height}%` }}
                >
                  {segments.map((segment) => {
                    const value = item[segment.key];
                    const segmentHeight = itemTotal > 0 ? (value / itemTotal) * 100 : 0;

                    return (
                      <span
                        className={`min-h-0 w-full ${segment.barClass}`}
                        key={segment.key}
                        style={{ height: `${segmentHeight}%` }}
                        title={`${segment.label} : ${formatNumber(value)} j`}
                      />
                    );
                  })}
                </div>
              </div>
              <span className="mt-2 flex h-24 w-full shrink-0 items-end justify-center sm:h-28">
                <span className="chart-month-label text-center text-[8px] font-bold leading-tight text-slate-500 sm:text-[10px]">
                  {MONTHS_LONG[index]}
                </span>
              </span>
            </div>
          );
        })}
      </div>

      {isAbsenceChart ? (
        <div className="mt-3 flex flex-wrap gap-x-3 gap-y-1.5 border-t border-slate-100 pt-3">
          {segments.map((segment) => (
            <span
              className="flex items-center gap-1.5 text-[9px] font-semibold text-slate-500 sm:text-[10px]"
              key={segment.key}
            >
              <span className={`size-1.5 shrink-0 rounded-full ${segment.barClass}`} />
              {segment.label}
            </span>
          ))}
        </div>
      ) : null}
    </section>
  );
}
