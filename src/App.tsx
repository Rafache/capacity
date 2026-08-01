import { useEffect, useMemo, useRef, useState, type ChangeEvent } from "react";
import { ChartNoAxesColumnIncreasing } from "lucide-react";
import { roundHalf, workingDaysInMonth } from "./capacity";
import { AnnualView } from "./views/AnnualView";
import { MonthlyView } from "./views/MonthlyView";
import type { Entry, MonthStats, SegmentKey, Zone } from "./types";

const STORAGE_KEY = "ma-capacite-v1";
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
const EMPTY_ENTRY: Entry = {
  workRate: 100,
  leave: 0,
  rtt: 0,
  training: 0,
  other: 0,
};
const formatNumber = (value: number) =>
  Number.isInteger(value) ? String(value) : value.toFixed(1).replace(".", ",");
const defaultEntries = () =>
  Array.from({ length: 12 }, () => ({ ...EMPTY_ENTRY }));
const defaultAllEntries = () => ({
  "2026": defaultEntries(),
  "2027": defaultEntries(),
  "2028": defaultEntries(),
});
const normalizeEntry = (item?: Partial<Entry>): Entry => ({
  ...EMPTY_ENTRY,
  ...item,
});

function getMonthStats(
  startYear: number,
  index: number,
  entry: Entry,
): MonthStats {
  const month = (index + 6) % 12;
  const year = startYear + (index >= 6 ? 1 : 0);
  const baseline = workingDaysInMonth(year, month);
  const contracted = roundHalf(baseline * (entry.workRate / 100));
  const available = Math.max(
    0,
    roundHalf(
      contracted - entry.leave - entry.rtt - entry.training - entry.other,
    ),
  );
  return {
    baseline,
    contracted,
    available,
    leave: entry.leave,
    rtt: entry.rtt,
    training: entry.training,
    other: entry.other,
  };
}

