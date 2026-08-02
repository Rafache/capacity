import { CAPACITY_SEGMENTS } from "./capacitySegments";
import type { SegmentKey } from "../types";

type Props = {
  values: Record<SegmentKey, number>;
  total?: number;
  label?: string;
  className?: string;
};

const formatNumber = (value: number) =>
  Number.isInteger(value) ? String(value) : value.toFixed(1).replace(".", ",");

export function CapacityBar({
  values,
  total,
  label = "Répartition de la capacité",
  className = "",
}: Props) {
  const valuesTotal = CAPACITY_SEGMENTS.reduce(
    (sum, segment) => sum + Math.max(0, values[segment.key]),
    0,
  );
  const scale = Math.max(0, total ?? valuesTotal, valuesTotal);
  const description = CAPACITY_SEGMENTS.map(
    (segment) => `${segment.label} : ${formatNumber(values[segment.key])} j`,
  ).join(", ");

  return (
    <span
      className={`flex h-1.5 min-w-0 overflow-hidden rounded-full bg-slate-100 ${className}`}
      role="img"
      aria-label={`${label}. ${description}`}
    >
      {CAPACITY_SEGMENTS.map((segment) => {
        const value = Math.max(0, values[segment.key]);
        const width = scale > 0 ? (value / scale) * 100 : 0;

        return (
          <span
            className={`h-full min-w-0 ${segment.barClass}`}
            key={segment.key}
            style={{ width: `${width}%` }}
            title={`${segment.label} : ${formatNumber(value)} j`}
          />
        );
      })}
    </span>
  );
}
