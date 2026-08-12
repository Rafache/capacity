import { ChartNoAxesColumnIncreasing } from 'lucide-react';
import type { ChangeEvent } from 'react';
import { ActionMenu } from './ActionMenu';
import { t } from '../i18n/fr';
import type { Zone } from '../types';

export type ViewTab = 'monthly' | 'annual';

type Props = {
  tab: ViewTab;
  years: number[];
  startYear: number;
  zone: Zone;
  onTabChange: (tab: ViewTab) => void;
  onFiscalYearChange: (year: number) => void;
  onImport: (event: ChangeEvent<HTMLInputElement>) => void;
  onExport: () => void;
  onZoneChange: (zone: Zone) => void;
  onClear: () => void;
};

/** Render the application chrome and keep navigation separate from data orchestration. */
export function AppHeader({
  tab,
  years,
  startYear,
  zone,
  onTabChange,
  onFiscalYearChange,
  onImport,
  onExport,
  onZoneChange,
  onClear,
}: Props) {
  return (
    <>
      <header className="flex items-center justify-between gap-3 px-4 pb-3 pt-[max(1rem,env(safe-area-inset-top))] sm:px-6 sm:pt-5">
        <div className="flex min-w-0 items-center gap-3">
          <span
            className="hidden size-11 shrink-0 place-items-center rounded-2xl bg-slate-950 text-white shadow-sm sm:grid"
            aria-hidden="true"
          >
            <ChartNoAxesColumnIncreasing className="size-5" />
          </span>
          <h1 className="leading-[1.05] tracking-tight text-slate-950">
            <span className="block whitespace-nowrap text-lg font-black sm:text-2xl">
              {t.app.name}
            </span>
            <span className="block whitespace-nowrap text-sm font-bold text-slate-500 sm:text-base">
              {startYear} - {startYear + 1}
            </span>
          </h1>
        </div>

        {tab === 'annual' ? (
          <ActionMenu
            years={years}
            startYear={startYear}
            onFiscalYearChange={onFiscalYearChange}
            onImport={onImport}
            onExport={onExport}
            zone={zone}
            onZoneChange={onZoneChange}
            onClear={onClear}
          />
        ) : null}
      </header>

      <nav
        className="sticky top-0 z-40 grid grid-cols-2 border-b border-slate-200/80 bg-white/95 px-4 pb-3 pt-2 backdrop-blur-xl sm:static sm:border-b-0 sm:px-6 sm:pt-1"
        aria-label={t.app.views}
      >
        <span className="col-span-2 grid grid-cols-2 rounded-2xl bg-slate-100 p-1">
          {(['monthly', 'annual'] as const).map((nextTab) => (
            <button
              className={`h-11 rounded-xl text-sm font-extrabold transition sm:text-base ${
                tab === nextTab
                  ? 'bg-white text-slate-950 shadow-sm ring-1 ring-slate-200/80'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
              key={nextTab}
              type="button"
              onClick={() => onTabChange(nextTab)}
            >
              {t.navigation[nextTab]}
            </button>
          ))}
        </span>
      </nav>
    </>
  );
}
