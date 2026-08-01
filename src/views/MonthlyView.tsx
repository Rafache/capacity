import {
  BriefcaseBusiness,
  CalendarDays,
  CalendarRange,
  ChevronLeft,
  ChevronRight,
  Clock3,
  Coffee,
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

  return (
    <div className="monthly-view">
      <div className="month-switcher">
        <button
          onClick={() => onMonthChange((monthIndex + 11) % 12)}
          aria-label="Mois précédent"
        >
          <ChevronLeft />
        </button>
        <strong>
          {MONTHS_LONG[monthIndex]} {year}
        </strong>
        <button
          onClick={() => onMonthChange((monthIndex + 1) % 12)}
          aria-label="Mois suivant"
        >
          <ChevronRight />
        </button>
      </div>

      <section className="summary-card">
        <span className="summary-icon" aria-hidden="true">
          <CalendarDays />
        </span>
        <div className="summary-main">
          <strong>
            <span className="summary-value">{stats.baseline}</span>
            <span className="summary-unit">jours ouvrés</span>
          </strong>
          <small>
            {weekdays} jours en semaine − {weekdayHolidays} férié
            {weekdayHolidays > 1 ? "s" : ""}
          </small>
        </div>
        <div className="summary-stat available">
          <strong>
            <span className="summary-value">
              {formatNumber(stats.available)}
            </span>
            <span className="summary-unit">jours</span>
          </strong>
          <span>disponibles</span>
        </div>
        <div className="summary-stat rate">
          <strong>
            <span className="summary-value">{capacityRate}</span>
            <span className="summary-unit">%</span>
          </strong>
          <span>de capacité</span>
        </div>
      </section>

      <section className="input-row work-row">
        <span className="row-icon work-icon" aria-hidden="true">
          <Clock3 />
        </span>
        <span className="row-copy">
          <strong>Temps de travail</strong>
        </span>
        <div className="stepper percent-stepper">
          <button
            disabled={entry.workRate <= 20}
            onClick={() =>
              onChange("workRate", Math.max(20, entry.workRate - 5))
            }
          >
            −
          </button>
          <output>{entry.workRate} %</output>
          <button
            disabled={entry.workRate >= 100}
            onClick={() =>
              onChange("workRate", Math.min(100, entry.workRate + 5))
            }
          >
            +
          </button>
        </div>
      </section>

      <section className="absence-section">
        <h2>Mes absences</h2>
        <InputRow
          icon={CalendarRange}
          iconClass="leave-icon"
          label="Congés payés"
          value={entry.leave}
          max={stats.contracted}
          onChange={(value) => onChange("leave", value)}
        />
        <InputRow
          icon={Coffee}
          iconClass="rtt-icon"
          label="RTT"
          value={entry.rtt}
          max={stats.contracted}
          onChange={(value) => onChange("rtt", value)}
        />
        <InputRow
          icon={GraduationCap}
          iconClass="training-icon"
          label="Formations"
          value={entry.training}
          max={stats.contracted}
          onChange={(value) => onChange("training", value)}
        />
        <InputRow
          icon={BriefcaseBusiness}
          iconClass="other-icon"
          label="Autres"
          value={entry.other}
          max={stats.contracted}
          onChange={(value) => onChange("other", value)}
        />
      </section>

      <label className="note-field">
        <span>Note du mois</span>
        <textarea
          value={entry.note}
          maxLength={300}
          placeholder="Ex. formation, mandat, congés d’été…"
          onChange={(event) => onChange("note", event.target.value)}
        />
      </label>

      <section className="calendar-card">
        <h2>Calendrier du mois</h2>
        {showZones && (
          <div className="zones" aria-label="Zone scolaire">
            {(["A", "B", "C"] as Zone[]).map((item) => (
              <button
                key={item}
                className={zone === item ? "active" : ""}
                onClick={() => onZoneChange(item)}
              >
                Zone {item}
              </button>
            ))}
          </div>
        )}
        <div className="calendar-events">
          {holidays.map((item) => (
            <div className="calendar-event" key={item.name}>
              <span className="event-icon holiday">
                <Sun />
              </span>
              <span>
                {item.name} · {formatDate(item.date)}
              </span>
            </div>
          ))}
          {schoolBreaks.map((item) => (
            <div
              className="calendar-event"
              key={`${item.name}-${item.start}`}
            >
              <span className="event-icon school">
                <CalendarRange />
              </span>
              <span>{formatRange(item)}</span>
            </div>
          ))}
          {!holidays.length && !schoolBreaks.length && (
            <p className="empty-calendar">
              Aucun jour férié ni vacances scolaires ce mois-ci.
            </p>
          )}
          {!SCHOOL_BREAKS[String(startYear)]?.[zone]?.length && (
            <p className="empty-calendar">
              Les dates scolaires de cette année ne sont pas encore publiées.
            </p>
          )}
        </div>
      </section>
    </div>
  );
}
