import {
  BriefcaseBusiness,
  CalendarRange,
  CalendarX2,
  ChevronRight,
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
  shortLabel: string;
  icon: LucideIcon;
  tone: string;
}> = [
  {
    key: "available",
    label: "Disponible",
    shortLabel: "Dispo.",
    icon: CircleCheckBig,
    tone: "text-emerald-600",
  },
  {
    key: "leave",
    label: "Congés payés",
    shortLabel: "CP",
    icon: CalendarRange,
    tone: "text-red-500",
  },
  {
    key: "rtt",
    label: "RTT",
    shortLabel: "RTT",
    icon: Coffee,
    tone: "text-pink-500",
  },
  {
    key: "training",
    label: "Formations",
    shortLabel: "Form.",
    icon: GraduationCap,
    tone: "text-violet-500",
  },
  {
    key: "other",
    label: "Autres",
    shortLabel: "Autres",
    icon: BriefcaseBusiness,
    tone: "text-amber-500",
  },
];

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
          <span className="text-right text-xs font-semibold text-slate-400">
            Touchez un mois pour le modifier
          </span>
        </div>

        <div className="space-y-2.5 sm:hidden">
          {stats.map((item, index) => (
            <button
              className="w-full rounded-2xl border border-slate-200/80 bg-white p-4 text-left shadow-sm transition active:scale-[0.99]"
              key={MONTHS_SHORT[index]}
              onClick={() => onMonthOpen(index)}
              aria-label={`Ouvrir ${MONTHS_SHORT[index]}`}
            >
              <span className="flex items-center justify-between gap-3">
                <span>
                  <strong className="text-base font-black text-slate-950">
                    {MONTHS_SHORT[index]}
                    {entries[index].note ? (
                      <span className="ml-1 text-blue-500">•</span>
                    ) : null}
                  </strong>
                  <small className="ml-2 text-xs font-semibold text-slate-400">
                    {item.baseline} jours ouvrés
                  </small>
                </span>
                <ChevronRight className="size-4 text-slate-400" />
              </span>

              <span className="mt-3 grid grid-cols-3 gap-2">
                <span className="rounded-xl bg-slate-50 p-2 text-center">
                  <small className="block text-[9px] font-black uppercase tracking-wide text-slate-400">
                    Travail
                  </small>
                  <strong className="text-sm font-black text-slate-900">
                    {formatNumber(entries[index].workRate)} %
                  </strong>
                </span>
                {SEGMENTS.map((segment) => (
                  <span
                    className="rounded-xl bg-slate-50 p-2 text-center"
                    key={segment.key}
                  >
                    <small
                      className={`block text-[9px] font-black uppercase tracking-wide ${segment.tone}`}
                    >
                      {segment.shortLabel}
                    </small>
                    <strong className="text-sm font-black text-slate-900">
                      {formatNumber(item[segment.key])} j
                    </strong>
                  </span>
                ))}
              </span>
            </button>
          ))}

          <div className="rounded-2xl bg-slate-950 p-4 text-white shadow-lg">
            <span className="flex items-center justify-between">
              <strong className="text-base font-black">Total annuel</strong>
              <small className="font-semibold text-slate-400">
                {annualBaseline} jours ouvrés
              </small>
            </span>
            <span className="mt-3 grid grid-cols-3 gap-2">
              <span className="rounded-xl bg-white/10 p-2 text-center">
                <small className="block text-[9px] font-black uppercase text-slate-400">
                  Travail
                </small>
                <strong className="text-sm font-black">{annualWorkRate} %</strong>
              </span>
              {SEGMENTS.map((segment) => (
                <span
                  className="rounded-xl bg-white/10 p-2 text-center"
                  key={segment.key}
                >
                  <small className="block text-[9px] font-black uppercase text-slate-400">
                    {segment.shortLabel}
                  </small>
                  <strong className="text-sm font-black">
                    {formatNumber(annualStats[segment.key])} j
                  </strong>
                </span>
              ))}
            </span>
          </div>
        </div>

        <div className="hidden overflow-hidden rounded-[1.75rem] border border-slate-200 bg-white shadow-sm sm:block">
          <div
            className="grid grid-cols-[minmax(8rem,1.4fr)_repeat(6,minmax(4.5rem,0.8fr))] items-center gap-2 border-b border-slate-200 bg-slate-50 px-5 py-3"
            role="row"
          >
            <span className="text-xs font-black uppercase tracking-[0.14em] text-slate-400">
              Mois
            </span>
            <span
              className="grid place-items-center text-slate-500"
              role="columnheader"
              aria-label="Temps de travail"
              title="Temps de travail"
            >
              <Clock3 className="size-4" aria-hidden="true" />
            </span>
            {SEGMENTS.map(({ key, label, icon: Icon, tone }) => (
              <span
                className={`grid place-items-center ${tone}`}
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
              className="grid w-full grid-cols-[minmax(8rem,1.4fr)_repeat(6,minmax(4.5rem,0.8fr))] items-center gap-2 border-b border-slate-100 px-5 py-3 text-left transition hover:bg-blue-50/50 focus:bg-blue-50 focus:outline-none"
              role="row"
              key={MONTHS_SHORT[index]}
              onClick={() => onMonthOpen(index)}
              aria-label={`Ouvrir ${MONTHS_SHORT[index]}`}
            >
              <span role="rowheader">
                <strong className="block text-sm font-black text-slate-950">
                  {MONTHS_SHORT[index]}
                  {entries[index].note ? (
                    <span className="ml-1 text-blue-500">•</span>
                  ) : null}
                </strong>
                <small className="text-xs font-semibold text-slate-400">
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

          <div className="grid grid-cols-[minmax(8rem,1.4fr)_repeat(6,minmax(4.5rem,0.8fr))] items-center gap-2 bg-slate-950 px-5 py-4 text-white">
            <span>
              <strong className="block text-sm font-black">Total</strong>
              <small className="text-xs font-semibold text-slate-400">
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
                key={segment.key}
              >
                {formatNumber(annualStats[segment.key])}
                <small className="ml-0.5 text-[10px] text-slate-400">j</small>
              </span>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
