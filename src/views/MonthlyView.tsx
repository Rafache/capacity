import {
  BriefcaseBusiness,
  CalendarDays,
  CalendarRange,
  ChevronLeft,
  ChevronRight,
  CircleCheckBig,
  Clock3,
  Coffee,
  Gauge,
  GraduationCap,
  Sun,
} from "lucide-react";
import { publicHolidays } from "../capacity";
import { InputRow } from "../components/InputRow";
import { SCHOOL_BREAKS } from "../data/schoolBreaks";
import type { Entry, MonthStats, SchoolBreak, Zone } from "../types";

const MONTHS_LONG = [
  "Juillet",
  "Août",
  "Septembre",
  "Octobre",
  "Novembre",
  "Décembre",
  "Janvier",
  "Février",
  "Mars",
  "Avril",
  "Mai",
  "Juin",
];
const WEEKDAY = ["dim.", "lun.", "mar.", "mer.", "jeu.", "ven.", "sam."];
const formatNumber = (value: number) =>
  Number.isInteger(value) ? String(value) : value.toFixed(1).replace(".", ",");
const formatDate = (date: Date) =>
  `${WEEKDAY[date.getUTCDay()]} ${date.getUTCDate()} ${new Intl.DateTimeFormat(
    "fr-FR",
    { month: "short", timeZone: "UTC" },
  )
    .format(date)
    .replace(".", "")}.`;
const formatRange = (item: SchoolBreak) => {
  const fmt = (date: Date) =>
    `${date.getUTCDate()} ${new Intl.DateTimeFormat("fr-FR", {
      month: "short",
      timeZone: "UTC",
    })
      .format(date)
      .replace(".", "")}.`;
  const labels: Record<string, string> = {
    Toussaint: "Vacances de la Toussaint",
    Noël: "Vacances de Noël",
    Hiver: "Vacances d’hiver",
    Printemps: "Vacances de printemps",
  };
  return `${labels[item.name] ?? item.name} · ${fmt(
    new Date(`${item.start}T00:00:00Z`),
  )} — ${fmt(new Date(`${item.end}T00:00:00Z`))}`;
};

type Props = {
  startYear: number;
  monthIndex: number;
  entry: Entry;
  stats: MonthStats;
  zone: Zone;
  onMonthChange: (index: number) => void;
  onZoneChange: (zone: Zone) => void;
  onChange: (field: keyof Entry, value: number | string) => void;
};

