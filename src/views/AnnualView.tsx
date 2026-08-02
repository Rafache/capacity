import { CalendarX2, CircleCheckBig, Clock3, Gauge } from "lucide-react";
import { CapacityBar } from "../components/CapacityBar";
import { CapacitySummary } from "../components/CapacitySummary";
import { CAPACITY_SEGMENTS } from "../components/capacitySegments";
import { MONTHS_SHORT } from "../data/months";
import type { Entry, MonthStats, SegmentKey } from "../types";

const formatNumber = (value: number) =>
  Number.isInteger(value) ? String(value) : value.toFixed(1).replace(".", ",");

const TABLE_GRID =
  "grid w-full grid-cols-[4rem_repeat(6,minmax(0,1fr))] items-center sm:grid-cols-[7rem_repeat(6,minmax(4rem,1fr))]";

const segmentTotal = (values: Record<SegmentKey, number>) =>
  CAPACITY_SEGMENTS.reduce((sum, segment) => sum + values[segment.key], 0);

type Props = {
  entries: Entry[];
  stats: MonthStats[];
  annualBaseline: number;
  annualAvailable: number;
  annualUnavailable: number;
  annualRate: number;
  annualWorkRate: number;
  annualStats: Record<SegmentKey, number>;
  onMonthOpen: (index: number) => void;
};

export function AnnualView({
  entries,
  stats,
  annualBaseline,
  annualAvailable,
  annualUnavailable,
  annualRate,
  annualWorkRate,
  annualStats,
  onMonthOpen,
}: Props) {
  return (
    <div className="space-y-3 sm:space-y-5">
      <CapacitySummary
        title="Résumé de l’année"
        meta={`${annualBaseline} jours ouvrés sur l’année`}
        items={[
          {
            icon: CircleCheckBig,
            label: "Disponibles",
            value: formatNumber(annualAvailable),
            unit: "j",
            tone: "positive",
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
            value: annualRate,
            unit: "%",
            tone: "accent",
          },
        ]}
      />

      <section>
        <div className="mb-2 flex items-end justify-between gap-3 sm:mb-3">
          <div>
            <h2 className="text-base font-black tracking-tight text-slate-950 sm:text-xl">
              Capacité par mois
            </h2>
            <p className="mt-1 text-[10px] font-medium text-slate-400 sm:text-xs">
              La barre visualise la répartition des jours contractuels.
            </p>
          </div>
          <span className="shrink-0 text-right text-[9px] font-semibold text-slate-400 sm:text-[11px]">
            Touchez une ligne pour modifier
          </span>
        </div>

        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm sm:rounded-2xl">
          <div
            className="overflow-x-auto overscroll-x-contain"
            role="table"
            aria-label="Capacité mensuelle en jours"
          >
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
              <span
                className="grid place-items-center py-2 text-slate-500"
                role="columnheader"
                aria-label="Temps de travail"
                title="Temps de travail"
              >
                <Clock3 className="size-3.5" aria-hidden="true" />
              </span>
              {CAPACITY_SEGMENTS.map(({ key, label, icon: Icon, textClass }) => (
                <span
                  className={`grid place-items-center py-2 ${textClass}`}
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
                  role="row"
                  key={MONTHS_SHORT[index]}
                  onClick={() => onMonthOpen(index)}
                  aria-label={`Ouvrir ${MONTHS_SHORT[index]}`}
                >
                  <span className="sticky left-0 z-10 row-start-1 flex flex-col justify-center bg-white px-2 py-2 text-left transition group-hover:bg-blue-50 group-focus-visible:bg-blue-50 sm:px-3 sm:py-2.5">
                    <strong className="truncate text-[11px] font-black leading-none text-slate-950 sm:text-xs">
                      {MONTHS_SHORT[index]}
                      {entries[index].note ? (
                        <span className="ml-0.5 text-blue-500">•</span>
                      ) : null}
                    </strong>
                    <small className="mt-1 block text-[8px] font-semibold leading-none text-slate-400 sm:text-[9px]">
                      {item.baseline} jours ouvrés
                    </small>
                  </span>
                  <span className="row-start-1 text-center text-[10px] font-extrabold leading-none text-slate-700 sm:text-xs">
                    {formatNumber(entries[index].workRate)}
                    <small className="ml-px text-[8px] text-slate-400">%</small>
                  </span>
                  {CAPACITY_SEGMENTS.map((segment) => (
                    <span
                      className={`row-start-1 text-center text-[10px] font-extrabold leading-none sm:text-xs ${segment.textClass}`}
                      role="cell"
                      key={segment.key}
                    >
                      {formatNumber(item[segment.key])}
                      <small className="ml-px text-[8px] text-slate-400">j</small>
                    </span>
                  ))}
                  <CapacityBar
                    className="col-span-7 mb-2"
                    values={item}
                    total={rowTotal}
                    label={`Répartition de ${MONTHS_SHORT[index]}`}
                  />
                </button>
              );
            })}

            <div className={`${TABLE_GRID} bg-slate-950 text-white`} role="row">
              <span className="sticky left-0 z-10 row-start-1 flex flex-col justify-center bg-slate-950 px-2 py-2.5 sm:px-3 sm:py-3">
                <strong className="text-[11px] font-black leading-none sm:text-xs">
                  Total
                </strong>
                <small className="mt-1 block text-[8px] font-semibold leading-none text-slate-400 sm:text-[9px]">
                  {annualBaseline} jours ouvrés
                </small>
              </span>
              <span className="row-start-1 text-center text-[10px] font-black leading-none sm:text-xs">
                {annualWorkRate}
                <small className="ml-px text-[8px] text-slate-400">%</small>
              </span>
              {CAPACITY_SEGMENTS.map((segment) => (
                <span
                  className="row-start-1 text-center text-[10px] font-black leading-none sm:text-xs"
                  role="cell"
                  key={segment.key}
                >
                  {formatNumber(annualStats[segment.key])}
                  <small className="ml-px text-[8px] text-slate-400">j</small>
                </span>
              ))}
              <CapacityBar
                className="col-span-7 mb-2 bg-white/10"
                values={annualStats}
                label="Répartition de l’année"
              />
            </div>
          </div>
        </div>

        <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-[10px] font-semibold text-slate-500">
          <span className="font-black text-slate-400">Répartition</span>
          {CAPACITY_SEGMENTS.map(({ key, label, barClass }) => (
            <span className="inline-flex items-center gap-1" key={key}>
              <span className={`size-2 rounded-full ${barClass}`} aria-hidden="true" />
              {label}
            </span>
          ))}
        </div>
      </section>
    </div>
  );
}
