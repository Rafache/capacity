"use client";

import { ChangeEvent, useMemo, useRef, useState } from "react";

type Zone = "A" | "B" | "C";
type SegmentKey = "available" | "leave" | "rtt" | "other" | "holidays" | "nonWorked";

type Entry = {
  workRate: number;
  leave: number;
  rtt: number;
  other: number;
};

type SchoolBreak = {
  name: string;
  start: string;
  end: string;
};

const STORAGE_KEY = "ma-capacite-v1";
const MONTHS_SHORT = ["Juil.", "Août", "Sept.", "Oct.", "Nov.", "Déc.", "Janv.", "Févr.", "Mars", "Avr.", "Mai", "Juin"];
const MONTHS_LONG = ["Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre", "Janvier", "Février", "Mars", "Avril", "Mai", "Juin"];
const WEEKDAY = ["dim.", "lun.", "mar.", "mer.", "jeu.", "ven.", "sam."];

const SEGMENTS: Array<{ key: SegmentKey; label: string; short: string }> = [
  { key: "available", label: "Disponible", short: "Disponible" },
  { key: "leave", label: "Congés payés", short: "Congés" },
  { key: "rtt", label: "RTT", short: "RTT" },
  { key: "other", label: "Autres", short: "Autres" },
  { key: "holidays", label: "Jours fériés", short: "Jours fériés" },
  { key: "nonWorked", label: "Temps non travaillé", short: "Non travaillé" },
];

const SCHOOL_BREAKS: Record<string, Record<Zone, SchoolBreak[]>> = {
  "2026": {
    A: [
      { name: "Vacances d’été", start: "2026-07-04", end: "2026-08-31" },
      { name: "Toussaint", start: "2026-10-17", end: "2026-11-02" },
      { name: "Noël", start: "2026-12-19", end: "2027-01-04" },
      { name: "Hiver", start: "2027-02-13", end: "2027-03-01" },
      { name: "Printemps", start: "2027-04-10", end: "2027-04-26" },
    ],
    B: [
      { name: "Vacances d’été", start: "2026-07-04", end: "2026-08-31" },
      { name: "Toussaint", start: "2026-10-17", end: "2026-11-02" },
      { name: "Noël", start: "2026-12-19", end: "2027-01-04" },
      { name: "Hiver", start: "2027-02-20", end: "2027-03-08" },
      { name: "Printemps", start: "2027-04-17", end: "2027-05-03" },
    ],
    C: [
      { name: "Vacances d’été", start: "2026-07-04", end: "2026-08-31" },
      { name: "Toussaint", start: "2026-10-17", end: "2026-11-02" },
      { name: "Noël", start: "2026-12-19", end: "2027-01-04" },
      { name: "Hiver", start: "2027-02-06", end: "2027-02-22" },
      { name: "Printemps", start: "2027-04-03", end: "2027-04-19" },
    ],
  },
  "2027": {
    A: [
      { name: "Vacances d’été", start: "2027-07-03", end: "2027-09-01" },
      { name: "Toussaint", start: "2027-10-23", end: "2027-11-08" },
      { name: "Noël", start: "2027-12-18", end: "2028-01-03" },
      { name: "Hiver", start: "2028-02-19", end: "2028-03-06" },
      { name: "Printemps", start: "2028-04-22", end: "2028-05-09" },
    ],
    B: [
      { name: "Vacances d’été", start: "2027-07-03", end: "2027-09-01" },
      { name: "Toussaint", start: "2027-10-23", end: "2027-11-08" },
      { name: "Noël", start: "2027-12-18", end: "2028-01-03" },
      { name: "Hiver", start: "2028-02-05", end: "2028-02-21" },
      { name: "Printemps", start: "2028-04-08", end: "2028-04-24" },
    ],
    C: [
      { name: "Vacances d’été", start: "2027-07-03", end: "2027-09-01" },
      { name: "Toussaint", start: "2027-10-23", end: "2027-11-08" },
      { name: "Noël", start: "2027-12-18", end: "2028-01-03" },
      { name: "Hiver", start: "2028-02-12", end: "2028-02-28" },
      { name: "Printemps", start: "2028-04-15", end: "2028-05-02" },
    ],
  },
  "2028": { A: [], B: [], C: [] },
};

