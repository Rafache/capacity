import { CalendarDays, CalendarX2, Gauge } from "lucide-react";
import { CapacityBar } from "../components/CapacityBar";
import { CapacitySummary } from "../components/CapacitySummary";
import { CAPACITY_SEGMENTS } from "../components/capacitySegments";
import { MONTHS_SHORT } from "../data/months";
import type { MonthStats, SegmentKey } from "../types";

const formatNumber = (value: number) =>
  Number.isInteger(value) ? String(value) : value.toFixed(1).replace(".", ",");

const TABLE_GRID =
  "grid w-full grid-cols-[4rem_repeat(5,minmax(0,1fr))] items-center sm:grid-cols-[7rem_repeat(5,minmax(0,1fr))]";

const segmentTotal = (values: Record<SegmentKey, number>) =>
  CAPACITY_SEGMENTS.reduce((sum, segment) => sum + values[segment.key], 0);

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
            label: "Jours ouvrés",
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
        <div className="mb-2 sm:mb-3">
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
                className="sticky left-0 z-10 bg-slate-50 px-2 py-2 text-left text-[9px] font-black uppercase tracking-wide text-slate-400 sm:px-3 sm:text-[10px]"
                role="columnheader"
              >
                Mois
              </span>
              {CAPACITY_SEGMENTS.map(({ key, label, icon: Icon, textClass }) => (
                <span
                  className={`grid place-items-center whitespace-nowrap py-2 ${textClass}`}
                  key={key}
                  role="columnheader"
                  aria-label={label}
                  title={label}
                >
                  <Icon className="size-3.5" aria-hidden="true" />
                </span>
              ))}
            </div>

            {stats.map((item, index) => {
              const rowTotal = Math.max(item.contracted, segmentTotal(item));

              return (
                <button
                  className={`${TABLE_GRID} group border-b border-slate-100 bg-white text-left transition hover:bg-blue-50/60 focus-visible:bg-blue-50 focus-visible:outline-none`}
                  type="button"
                  role="row"
                  key={MONTHS_SHORT[index]}
                  onClick={() => onMonthOpen(index)}
                  aria-label={`Ouvrir ${MONTHS_SHORT[index]}`}
                >
                  <span className="sticky left-0 z-10 row-start-1 flex items-center bg-white px-2 py-2 text-left transition group-hover:bg-blue-50 group-focus-visible:bg-blue-50 sm:px-3 sm:py-2.5">
                    <strong className="truncate whitespace-nowrap text-[11px] font-black leading-none text-slate-950 sm:text-xs">
                      {MONTHS_SHORT[index]}
                    </strong>
                  </span>
                  {CAPACITY_SEGMENTS.map((segment) => (
                    <span
                      className={`row-start-1 min-w-0 whitespace-nowrap text-center text-[10px] font-extrabold leading-none sm:text-xs ${segment.textClass}`}
                      role="cell"
                      key={segment.key}
                    >
                      {formatNumber(item[segment.key])}
                      <small className="ml-px text-[8px] text-slate-400">j</small>
                    </span>
                  ))}
                  <CapacityBar
                    className="col-span-6 mb-2"
                    values={item}
                    total={rowTotal}
                    label={`Répartition de ${MONTHS_SHORT[index]}`}
                  />
                </button>
              );
            })}

            <div className={`${TABLE_GRID} bg-slate-950 text-white`} role="row">
              <span className="sticky left-0 z-10 row-start-1 flex items-center bg-slate-950 px-2 py-2.5 sm:px-3 sm:py-3">
                <strong className="text-[11px] font-black leading-none sm:text-xs">
                  Total
                </strong>
              </span>
              {CAPACITY_SEGMENTS.map((segment) => (
                <span
                  className="row-start-1 min-w-0 whitespace-nowrap text-center text-[10px] font-black leading-none sm:text-xs"
                  role="cell"
                  key={segment.key}
                >
                  {formatNumber(annualStats[segment.key])}
                  <small className="ml-px text-[8px] text-slate-400">j</small>
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
