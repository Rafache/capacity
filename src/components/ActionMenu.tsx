import { CalendarRange, Download, MoreVertical, Trash2, Upload } from "lucide-react";
import { useId, useRef, type ChangeEvent } from "react";
import { t } from "../i18n/fr";
import type { Zone } from "../types";

type Props = {
  years: number[];
  startYear: number;
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
  years,
  startYear,
  onFiscalYearChange,
  onImport,
  onExport,
  zone,
  onZoneChange,
  onClear,
}: Props) {
  const fileRef = useRef<HTMLInputElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const menuId = useId();

  const runAction = (action: () => void) => {
    action();
    menuRef.current?.hidePopover();
  };

  return (
    <div className="action-menu relative">
      <button
        className="action-menu-trigger grid size-11 place-items-center rounded-2xl border border-slate-200 bg-white text-slate-600 transition hover:border-slate-300 hover:bg-slate-50 hover:text-slate-950 focus:outline-none focus:ring-4 focus:ring-blue-100"
        type="button"
        popoverTarget={menuId}
        aria-label={t.actions.openMenu}
      >
        <MoreVertical className="size-5" aria-hidden="true" />
      </button>

      <div
        ref={menuRef}
        className="action-menu-popover max-h-[calc(100dvh-1.5rem)] w-72 max-w-[calc(100vw-1.5rem)] overflow-y-auto rounded-2xl border border-slate-200 bg-white p-2 shadow-[0_18px_60px_rgba(15,23,42,0.18)]"
        id={menuId}
        popover="auto"
        aria-label={t.actions.menuLabel}
      >
        <p className="px-3 pb-1 pt-2 text-[10px] font-black uppercase tracking-[0.16em] text-slate-400">
          {t.actions.fiscalYear}
        </p>
        <label className="relative block px-1 pb-2">
          <span className="sr-only">{t.actions.fiscalYear}</span>
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
          <span
            className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-xs text-slate-500"
            aria-hidden="true"
          >
            ▾
          </span>
        </label>

        <p className="mt-2 px-3 pb-1 pt-2 text-[10px] font-black uppercase tracking-[0.16em] text-slate-400">
          {t.actions.schoolBreaks}
        </p>
        <div
          className="grid grid-cols-3 gap-1 px-1 pb-1"
          aria-label={t.actions.schoolZone}
        >
          {(["A", "B", "C"] as const).map((schoolZone) => (
            <button
              className={`rounded-xl px-2 py-2 text-xs font-extrabold transition focus:outline-none focus:ring-2 focus:ring-blue-200 ${
                zone === schoolZone
                  ? "bg-slate-950 text-white"
                  : "text-slate-500 hover:bg-slate-100 hover:text-slate-900"
              }`}
              key={schoolZone}
              type="button"
              aria-pressed={zone === schoolZone}
              onClick={() => runAction(() => onZoneChange(schoolZone))}
            >
              <span className="inline-flex items-center gap-1.5">
                {zone === schoolZone ? (
                  <CalendarRange className="size-3.5" aria-hidden="true" />
                ) : null}
                {t.actions.zone} {schoolZone}
              </span>
            </button>
          ))}
        </div>

        <p className="mt-2 px-3 pb-1 pt-2 text-[10px] font-black uppercase tracking-[0.16em] text-slate-400">
          {t.actions.data}
        </p>
        <button
          className={itemClass}
          type="button"
          onClick={() => {
            menuRef.current?.hidePopover();
            fileRef.current?.click();
          }}
        >
          <Upload className="size-4 text-blue-600" aria-hidden="true" />
          <span>{t.actions.importCsv}</span>
        </button>
        <button className={itemClass} type="button" onClick={() => runAction(onExport)}>
          <Download className="size-4 text-blue-600" aria-hidden="true" />
          <span>{t.actions.exportCsv}</span>
        </button>

        <div className="my-2 h-px bg-slate-200" role="separator" />
        <button
          className={`${itemClass} text-red-700 hover:bg-red-50 hover:text-red-800`}
          type="button"
          onClick={() => runAction(onClear)}
        >
          <Trash2 className="size-4" aria-hidden="true" />
          <span>{t.actions.clearData}</span>
        </button>
      </div>

      <input
        ref={fileRef}
        className="sr-only"
        type="file"
        accept=".csv,text/csv"
        aria-label={t.actions.importCsv}
        onChange={onImport}
      />
    </div>
  );
}