const presets: Entry[] = [
  { workRate: 100, leave: 5, rtt: 1, other: 1 },
  { workRate: 100, leave: 8, rtt: 1, other: 1 },
  { workRate: 100, leave: 1, rtt: 1, other: 2 },
  { workRate: 100, leave: 2, rtt: 1, other: 2 },
  { workRate: 100, leave: 5, rtt: 2.5, other: 4.5 },
  { workRate: 100, leave: 5, rtt: 1, other: 2 },
  { workRate: 100, leave: 2, rtt: 1, other: 2 },
  { workRate: 80, leave: 1, rtt: 1, other: 1 },
  { workRate: 100, leave: 1, rtt: 1, other: 2 },
  { workRate: 100, leave: 3, rtt: 1, other: 1 },
  { workRate: 90, leave: 2, rtt: 1, other: 1 },
  { workRate: 100, leave: 1, rtt: 1, other: 2 },
];

function dateUTC(year: number, month: number, day: number) {
  return new Date(Date.UTC(year, month, day));
}

function addDays(date: Date, days: number) {
  const next = new Date(date);
  next.setUTCDate(next.getUTCDate() + days);
  return next;
}

function easterSunday(year: number) {
  const a = year % 19;
  const b = Math.floor(year / 100);
  const c = year % 100;
  const d = Math.floor(b / 4);
  const e = b % 4;
  const f = Math.floor((b + 8) / 25);
  const g = Math.floor((b - f + 1) / 3);
  const h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4);
  const k = c % 4;
  const l = (32 + 2 * e + 2 * i - h - k) % 7;
  const m = Math.floor((a + 11 * h + 22 * l) / 451);
  const month = Math.floor((h + l - 7 * m + 114) / 31) - 1;
  const day = ((h + l - 7 * m + 114) % 31) + 1;
  return dateUTC(year, month, day);
}

function publicHolidays(year: number) {
  const easter = easterSunday(year);
  return [
    { name: "Jour de l’An", date: dateUTC(year, 0, 1) },
    { name: "Lundi de Pâques", date: addDays(easter, 1) },
    { name: "Fête du Travail", date: dateUTC(year, 4, 1) },
    { name: "Victoire 1945", date: dateUTC(year, 4, 8) },
    { name: "Ascension", date: addDays(easter, 39) },
    { name: "Lundi de Pentecôte", date: addDays(easter, 50) },
    { name: "Fête nationale", date: dateUTC(year, 6, 14) },
    { name: "Assomption", date: dateUTC(year, 7, 15) },
    { name: "Toussaint", date: dateUTC(year, 10, 1) },
    { name: "Armistice", date: dateUTC(year, 10, 11) },
    { name: "Noël", date: dateUTC(year, 11, 25) },
  ];
}

function weekdaysInMonth(year: number, month: number) {
  const total = new Date(Date.UTC(year, month + 1, 0)).getUTCDate();
  let count = 0;
  for (let day = 1; day <= total; day += 1) {
    const weekday = dateUTC(year, month, day).getUTCDay();
    if (weekday !== 0 && weekday !== 6) count += 1;
  }
  return count;
}

function fiscalMonth(startYear: number, index: number) {
  const month = (index + 6) % 12;
  const year = startYear + (index >= 6 ? 1 : 0);
  return { year, month };
}

function roundHalf(value: number) {
  return Math.round(value * 2) / 2;
}

function formatNumber(value: number) {
  return Number.isInteger(value) ? String(value) : value.toFixed(1).replace(".", ",");
}

