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
import { InputRow } from "../components/InputRow";
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
    "Vacances d’été": "Été",
    Toussaint: "Toussaint",
    Noël: "Noël",
    Hiver: "Hiver",
    Printemps: "Printemps",
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
  onRequestApplyToYear: (field: EntryNumericKey) => void;
  onChange: (field: EntryNumericKey, value: number) => void;
};

export function MonthlyView({
  startYear,
  monthIndex,
  entry,
  stats,
  zone,
  onMonthChange,
  onRequestApplyToYear,
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
        afterBar={
          <div
            className="space-y-1.5 text-[11px] leading-snug sm:space-y-2 sm:text-sm"
            aria-label="Jours fériés et vacances scolaires"
          >
            {holidays.length ? (
              <p className="flex min-w-0 items-start gap-1.5 text-slate-300">
                <Sun
                  className="mt-0.5 size-3.5 shrink-0 text-amber-300"
                  aria-hidden="true"
                />
                <span className="min-w-0 flex-1">
                  <strong className="font-extrabold text-white/90">
                    Jours fériés :{" "}
                  </strong>
                  <span className="font-medium">
                    {holidays
                      .map((item) => `${item.name} · ${formatDate(item.date)}`)
                      .join(" · ")}
                  </span>
                </span>
              </p>
            ) : null}

            {schoolBreaks.length ? (
              <p className="flex min-w-0 items-start gap-1.5 text-slate-300">
                <CalendarRange
                  className="mt-0.5 size-3.5 shrink-0 text-blue-300"
                  aria-hidden="true"
                />
                <span className="min-w-0 flex-1">
                  <strong className="font-extrabold text-white/90">Vacances : </strong>
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
        }
      />

      <section aria-label="Temps de travail et absences">
        <div className="space-y-2.5">
          <InputRow
            icon={Clock3}
            iconClass="bg-blue-50 text-blue-600"
            label="Temps de travail"
            value={entry.workRate}
            min={20}
            max={100}
            step={5}
            unit="%"
            onChange={(value) => onChange("workRate", value)}
            onApplyToYear={() => onRequestApplyToYear("workRate")}
          />

          {ABSENCE_SEGMENTS.map(({ key, label, icon: Icon, softClass }) => (
            <InputRow
              icon={Icon}
              iconClass={softClass}
              key={key}
              label={label}
              value={entry[key]}
              max={stats.contracted}
              onChange={(value) => onChange(key, value)}
              onApplyToYear={() => onRequestApplyToYear(key)}
            />
          ))}
        </div>
      </section>
    </div>
  );
}
