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
    <div className="action-menu-wrap" ref={containerRef}>
      <button
        className={`action-menu-trigger${open ? " active" : ""}`}
        type="button"
        onClick={onToggle}
        aria-label="Ouvrir le menu des actions"
        aria-haspopup="menu"
        aria-expanded={open}
      >
        <MoreVertical aria-hidden="true" />
      </button>

      {open && (
        <div className="action-menu-panel" role="menu" aria-label="Actions">
          {showCsvActions && (
            <>
              <button
                className="action-menu-item"
                type="button"
                role="menuitem"
                onClick={() => fileRef.current?.click()}
              >
                <Upload aria-hidden="true" />
                <span>Importer un CSV</span>
              </button>
              <button
                className="action-menu-item"
                type="button"
                role="menuitem"
                onClick={() => runAction(onExport)}
              >
                <Download aria-hidden="true" />
                <span>Exporter en CSV</span>
              </button>
            </>
          )}

          {showMonthlyActions && (
            <>
              <button
                className="action-menu-item"
                type="button"
                role="menuitem"
                onClick={() => runAction(onApplyWorkRate)}
              >
                <Percent aria-hidden="true" />
                <span>Appliquer le % à l’année</span>
              </button>
              <button
                className="action-menu-item"
                type="button"
                role="menuitem"
                onClick={() => runAction(onCopyNext)}
              >
                <Copy aria-hidden="true" />
                <span>Copier vers le mois suivant</span>
              </button>
              <button
                className="action-menu-item warning-action"
                type="button"
                role="menuitem"
                onClick={() => runAction(onResetMonth)}
              >
                <RotateCcw aria-hidden="true" />
                <span>Réinitialiser ce mois</span>
              </button>
            </>
          )}

          <div className="action-menu-divider" role="separator" />
          <button
            className="action-menu-item danger-action"
            type="button"
            role="menuitem"
            onClick={() => runAction(onClear)}
          >
            <Trash2 aria-hidden="true" />
            <span>Effacer toutes les données</span>
          </button>
        </div>
      )}

      {showCsvActions && (
        <input
          ref={fileRef}
          className="hidden-input"
          type="file"
          accept=".csv,text/csv"
          onChange={onImport}
        />
      )}
    </div>
  );
}