function formatDate(date: Date) {
  return `${WEEKDAY[date.getUTCDay()]} ${date.getUTCDate()} ${new Intl.DateTimeFormat("fr-FR", { month: "short", timeZone: "UTC" }).format(date).replace(".", "")}.`;
}

function formatRange(item: SchoolBreak) {
  const start = new Date(`${item.start}T00:00:00Z`);
  const end = new Date(`${item.end}T00:00:00Z`);
  const fmt = (date: Date) => `${date.getUTCDate()} ${new Intl.DateTimeFormat("fr-FR", { month: "short", timeZone: "UTC" }).format(date).replace(".", "")}.`;
  return `${item.name} · ${fmt(start)} — ${fmt(end)}`;
}

function defaultEntries() {
  return presets.map((item) => ({ ...item }));
}

function getMonthStats(startYear: number, index: number, entry: Entry) {
  const { year, month } = fiscalMonth(startYear, index);
  const baseline = weekdaysInMonth(year, month);
  const holidays = publicHolidays(year).filter((item) => item.date.getUTCMonth() === month && item.date.getUTCDay() !== 0 && item.date.getUTCDay() !== 6).length;
  const contracted = roundHalf(baseline * (entry.workRate / 100));
  const nonWorked = Math.max(0, baseline - contracted);
  const available = Math.max(0, roundHalf(contracted - holidays - entry.leave - entry.rtt - entry.other));
  return { baseline, holidays, nonWorked, available, leave: entry.leave, rtt: entry.rtt, other: entry.other };
}

