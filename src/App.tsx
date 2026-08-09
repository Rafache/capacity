import { useEffect, useState, type ChangeEvent } from "react";
import { exportCapacityCsv, importCapacityCsv } from "./domain/csv";
import {
  availableFiscalYears,
  calculateFiscalYear,
  EMPTY_ENTRY,
  getCurrentFiscalPosition,
} from "./domain/capacity";
import { AppFeedback, type Confirmation, type Notice } from "./components/AppFeedback";
import { AppHeader, type ViewTab } from "./components/AppHeader";
import { AnnualView } from "./views/AnnualView";
import { MonthlyView } from "./views/MonthlyView";
import { t } from "./i18n/fr";
import { useCapacityStore } from "./hooks/useCapacityStore";
import type { EntryNumericKey } from "./types";

export default function App() {
  const years = availableFiscalYears();
  const current = getCurrentFiscalPosition();
  const store = useCapacityStore();
  const [tab, setTab] = useState<ViewTab>("annual");
  const [startYear, setStartYear] = useState(years[0]!);
  const [monthIndex, setMonthIndex] = useState(current.monthIndex);
  const [notice, setNotice] = useState<Notice | null>(() =>
    store.storageAvailable
      ? null
      : { message: t.notices.storageUnavailable, type: "error" },
  );
  const [confirmation, setConfirmation] = useState<Confirmation | null>(null);

  useEffect(() => {
    if (!notice) return;
    const timeout = window.setTimeout(() => setNotice(null), 3000);
    return () => window.clearTimeout(timeout);
  }, [notice]);

  const fiscalYear = calculateFiscalYear(
    startYear,
    store.data.entries[String(startYear)],
  );
  const { entries, stats } = fiscalYear;
  const currentEntry = entries[monthIndex] ?? EMPTY_ENTRY;
  const currentStats = stats[monthIndex] ?? stats[0]!;

  const updateEntry = (field: EntryNumericKey, value: number) => {
    const result = store.updateEntry(startYear, monthIndex, field, value);
    if (!result.saved) {
      setNotice({ message: t.notices.storageUnavailable, type: "error" });
    } else if (result.clamped) {
      setNotice({ message: t.notices.absenceClamped, type: "error" });
    }
  };

  const exportCsv = () => {
    const url = URL.createObjectURL(
      new Blob([exportCapacityCsv(startYear, entries, stats)], {
        type: "text/csv;charset=utf-8",
      }),
    );
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
      const saved = store.replaceYear(
        startYear,
        importCapacityCsv(await file.text(), startYear),
      );
      setNotice({
        message: saved ? t.notices.importComplete : t.notices.storageUnavailable,
        type: saved ? "success" : "error",
      });
    } catch {
      setNotice({ message: t.errors.invalidCsv, type: "error" });
    } finally {
      event.target.value = "";
    }
  };

  const confirmAction = () => {
    if (!confirmation) return;
    const isClear = confirmation.type === "clear";
    const saved = isClear
      ? store.clear()
      : store.applyField(startYear, monthIndex, confirmation.field);
    setNotice({
      message: saved
        ? isClear
          ? t.notices.dataCleared
          : t.notices.applied[confirmation.field]
        : t.notices.storageUnavailable,
      type: saved ? "success" : "error",
    });
    setConfirmation(null);
  };

  const openMonth = (index: number) => {
    setMonthIndex(index);
    setTab("monthly");
    window.requestAnimationFrame(() => window.scrollTo({ top: 0, behavior: "smooth" }));
  };

  return (
    <main className="min-h-dvh bg-slate-50 text-slate-950 antialiased sm:px-5 sm:py-6">
      <section
        className="mx-auto min-h-dvh w-full max-w-5xl bg-white sm:min-h-0 sm:rounded-[2rem] sm:border sm:border-slate-200/80 sm:shadow-[0_24px_80px_rgba(15,23,42,0.10)]"
        aria-label={t.app.ariaLabel}
      >
        <AppHeader
          tab={tab}
          years={years}
          startYear={startYear}
          zone={store.data.zone}
          onTabChange={setTab}
          onFiscalYearChange={(year) => {
            setStartYear(year);
            setMonthIndex(year === current.startYear ? current.monthIndex : 0);
          }}
          onImport={importCsv}
          onExport={exportCsv}
          onZoneChange={store.setZone}
          onClear={() => setConfirmation({ type: "clear" })}
        />

        <div
          className={
            tab === "monthly"
              ? "px-4 pb-5 pt-0 sm:px-6 sm:pb-7 sm:pt-7"
              : "px-4 py-5 sm:px-6 sm:py-7"
          }
        >
          {tab === "monthly" ? (
            <MonthlyView
              startYear={startYear}
              monthIndex={monthIndex}
              entry={currentEntry}
              stats={currentStats}
              zone={store.data.zone}
              onMonthChange={setMonthIndex}
              onRequestApplyToYear={(field) => setConfirmation({ type: "apply", field })}
              onChange={updateEntry}
            />
          ) : (
            <AnnualView
              entries={entries}
              stats={stats}
              summary={fiscalYear.summary}
              currentMonthIndex={
                startYear === current.startYear ? current.monthIndex : null
              }
              onMonthOpen={openMonth}
            />
          )}
        </div>

        <footer className="border-t border-slate-100 px-4 py-4 text-center text-[10px] text-slate-400 sm:px-6 sm:py-5 sm:text-xs">
          <p>
            <span>
              © {new Date().getFullYear()} · {t.footer.madeWithLove}{" "}
            </span>
            <a
              className="font-bold text-slate-600 underline decoration-slate-300 underline-offset-2 transition hover:text-blue-600 hover:decoration-blue-300 focus-visible:rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
              href="https://github.com/Rafache"
              target="_blank"
              rel="noreferrer"
              aria-label={t.footer.profile}
            >
              RCH
            </a>
            <span className="mx-1.5" aria-hidden="true">
              ·
            </span>
            <a
              className="font-bold text-slate-600 underline decoration-slate-300 underline-offset-2 transition hover:text-blue-600 hover:decoration-blue-300 focus-visible:rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
              href="https://github.com/Rafache/capacity"
              target="_blank"
              rel="noreferrer"
              aria-label={t.footer.repository}
            >
              {t.footer.repository}
            </a>
          </p>
        </footer>
      </section>

      <AppFeedback
        notice={notice}
        confirmation={confirmation}
        currentEntry={currentEntry}
        onDismissNotice={() => setNotice(null)}
        onCancel={() => setConfirmation(null)}
        onConfirm={confirmAction}
      />
    </main>
  );
}
