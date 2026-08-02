import { useState } from "react";
import { CalendarRange, type LucideIcon } from "lucide-react";

export function ApplyToYearButton({
  label,
  onClick,
}: {
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      className="grid size-11 shrink-0 place-items-center rounded-xl border border-slate-200 bg-white text-slate-500 transition hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-100"
      type="button"
      onClick={onClick}
      aria-label={`Appliquer ${label} aux 12 mois`}
      title="Appliquer à l’année"
    >
      <CalendarRange className="size-4" aria-hidden="true" />
    </button>
  );
}

export function InputRow({
  icon: Icon,
  iconClass,
  label,
  value,
  max,
  onChange,
  onApplyToYear,
}: {
  icon: LucideIcon;
  iconClass: string;
  label: string;
  value: number;
  max: number;
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
      onChange(Math.min(max, Math.max(0, Math.round(parsed * 2) / 2)));
    }
    setEditing(false);
  };

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
        <strong className="block truncate text-sm font-extrabold text-slate-900 sm:text-base">
          {label}
        </strong>
      </span>
      <div className="col-span-2 flex w-full flex-nowrap items-center justify-end gap-2 sm:col-span-1">
        <div className="grid h-11 shrink-0 grid-cols-[2.5rem_5rem_2.5rem] overflow-hidden rounded-xl border border-slate-200 bg-slate-50">
          <button
            className={controlClass}
            disabled={value <= 0}
            onClick={() => onChange(Math.max(0, value - 0.5))}
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
              aria-label={`${label} en jours`}
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
              {formattedValue} j
            </button>
          )}
          <button
            className={controlClass}
            disabled={value >= max}
            onClick={() => onChange(Math.min(max, value + 0.5))}
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
