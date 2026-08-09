import {
  Copy,
  Download,
  MoreVertical,
  Percent,
  RotateCcw,
  Trash2,
  Upload,
} from "lucide-react";
import { useEffect, useRef, type ChangeEvent } from "react";

type Props = {
  open: boolean;
  showCsvActions: boolean;
  showMonthlyActions: boolean;
  onToggle: () => void;
  onClose: () => void;
  onImport: (event: ChangeEvent<HTMLInputElement>) => void;
  onExport: () => void;
  onApplyWorkRate: () => void;
  onCopyNext: () => void;
  onResetMonth: () => void;
  onClear: () => void;
};

const itemClass =
  "flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-bold text-slate-700 transition hover:bg-slate-100 hover:text-slate-950 focus:outline-none focus:ring-2 focus:ring-blue-200";

export function ActionMenu({
  open,
  showCsvActions,
  showMonthlyActions,
  onToggle,
  onClose,
  onImport,
  onExport,
  onApplyWorkRate,
  onCopyNext,
  onResetMonth,
  onClear,
}: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) return;

    const handlePointerDown = (event: PointerEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) onClose();
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open, onClose]);

  const runAction = (action: () => void) => {
    action();
    onClose();
  };

  return (
    <div className="relative" ref={containerRef}>
      <button
        className={`grid size-11 place-items-center rounded-2xl border transition focus:outline-none focus:ring-4 focus:ring-blue-100 ${
          open
            ? "border-blue-300 bg-blue-50 text-blue-700"
            : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50 hover:text-slate-950"
        }`}
        type="button"
        onClick={onToggle}
        aria-label="Ouvrir le menu des actions"
        aria-haspopup="menu"
        aria-expanded={open}
      >
        <MoreVertical className="size-5" aria-hidden="true" />
      </button>

      {open && (
        <div
          className="absolute right-0 top-full z-50 mt-2 w-72 rounded-2xl border border-slate-200 bg-white p-2 shadow-[0_18px_60px_rgba(15,23,42,0.18)]"
          role="menu"
          aria-label="Actions"
        >
          {showCsvActions && (
            <>
              <p className="px-3 pb-1 pt-2 text-[10px] font-black uppercase tracking-[0.16em] text-slate-400">
                Données
              </p>
              <button
                className={itemClass}
                type="button"
                role="menuitem"
                onClick={() => fileRef.current?.click()}
              >
                <Upload className="size-4 text-blue-600" aria-hidden="true" />
                <span>Importer un CSV</span>
              </button>
              <button
                className={itemClass}
                type="button"
                role="menuitem"
                onClick={() => runAction(onExport)}
              >
                <Download className="size-4 text-blue-600" aria-hidden="true" />
                <span>Exporter en CSV</span>
              </button>
            </>
          )}

          {showMonthlyActions && (
            <>
              <p className="px-3 pb-1 pt-2 text-[10px] font-black uppercase tracking-[0.16em] text-slate-400">
                Mois sélectionné
              </p>
              <button
                className={itemClass}
                type="button"
                role="menuitem"
                onClick={() => runAction(onApplyWorkRate)}
              >
                <Percent className="size-4 text-blue-600" aria-hidden="true" />
                <span>Appliquer le % à l’année</span>
              </button>
              <button
                className={itemClass}
                type="button"
                role="menuitem"
                onClick={() => runAction(onCopyNext)}
              >
                <Copy className="size-4 text-blue-600" aria-hidden="true" />
                <span>Copier vers le mois suivant</span>
              </button>
              <button
                className={`${itemClass} text-amber-700 hover:bg-amber-50 hover:text-amber-800`}
                type="button"
                role="menuitem"
                onClick={() => runAction(onResetMonth)}
              >
                <RotateCcw className="size-4" aria-hidden="true" />
                <span>Réinitialiser ce mois</span>
              </button>
            </>
          )}

          <div className="my-2 h-px bg-slate-200" role="separator" />
          <button
            className={`${itemClass} text-red-700 hover:bg-red-50 hover:text-red-800`}
            type="button"
            role="menuitem"
            onClick={() => runAction(onClear)}
          >
            <Trash2 className="size-4" aria-hidden="true" />
            <span>Effacer toutes les données</span>
          </button>
        </div>
      )}

      {showCsvActions && (
        <input
          ref={fileRef}
          className="sr-only"
          type="file"
          accept=".csv,text/csv"
          onChange={onImport}
        />
      )}
    </div>
  );
}