export default function Home() {
  const [initialState] = useState(() => {
    const fallback = { entries: { "2026": defaultEntries(), "2027": defaultEntries(), "2028": defaultEntries() }, zone: "C" as Zone };
    if (typeof window === "undefined") return fallback;
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (!stored) return fallback;
    try {
      const parsed = JSON.parse(stored);
      return {
        entries: parsed.entries ?? fallback.entries,
        zone: (["A", "B", "C"].includes(parsed.zone) ? parsed.zone : "C") as Zone,
      };
    } catch {
      return fallback;
    }
  });
  const [tab, setTab] = useState<"monthly" | "annual">("monthly");
  const [startYear, setStartYear] = useState(2026);
  const [monthIndex, setMonthIndex] = useState(4);
  const [detailMonth, setDetailMonth] = useState(4);
  const [selectedSegment, setSelectedSegment] = useState<SegmentKey>("leave");
  const [zone, setZone] = useState<Zone>(initialState.zone);
  const [allEntries, setAllEntries] = useState<Record<string, Entry[]>>(initialState.entries);
  const [saved, setSaved] = useState(false);
  const [csvOpen, setCsvOpen] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const entries = allEntries[String(startYear)] ?? defaultEntries();
  const currentEntry = entries[monthIndex];
  const currentDate = fiscalMonth(startYear, monthIndex);
  const currentStats = getMonthStats(startYear, monthIndex, currentEntry);
  const stats = useMemo(() => entries.map((entry, index) => getMonthStats(startYear, index, entry)), [entries, startYear]);

  const schoolBreaks = (SCHOOL_BREAKS[String(startYear)]?.[zone] ?? []).filter((item) => {
    const monthStart = dateUTC(currentDate.year, currentDate.month, 1).getTime();
    const monthEnd = dateUTC(currentDate.year, currentDate.month + 1, 0).getTime();
    return new Date(`${item.start}T00:00:00Z`).getTime() <= monthEnd && new Date(`${item.end}T00:00:00Z`).getTime() >= monthStart;
  });
  const monthHolidays = publicHolidays(currentDate.year).filter((item) => item.date.getUTCMonth() === currentDate.month);

  const annualBaseline = stats.reduce((sum, item) => sum + item.baseline, 0);
  const annualAvailable = stats.reduce((sum, item) => sum + item.available, 0);
  const annualUnavailable = annualBaseline - annualAvailable;
  const annualRate = annualBaseline ? Math.round((annualAvailable / annualBaseline) * 100) : 0;

  function updateEntry(field: keyof Entry, value: number) {
    setAllEntries((previous) => {
      const yearEntries = [...(previous[String(startYear)] ?? defaultEntries())];
      yearEntries[monthIndex] = { ...yearEntries[monthIndex], [field]: value };
      return { ...previous, [String(startYear)]: yearEntries };
    });
    setSaved(false);
  }

  function adjust(field: keyof Entry, delta: number) {
    const current = currentEntry[field];
    const max = field === "workRate" ? 100 : currentStats.baseline;
    const min = field === "workRate" ? 20 : 0;
    updateEntry(field, Math.min(max, Math.max(min, current + delta)));
  }

  function save() {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ entries: allEntries, zone }));
    setSaved(true);
    window.setTimeout(() => setSaved(false), 2200);
  }

  function exportCsv() {
    const rows = ["annee_budgetaire;mois;temps_travail;conges;RTT;autres"];
    entries.forEach((entry, index) => rows.push(`${startYear}-${startYear + 1};${MONTHS_LONG[index]};${entry.workRate};${String(entry.leave).replace(".", ",")};${String(entry.rtt).replace(".", ",")};${String(entry.other).replace(".", ",")}`));
    const url = URL.createObjectURL(new Blob([rows.join("\n")], { type: "text/csv;charset=utf-8" }));
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `capacite-${startYear}-${startYear + 1}.csv`;
    anchor.click();
    URL.revokeObjectURL(url);
    setCsvOpen(false);
  }

  function importCsv(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    file.text().then((text) => {
      const rows = text.trim().split(/\r?\n/).slice(1);
      if (rows.length < 12) return;
      const imported = rows.slice(0, 12).map((row) => {
        const values = row.split(";");
        const num = (value: string) => Number(value.replace(",", ".")) || 0;
        return { workRate: num(values[2]), leave: num(values[3]), rtt: num(values[4]), other: num(values[5]) };
      });
      setAllEntries((previous) => ({ ...previous, [String(startYear)]: imported }));
      setSaved(false);
    });
    event.target.value = "";
    setCsvOpen(false);
  }

  function segmentValue(item: ReturnType<typeof getMonthStats>, key: SegmentKey) {
    return item[key];
  }

  function chooseSegment(index: number, key: SegmentKey) {
    setDetailMonth(index);
    setSelectedSegment(key);
  }

  const detailStats = stats[detailMonth];
  const selectedValue = segmentValue(detailStats, selectedSegment);
  const selectedPercent = detailStats.baseline ? Math.round((selectedValue / detailStats.baseline) * 100) : 0;
  const selectedMeta = SEGMENTS.find((item) => item.key === selectedSegment)!;

  return (
    <main className="app-shell">
      <section className="app-card" aria-label="Gestion de capacité">
        <header className="topbar">
          <div className="brand"><span className="brand-mark" aria-hidden="true">▥</span><span>Ma capacité</span></div>
          <div className="top-actions">
            <label className="year-select">
              <span className="sr-only">Année budgétaire</span>
              <select value={startYear} onChange={(event) => { setStartYear(Number(event.target.value)); setMonthIndex(0); setDetailMonth(0); }}>
                <option value={2026}>2026 — 2027</option>
                <option value={2027}>2027 — 2028</option>
                <option value={2028}>2028 — 2029</option>
              </select>
            </label>
            <div className="csv-wrap">
              <button className="csv-button" onClick={() => setCsvOpen((open) => !open)} aria-expanded={csvOpen}>⇅ <span>CSV</span></button>
              {csvOpen && <div className="csv-menu"><button onClick={() => fileRef.current?.click()}>Importer</button><button onClick={exportCsv}>Exporter</button></div>}
              <input ref={fileRef} className="hidden-input" type="file" accept=".csv,text/csv" onChange={importCsv} />
            </div>
          </div>
        </header>

        <nav className="tabs" aria-label="Vues">
          <button className={tab === "monthly" ? "active" : ""} onClick={() => setTab("monthly")}>Mensuelle</button>
          <button className={tab === "annual" ? "active" : ""} onClick={() => setTab("annual")}>Annuelle</button>
        </nav>

        {tab === "monthly" ? (
          <div className="monthly-view">
            <div className="month-switcher"><button onClick={() => setMonthIndex((value) => (value + 11) % 12)} aria-label="Mois précédent">‹</button><strong>{MONTHS_LONG[monthIndex]} {currentDate.year}</strong><button onClick={() => setMonthIndex((value) => (value + 1) % 12)} aria-label="Mois suivant">›</button></div>

            <section className="summary-card">
              <span className="summary-icon" aria-hidden="true">▦</span>
              <div className="summary-main"><strong>{currentStats.baseline} jours ouvrés</strong></div>
              <div className="summary-stat available"><strong>{formatNumber(currentStats.available)} jours</strong><span>disponibles</span></div>
              <div className="summary-stat rate"><strong>{Math.round((currentStats.available / currentStats.baseline) * 100)} %</strong><span>de capacité</span></div>
            </section>

            <section className="input-row work-row">
              <span className="row-icon work-icon" aria-hidden="true">◷</span>
              <span className="row-copy"><strong>Temps de travail</strong></span>
              <div className="stepper percent-stepper"><button onClick={() => adjust("workRate", -5)} aria-label="Réduire le temps de travail">−</button><output>{currentEntry.workRate} %</output><button className={currentEntry.workRate >= 100 ? "disabled" : ""} onClick={() => adjust("workRate", 5)} aria-label="Augmenter le temps de travail">+</button></div>
            </section>

            <section className="calendar-card">
              <h2>Calendrier du mois</h2>
              <div className="zones" aria-label="Zone scolaire">{(["A", "B", "C"] as Zone[]).map((item) => <button key={item} className={zone === item ? "active" : ""} onClick={() => setZone(item)}>Zone {item}</button>)}</div>
              <div className="calendar-events">
                {monthHolidays.map((item) => <div className="calendar-event" key={item.name}><span className="event-icon holiday">☀</span><span>{item.name} · {formatDate(item.date)}</span></div>)}
                {schoolBreaks.map((item) => <div className="calendar-event" key={`${item.name}-${item.start}`}><span className="event-icon school">▦</span><span>{formatRange(item)}</span></div>)}
                {!monthHolidays.length && !schoolBreaks.length && <p className="empty-calendar">Aucun jour férié ni vacances scolaires ce mois-ci.</p>}
                {!SCHOOL_BREAKS[String(startYear)]?.[zone]?.length && <p className="empty-calendar">Les dates scolaires de cette année ne sont pas encore publiées.</p>}
              </div>
            </section>

            <section className="absence-section">
              <h2>Mes absences</h2>
              <InputRow icon="♧" iconClass="leave-icon" label="Congés payés" value={currentEntry.leave} onMinus={() => adjust("leave", -0.5)} onPlus={() => adjust("leave", 0.5)} />
              <InputRow icon="◷" iconClass="rtt-icon" label="RTT" value={currentEntry.rtt} onMinus={() => adjust("rtt", -0.5)} onPlus={() => adjust("rtt", 0.5)} />
              <InputRow icon="◆" iconClass="other-icon" label="Autres" sublabel="Formation, mandat…" value={currentEntry.other} onMinus={() => adjust("other", -0.5)} onPlus={() => adjust("other", 0.5)} />
            </section>

            <button className={`save-button ${saved ? "saved" : ""}`} onClick={save}>{saved ? "✓ Enregistré" : "▣ Enregistrer"}</button>
          </div>
        ) : (
          <div className="annual-view">
            <section className="kpis">
              <article><span className="kpi-icon available-icon">▦</span><strong>{formatNumber(annualAvailable)} j</strong><small>Disponibles</small></article>
              <article><span className="kpi-icon unavailable-icon">◉</span><strong>{formatNumber(annualUnavailable)} j</strong><small>Indisponibilités</small></article>
              <article><span className="kpi-icon rate-icon">◕</span><strong>{annualRate} %</strong><small>Capacité</small></article>
            </section>

            <section className="monthly-bars">
              <h2>Capacité par mois</h2>
              {stats.map((item, index) => (
                <div className={`month-block ${detailMonth === index ? "selected" : ""}`} key={MONTHS_SHORT[index]}>
                  <div className="month-bar-row">
                    <button className="month-name" onClick={() => setDetailMonth(index)}>{MONTHS_SHORT[index]}</button>
                    <StackedBar stats={item} onSelect={(key) => chooseSegment(index, key)} compact />
                    <span className="baseline">{item.baseline} j</span>
                  </div>
                  {detailMonth === index && (
                    <div className="month-detail">
                      <h3>Détail · {MONTHS_LONG[index]}</h3>
                      <div className="segment-tooltip"><strong>{selectedMeta.label}</strong><span>{formatNumber(selectedValue)} j · {selectedPercent} %</span></div>
                      <StackedBar stats={item} onSelect={(key) => chooseSegment(index, key)} selected={selectedSegment} />
                      <div className="detail-legend">{SEGMENTS.map((segment) => <button key={segment.key} onClick={() => chooseSegment(index, segment.key)}><i className={`dot ${segment.key}`} />{segment.short}<strong>{formatNumber(segmentValue(item, segment.key))} j</strong></button>)}</div>
                    </div>
                  )}
                </div>
              ))}
            </section>

            <section className="annual-distribution">
              <h2>Répartition annuelle</h2>
              <StackedBar stats={{
                baseline: annualBaseline,
                available: annualAvailable,
                leave: stats.reduce((sum, item) => sum + item.leave, 0),
                rtt: stats.reduce((sum, item) => sum + item.rtt, 0),
                other: stats.reduce((sum, item) => sum + item.other, 0),
                holidays: stats.reduce((sum, item) => sum + item.holidays, 0),
                nonWorked: stats.reduce((sum, item) => sum + item.nonWorked, 0),
              }} onSelect={(key) => setSelectedSegment(key)} />
            </section>
          </div>
        )}
      </section>
    </main>
  );
}