export function MonthlyView({
  startYear,
  monthIndex,
  entry,
  stats,
  zone,
  onMonthChange,
  onZoneChange,
  onChange,
}: Props) {
  const month = (monthIndex + 6) % 12;
  const year = startYear + (monthIndex >= 6 ? 1 : 0);
  const monthStart = Date.UTC(year, month, 1);
  const monthEnd = Date.UTC(year, month + 1, 0);
  const overlaps = (item: SchoolBreak) =>
    Date.parse(`${item.start}T00:00:00Z`) <= monthEnd &&
    Date.parse(`${item.end}T00:00:00Z`) >= monthStart;
  const schoolBreaks = (SCHOOL_BREAKS[String(startYear)]?.[zone] ?? []).filter(
    overlaps,
  );
  const showZones = (["A", "B", "C"] as Zone[]).some((schoolZone) =>
    (SCHOOL_BREAKS[String(startYear)]?.[schoolZone] ?? []).some(
      (item) =>
        (item.name === "Hiver" || item.name === "Printemps") &&
        overlaps(item),
    ),
  );
  const holidays = publicHolidays(year).filter(
    (item) => item.date.getUTCMonth() === month,
  );
  const weekdayHolidays = holidays.filter(
    (item) => ![0, 6].includes(item.date.getUTCDay()),
  ).length;
  const weekdays = stats.baseline + weekdayHolidays;
  const capacityRate = stats.baseline
    ? Math.round((stats.available / stats.baseline) * 100)
    : 0;
  const progressRate = Math.min(100, Math.max(0, capacityRate));
  const stepperButtonClass =
    "grid size-11 place-items-center text-xl font-black text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:text-slate-300 disabled:hover:bg-transparent";

  return (
    <div className="space-y-5 sm:space-y-6">
      <div className="grid grid-cols-[3rem_minmax(0,1fr)_3rem] items-center gap-3">
        <button
          className="grid size-12 place-items-center rounded-2xl border border-slate-200 bg-white text-slate-700 shadow-sm transition hover:border-slate-300 hover:bg-slate-50 focus:outline-none focus:ring-4 focus:ring-blue-100"
          onClick={() => onMonthChange((monthIndex + 11) % 12)}
          aria-label="Mois précédent"
        >
          <ChevronLeft className="size-5" />
        </button>
        <div className="min-w-0 text-center">
          <p className="text-[10px] font-black uppercase tracking-[0.18em] text-blue-600">
            Vue mensuelle
          </p>
          <strong className="block truncate text-2xl font-black tracking-tight text-slate-950 sm:text-3xl">
            {MONTHS_LONG[monthIndex]} {year}
          </strong>
        </div>
        <button
          className="grid size-12 place-items-center rounded-2xl border border-slate-200 bg-white text-slate-700 shadow-sm transition hover:border-slate-300 hover:bg-slate-50 focus:outline-none focus:ring-4 focus:ring-blue-100"
          onClick={() => onMonthChange((monthIndex + 1) % 12)}
          aria-label="Mois suivant"
        >
          <ChevronRight className="size-5" />
        </button>
      </div>

      <section
        className="overflow-hidden rounded-[1.75rem] bg-gradient-to-br from-slate-950 via-slate-900 to-blue-950 p-5 text-white shadow-[0_20px_50px_rgba(15,23,42,0.24)] sm:p-6"
        aria-labelledby="month-summary-title"
      >
        <div className="mb-5 flex items-start justify-between gap-4">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.18em] text-blue-300">
              Synthèse
            </p>
            <h2 id="month-summary-title" className="text-lg font-black">
              Résumé du mois
            </h2>
          </div>
          <p className="max-w-44 text-right text-[11px] font-medium leading-snug text-slate-400 sm:max-w-none sm:text-xs">
            {weekdays} jours en semaine
            {weekdayHolidays > 0
              ? ` · ${weekdayHolidays} férié${weekdayHolidays > 1 ? "s" : ""} déduit${weekdayHolidays > 1 ? "s" : ""}`
              : " · aucun férié déduit"}
          </p>
        </div>

        <div className="grid grid-cols-3 divide-x divide-white/15">
          <article
            className="min-w-0 px-2 text-center sm:px-5"
            aria-label={`${stats.baseline} jours ouvrés`}
          >
            <span className="flex items-center justify-center gap-1.5 whitespace-nowrap text-[9px] font-black uppercase tracking-[0.08em] text-slate-400 sm:text-xs">
              <CalendarDays className="size-3.5 shrink-0" />
              Jours ouvrés
            </span>
            <strong className="mt-2 block whitespace-nowrap text-3xl font-black tracking-tight sm:text-4xl">
              {stats.baseline}
              <small className="ml-1 text-sm font-bold text-slate-400 sm:text-base">
                j
              </small>
            </strong>
          </article>

          <article className="min-w-0 px-2 text-center sm:px-5">
            <span className="flex items-center justify-center gap-1.5 whitespace-nowrap text-[9px] font-black uppercase tracking-[0.08em] text-emerald-300 sm:text-xs">
              <CircleCheckBig className="size-3.5 shrink-0" />
              Disponibles
            </span>
            <strong className="mt-2 block whitespace-nowrap text-3xl font-black tracking-tight text-emerald-300 sm:text-4xl">
              {formatNumber(stats.available)}
              <small className="ml-1 text-sm font-bold text-emerald-300/70 sm:text-base">
                j
              </small>
            </strong>
          </article>

          <article className="min-w-0 px-2 text-center sm:px-5">
            <span className="flex items-center justify-center gap-1.5 whitespace-nowrap text-[9px] font-black uppercase tracking-[0.08em] text-blue-300 sm:text-xs">
              <Gauge className="size-3.5 shrink-0" />
              Capacité
            </span>
            <strong className="mt-2 block whitespace-nowrap text-3xl font-black tracking-tight text-blue-300 sm:text-4xl">
              {capacityRate}
              <small className="ml-0.5 text-sm font-bold text-blue-300/70 sm:text-base">
                %
              </small>
            </strong>
            <span
              className="mx-auto mt-2 block h-1.5 max-w-24 overflow-hidden rounded-full bg-white/10"
              role="progressbar"
              aria-label="Taux de capacité"
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={progressRate}
            >
              <span
                className="block h-full rounded-full bg-blue-400"
                style={{ width: `${progressRate}%` }}
              />
            </span>
          </article>
        </div>
      </section>

      <section className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 rounded-2xl border border-slate-200/80 bg-white p-3 shadow-sm sm:p-4">
        <span
          className="grid size-11 place-items-center rounded-2xl bg-blue-50 text-blue-600"
          aria-hidden="true"
        >
          <Clock3 className="size-5" />
        </span>
        <span className="min-w-0">
          <strong className="block truncate text-sm font-extrabold text-slate-900 sm:text-base">
            Temps de travail
          </strong>
          <small className="text-xs font-medium text-slate-400">
            Quotité du mois
          </small>
        </span>
        <div className="grid h-11 grid-cols-[2.5rem_minmax(4.5rem,1fr)_2.5rem] overflow-hidden rounded-xl border border-slate-200 bg-slate-50">
          <button
            className={stepperButtonClass}
            disabled={entry.workRate <= 20}
            onClick={() =>
              onChange("workRate", Math.max(20, entry.workRate - 5))
            }
          >
            −
          </button>
          <output className="grid place-items-center border-x border-slate-200 bg-white px-1 text-sm font-black text-slate-950">
            {entry.workRate} %
          </output>
          <button
            className={stepperButtonClass}
            disabled={entry.workRate >= 100}
            onClick={() =>
              onChange("workRate", Math.min(100, entry.workRate + 5))
            }
          >
            +
          </button>
        </div>
      </section>

      <section>
        <div className="mb-3 flex items-end justify-between gap-3">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.18em] text-blue-600">
              Planification
            </p>
            <h2 className="text-xl font-black tracking-tight text-slate-950">
              Mes absences
            </h2>
          </div>
          <span className="text-xs font-semibold text-slate-400">
            {formatNumber(stats.contracted)} j contractuels
          </span>
        </div>
        <div className="space-y-2.5">
          <InputRow
            icon={CalendarRange}
            iconClass="bg-red-50 text-red-500"
            label="Congés payés"
            value={entry.leave}
            max={stats.contracted}
            onChange={(value) => onChange("leave", value)}
          />
          <InputRow
            icon={Coffee}
            iconClass="bg-pink-50 text-pink-500"
            label="RTT"
            value={entry.rtt}
            max={stats.contracted}
            onChange={(value) => onChange("rtt", value)}
          />
          <InputRow
            icon={GraduationCap}
            iconClass="bg-violet-50 text-violet-500"
            label="Formations"
            value={entry.training}
            max={stats.contracted}
            onChange={(value) => onChange("training", value)}
          />
          <InputRow
            icon={BriefcaseBusiness}
            iconClass="bg-amber-50 text-amber-500"
            label="Autres"
            value={entry.other}
            max={stats.contracted}
            onChange={(value) => onChange("other", value)}
          />
        </div>
      </section>

      <label className="block rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm">
        <span className="mb-2 block text-sm font-extrabold text-slate-900">
          Note du mois
        </span>
        <textarea
          className="min-h-24 w-full resize-y rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm font-medium text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-100"
          value={entry.note}
          maxLength={300}
          placeholder="Ex. formation, mandat, congés d’été…"
          onChange={(event) => onChange("note", event.target.value)}
        />
      </label>

      <section className="rounded-[1.75rem] border border-slate-200/80 bg-slate-50 p-4 sm:p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.18em] text-blue-600">
              Repères
            </p>
            <h2 className="text-lg font-black text-slate-950">
              Calendrier du mois
            </h2>
          </div>
          {showZones && (
            <div
              className="flex rounded-xl border border-slate-200 bg-white p-1"
              aria-label="Zone scolaire"
            >
              {(["A", "B", "C"] as Zone[]).map((item) => (
                <button
                  key={item}
                  className={`rounded-lg px-3 py-1.5 text-xs font-extrabold transition ${
                    zone === item
                      ? "bg-slate-950 text-white shadow-sm"
                      : "text-slate-500 hover:bg-slate-100 hover:text-slate-900"
                  }`}
                  onClick={() => onZoneChange(item)}
                >
                  Zone {item}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="mt-4 space-y-2">
          {holidays.map((item) => (
            <div
              className="flex items-center gap-3 rounded-xl border border-amber-100 bg-white p-3 text-sm font-semibold text-slate-700"
              key={item.name}
            >
              <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-amber-50 text-amber-500">
                <Sun className="size-4" />
              </span>
              <span>
                {item.name} · {formatDate(item.date)}
              </span>
            </div>
          ))}
          {schoolBreaks.map((item) => (
            <div
              className="flex items-center gap-3 rounded-xl border border-blue-100 bg-white p-3 text-sm font-semibold text-slate-700"
              key={`${item.name}-${item.start}`}
            >
              <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-blue-50 text-blue-600">
                <CalendarRange className="size-4" />
              </span>
              <span>{formatRange(item)}</span>
            </div>
          ))}
          {!holidays.length && !schoolBreaks.length && (
            <p className="rounded-xl border border-dashed border-slate-300 p-4 text-center text-sm font-medium text-slate-400">
              Aucun jour férié ni vacances scolaires ce mois-ci.
            </p>
          )}
          {!SCHOOL_BREAKS[String(startYear)]?.[zone]?.length && (
            <p className="text-center text-xs font-medium text-slate-400">
              Les dates scolaires de cette année ne sont pas encore publiées.
            </p>
          )}
        </div>
      </section>
    </div>
  );
}
