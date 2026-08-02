import { useState } from "react";
import { CopyPlus, type LucideIcon } from "lucide-react";

export function ApplyToYearButton({
  label,
  onClick,
}: {
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      className="grid size-11 shrink-0 place-items-center rounded-xl border border-blue-100 bg-blue-50 text-blue-600 transition hover:border-blue-300 hover:bg-blue-100 hover:text-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-100"
      type="button"
      onClick={onClick}
      aria-label={`Répliquer ${label} aux 12 mois`}
      title="Répliquer sur l’année"
    >
      <CopyPlus className="size-4.5" aria-hidden="true" />
    </button>
  );
}

export function InputRow({
  icon: Icon,
  iconClass,
  label,
  value,
  min = 0,
  max,
  step = 0.5,
  unit = "j",
  onChange,
  onApplyToYear,
}: {
  icon: LucideIcon;
  iconClass: string;
  label: string;
  value: number;
  min?: number;
  max: number;
  step?: number;
  unit?: string;
  onChange: (value: number) => void;
  onApplyToYear: () => void;
}) {
  const [editing, setEditing] = useState(false);
  const formattedValue = Number.isInteger(value)
    ? String(value)
    : value.toFixed(1).replace(".", ",");

  const commit = (raw: string) => {
    const parsed = Number(raw.replace(",", "."));
    if (Number.isFinite(parsed)) {
      const snapped = Math.round(parsed / step) * step;
      onChange(Math.min(max, Math.max(min, Math.round(snapped * 100) / 100)));
    }
    setEditing(false);
  };

  const formattedUnit = unit === "%" ? "%" : unit;

  const controlClass =
    "grid size-10 place-items-center text-xl font-bold text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:text-slate-300 disabled:hover:bg-transparent";

  return (
    <div className="grid grid-cols-[auto_minmax(0,1fr)] items-center gap-3 rounded-2xl border border-slate-200/80 bg-white p-3 shadow-sm transition hover:border-slate-300 sm:grid-cols-[auto_minmax(0,1fr)_auto] sm:p-4">
      <span
        className={`grid size-11 shrink-0 place-items-center rounded-2xl ${iconClass}`}
      >
        <Icon className="size-5" aria-hidden="true" />
      </span>
      <span className="min-w-0">
        <strong className="block whitespace-nowrap text-xs font-bold leading-none text-slate-900 sm:text-sm">
          {label}
        </strong>
      </span>
      <div className="col-span-2 flex w-full flex-nowrap items-center justify-end gap-2 sm:col-span-1">
        <div className="grid h-11 shrink-0 grid-cols-[2.5rem_5rem_2.5rem] overflow-hidden rounded-xl border border-slate-200 bg-slate-50">
          <button
            className={controlClass}
            disabled={value <= min}
            onClick={() => onChange(Math.max(min, value - step))}
            aria-label={`Réduire ${label}`}
          >
            −
          </button>
          {editing ? (
            <input
              className="w-full min-w-0 whitespace-nowrap border-x border-slate-200 bg-white px-1 text-center text-[16px] font-black leading-none text-slate-950 outline-none focus:bg-blue-50 sm:text-sm"
              autoFocus
              inputMode="decimal"
              defaultValue={formattedValue}
              aria-label={`${label} en ${unit === "%" ? "pourcentage" : "jours"}`}
              onBlur={(event) => commit(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") commit(event.currentTarget.value);
                if (event.key === "Escape") setEditing(false);
              }}
            />
          ) : (
            <button
              className="min-w-0 whitespace-nowrap border-x border-slate-200 bg-white px-1 text-sm font-black text-slate-950 transition hover:bg-blue-50 hover:text-blue-700"
              type="button"
              onClick={() => setEditing(true)}
            >
              {formattedValue} {formattedUnit}
            </button>
          )}
          <button
            className={controlClass}
            disabled={value >= max}
            onClick={() => onChange(Math.min(max, value + step))}
            aria-label={`Augmenter ${label}`}
          >
            +
          </button>
        </div>
        <ApplyToYearButton label={label} onClick={onApplyToYear} />
      </div>
    </div>
  );
}
