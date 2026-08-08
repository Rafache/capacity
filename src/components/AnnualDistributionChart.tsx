import { CAPACITY_SEGMENTS } from "./capacitySegments";
import { formatNumber } from "../i18n/formatters";
import { t } from "../i18n/fr";
import type { CapacityTotals, SegmentKey } from "../types";

const COLORS: Record<SegmentKey, string> = {
  available: "var(--color-capacity-available)",
  leave: "var(--color-capacity-leave)",
  rtt: "var(--color-capacity-rtt)",
  training: "var(--color-capacity-training)",
  other: "var(--color-capacity-other)",
};

type Props = {
  summary: CapacityTotals;
};

export function AnnualDistributionChart({ summary }: Props) {
  const total = CAPACITY_SEGMENTS.reduce(
    (sum, segment) => sum + Math.max(0, summary[segment.key]),
    0,
  );
  let cursor = 0;
  const slices = CAPACITY_SEGMENTS.map((segment) => {
    const value = Math.max(0, summary[segment.key]);
    const start = cursor;
    const end = total ? cursor + (value / total) * 100 : cursor;
    cursor = end;
    return { ...segment, value, start, end };
  });
  const background = total
    ? `conic-gradient(${slices
        .map(({ key, start, end }) => `${COLORS[key]} ${start}% ${end}%`)
        .join(", ")})`
    : "#e2e8f0";
  const description = slices
    .map(
      ({ key, value }) =>
        `${t.segments[key]} : ${formatNumber(value)} ${t.units.day}`,
    )
    .join(", ");

  return (
    <section
      className="mt-3.5 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:mt-5 sm:rounded-3xl sm:p-5"
      aria-label={t.summary.annualDistribution}
    >
      <div>
        <h3 className="text-sm font-black tracking-tight text-slate-950 sm:text-base">
          {t.summary.annualDistribution}
        </h3>
        <p className="mt-0.5 text-[10px] font-medium text-slate-500 sm:text-xs">
          {t.summary.annualDistributionDescription}
        </p>
      </div>

      <div className="mt-4 grid grid-cols-[8rem_minmax(0,1fr)] items-center gap-4 sm:grid-cols-[10rem_minmax(0,1fr)] sm:gap-7">
        <div
          className="aspect-square w-full rounded-full shadow-inner ring-1 ring-slate-200"
          role="img"
          aria-label={`${t.summary.annualDistribution}. ${description}`}
          style={{ background }}
        />

        <div className="grid gap-2 sm:grid-cols-2 sm:gap-x-4">
          {slices.map(({ key, value, barClass }) => (
            <div className="min-w-0" key={key}>
              <div className="flex items-center gap-2 text-[10px] font-bold text-slate-600 sm:text-xs">
                <span className={`size-2 shrink-0 rounded-full ${barClass}`} />
                <span className="truncate">{t.segments[key]}</span>
              </div>
              <strong className="ml-4 mt-0.5 block text-sm font-black text-slate-950 sm:text-base">
                {formatNumber(value)} {t.units.day}
              </strong>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
