import { CalendarDays, CalendarX2, Gauge } from "lucide-react";
import { CapacitySummary } from "../components/CapacitySummary";
import { CAPACITY_SEGMENTS } from "../components/capacitySegments";
import { CapacityEvolutionChart } from "../components/CapacityEvolutionChart";
import { MONTHS_LONG } from "../data/months";
import type { MonthStats, SegmentKey } from "../types";

const formatNumber = (value: number) =>
  Number.isInteger(value) ? String(value) : value.toFixed(1).replace(".", ",");

const TABLE_GRID =
  "grid w-full grid-cols-[4.25rem_repeat(5,minmax(0,1fr))] items-center sm:grid-cols-[5rem_repeat(5,minmax(0,1fr))]";

type Props = {
  stats: MonthStats[];
  annualBaseline: number;
  annualUnavailable: number;
  annualAvailable: number;
  annualStats: Record<SegmentKey, number>;
  onMonthOpen: (index: number) => void;
};

export function AnnualView({
  stats,
  annualBaseline,
  annualUnavailable,
  annualAvailable,
  annualStats,
  onMonthOpen,
}: Props) {
  return (
    <div className="space-y-3 sm:space-y-5">
      <CapacitySummary
        title="Synthèse de l’année"
        eyebrow={null}
        barValues={annualStats}
        barLabel="Répartition de l’année"
        items={[
          {
            icon: CalendarDays,
            label: "Ouvrés",
            value: annualBaseline,
            unit: "j",
            tone: "neutral",
          },
          {
            icon: CalendarX2,
            label: "Absences",
            value: formatNumber(annualUnavailable),
            unit: "j",
            tone: "negative",
          },
          {
            icon: Gauge,
            label: "Capacité",
            value: formatNumber(annualAvailable),
            unit: "j",
            tone: "positive",
          },
        ]}
      />

      <section>
        <div className="mb-1.5 sm:mb-2.5">
          <h2 className="text-base font-black tracking-tight text-slate-950 sm:text-xl">
            Capacité par mois
          </h2>
        </div>

        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm sm:rounded-2xl">
          <div role="table" aria-label="Capacité mensuelle en jours">
            <div
              className={`${TABLE_GRID} border-b border-slate-200 bg-slate-50 text-center`}
              role="row"
            >
              <span
                className="sticky left-0 z-10 bg-slate-50 px-1 py-px text-center text-[9px] font-black uppercase tracking-wide text-slate-400 sm:px-2 sm:text-[10px]"
                role="columnheader"
              >
                Mois
              </span>
              {CAPACITY_SEGMENTS.map(({ key, label, icon: Icon, textClass }) => {
                const HeaderIcon = key === "available" ? Gauge : Icon;

                return (
                  <span
                    className={`grid place-items-center whitespace-nowrap py-px ${textClass}`}
                    key={key}
                    role="columnheader"
                    aria-label={label}
                    title={label}
                  >
                    <HeaderIcon className="size-3.5" aria-hidden="true" />
                  </span>
                );
              })}
            </div>

            {stats.map((item, index) => (
              <button
                className={`${TABLE_GRID} group min-h-9 border-b border-slate-100 bg-white text-left transition hover:bg-blue-50/60 focus-visible:bg-blue-50 focus-visible:outline-none`}
                type="button"
                role="row"
                key={MONTHS_LONG[index]}
                onClick={() => onMonthOpen(index)}
                aria-label={`Ouvrir ${MONTHS_LONG[index]}`}
              >
                <span className="sticky left-0 z-10 row-start-1 flex min-h-9 min-w-0 items-center justify-center bg-white px-1 transition group-hover:bg-blue-50 group-focus-visible:bg-blue-50 sm:px-2">
                  <strong className="whitespace-nowrap text-[10px] font-black leading-none text-slate-950 sm:text-xs">
                    {MONTHS_LONG[index]}
                  </strong>
                </span>
                {CAPACITY_SEGMENTS.map((segment) => (
                  <span
                    className={`row-start-1 min-w-0 whitespace-nowrap text-center text-xs font-extrabold leading-none sm:text-sm ${segment.textClass}`}
                    role="cell"
                    key={segment.key}
                  >
                    {formatNumber(item[segment.key])}
                    <small className="ml-px text-[9px] text-slate-400 sm:text-[10px]">
                      j
                    </small>
                  </span>
                ))}
              </button>
            ))}

            <div className={`${TABLE_GRID} bg-slate-950 text-white`} role="row">
              <span className="sticky left-0 z-10 row-start-1 flex items-center bg-slate-950 px-1.5 py-1 sm:px-3 sm:py-1.5">
                <strong className="text-[10px] font-black leading-none sm:text-sm">
                  Total
                </strong>
              </span>
              {CAPACITY_SEGMENTS.map((segment) => (
                <span
                  className="row-start-1 min-w-0 whitespace-nowrap text-center text-xs font-black leading-none sm:text-sm"
                  role="cell"
                  key={segment.key}
                >
                  {formatNumber(annualStats[segment.key])}
                  <small className="ml-px text-[9px] text-slate-400 sm:text-[10px]">
                    j
                  </small>
                </span>
              ))}
            </div>
          </div>
        </div>

        <CapacityEvolutionChart stats={stats} />
      </section>
    </div>
  );
}
