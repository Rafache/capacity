import { CalendarDays, CalendarX2, Clock3, Gauge } from "lucide-react";
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
  annualUnavailable,
  annualRate,
  annualWorkRate,
  annualStats,
  onMonthOpen,
}: Props) {
  return (
    <div className="space-y-3 sm:space-y-5">
      <CapacitySummary
        title="Synthèse de l’année"
        eyebrow={null}
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
            value: annualRate,
            unit: "%",
            tone: "accent",
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
                  <span className="sticky left-0 z-10 row-start-1 flex items-center bg-white px-2 py-2 text-left transition group-hover:bg-blue-50 group-focus-visible:bg-blue-50 sm:px-3 sm:py-2.5">
                    <strong className="truncate text-[11px] font-black leading-none text-slate-950 sm:text-xs">
                      {MONTHS_SHORT[index]}
                      {entries[index].note ? (
                        <span className="ml-0.5 text-blue-500">•</span>
                      ) : null}
                    </strong>
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
              <span className="sticky left-0 z-10 row-start-1 flex items-center bg-slate-950 px-2 py-2.5 sm:px-3 sm:py-3">
                <strong className="text-[11px] font-black leading-none sm:text-xs">
                  Total
                </strong>
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

        <div
          className="mt-3 rounded-2xl border border-slate-200/80 bg-slate-50 p-3 sm:p-4"
          role="group"
          aria-label="Légende de la répartition"
        >
          <div className="mb-3 flex items-center justify-between gap-3">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.16em] text-slate-400">
                Légende
              </p>
              <p className="mt-0.5 text-xs font-bold text-slate-700">
                Répartition des jours
              </p>
            </div>
            <span
              className="flex h-1.5 w-12 overflow-hidden rounded-full"
              aria-hidden="true"
            >
              {CAPACITY_SEGMENTS.map(({ key, barClass }) => (
                <span className={`min-w-0 flex-1 ${barClass}`} key={key} />
              ))}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
            {CAPACITY_SEGMENTS.map(({ key, label, icon: Icon, softClass }) => (
              <span
                className="flex min-w-0 items-center gap-2 rounded-xl bg-white px-2 py-2 ring-1 ring-slate-200/70 sm:px-2.5"
                key={key}
              >
                <span
                  className={`grid size-7 shrink-0 place-items-center rounded-lg ${softClass}`}
                  aria-hidden="true"
                >
                  <Icon className="size-3.5" />
                </span>
                <span className="truncate text-[10px] font-bold text-slate-600 sm:text-[11px]">
                  {label}
                </span>
              </span>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
