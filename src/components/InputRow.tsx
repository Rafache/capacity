import { CopyPlus, type LucideIcon } from "lucide-react";
import { formatNumber } from "../i18n/formatters";
import { t } from "../i18n/fr";

export function InputRow({
  icon: Icon,
  iconClass,
  label,
  value,
  min = 0,
  max,
  step = 0.5,
  unit,
  onChange,
  onApplyToYear,
  grouped = false,
}: {
  icon: LucideIcon;
  iconClass: string;
  label: string;
  value: number;
  min?: number;
  max: number;
  step?: number;
  unit: string;
  onChange: (value: number) => void;
  onApplyToYear: () => void;
  grouped?: boolean;
}) {
  const formattedValue = formatNumber(value);

  const changeValue = (raw: string) => {
    const parsed = Number(raw.replace(",", "."));
    if (!Number.isFinite(parsed)) return;
    const snapped = Math.round(parsed / step) * step;
    onChange(Math.min(max, Math.max(min, Math.round(snapped * 100) / 100)));
  };

  const controlClass =
    "grid size-8 place-items-center text-lg font-bold text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:text-slate-300 disabled:hover:bg-transparent sm:size-10 sm:text-xl";
  const containerClass = grouped
    ? "flex min-w-0 items-center gap-2 px-2.5 py-2.5 sm:gap-3 sm:px-4 sm:py-3"
    : "flex min-w-0 items-center gap-2 rounded-xl border border-slate-200/80 bg-white p-2.5 shadow-sm transition hover:border-slate-300 sm:gap-3 sm:rounded-2xl sm:p-4";

  return (
    <div className={containerClass}>
      <span
        className={`grid size-9 shrink-0 place-items-center rounded-xl ${iconClass} sm:size-11 sm:rounded-2xl`}
      >
        <Icon className="size-4 sm:size-5" aria-hidden="true" />
      </span>
      <span className="min-w-0 flex-1">
        <strong className="block truncate whitespace-nowrap text-[11px] font-bold leading-none text-slate-900 sm:text-sm">
          {label}
        </strong>
      </span>
      <div className="flex shrink-0 flex-nowrap items-center gap-1.5 sm:gap-2">
        <div className="grid h-9 shrink-0 grid-cols-[2rem_4rem_2rem] overflow-hidden rounded-lg border border-slate-200 bg-slate-50 sm:h-11 sm:grid-cols-[2.5rem_5rem_2.5rem] sm:rounded-xl">
          <button
            className={controlClass}
            type="button"
            disabled={value <= min}
            onClick={() => onChange(Math.max(min, value - step))}
            aria-label={`${t.inputs.reduce} ${label}`}
          >
            −
          </button>
          <span className="flex min-w-0 items-center justify-center gap-1 border-x border-slate-200 bg-white px-1">
            <input
              className="min-w-0 flex-1 bg-transparent text-right text-[16px] font-black leading-none text-slate-950 outline-none sm:text-sm"
              type="text"
              inputMode="decimal"
              value={formattedValue}
              aria-label={`${label} ${t.inputs.valueIn} ${unit === t.units.percent ? t.inputs.valueInPercent : t.inputs.valueInDays}`}
              onChange={(event) => changeValue(event.target.value)}
            />
            <small className="shrink-0 text-xs font-black text-slate-950 sm:text-sm">
              {unit}
            </small>
          </span>
          <button
            className={controlClass}
            type="button"
            disabled={value >= max}
            onClick={() => onChange(Math.min(max, value + step))}
            aria-label={`${t.inputs.increase} ${label}`}
          >
            +
          </button>
        </div>
        <button
          className="grid size-9 shrink-0 place-items-center rounded-lg border border-blue-100 bg-blue-50 text-blue-600 transition hover:border-blue-300 hover:bg-blue-100 hover:text-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-100 sm:size-11 sm:rounded-xl"
          type="button"
          onClick={onApplyToYear}
          aria-label={`${t.inputs.applyToYear} ${label} ${t.inputs.year}`}
          title={t.inputs.applyToYear}
        >
          <CopyPlus className="size-4" aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}
