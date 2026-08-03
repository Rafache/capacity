import { CalendarRange, Download, MoreVertical, Trash2, Upload } from "lucide-react";
import { createPortal } from "react-dom";
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type ChangeEvent,
} from "react";
import type { Zone } from "../types";

type Props = {
  open: boolean;
  years: number[];
  startYear: number;
  onToggle: () => void;
  onClose: () => void;
  onFiscalYearChange: (startYear: number) => void;
  onImport: (event: ChangeEvent<HTMLInputElement>) => void;
  onExport: () => void;
  zone: Zone;
  onZoneChange: (zone: Zone) => void;
  onClear: () => void;
};

const itemClass =
  "flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-bold text-slate-700 transition hover:bg-slate-100 hover:text-slate-950 focus:outline-none focus:ring-2 focus:ring-blue-200";

export function ActionMenu({
  open,
  years,
  startYear,
  onToggle,
  onClose,
  onFiscalYearChange,
  onImport,
  onExport,
  zone,
  onZoneChange,
  onClear,
}: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const [menuPosition, setMenuPosition] = useState<{
    top: number;
    right: number;
  } | null>(null);

  const updateMenuPosition = useCallback(() => {
    const trigger = triggerRef.current;
    if (!trigger) return;

    const triggerRect = trigger.getBoundingClientRect();
    const appHeader = trigger.closest("[data-app-header]");
    const headerBottom = appHeader?.getBoundingClientRect().bottom;

    setMenuPosition({
      top: Math.max(headerBottom ?? 0, triggerRect.bottom) + 8,
      right: Math.max(12, window.innerWidth - triggerRect.right),
    });
  }, []);

  useEffect(() => {
    if (!open) return;

    const handlePointerDown = (event: PointerEvent) => {
      const target = event.target as Node;
      if (!containerRef.current?.contains(target) && !menuRef.current?.contains(target)) {
        onClose();
      }
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

  useLayoutEffect(() => {
    if (!open) {
      setMenuPosition(null);
      return;
    }

    updateMenuPosition();
    window.addEventListener("resize", updateMenuPosition);
    document.addEventListener("scroll", updateMenuPosition, true);

    return () => {
      window.removeEventListener("resize", updateMenuPosition);
      document.removeEventListener("scroll", updateMenuPosition, true);
    };
  }, [open, updateMenuPosition]);

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
        aria-label={open ? "Fermer le menu des actions" : "Ouvrir le menu des actions"}
        aria-haspopup="menu"
        aria-expanded={open}
        ref={triggerRef}
      >
        <MoreVertical className="size-5" aria-hidden="true" />
      </button>

      {open &&
        typeof document !== "undefined" &&
        createPortal(
          <div
            className="fixed z-[90] max-h-[calc(100dvh-1.5rem)] w-72 max-w-[calc(100vw-1.5rem)] overflow-y-auto rounded-2xl border border-slate-200 bg-white p-2 shadow-[0_18px_60px_rgba(15,23,42,0.18)]"
            role="menu"
            aria-label="Actions"
            ref={menuRef}
            style={{
              top: menuPosition?.top ?? 0,
              right: menuPosition?.right ?? 12,
              visibility: menuPosition ? "visible" : "hidden",
            }}
          >
            <p className="px-3 pb-1 pt-2 text-[10px] font-black uppercase tracking-[0.16em] text-slate-400">
              Année fiscale
            </p>
            <label className="relative block px-1 pb-2">
              <span className="sr-only">Année fiscale</span>
              <select
                className="h-10 w-full appearance-none rounded-xl border border-slate-200 bg-slate-50 px-3 pr-8 text-sm font-extrabold text-slate-900 outline-none transition hover:border-slate-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                value={startYear}
                onChange={(event) =>
                  runAction(() => onFiscalYearChange(Number(event.target.value)))
                }
              >
                {years.map((year) => (
                  <option key={year} value={year}>
                    {year} — {year + 1}
                  </option>
                ))}
              </select>
              <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-xs text-slate-500">
                ▾
              </span>
            </label>

            <p className="mt-2 px-3 pb-1 pt-2 text-[10px] font-black uppercase tracking-[0.16em] text-slate-400">
              Vacances scolaires
            </p>
            <div
              className="grid grid-cols-3 gap-1 px-1 pb-1"
              role="group"
              aria-label="Zone scolaire"
            >
              {["A", "B", "C"].map((item) => {
                const schoolZone = item as Zone;

                return (
                  <button
                    className={`rounded-xl px-2 py-2 text-xs font-extrabold transition focus:outline-none focus:ring-2 focus:ring-blue-200 ${
                      zone === schoolZone
                        ? "bg-slate-950 text-white"
                        : "text-slate-500 hover:bg-slate-100 hover:text-slate-900"
                    }`}
                    key={schoolZone}
                    type="button"
                    role="menuitemradio"
                    aria-checked={zone === schoolZone}
                    onClick={() => runAction(() => onZoneChange(schoolZone))}
                  >
                    <span className="inline-flex items-center gap-1.5">
                      {zone === schoolZone ? (
                        <CalendarRange className="size-3.5" aria-hidden="true" />
                      ) : null}
                      Zone {schoolZone}
                    </span>
                  </button>
                );
              })}
            </div>

            <p className="mt-2 px-3 pb-1 pt-2 text-[10px] font-black uppercase tracking-[0.16em] text-slate-400">
              Données
            </p>
            <button
              className={itemClass}
              type="button"
              role="menuitem"
              onClick={() => {
                onClose();
                fileRef.current?.click();
              }}
            >
              <Upload className="size-4 text-blue-600" aria-hidden="true" />
              <span>Importer</span>
            </button>
            <button
              className={itemClass}
              type="button"
              role="menuitem"
              onClick={() => runAction(onExport)}
            >
              <Download className="size-4 text-blue-600" aria-hidden="true" />
              <span>Exporter</span>
            </button>

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
          </div>,
          document.body,
        )}

      <input
        ref={fileRef}
        className="sr-only"
        type="file"
        accept=".csv,text/csv"
        onChange={onImport}
      />
    </div>
  );
}
