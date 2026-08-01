import type { LucideIcon } from "lucide-react";

export function InputRow({ icon: Icon, iconClass, label, value, onMinus, onPlus }: { icon: LucideIcon; iconClass: string; label: string; value: number; onMinus: () => void; onPlus: () => void }) {
  const formattedValue = Number.isInteger(value) ? String(value) : value.toFixed(1).replace(".", ",");
  return <div className="input-row"><span className={`row-icon ${iconClass}`}><Icon aria-hidden="true" /></span><span className="row-copy"><strong>{label}</strong></span><div className="stepper"><button onClick={onMinus} aria-label={`Réduire ${label}`}>−</button><output>{formattedValue} j</output><button onClick={onPlus} aria-label={`Augmenter ${label}`}>+</button></div></div>;
}
