import { useState } from "react";
import type { LucideIcon } from "lucide-react";

export function InputRow({
  icon: Icon,
  iconClass,
  label,
  value,
  max,
  onChange,
}: {
  icon: LucideIcon;
  iconClass: string;
  label: string;
  value: number;
  max: number;
  onChange: (value: number) => void;
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

  return (
    <div className="input-row">
      <span className={`row-icon ${iconClass}`}>
        <Icon aria-hidden="true" />
      </span>
      <span className="row-copy">
        <strong>{label}</strong>
      </span>
      <div className="stepper">
        <button
          disabled={value <= 0}
          onClick={() => onChange(Math.max(0, value - 0.5))}
          aria-label={`Réduire ${label}`}
        >
          −
        </button>
        {editing ? (
          <input
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
          <button className="editable-value" onClick={() => setEditing(true)}>
            {formattedValue} j
          </button>
        )}
        <button
          disabled={value >= max}
          onClick={() => onChange(Math.min(max, value + 0.5))}
          aria-label={`Augmenter ${label}`}
        >
          +
        </button>
      </div>
    </div>
  );
}
