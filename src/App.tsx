import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
  type CSSProperties,
} from "react";
import {
  AlertTriangle,
  ChartNoAxesColumnIncreasing,
  CircleCheckBig,
  CopyPlus,
  X,
} from "lucide-react";
import { ActionMenu } from "./components/ActionMenu";
import { exportCapacityCsv, importCapacityCsv } from "./domain/csv";
import {
  STORAGE_KEY,
  availableFiscalYears,
  emptyData,
  getFiscalMonthLimits,
  getMonthStats,
  loadData,
  normalizeMonthlyEntry,
  saveData,
} from "./domain/capacityData";
import { ConfirmDialog } from "./components/ConfirmDialog";
import { MONTHS_SHORT } from "./data/months";
import { AnnualView } from "./views/AnnualView";
import { MonthlyView } from "./views/MonthlyView";
import type { CapacityData, Entry, EntryNumericKey, SegmentKey } from "./types";

type Notice = {
  message: string;
  type: "success" | "error";
};

const FIELD_LABELS: Record<EntryNumericKey, string> = {
  workRate: "Temps de travail",
  leave: "Congés payés",
  rtt: "RTT",
  training: "Formations",
  other: "Autres",
};

const formatEntryValue = (field: EntryNumericKey, value: number) =>
  `${Number.isInteger(value) ? value : value.toFixed(1).replace(".", ",")}${
    field === "workRate" ? " %" : " j"
  }`;

