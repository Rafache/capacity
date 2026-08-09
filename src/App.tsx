import { useCallback, useEffect, useState, type ChangeEvent } from "react";
import { CsvImportError, exportCapacityCsv, importCapacityCsv } from "./domain/csv";
import {
  availableFiscalYears,
  calculateFiscalYear,
  EMPTY_ENTRY,
} from "./domain/capacityData";
import { AppFeedback, type Notice } from "./components/AppFeedback";
import { AppHeader, type ViewTab } from "./components/AppHeader";
import { AnnualView } from "./views/AnnualView";
import { MonthlyView } from "./views/MonthlyView";
import { t } from "./i18n/translate";
import { useCapacityStore } from "./hooks/useCapacityStore";
import type { EntryNumericKey } from "./types";

const csvErrorMessages: Record<CsvImportError["code"], string> = {
  "file-too-large": t.errors.fileTooLarge,
  "invalid-format": t.errors.invalidFormat,
  "invalid-columns": t.errors.invalidColumns,
  "invalid-months": t.errors.invalidMonths,
  "invalid-value": t.errors.invalidValue,
};

export default function App() {
  const years = availableFiscalYears();
  const defaultYear = years[0]!;
  const store = useCapacityStore();
  const { data } = store;
  const [tab, setTab] = useState<ViewTab>("annual");
  const [startYear, setStartYear] = useState(defaultYear);
  const [monthIndex, setMonthIndex] = useState(0);
  const [actionsOpen, setActionsOpen] = useState(false);
  const [notice, setNotice] = useState<Notice | null>(() =>
    store.loadWarning
      ? {
          message:
            store.loadWarning === "repaired"
              ? t.notices.repaired
              : t.notices.storageUnavailable,
          type: "error",
        }
      : null,
  );
  const [confirmClearOpen, setConfirmClearOpen] = useState(false);
  const [pendingApplyField, setPendingApplyField] = useState<EntryNumericKey | null>(
    null,
  );
  const closeActions = useCallback(() => setActionsOpen(false), []);
  useEffect(() => {
    if (!notice) return;
    const timeout = window.setTimeout(() => setNotice(null), 3000);
    return () => window.clearTimeout(timeout);
  }, [notice]);

  const fiscalYear = calculateFiscalYear(startYear, data.entries[String(startYear)]);
  const { entries, stats } = fiscalYear;
  const currentEntry = entries[monthIndex] ?? EMPTY_ENTRY;
  const currentStats = stats[monthIndex] ?? fiscalYear.stats[0]!;
  const updateEntry = (field: EntryNumericKey, value: number) => {
    const result = store.updateEntry(startYear, monthIndex, field, value);
    if (!result.saved) {
      setNotice({ message: t.notices.storageSaveUnavailable, type: "error" });
    } else if (result.clamped) {
      setNotice({
        message: t.notices.absenceClamped,
        type: "error",
      });
    }
  };

  const exportCsv = () => {
    const text = exportCapacityCsv(startYear, entries, stats);
    const url = URL.createObjectURL(new Blob([text], { type: "text/csv;charset=utf-8" }));
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `capacity-${startYear}-${startYear + 1}.csv`;
    anchor.click();
    URL.revokeObjectURL(url);
    setNotice({ message: t.notices.exportComplete, type: "success" });
  };

  const importCsv = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    try {
      const imported = importCapacityCsv(await file.text(), startYear);
      const result = store.replaceYear(startYear, imported);
      setNotice({
        message: result.saved
          ? t.notices.importComplete
          : t.notices.storageSaveUnavailable,
        type: result.saved ? "success" : "error",
      });
    } catch (error) {
      setNotice({
        message:
          error instanceof CsvImportError
            ? csvErrorMessages[error.code]
            : t.errors.importFailed,
        type: "error",
      });
    } finally {
      event.target.value = "";
      setActionsOpen(false);
    }
  };

  const clearStoredData = () => setConfirmClearOpen(true);

  const confirmClearStoredData = () => {
    const result = store.clear();
    setConfirmClearOpen(false);
    setNotice({
      message: result.saved ? t.notices.dataCleared : t.notices.storageSaveUnavailable,
      type: result.saved ? "success" : "error",
    });
  };

  const applyFieldToYear = (field: EntryNumericKey) => {
    const result = store.applyField(startYear, monthIndex, field);
    setNotice({
      message: result.saved ? t.notices.applied[field] : t.notices.storageSaveUnavailable,
      type: result.saved ? "success" : "error",
    });
  };

  const confirmApplyFieldToYear = () => {
    if (!pendingApplyField) return;

    applyFieldToYear(pendingApplyField);
    setPendingApplyField(null);
  };

  const changeTab = (nextTab: ViewTab) => {
    setTab(nextTab);
    setActionsOpen(false);
  };

  return (
    <main className="min-h-dvh bg-slate-50 text-slate-950 antialiased sm:px-5 sm:py-6">
      <section
        className="mx-auto min-h-dvh w-full max-w-5xl bg-white sm:min-h-0 sm:rounded-[2rem] sm:border sm:border-slate-200/80 sm:shadow-[0_24px_80px_rgba(15,23,42,0.10)]"
        aria-label={t.app.ariaLabel}
      >
        <AppHeader
          tab={tab}
          actionsOpen={actionsOpen}
          years={years}
          startYear={startYear}
          zone={data.zone}
          onTabChange={changeTab}
          onActionsToggle={() => setActionsOpen((open) => !open)}
          onActionsClose={closeActions}
          onFiscalYearChange={(year) => {
            setStartYear(year);
            setMonthIndex(0);
          }}
          onImport={importCsv}
          onExport={exportCsv}
          onZoneChange={store.setZone}
          onClear={clearStoredData}
        />

        <div className="px-4 py-5 sm:px-6 sm:py-7">
          {tab === "monthly" ? (
            <MonthlyView
              startYear={startYear}
              monthIndex={monthIndex}
              entry={currentEntry}
              stats={currentStats}
              zone={data.zone}
              onMonthChange={setMonthIndex}
              onRequestApplyToYear={setPendingApplyField}
              onChange={updateEntry}
            />
          ) : (
            <AnnualView
              startYear={startYear}
              stats={stats}
              summary={fiscalYear.summary}
              onMonthOpen={(index) => {
                setMonthIndex(index);
                setTab("monthly");
                closeActions();
              }}
            />
          )}
        </div>
      </section>

      <AppFeedback
        notice={notice}
        onDismissNotice={() => setNotice(null)}
        confirmClearOpen={confirmClearOpen}
        onCancelClear={() => setConfirmClearOpen(false)}
        onConfirmClear={confirmClearStoredData}
        pendingApplyField={pendingApplyField}
        currentEntry={currentEntry}
        onCancelApply={() => setPendingApplyField(null)}
        onConfirmApply={confirmApplyFieldToYear}
      />
    </main>
  );
}
