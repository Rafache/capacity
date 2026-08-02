import {
  BriefcaseBusiness,
  CalendarRange,
  CalendarX2,
  CircleCheckBig,
  Clock3,
  Coffee,
  Gauge,
  GraduationCap,
  type LucideIcon,
} from "lucide-react";
import type { Entry, MonthStats, SegmentKey } from "../types";

const MONTHS_SHORT = [
  "Juil.",
  "Août",
  "Sept.",
  "Oct.",
  "Nov.",
  "Déc.",
  "Janv.",
  "Févr.",
  "Mars",
  "Avr.",
  "Mai",
  "Juin",
];

const formatNumber = (value: number) =>
  Number.isInteger(value) ? String(value) : value.toFixed(1).replace(".", ",");

const SEGMENTS: Array<{
  key: SegmentKey;
  label: string;
  icon: LucideIcon;
  tone: string;
}> = [
  {
    key: "available",
    label: "Disponible",
    icon: CircleCheckBig,
    tone: "text-emerald-600",
  },
  {
    key: "leave",
    label: "Congés payés",
    icon: CalendarRange,
    tone: "text-red-500",
  },
  {
    key: "rtt",
    label: "RTT",
    icon: Coffee,
    tone: "text-pink-500",
  },
  {
    key: "training",
    label: "Formations",
    icon: GraduationCap,
    tone: "text-violet-500",
  },
  {
    key: "other",
    label: "Autres",
    icon: BriefcaseBusiness,
    tone: "text-amber-500",
  },
];

