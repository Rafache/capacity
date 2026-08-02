import {
  CalendarDays,
  CalendarRange,
  ChevronLeft,
  ChevronRight,
  CalendarX2,
  Clock3,
  Gauge,
  Sun,
} from "lucide-react";
import { publicHolidays } from "../capacity";
import { CapacitySummary } from "../components/CapacitySummary";
import { ABSENCE_SEGMENTS } from "../components/capacitySegments";
import { ApplyToYearButton, InputRow } from "../components/InputRow";
import { SCHOOL_BREAKS } from "../data/schoolBreaks";
import { MONTHS_LONG } from "../data/months";
import type { Entry, EntryNumericKey, MonthStats, SchoolBreak, Zone } from "../types";

const WEEKDAY = ["dim.", "lun.", "mar.", "mer.", "jeu.", "ven.", "sam."];

const formatNumber = (value: number) =>
  Number.isInteger(value) ? String(value) : value.toFixed(1).replace(".", ",");

const formatDate = (date: Date) =>
  `${WEEKDAY[date.getUTCDay()]} ${date.getUTCDate()} ${new Intl.DateTimeFormat("fr-FR", {
    month: "short",
    timeZone: "UTC",
  })
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
  onApplyToYear: (field: EntryNumericKey) => void;
  onChange: (field: keyof Entry, value: number | string) => void;
};

export function MonthlyView({
  startYear,
  monthIndex,
  entry,
  stats,
  zone,
  onMonthChange,
  onApplyToYear,
  onChange,
}: Props) {
  const month = (monthIndex + 6) % 12;
  const year = startYear + (monthIndex >= 6 ? 1 : 0);
  const monthStart = Date.UTC(year, month, 1);
  const monthEnd = Date.UTC(year, month + 1, 0);
  const overlaps = (item: SchoolBreak) =>
    Date.parse(`${item.start}T00:00:00Z`) <= monthEnd &&
    Date.parse(`${item.end}T00:00:00Z`) >= monthStart;
  const schoolBreaks = (SCHOOL_BREAKS[String(startYear)]?.[zone] ?? []).filter(overlaps);
  const holidays = publicHolidays(year).filter(
    (item) => item.date.getUTCMonth() === month,
  );
  const absenceTotal = stats.leave + stats.rtt + stats.training + stats.other;
  const stepperButtonClass =
    "grid size-11 place-items-center text-xl font-black text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:text-slate-300 disabled:hover:bg-transparent";

  return (
    <div className="space-y-4 sm:space-y-5">
      <div className="monthly-month-nav grid grid-cols-[3rem_minmax(0,1fr)_3rem] items-center gap-3">
        <button
          className="grid size-12 place-items-center rounded-2xl border border-slate-200 bg-white text-slate-700 shadow-sm transition hover:border-slate-300 hover:bg-slate-50 focus:outline-none focus:ring-4 focus:ring-blue-100"
          onClick={() => onMonthChange((monthIndex + 11) % 12)}
          aria-label="Mois précédent"
        >
          <ChevronLeft className="size-5" />
        </button>
        <div className="min-w-0 text-center">
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

      <CapacitySummary
        title="Synthèse du mois"
        eyebrow={null}
        barValues={stats}
        barLabel={`Répartition de ${MONTHS_LONG[monthIndex]}`}
        items={[
          {
            icon: CalendarDays,
            label: "Jours ouvrés",
            value: stats.baseline,
            unit: "j",
            tone: "neutral",
          },
          {
            icon: CalendarX2,
            label: "Absences",
            value: formatNumber(absenceTotal),
            unit: "j",
            tone: "negative",
          },
          {
            icon: Gauge,
            label: "Capacité",
            value: formatNumber(stats.available),
            unit: "j",
            tone: "positive",
          },
        ]}
      />

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
          <small className="text-xs font-medium text-slate-400">Quotité du mois</small>
        </span>
        <div className="flex items-center gap-2">
          <div className="grid h-11 grid-cols-[2.5rem_minmax(4.5rem,1fr)_2.5rem] overflow-hidden rounded-xl border border-slate-200 bg-slate-50">
            <button
              className={stepperButtonClass}
              type="button"
              disabled={entry.workRate <= 20}
              onClick={() => onChange("workRate", Math.max(20, entry.workRate - 5))}
            >
              −
            </button>
            <output className="grid place-items-center border-x border-slate-200 bg-white px-1 text-sm font-black text-slate-950">
              {entry.workRate} %
            </output>
            <button
              className={stepperButtonClass}
              type="button"
              disabled={entry.workRate >= 100}
              onClick={() => onChange("workRate", Math.min(100, entry.workRate + 5))}
            >
              +
            </button>
          </div>
          <ApplyToYearButton
            label="le temps de travail"
            onClick={() => onApplyToYear("workRate")}
          />
        </div>
      </section>

      <section>
        <div className="mb-3">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.18em] text-blue-600">
              Planification
            </p>
            <h2 className="text-xl font-black tracking-tight text-slate-950">
              Mes absences
            </h2>
          </div>
        </div>
        <div className="space-y-2.5">
          {ABSENCE_SEGMENTS.map(({ key, label, icon: Icon, softClass }) => (
            <InputRow
              icon={Icon}
              iconClass={softClass}
              key={key}
              label={label}
              value={entry[key]}
              max={stats.contracted}
              onChange={(value) => onChange(key, value)}
              onApplyToYear={() => onApplyToYear(key)}
            />
          ))}
        </div>

        <div
          className="mt-4 space-y-2 px-1 text-xs sm:text-sm"
          aria-label="Jours fériés et vacances scolaires"
        >
          {holidays.length ? (
            <p className="flex items-start gap-2 text-slate-500">
              <Sun className="mt-0.5 size-4 shrink-0 text-amber-500" aria-hidden="true" />
              <span>
                <strong className="font-extrabold text-slate-800">Jours fériés : </strong>
                <span className="font-medium">
                  {holidays
                    .map((item) => `${item.name} · ${formatDate(item.date)}`)
                    .join(" · ")}
                </span>
              </span>
            </p>
          ) : null}

          {schoolBreaks.length ? (
            <p className="flex items-start gap-2 text-slate-500">
              <CalendarRange
                className="mt-0.5 size-4 shrink-0 text-blue-600"
                aria-hidden="true"
              />
              <span>
                <strong className="font-extrabold text-slate-800">
                  Vacances scolaires :{" "}
                </strong>
                <span className="font-medium">
                  {schoolBreaks.map(formatRange).join(" · ")}
                </span>
              </span>
            </p>
          ) : null}

          {!holidays.length && !schoolBreaks.length ? (
            <p className="font-medium text-slate-400">
              Aucun jour férié ni vacances scolaires ce mois-ci.
            </p>
          ) : null}

          {!SCHOOL_BREAKS[String(startYear)]?.[zone]?.length ? (
            <p className="font-medium text-slate-400">
              Les dates scolaires de cette année ne sont pas encore publiées.
            </p>
          ) : null}
        </div>
      </section>

      <label className="block rounded-2xl border border-slate-200/80 bg-white p-3 shadow-sm sm:p-4">
        <span className="mb-2 block text-sm font-extrabold text-slate-900">Notes</span>
        <textarea
          className="min-h-20 w-full resize-y rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm font-medium text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-100"
          value={entry.note}
          maxLength={300}
          placeholder="Ex. formation, mandat, congés d’été…"
          onChange={(event) => onChange("note", event.target.value)}
        />
      </label>
    </div>
  );
}
