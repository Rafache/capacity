import { CalendarDays, CalendarX2, Gauge } from "lucide-react";
import { CAPACITY_SEGMENTS } from "./capacitySegments";
import { formatNumber } from "../i18n/formatters";
import { t } from "../i18n/fr";
import type { SegmentKey } from "../types";

type Props = {
  title: string;
  baseline: number;
  absences: number;
  available: number;
  values: Record<SegmentKey, number>;
};

function CapacityBar({ values }: Pick<Props, "values">) {
  const segments = CAPACITY_SEGMENTS.map(({ key, barClass }) => ({
    key,
    barClass,
    value: Math.max(0, values[key]),
  }));
  const total = segments.reduce((sum, segment) => sum + segment.value, 0);
  const description = segments
    .map(({ key, value }) => `${t.segments[key]} : ${formatNumber(value)} ${t.units.day}`)
    .join(", ");

  return (
    <span
      className="flex h-3 min-w-0 overflow-hidden rounded-full bg-white/10"
      role="img"
      aria-label={`${t.summary.distribution}. ${description}`}
    >
      {segments.map(({ key, barClass, value }) => {
        if (!value || !total) return null;

        const percentage = (value / total) * 100;

        return (
          <span
            className={`relative flex h-full min-w-0 items-center justify-center overflow-hidden ${barClass}`}
            key={key}
            style={{ width: `${percentage}%` }}
          >
            <span
              aria-hidden="true"
              className="truncate whitespace-nowrap px-0.5 text-[8px] font-black leading-none text-white sm:text-[9px]"
            >
              {Math.round(percentage)}%
            </span>
          </span>
        );
      })}
    </span>
  );
}

export function CapacitySummary({ title, baseline, absences, available, values }: Props) {
  const metrics = [
    {
      icon: CalendarDays,
      label: t.summary.workingDays,
      value: baseline,
      classes: "text-white",
      labelClasses: "text-slate-400",
    },
    {
      icon: CalendarX2,
      label: t.summary.absences,
      value: absences,
      classes: "text-red-300",
      labelClasses: "text-red-300",
    },
    {
      icon: Gauge,
      label: t.summary.capacity,
      value: available,
      classes: "text-emerald-300",
      labelClasses: "text-emerald-300",
    },
  ];

  return (
    <section
      className="overflow-hidden rounded-[1.75rem] bg-gradient-to-br from-slate-950 via-slate-900 to-blue-950 p-5 text-white shadow-[0_20px_50px_rgba(15,23,42,0.24)] sm:p-6"
      aria-label={title}
    >
      <h2 className="mb-5 text-xl font-black">{title}</h2>

      <div className="grid grid-cols-3 divide-x divide-white/15">
        {metrics.map(({ icon: Icon, label, value, classes, labelClasses }) => (
          <article
            className="min-w-0 px-2 text-center sm:px-5"
            aria-label={`${label} : ${formatNumber(value)}${t.units.day}`}
            key={label}
          >
            <span
              className={`flex items-center justify-center gap-1.5 whitespace-nowrap text-[9px] font-black uppercase tracking-[0.08em] sm:text-xs ${labelClasses}`}
            >
              <Icon className="size-3.5 shrink-0" aria-hidden="true" />
              {label}
            </span>
            <strong
              className={`mt-2 block whitespace-nowrap text-3xl font-black tracking-tight sm:text-4xl ${classes}`}
            >
              {formatNumber(value)}
              <small className="ml-1 text-sm font-bold text-current opacity-70 sm:text-base">
                {t.units.day}
              </small>
            </strong>
          </article>
        ))}
      </div>

      <div className="mt-5 border-t border-white/10 pt-4">
        <p className="mb-2 text-[10px] font-black uppercase tracking-[0.16em] text-slate-400">
          {t.summary.distribution}
        </p>
        <CapacityBar values={values} />
        <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1.5">
          {CAPACITY_SEGMENTS.map(({ key, barClass }) => (
            <span
              className="flex items-center gap-1.5 text-[9px] font-semibold text-slate-400 sm:text-[10px]"
              key={key}
            >
              <span className={`size-1.5 shrink-0 rounded-full ${barClass}`} />
              {t.segments[key]}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