const TABLE_GRID =
  "grid w-full grid-cols-[4rem_repeat(6,minmax(0,1fr))] items-center sm:grid-cols-[7rem_repeat(6,minmax(4rem,1fr))]";

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
      <section className="grid grid-cols-3 gap-1.5 sm:gap-3">
        <article className="flex min-w-0 items-center gap-2 rounded-xl border border-emerald-100 bg-emerald-50/70 p-2 sm:rounded-2xl sm:p-3">
          <span className="hidden size-8 shrink-0 place-items-center rounded-lg bg-white text-emerald-600 shadow-sm min-[360px]:grid sm:size-9 sm:rounded-xl">
            <CircleCheckBig className="size-3.5 sm:size-4" />
          </span>
          <span className="min-w-0">
            <strong className="block truncate text-lg font-black leading-none tracking-tight text-slate-950 sm:text-2xl">
              {formatNumber(annualAvailable)}
              <small className="ml-0.5 text-[10px] font-bold text-slate-400 sm:text-xs">
                j
              </small>
            </strong>
            <small className="mt-1 block truncate text-[8px] font-extrabold uppercase leading-none tracking-wide text-emerald-700 sm:text-[10px]">
              Disponibles
            </small>
          </span>
        </article>

        <article className="flex min-w-0 items-center gap-2 rounded-xl border border-red-100 bg-red-50/70 p-2 sm:rounded-2xl sm:p-3">
          <span className="hidden size-8 shrink-0 place-items-center rounded-lg bg-white text-red-500 shadow-sm min-[360px]:grid sm:size-9 sm:rounded-xl">
            <CalendarX2 className="size-3.5 sm:size-4" />
          </span>
          <span className="min-w-0">
            <strong className="block truncate text-lg font-black leading-none tracking-tight text-slate-950 sm:text-2xl">
              {formatNumber(annualUnavailable)}
              <small className="ml-0.5 text-[10px] font-bold text-slate-400 sm:text-xs">
                j
              </small>
            </strong>
            <small className="mt-1 block truncate text-[8px] font-extrabold uppercase leading-none tracking-wide text-red-600 sm:text-[10px]">
              Absences
            </small>
          </span>
        </article>

        <article className="flex min-w-0 items-center gap-2 rounded-xl border border-blue-100 bg-blue-50/70 p-2 sm:rounded-2xl sm:p-3">
          <span className="hidden size-8 shrink-0 place-items-center rounded-lg bg-white text-blue-600 shadow-sm min-[360px]:grid sm:size-9 sm:rounded-xl">
            <Gauge className="size-3.5 sm:size-4" />
          </span>
          <span className="min-w-0">
            <strong className="block truncate text-lg font-black leading-none tracking-tight text-slate-950 sm:text-2xl">
              {annualRate}
              <small className="ml-0.5 text-[10px] font-bold text-slate-400 sm:text-xs">
                %
              </small>
            </strong>
            <small className="mt-1 block truncate text-[8px] font-extrabold uppercase leading-none tracking-wide text-blue-700 sm:text-[10px]">
              Capacité
            </small>
          </span>
        </article>
      </section>

      <section>
        <div className="mb-2 flex items-center justify-between gap-3 sm:mb-3">
          <h2 className="text-base font-black tracking-tight text-slate-950 sm:text-xl">
            Capacité par mois
          </h2>
          <span className="text-[9px] font-semibold text-slate-400 sm:text-[11px]">
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
              <span className="sticky left-0 z-10 bg-slate-50 px-2 py-2 text-left text-[9px] font-black uppercase tracking-wide text-slate-400 sm:px-3 sm:text-[10px]">
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
              {SEGMENTS.map(({ key, label, icon: Icon, tone }) => (
                <span
                  className={`grid place-items-center py-2 ${tone}`}
                  key={key}
                  role="columnheader"
                  aria-label={label}
                  title={label}
                >
                  <Icon className="size-3.5" aria-hidden="true" />
                </span>
              ))}
            </div>

            {stats.map((item, index) => (
              <button
                className={`${TABLE_GRID} group border-b border-slate-100 bg-white text-left transition hover:bg-blue-50/60 focus-visible:bg-blue-50 focus-visible:outline-none`}
                role="row"
                key={MONTHS_SHORT[index]}
                onClick={() => onMonthOpen(index)}
                aria-label={`Ouvrir ${MONTHS_SHORT[index]}`}
              >
                <span className="sticky left-0 z-10 flex items-baseline gap-1 bg-white px-2 py-1.5 text-left transition group-hover:bg-blue-50 group-focus-visible:bg-blue-50 sm:px-3 sm:py-2">
                  <strong className="truncate text-[11px] font-black leading-none text-slate-950 sm:text-xs">
                    {MONTHS_SHORT[index]}
                    {entries[index].note ? (
                      <span className="ml-0.5 text-blue-500">•</span>
                    ) : null}
                  </strong>
                  <small className="shrink-0 text-[8px] font-semibold leading-none text-slate-400 sm:text-[9px]">
                    {item.baseline}j
                  </small>
                </span>
                <span className="text-center text-[10px] font-extrabold leading-none text-slate-700 sm:text-xs">
                  {formatNumber(entries[index].workRate)}
                  <small className="ml-px text-[8px] text-slate-400">%</small>
                </span>
                {SEGMENTS.map((segment) => (
                  <span
                    className={`text-center text-[10px] font-extrabold leading-none sm:text-xs ${segment.tone}`}
                    role="cell"
                    key={segment.key}
                  >
                    {formatNumber(item[segment.key])}
                    <small className="ml-px text-[8px] text-slate-400">j</small>
                  </span>
                ))}
              </button>
            ))}

            <div
              className={`${TABLE_GRID} bg-slate-950 text-white`}
              role="row"
            >
              <span className="sticky left-0 z-10 flex items-baseline gap-1 bg-slate-950 px-2 py-2 sm:px-3 sm:py-2.5">
                <strong className="text-[11px] font-black leading-none sm:text-xs">
                  Total
                </strong>
                <small className="text-[8px] font-semibold leading-none text-slate-400 sm:text-[9px]">
                  {annualBaseline}j
                </small>
              </span>
              <span className="text-center text-[10px] font-black leading-none sm:text-xs">
                {annualWorkRate}
                <small className="ml-px text-[8px] text-slate-400">%</small>
              </span>
              {SEGMENTS.map((segment) => (
                <span
                  className="text-center text-[10px] font-black leading-none sm:text-xs"
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