function InputRow({ icon, iconClass, label, sublabel, value, onMinus, onPlus }: { icon: string; iconClass: string; label: string; sublabel?: string; value: number; onMinus: () => void; onPlus: () => void }) {
  return <div className="input-row"><span className={`row-icon ${iconClass}`}>{icon}</span><span className="row-copy"><strong>{label}</strong>{sublabel && <small>{sublabel}</small>}</span><div className="stepper"><button onClick={onMinus} aria-label={`Réduire ${label}`}>−</button><output>{formatNumber(value)} j</output><button onClick={onPlus} aria-label={`Augmenter ${label}`}>+</button></div></div>;
}

function StackedBar({ stats, onSelect, compact = false, selected }: { stats: ReturnType<typeof getMonthStats>; onSelect: (key: SegmentKey) => void; compact?: boolean; selected?: SegmentKey }) {
  return <div className={`stacked-bar ${compact ? "compact" : "expanded"}`}>{SEGMENTS.map((segment) => {
    const value = stats[segment.key];
    const percent = stats.baseline ? (value / stats.baseline) * 100 : 0;
    if (value <= 0 && compact) return null;
    return <button key={segment.key} className={`segment ${segment.key} ${selected === segment.key ? "active" : ""}`} style={{ width: `${Math.max(value > 0 ? 2 : 0, percent)}%` }} onClick={() => onSelect(segment.key)} aria-label={`${segment.label} : ${formatNumber(value)} jours`}><span>{!compact && value > 0 ? `${formatNumber(value)} j` : ""}</span></button>;
  })}</div>;
}
