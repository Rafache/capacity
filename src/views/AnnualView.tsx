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
  "grid min-w-[650px] grid-cols-[8.75rem_4.5rem_repeat(5,4.75rem)] items-center";

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
    <div className="space-y-6">
      <section className="grid grid-cols-3 gap-2.5 sm:gap-4">
        <article className="min-w-0 rounded-2xl border border-emerald-100 bg-emerald-50/70 p-3 sm:rounded-3xl sm:p-5">
          <span className="grid size-9 place-items-center rounded-xl bg-white text-emerald-600 shadow-sm sm:size-11 sm:rounded-2xl">
            <CircleCheckBig className="size-4 sm:size-5" />
          </span>
          <strong className="mt-3 block truncate text-xl font-black tracking-tight text-slate-950 sm:text-3xl">
            {formatNumber(annualAvailable)}
            <small className="ml-1 text-xs font-bold text-slate-400 sm:text-sm">
              j
            </small>
          </strong>
          <small className="mt-0.5 block truncate text-[10px] font-extrabold uppercase tracking-wide text-emerald-700 sm:text-xs">
            Disponibles
          </small>
        </article>

        <article className="min-w-0 rounded-2xl border border-red-100 bg-red-50/70 p-3 sm:rounded-3xl sm:p-5">
          <span className="grid size-9 place-items-center rounded-xl bg-white text-red-500 shadow-sm sm:size-11 sm:rounded-2xl">
            <CalendarX2 className="size-4 sm:size-5" />
          </span>
          <strong className="mt-3 block truncate text-xl font-black tracking-tight text-slate-950 sm:text-3xl">
            {formatNumber(annualUnavailable)}
            <small className="ml-1 text-xs font-bold text-slate-400 sm:text-sm">
              j
            </small>
          </strong>
          <small className="mt-0.5 block truncate text-[10px] font-extrabold uppercase tracking-wide text-red-600 sm:text-xs">
            Absences
          </small>
        </article>

        <article className="min-w-0 rounded-2xl border border-blue-100 bg-blue-50/70 p-3 sm:rounded-3xl sm:p-5">
          <span className="grid size-9 place-items-center rounded-xl bg-white text-blue-600 shadow-sm sm:size-11 sm:rounded-2xl">
            <Gauge className="size-4 sm:size-5" />
          </span>
          <strong className="mt-3 block truncate text-xl font-black tracking-tight text-slate-950 sm:text-3xl">
            {annualRate}
            <small className="ml-0.5 text-xs font-bold text-slate-400 sm:text-sm">
              %
            </small>
          </strong>
          <small className="mt-0.5 block truncate text-[10px] font-extrabold uppercase tracking-wide text-blue-700 sm:text-xs">
            Capacité
          </small>
        </article>
      </section>

      <section>
        <div className="mb-4 flex items-end justify-between gap-4">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.18em] text-blue-600">
              Exercice complet
            </p>
            <h2 className="text-xl font-black tracking-tight text-slate-950 sm:text-2xl">
              Capacité par mois
            </h2>
          </div>
          <span className="max-w-40 text-right text-[11px] font-semibold leading-tight text-slate-400 sm:max-w-none sm:text-xs">
            Touchez une ligne pour modifier le mois
          </span>
        </div>

        <div className="overflow-hidden rounded-[1.5rem] border border-slate-200 bg-white shadow-sm sm:rounded-[1.75rem]">
          <div
            className="overflow-x-auto overscroll-x-contain [scrollbar-width:thin]"
            role="table"
            aria-label="Capacité mensuelle en jours"
          >
            <div
              className={`${TABLE_GRID} border-b border-slate-200 bg-slate-50 text-center`}
              role="row"
            >
              <span className="sticky left-0 z-10 bg-slate-50 px-4 py-3 text-left text-[10px] font-black uppercase tracking-[0.14em] text-slate-400 sm:px-5 sm:text-xs">
                Mois
              </span>
              <span
                className="grid place-items-center py-3 text-slate-500"
                role="columnheader"
                aria-label="Temps de travail"
                title="Temps de travail"
              >
                <Clock3 className="size-4" aria-hidden="true" />
              </span>
              {SEGMENTS.map(({ key, label, icon: Icon, tone }) => (
                <span
                  className={`grid place-items-center py-3 ${tone}`}
                  key={key}
                  role="columnheader"
                  aria-label={label}
                  title={label}
                >
                  <Icon className="size-4" aria-hidden="true" />
                </span>
              ))}
            </div>

            {stats.map((item, index) => (
              <button
                className={`${TABLE_GRID} group w-full border-b border-slate-100 bg-white text-left transition hover:bg-blue-50/60 focus-visible:bg-blue-50 focus-visible:outline-none`}
                role="row"
                key={MONTHS_SHORT[index]}
                onClick={() => onMonthOpen(index)}
                aria-label={`Ouvrir ${MONTHS_SHORT[index]}`}
              >
                <span className="sticky left-0 z-10 bg-white px-4 py-3.5 text-left transition group-hover:bg-blue-50 group-focus-visible:bg-blue-50 sm:px-5">
                  <strong className="block text-sm font-black text-slate-950">
                    {MONTHS_SHORT[index]}
                    {entries[index].note ? (
                      <span className="ml-1 text-blue-500">•</span>
                    ) : null}
                  </strong>
                  <small className="text-[11px] font-semibold text-slate-400">
                    {item.baseline} ouvrés
                  </small>
                </span>
                <span className="text-center text-sm font-extrabold text-slate-700">
                  {formatNumber(entries[index].workRate)}
                  <small className="ml-0.5 text-[10px] text-slate-400">%</small>
                </span>
                {SEGMENTS.map((segment) => (
                  <span
                    className={`text-center text-sm font-extrabold ${segment.tone}`}
                    role="cell"
                    key={segment.key}
                  >
                    {formatNumber(item[segment.key])}
                    <small className="ml-0.5 text-[10px] text-slate-400">j</small>
                  </span>
                ))}
              </button>
            ))}

            <div
              className={`${TABLE_GRID} bg-slate-950 text-white`}
              role="row"
            >
              <span className="sticky left-0 z-10 bg-slate-950 px-4 py-4 sm:px-5">
                <strong className="block text-sm font-black">Total</strong>
                <small className="text-[11px] font-semibold text-slate-400">
                  {annualBaseline} ouvrés
                </small>
              </span>
              <span className="text-center text-sm font-black">
                {annualWorkRate}
                <small className="ml-0.5 text-[10px] text-slate-400">%</small>
              </span>
              {SEGMENTS.map((segment) => (
                <span
                  className="text-center text-sm font-black"
                  role="cell"
                  key={segment.key}
                >
                  {formatNumber(annualStats[segment.key])}
                  <small className="ml-0.5 text-[10px] text-slate-400">j</small>
                </span>
              ))}
            </div>
          </div>
        </div>

        <p className="mt-2 text-center text-[10px] font-semibold text-slate-400 sm:hidden">
          Faites glisser le tableau horizontalement pour afficher toutes les colonnes.
        </p>
      </section>
    </div>
  );
}
