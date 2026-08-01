import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
} from "react";
import { ChartNoAxesColumnIncreasing } from "lucide-react";
import { ActionMenu } from "./components/ActionMenu";
import { exportCapacityCsv, importCapacityCsv } from "./domain/csv";
import {
  EMPTY_ENTRY,
  STORAGE_KEY,
  availableFiscalYears,
  emptyData,
  getMonthStats,
  loadData,
  normalizeEntry,
  saveData,
} from "./domain/capacityData";
import { AnnualView } from "./views/AnnualView";
import { MonthlyView } from "./views/MonthlyView";
import type { CapacityData, Entry, SegmentKey, Zone } from "./types";

const MONTHS_SHORT = [
  "Juil.",
  "Août",
  "Sept.",
  "Oct.",
  "Nov.",
  "Déc.",
  "Janv.",
  "Févr.",
  "Mars",
  "Avr.",
  "Mai",
  "Juin",
];

export default function App() {
  const years = useMemo(() => availableFiscalYears(), []);
  const [tab, setTab] = useState<"monthly" | "annual">("monthly");
  const [startYear, setStartYear] = useState(years[1]);
  const [monthIndex, setMonthIndex] = useState(0);
  const [data, setData] = useState<CapacityData>(() => emptyData());
  const [actionsOpen, setActionsOpen] = useState(false);
  const [notice, setNotice] = useState("");
  const storageReady = useRef(false);
  const closeActions = useCallback(() => setActionsOpen(false), []);

  useEffect(() => {
    setData(loadData(window.localStorage));
    storageReady.current = true;
  }, []);

  useEffect(() => {
    if (storageReady.current) saveData(window.localStorage, data);
  }, [data]);

  const entries = useMemo(
    () =>
      Array.from({ length: 12 }, (_, index) =>
        normalizeEntry(data.entries[String(startYear)]?.[index]),
      ),
    [data.entries, startYear],
  );
  const stats = useMemo(
    () =>
      entries.map((entry, index) =>
        getMonthStats(startYear, index, entry),
      ),
    [entries, startYear],
  );
  const currentEntry = entries[monthIndex];
  const currentStats = stats[monthIndex];
  const annualBaseline = stats.reduce(
    (sum, item) => sum + item.baseline,
    0,
  );
  const annualAvailable = stats.reduce(
    (sum, item) => sum + item.available,
    0,
  );
  const annualWorkRate = annualBaseline
    ? Math.round(
        (stats.reduce((sum, item) => sum + item.contracted, 0) /
          annualBaseline) *
          100,
      )
    : 0;
  const annualRate = annualBaseline
    ? Math.round((annualAvailable / annualBaseline) * 100)
    : 0;
  const annualStats = (
    ["available", "leave", "rtt", "training", "other"] as SegmentKey[]
  ).reduce(
    (result, key) => ({
      ...result,
      [key]: stats.reduce((sum, item) => sum + item[key], 0),
    }),
    {} as Record<SegmentKey, number>,
  );
  const annualUnavailable =
    annualStats.leave +
    annualStats.rtt +
    annualStats.training +
    annualStats.other;

  const replaceYear = (nextEntries: Entry[]) => {
    setData((previous) => ({
      ...previous,
      entries: { ...previous.entries, [String(startYear)]: nextEntries },
    }));
  };

  const updateEntry = (field: keyof Entry, value: number | string) => {
    const next = [...entries];
    next[monthIndex] = { ...next[monthIndex], [field]: value } as Entry;
    replaceYear(next);
  };

  const exportCsv = () => {
    const text = exportCapacityCsv(MONTHS_SHORT, entries, stats);
    const url = URL.createObjectURL(
      new Blob([text], { type: "text/csv;charset=utf-8" }),
    );
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `capacite-${startYear}-${startYear + 1}.csv`;
    anchor.click();
    URL.revokeObjectURL(url);
    setNotice("Export CSV créé.");
  };

  const importCsv = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    try {
      const imported = importCapacityCsv(await file.text());
      replaceYear(imported);
      setNotice("Import terminé : 12 mois ont été chargés.");
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "Import impossible.");
    } finally {
      event.target.value = "";
      closeActions();
    }
  };

  const clearStoredData = () => {
    if (
      !window.confirm("Effacer toutes les données enregistrées sur cet appareil ?")
    )
      return;
    setData(emptyData());
    window.localStorage.removeItem(STORAGE_KEY);
    window.localStorage.removeItem("ma-capacite-v1");
    setNotice("Les données locales ont été effacées.");
  };

  const copyNext = () => {
    const next = [...entries];
    const target = (monthIndex + 1) % 12;
    next[target] = { ...currentEntry };
    replaceYear(next);
    setMonthIndex(target);
    setNotice("Le mois a été copié.");
  };

  const applyWorkRate = () => {
    replaceYear(
      entries.map((entry) => ({
        ...entry,
        workRate: currentEntry.workRate,
      })),
    );
    setNotice("Le temps de travail a été appliqué aux 12 mois.");
  };

  const resetMonth = () => {
    const next = [...entries];
    next[monthIndex] = { ...EMPTY_ENTRY };
    replaceYear(next);
    setNotice("Le mois a été réinitialisé.");
  };

  const changeTab = (nextTab: "monthly" | "annual") => {
    setTab(nextTab);
    closeActions();
  };

  return (
    <main className="app-shell">
      <section className="app-card" aria-label="Gestion de capacité">
        <div className="sticky-header">
          <header className="topbar">
            <div className="brand">
              <span className="brand-mark" aria-hidden="true">
                <ChartNoAxesColumnIncreasing />
              </span>
              <span>Ma capacité</span>
            </div>
            <div className="top-actions">
              <label className="year-select">
                <span className="sr-only">Année budgétaire</span>
                <select
                  value={startYear}
                  onChange={(event) => {
                    setStartYear(Number(event.target.value));
                    setMonthIndex(0);
                    closeActions();
                  }}
                >
                  {years.map((year) => (
                    <option key={year} value={year}>
                      {year} — {year + 1}
                    </option>
                  ))}
                </select>
              </label>
              <ActionMenu
                open={actionsOpen}
                showCsvActions={tab === "annual"}
                showMonthlyActions={tab === "monthly"}
                onToggle={() => setActionsOpen((open) => !open)}
                onClose={closeActions}
                onImport={importCsv}
                onExport={exportCsv}
                onApplyWorkRate={applyWorkRate}
                onCopyNext={copyNext}
                onResetMonth={resetMonth}
                onClear={clearStoredData}
              />
            </div>
          </header>
          <nav className="tabs" aria-label="Vues">
            <button
              className={tab === "monthly" ? "active" : ""}
              onClick={() => changeTab("monthly")}
            >
              Mensuelle
            </button>
            <button
              className={tab === "annual" ? "active" : ""}
              onClick={() => changeTab("annual")}
            >
              Annuelle
            </button>
          </nav>
        </div>
        {notice && (
          <div className="notice" role="status">
            <span>{notice}</span>
            <button onClick={() => setNotice("")} aria-label="Fermer">
              ×
            </button>
          </div>
        )}
        {tab === "monthly" ? (
          <MonthlyView
            startYear={startYear}
            monthIndex={monthIndex}
            entry={currentEntry}
            stats={currentStats}
            zone={data.zone}
            onMonthChange={setMonthIndex}
            onZoneChange={(zone: Zone) =>
              setData((previous) => ({ ...previous, zone }))
            }
            onChange={updateEntry}
          />
        ) : (
          <AnnualView
            entries={entries}
            stats={stats}
            annualBaseline={annualBaseline}
            annualAvailable={annualAvailable}
            annualUnavailable={annualUnavailable}
            annualRate={annualRate}
            annualWorkRate={annualWorkRate}
            annualStats={annualStats}
            onMonthOpen={(index) => {
              setMonthIndex(index);
              setTab("monthly");
            }}
          />
        )}
      </section>
    </main>
  );
}