export default function App() {
  const [tab, setTab] = useState<"monthly" | "annual">("monthly");
  const [startYear, setStartYear] = useState(2026);
  const [monthIndex, setMonthIndex] = useState(4);
  const [zone, setZone] = useState<Zone>("C");
  const [allEntries, setAllEntries] =
    useState<Record<string, Entry[]>>(defaultAllEntries);
  const [csvOpen, setCsvOpen] = useState(false);
  const storageReady = useRef(false);
  const entries = useMemo(
    () =>
      (allEntries[String(startYear)] ?? defaultEntries()).map(normalizeEntry),
    [allEntries, startYear],
  );
  const stats = useMemo(
    () => entries.map((entry, index) => getMonthStats(startYear, index, entry)),
    [entries, startYear],
  );
  const currentEntry = entries[monthIndex];
  const currentStats = stats[monthIndex];
  const annualBaseline = stats.reduce((sum, item) => sum + item.baseline, 0);
  const annualAvailable = stats.reduce((sum, item) => sum + item.available, 0);
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

  useEffect(() => {
    if (storageReady.current)
      window.localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ entries: allEntries, zone }),
      );
  }, [allEntries, zone]);
  useEffect(() => {
    try {
      const parsed = JSON.parse(
        window.localStorage.getItem(STORAGE_KEY) ?? "{}",
      );
      setAllEntries(parsed.entries ?? defaultAllEntries());
      setZone(
        (["A", "B", "C"].includes(parsed.zone) ? parsed.zone : "C") as Zone,
      );
    } catch {
      setAllEntries(defaultAllEntries());
    }
    storageReady.current = true;
  }, []);

  const updateEntry = (field: keyof Entry, value: number) =>
    setAllEntries((previous) => {
      const yearEntries = [
        ...(previous[String(startYear)] ?? defaultEntries()),
      ];
      yearEntries[monthIndex] = {
        ...normalizeEntry(yearEntries[monthIndex]),
        [field]: value,
      };
      return { ...previous, [String(startYear)]: yearEntries };
    });
  const adjust = (field: keyof Entry, delta: number) => {
    const max = field === "workRate" ? 100 : currentStats.baseline;
    updateEntry(
      field,
      Math.min(
        max,
        Math.max(field === "workRate" ? 20 : 0, currentEntry[field] + delta),
      ),
    );
  };
  const exportCsv = () => {
    const rows = [
      "Mois;Temps de travail;Disponible;Congés payés;RTT;Formations;Autres",
    ];
    stats.forEach((item, index) =>
      rows.push(
        [
          `${MONTHS_SHORT[index]} — ${item.baseline} ouvrés`,
          `${formatNumber(entries[index].workRate)} %`,
          `${formatNumber(item.available)} j`,
          `${formatNumber(item.leave)} j`,
          `${formatNumber(item.rtt)} j`,
          `${formatNumber(item.training)} j`,
          `${formatNumber(item.other)} j`,
        ].join(";"),
      ),
    );
    rows.push(
      [
        `Total — ${annualBaseline} ouvrés`,
        `${annualWorkRate} %`,
        `${formatNumber(annualStats.available)} j`,
        `${formatNumber(annualStats.leave)} j`,
        `${formatNumber(annualStats.rtt)} j`,
        `${formatNumber(annualStats.training)} j`,
        `${formatNumber(annualStats.other)} j`,
      ].join(";"),
    );
    const url = URL.createObjectURL(
      new Blob([`\uFEFF${rows.join("\n")}`], {
        type: "text/csv;charset=utf-8",
      }),
    );
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `capacite-${startYear}-${startYear + 1}.csv`;
    anchor.click();
    URL.revokeObjectURL(url);
    setCsvOpen(false);
  };
  const importCsv = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    file.text().then((text) => {
      const lines = text
        .replace(/^\uFEFF/, "")
        .trim()
        .split(/\r?\n/);
      const displayed = lines[0]?.startsWith(
        "Mois;Temps de travail;Disponible;",
      );
      const rows = lines.slice(1).filter((row) => !row.startsWith("Total"));
      if (rows.length < 12) return;
      const number = (value: string) =>
        Number(value.replace(",", ".").replace(/[^\d.-]/g, "")) || 0;
      const imported = rows.slice(0, 12).map((row) => {
        const values = row.split(";");
        const hasTraining = values.length >= 7;
        return displayed
          ? {
              workRate: number(values[1]),
              leave: number(values[3]),
              rtt: number(values[4]),
              training: number(values[5]),
              other: number(values[6]),
            }
          : {
              workRate: number(values[2]),
              leave: number(values[3]),
              rtt: number(values[4]),
              training: hasTraining ? number(values[5]) : 0,
              other: number(values[hasTraining ? 6 : 5]),
            };
      });
      setAllEntries((previous) => ({
        ...previous,
        [String(startYear)]: imported,
      }));
    });
    event.target.value = "";
    setCsvOpen(false);
  };
  const clearStoredData = () => {
    if (
      window.confirm(
        "Effacer toutes les données enregistrées sur cet appareil ?",
      )
    ) {
      setAllEntries(defaultAllEntries());
      setZone("C");
      window.localStorage.removeItem(STORAGE_KEY);
    }
  };

  return (
    <main className="app-shell">
      <section className="app-card" aria-label="Gestion de capacité">
        <header className="topbar">
          <div className="brand">
            <span className="brand-mark" aria-hidden="true">
              <ChartNoAxesColumnIncreasing />
            </span>
            <span>Ma capacité</span>
          </div>
          <label className="year-select">
            <span className="sr-only">Année budgétaire</span>
            <select
              value={startYear}
              onChange={(event) => {
                setStartYear(Number(event.target.value));
                setMonthIndex(0);
              }}
            >
              <option value={2026}>2026 — 2027</option>
              <option value={2027}>2027 — 2028</option>
              <option value={2028}>2028 — 2029</option>
            </select>
          </label>
        </header>
        <nav className="tabs" aria-label="Vues">
          <button
            className={tab === "monthly" ? "active" : ""}
            onClick={() => setTab("monthly")}
          >
            Mensuelle
          </button>
          <button
            className={tab === "annual" ? "active" : ""}
            onClick={() => setTab("annual")}
          >
            Annuelle
          </button>
        </nav>
        {tab === "monthly" ? (
          <MonthlyView
            startYear={startYear}
            monthIndex={monthIndex}
            entry={currentEntry}
            stats={currentStats}
            zone={zone}
            onMonthChange={setMonthIndex}
            onZoneChange={setZone}
            onAdjust={adjust}
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
            csvOpen={csvOpen}
            onCsvToggle={() => setCsvOpen((open) => !open)}
            onImport={importCsv}
            onExport={exportCsv}
            onClear={clearStoredData}
          />
        )}
      </section>
    </main>
  );
}
