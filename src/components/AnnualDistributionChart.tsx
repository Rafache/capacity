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

const polar = (angle: number, radius: number) => {
  const radians = ((angle - 90) * Math.PI) / 180;
  return {
    x: 50 + radius * Math.cos(radians),
    y: 50 + radius * Math.sin(radians),
  };
};

const arcPath = (start: number, end: number) => {
  const startPoint = polar(start, 48);
  const endPoint = polar(end, 48);
  const largeArc = end - start > 180 ? 1 : 0;
  return `M 50 50 L ${startPoint.x} ${startPoint.y} A 48 48 0 ${largeArc} 1 ${endPoint.x} ${endPoint.y} Z`;
};

type Props = {
  summary: CapacityTotals;
};

export function AnnualDistributionChart({ summary }: Props) {
  const total = CAPACITY_SEGMENTS.reduce(
    (sum, segment) => sum + Math.max(0, summary[segment.key]),
    0,
  );
  const slices = CAPACITY_SEGMENTS.map((segment, index) => {
    const value = Math.max(0, summary[segment.key]);
    const previous = CAPACITY_SEGMENTS.slice(0, index).reduce(
      (sum, item) => sum + Math.max(0, summary[item.key]),
      0,
    );
    const start = total ? (previous / total) * 360 : 0;
    const end = total ? ((previous + value) / total) * 360 : 0;
    const middle = start + (end - start) / 2;
    const percent = total ? value / total : 0;
    const labelRadius = percent < 0.05 ? 42 : 31;
    const label = polar(middle, labelRadius);
    return { ...segment, value, start, end, label, percent };
  });
  const description = slices
    .map(
      ({ key, percent }) =>
        `${t.segments[key]} : ${formatNumber(percent * 100)} %`,
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

      <div className="mt-3 flex justify-center sm:mt-4">
        <svg
          className="aspect-square w-[min(82vw,22rem)] drop-shadow-sm sm:w-[24rem]"
          viewBox="0 0 100 100"
          role="img"
          aria-label={`${t.summary.annualDistribution}. ${description}`}
        >
          {total ? (
            slices.map(({ key, value, start, end, label, percent }) =>
              value > 0 ? (
                <g key={key}>
                  <path d={arcPath(start, end)} fill={COLORS[key]} />
                  <text
                    x={label.x}
                    y={label.y}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fill="white"
                    fontSize={percent < 0.03 ? 3.2 : percent < 0.08 ? 4 : 5}
                    fontWeight="800"
                    stroke="rgba(15,23,42,0.28)"
                    strokeWidth="0.35"
                    paintOrder="stroke"
                  >
                    {formatNumber(percent * 100)}%
                  </text>
                </g>
              ) : null,
            )
          ) : (
            <circle cx="50" cy="50" r="48" fill="#e2e8f0" />
          )}
        </svg>
      </div>
    </section>
  );
}
