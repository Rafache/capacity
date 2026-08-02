import type { LucideIcon } from "lucide-react";
import { CapacityBar } from "./CapacityBar";
import { CAPACITY_SEGMENTS } from "./capacitySegments";
import type { SegmentKey } from "../types";

type SummaryTone = "neutral" | "positive" | "negative" | "accent";

export type SummaryItem = {
  icon: LucideIcon;
  label: string;
  value: string | number;
  unit?: string;
  tone: SummaryTone;
};

type Props = {
  title: string;
  eyebrow?: string | null;
  meta?: string;
  items: SummaryItem[];
  barValues?: Record<SegmentKey, number>;
  barTotal?: number;
  barLabel?: string;
};

const toneClasses: Record<SummaryTone, { label: string; value: string }> = {
  neutral: {
    label: "text-slate-400",
    value: "text-white",
  },
  positive: {
    label: "text-emerald-300",
    value: "text-emerald-300",
  },
  negative: {
    label: "text-red-300",
    value: "text-red-300",
  },
  accent: {
    label: "text-blue-300",
    value: "text-blue-300",
  },
};

export function CapacitySummary({
  title,
  eyebrow = "Synthèse",
  meta,
  items,
  barValues,
  barTotal,
  barLabel,
}: Props) {
  const distributionLabel = barLabel ?? `Répartition de ${title.toLowerCase()}`;

  return (
    <section
      className="overflow-hidden rounded-[1.75rem] bg-gradient-to-br from-slate-950 via-slate-900 to-blue-950 p-5 text-white shadow-[0_20px_50px_rgba(15,23,42,0.24)] sm:p-6"
      aria-label={title}
    >
      <div className="mb-5 flex items-start justify-between gap-4">
        <div>
          {eyebrow ? (
            <p className="text-[10px] font-black uppercase tracking-[0.18em] text-blue-300">
              {eyebrow}
            </p>
          ) : null}
          <h2 className={eyebrow ? "text-lg font-black" : "text-xl font-black"}>
            {title}
          </h2>
        </div>
        {meta ? (
          <p className="max-w-44 text-right text-[11px] font-medium leading-snug text-slate-400 sm:max-w-none sm:text-xs">
            {meta}
          </p>
        ) : null}
      </div>

      <div className="grid grid-cols-3 divide-x divide-white/15">
        {items.map((item) => {
          const Icon = item.icon;
          const tone = toneClasses[item.tone];

          return (
            <article
              className="min-w-0 px-2 text-center sm:px-5"
              aria-label={`${item.label} : ${item.value}${item.unit ?? ""}`}
              key={item.label}
            >
              <span
                className={`flex items-center justify-center gap-1.5 whitespace-nowrap text-[9px] font-black uppercase tracking-[0.08em] sm:text-xs ${tone.label}`}
              >
                <Icon className="size-3.5 shrink-0" aria-hidden="true" />
                {item.label}
              </span>
              <strong
                className={`mt-2 block whitespace-nowrap text-3xl font-black tracking-tight sm:text-4xl ${tone.value}`}
              >
                {item.value}
                {item.unit ? (
                  <small className="ml-1 text-sm font-bold text-current opacity-70 sm:text-base">
                    {item.unit}
                  </small>
                ) : null}
              </strong>
            </article>
          );
        })}
      </div>

      {barValues ? (
        <div className="mt-5 border-t border-white/10 pt-4">
          <p className="mb-2 text-[10px] font-black uppercase tracking-[0.16em] text-slate-400">
            Répartition
          </p>
          <CapacityBar
            values={barValues}
            total={barTotal}
            label={distributionLabel}
            className="h-3 bg-white/10"
          />
          <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1.5">
            {CAPACITY_SEGMENTS.map(({ key, label, barClass }) => (
              <span
                className="flex items-center gap-1.5 text-[9px] font-semibold text-slate-400 sm:text-[10px]"
                key={key}
              >
                <span className={`size-1.5 shrink-0 rounded-full ${barClass}`} />
                {label}
              </span>
            ))}
          </div>
        </div>
      ) : null}
    </section>
  );
}
