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
}> = [
  { key: "available", label: "Disponible", icon: CircleCheckBig },
  { key: "leave", label: "Congés payés", icon: CalendarRange },
  { key: "rtt", label: "RTT", icon: Coffee },
  { key: "training", label: "Formations", icon: GraduationCap },
  { key: "other", label: "Autres", icon: BriefcaseBusiness },
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
    <div className="annual-view">
      <section className="kpis">
        <article>
          <span className="kpi-icon available-icon">
            <CircleCheckBig />
          </span>
          <strong>{formatNumber(annualAvailable)} j</strong>
          <small>Disponibles</small>
        </article>
        <article>
          <span className="kpi-icon unavailable-icon">
            <CalendarX2 />
          </span>
          <strong>{formatNumber(annualUnavailable)} j</strong>
          <small>Indisponibilités</small>
        </article>
        <article>
          <span className="kpi-icon rate-icon">
            <Gauge />
          </span>
          <strong>{annualRate} %</strong>
          <small>Capacité</small>
        </article>
      </section>
      <section className="monthly-bars">
        <div className="table-heading">
          <h2>Capacité par mois</h2>
        </div>
        <div
          className="annual-table"
          role="table"
          aria-label="Capacité mensuelle en jours"
        >
          <div className="annual-table-header" role="row">
            <span role="columnheader">Mois</span>
            <span
              className="workRate"
              role="columnheader"
              aria-label="Temps de travail"
              title="Temps de travail"
            >
              <Clock3 aria-hidden="true" />
            </span>
            {SEGMENTS.map(({ key, label, icon: Icon }) => (
              <span
                className={key}
                key={key}
                role="columnheader"
                aria-label={label}
                title={label}
              >
                <Icon aria-hidden="true" />
              </span>
            ))}
          </div>
          {stats.map((item, index) => (
            <button
              className="annual-table-row annual-row-button"
              role="row"
              key={MONTHS_SHORT[index]}
              onClick={() => onMonthOpen(index)}
              aria-label={`Ouvrir ${MONTHS_SHORT[index]}`}
            >
              <span className="month-cell" role="rowheader">
                <strong>
                  {MONTHS_SHORT[index]}
                  {entries[index].note ? " •" : ""}
                </strong>
                <small>{item.baseline} ouvrés</small>
              </span>
              <span className="day-cell workRate" role="cell">
                {formatNumber(entries[index].workRate)}
                <small>%</small>
              </span>
              {SEGMENTS.map((segment) => (
                <span
                  className={`day-cell ${segment.key}`}
                  role="cell"
                  key={segment.key}
                >
                  {formatNumber(item[segment.key])}
                  <small>j</small>
                </span>
              ))}
            </button>
          ))}
          <div className="annual-table-row total-row" role="row">
            <div className="month-cell" role="rowheader">
              <strong>Total</strong>
              <small>{annualBaseline} ouvrés</small>
            </div>
            <span className="day-cell workRate" role="cell">
              {annualWorkRate}
              <small>%</small>
            </span>
            {SEGMENTS.map((segment) => (
              <span
                className={`day-cell ${segment.key}`}
                role="cell"
                key={segment.key}
              >
                {formatNumber(annualStats[segment.key])}
                <small>j</small>
              </span>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