export default function App() {
  const years = useMemo(() => availableFiscalYears(), []);
  const [tab, setTab] = useState<"monthly" | "annual">("annual");
  const [startYear, setStartYear] = useState(years[0]);
  const [monthIndex, setMonthIndex] = useState(0);
  const [data, setData] = useState<CapacityData>(() => emptyData());
  const [actionsOpen, setActionsOpen] = useState(false);
  const [notice, setNotice] = useState<Notice | null>(null);
  const [confirmClearOpen, setConfirmClearOpen] = useState(false);
  const [pendingApplyField, setPendingApplyField] = useState<EntryNumericKey | null>(
    null,
  );
  const [appHeaderHeight, setAppHeaderHeight] = useState<number>();
  const appHeaderRef = useRef<HTMLDivElement>(null);
  const storageReady = useRef(false);
  const closeActions = useCallback(() => setActionsOpen(false), []);

  useLayoutEffect(() => {
    const header = appHeaderRef.current;
    if (!header) return;

    const updateHeaderHeight = () => {
      setAppHeaderHeight(header.getBoundingClientRect().height);
    };

    updateHeaderHeight();
    const observer = new ResizeObserver(updateHeaderHeight);
    observer.observe(header);

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const result = loadData(window.localStorage);
    setData(result.data);
    if (result.warning === "repaired") {
      setNotice({
        message: "Des données locales ont été corrigées pour respecter les limites de capacité.",
        type: "error",
      });
    }
    if (result.warning === "unavailable") {
      setNotice({
        message: "Le stockage local est indisponible. Vos modifications ne pourront pas être enregistrées.",
        type: "error",
      });
    }
    storageReady.current = true;
  }, []);

  useEffect(() => {
    if (!storageReady.current) return;
    const result = saveData(window.localStorage, data);
    if (!result.success) {
      setNotice({
        message: "Le stockage local est indisponible. Vos modifications ne peuvent pas être enregistrées.",
        type: "error",
      });
    }
  }, [data]);

  useEffect(() => {
    if (!notice) return;
    const timeout = window.setTimeout(() => setNotice(null), 3000);
    return () => window.clearTimeout(timeout);
  }, [notice]);

  const entries = useMemo(
    () =>
      Array.from({ length: 12 }, (_, index) =>
        normalizeMonthlyEntry(
          data.entries[String(startYear)]?.[index],
          getFiscalMonthLimits(startYear, index),
        ),
      ),
    [data.entries, startYear],
  );
  const stats = useMemo(
    () => entries.map((entry, index) => getMonthStats(startYear, index, entry)),
    [entries, startYear],
  );
  const currentEntry = entries[monthIndex];
  const currentStats = stats[monthIndex];
  const annualBaseline = stats.reduce((sum, item) => sum + item.baseline, 0);
  const annualAvailable = stats.reduce((sum, item) => sum + item.available, 0);
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
    annualStats.leave + annualStats.rtt + annualStats.training + annualStats.other;

  const replaceYear = (nextEntries: Entry[]) => {
    setData((previous) => ({
      ...previous,
      entries: { ...previous.entries, [String(startYear)]: nextEntries },
    }));
  };

  const updateEntry = (field: EntryNumericKey, value: number) => {
    const next = [...entries];
    const requested = { ...next[monthIndex], [field]: value } as Entry;
    next[monthIndex] = normalizeMonthlyEntry(
      requested,
      getFiscalMonthLimits(startYear, monthIndex),
    );
    replaceYear(next);

    if (
      ["leave", "rtt", "training", "other"].some(
        (absence) =>
          next[monthIndex][absence as Exclude<EntryNumericKey, "workRate">] !==
          requested[absence as Exclude<EntryNumericKey, "workRate">],
      )
    ) {
      setNotice({
        message: "Les absences ont été plafonnées aux jours prévus par votre temps de travail.",
        type: "error",
      });
    }
  };

  const exportCsv = () => {
    const text = exportCapacityCsv(MONTHS_SHORT, entries, stats);
    const url = URL.createObjectURL(new Blob([text], { type: "text/csv;charset=utf-8" }));
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `capacite-${startYear}-${startYear + 1}.csv`;
    anchor.click();
    URL.revokeObjectURL(url);
    setNotice({ message: "Export terminé.", type: "success" });
  };

  const importCsv = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    try {
      const imported = importCapacityCsv(await file.text());
      replaceYear(imported);
      setNotice({
        message: "Import terminé : 12 mois ont été chargés.",
        type: "success",
      });
    } catch (error) {
      setNotice({
        message: error instanceof Error ? error.message : "Import impossible.",
        type: "error",
      });
    } finally {
      event.target.value = "";
      closeActions();
    }
  };

  const clearStoredData = () => setConfirmClearOpen(true);

  const confirmClearStoredData = () => {
    setData(emptyData());
    window.localStorage.removeItem(STORAGE_KEY);
    window.localStorage.removeItem("ma-capacite-v2");
    window.localStorage.removeItem("ma-capacite-v1");
    setConfirmClearOpen(false);
    setNotice({
      message: "Les données locales ont été effacées.",
      type: "success",
    });
  };

  const applyFieldToYear = (field: EntryNumericKey) => {
    const messages: Record<EntryNumericKey, string> = {
      workRate: "Le temps de travail a été appliqué aux 12 mois.",
      leave: "Les congés payés ont été appliqués aux 12 mois.",
      rtt: "Les RTT ont été appliqués aux 12 mois.",
      training: "Les formations ont été appliquées aux 12 mois.",
      other: "Les autres absences ont été appliquées aux 12 mois.",
    };

    replaceYear(
      entries.map((entry, index) =>
        normalizeMonthlyEntry(
          { ...entry, [field]: currentEntry[field] },
          getFiscalMonthLimits(startYear, index),
        ),
      ),
    );
    setNotice({
      message: messages[field],
      type: "success",
    });
  };

  const confirmApplyFieldToYear = () => {
    if (!pendingApplyField) return;

    applyFieldToYear(pendingApplyField);
    setPendingApplyField(null);
  };

  const changeTab = (nextTab: "monthly" | "annual") => {
    setTab(nextTab);
    closeActions();
  };

  return (
    <main
      className="min-h-dvh bg-slate-50 text-slate-950 antialiased sm:px-5 sm:py-6"
      style={
        appHeaderHeight
          ? ({ "--app-header-height": `${appHeaderHeight}px` } as CSSProperties)
          : undefined
      }
    >
      <section
        className="mx-auto min-h-dvh w-full max-w-5xl bg-white sm:min-h-0 sm:rounded-[2rem] sm:border sm:border-slate-200/80 sm:shadow-[0_24px_80px_rgba(15,23,42,0.10)]"
        aria-label="Gestion de capacité"
      >
        <div
          className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/95 px-4 pb-3 pt-[max(1rem,env(safe-area-inset-top))] backdrop-blur-xl sm:rounded-t-[2rem] sm:px-6 sm:pt-5"
          data-app-header
          ref={appHeaderRef}
        >
          <header className="flex items-center justify-between gap-3">
            <div className="flex min-w-0 items-center gap-3">
              <span
                className="hidden size-11 shrink-0 place-items-center rounded-2xl bg-slate-950 text-white shadow-sm sm:grid"
                aria-hidden="true"
              >
                <ChartNoAxesColumnIncreasing className="size-5" />
              </span>
              <div className="min-w-0">
                <h1 className="leading-[1.05] tracking-tight text-slate-950">
                  <span className="block whitespace-nowrap text-lg font-black sm:text-2xl">
                    Ma capacité
                  </span>
                  <span className="block whitespace-nowrap text-sm font-bold text-slate-500 sm:text-base">
                    {startYear} - {startYear + 1}
                  </span>
                </h1>
              </div>
            </div>

            {tab === "annual" ? (
              <ActionMenu
                open={actionsOpen}
                years={years}
                startYear={startYear}
                onToggle={() => setActionsOpen((open) => !open)}
                onClose={closeActions}
                onFiscalYearChange={(year) => {
                  setStartYear(year);
                  setMonthIndex(0);
                }}
                onImport={importCsv}
                onExport={exportCsv}
                zone={data.zone}
                onZoneChange={(zone) => setData((previous) => ({ ...previous, zone }))}
                onClear={clearStoredData}
              />
            ) : null}
          </header>

          <nav
            className="mt-4 grid grid-cols-2 rounded-2xl bg-slate-100 p-1"
            aria-label="Vues"
          >
            <button
              className={`h-11 rounded-xl text-sm font-extrabold transition sm:text-base ${
                tab === "monthly"
                  ? "bg-white text-slate-950 shadow-sm ring-1 ring-slate-200/80"
                  : "text-slate-500 hover:text-slate-800"
              }`}
              onClick={() => changeTab("monthly")}
            >
              Mensuelle
            </button>
            <button
              className={`h-11 rounded-xl text-sm font-extrabold transition sm:text-base ${
                tab === "annual"
                  ? "bg-white text-slate-950 shadow-sm ring-1 ring-slate-200/80"
                  : "text-slate-500 hover:text-slate-800"
              }`}
              onClick={() => changeTab("annual")}
            >
              Annuelle
            </button>
          </nav>
        </div>

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
              stats={stats}
              annualBaseline={annualBaseline}
              annualUnavailable={annualUnavailable}
              annualAvailable={annualAvailable}
              annualStats={annualStats}
              onMonthOpen={(index) => {
                setMonthIndex(index);
                setTab("monthly");
                closeActions();
              }}
            />
          )}
        </div>
      </section>

      {notice && (
        <div
          className={`toast-in fixed bottom-[max(0.75rem,env(safe-area-inset-bottom))] left-1/2 z-[100] grid w-[min(430px,calc(100vw-1.25rem))] -translate-x-1/2 grid-cols-[2.25rem_minmax(0,1fr)_2rem] items-center gap-2.5 overflow-hidden rounded-2xl border p-3 pr-2 shadow-2xl ${
            notice.type === "error"
              ? "border-red-200 bg-red-50 text-red-900 shadow-red-950/15"
              : "border-emerald-200 bg-emerald-50 text-emerald-900 shadow-emerald-950/15"
          }`}
          role={notice.type === "error" ? "alert" : "status"}
          aria-live={notice.type === "error" ? "assertive" : "polite"}
        >
          <span
            className={`grid size-9 place-items-center rounded-xl ${
              notice.type === "error" ? "bg-red-100" : "bg-emerald-100"
            }`}
            aria-hidden="true"
          >
            {notice.type === "error" ? (
              <AlertTriangle className="size-5" />
            ) : (
              <CircleCheckBig className="size-5" />
            )}
          </span>
          <span className="text-sm font-bold leading-snug">{notice.message}</span>
          <button
            className="grid size-8 place-items-center rounded-lg transition hover:bg-black/5 focus:outline-none focus:ring-2 focus:ring-current/20"
            onClick={() => setNotice(null)}
            aria-label="Fermer la notification"
          >
            <X className="size-4" />
          </button>
          <span
            className={`toast-progress absolute inset-x-0 bottom-0 h-1 origin-left ${
              notice.type === "error" ? "bg-red-500" : "bg-emerald-500"
            }`}
            aria-hidden="true"
          />
        </div>
      )}

      <ConfirmDialog
        open={confirmClearOpen}
        title="Effacer toutes les données ?"
        description="Cette action supprimera les données enregistrées sur cet appareil pour toutes les années budgétaires. Elle est irréversible."
        confirmLabel="Effacer les données"
        onCancel={() => setConfirmClearOpen(false)}
        onConfirm={confirmClearStoredData}
      />

      <ConfirmDialog
        open={pendingApplyField !== null}
        title="Répliquer sur l’année ?"
        description={
          pendingApplyField
            ? `La valeur ${formatEntryValue(
                pendingApplyField,
                currentEntry[pendingApplyField],
              )} de ${FIELD_LABELS[pendingApplyField].toLowerCase()} sera appliquée aux 12 mois de l’année fiscale.`
            : ""
        }
        confirmLabel="Répliquer sur l’année"
        icon={CopyPlus}
        tone="primary"
        onCancel={() => setPendingApplyField(null)}
        onConfirm={confirmApplyFieldToYear}
      />
    </main>
  );
}
