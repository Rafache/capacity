"use client";

import { ChangeEvent, useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowUpDown,
  BriefcaseBusiness,
  CalendarDays,
  CalendarRange,
  CalendarX2,
  ChartNoAxesColumnIncreasing,
  ChevronLeft,
  ChevronRight,
  CircleCheckBig,
  Clock3,
  Coffee,
  Gauge,
  GraduationCap,
  Sun,
  type LucideIcon,
} from "lucide-react";

type Zone = "A" | "B" | "C";
type SegmentKey = "available" | "leave" | "rtt" | "training" | "other";

type Entry = {
  workRate: number;
  leave: number;
  rtt: number;
  training: number;
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

const SEGMENTS: Array<{ key: SegmentKey; label: string; icon: LucideIcon }> = [
  { key: "available", label: "Disponible", icon: CircleCheckBig },
  { key: "leave", label: "Congés payés", icon: CalendarRange },
  { key: "rtt", label: "RTT", icon: Coffee },
  { key: "training", label: "Formation", icon: GraduationCap },
  { key: "other", label: "Autres", icon: BriefcaseBusiness },
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
  { workRate: 100, leave: 5, rtt: 1, training: 0, other: 1 },
  { workRate: 100, leave: 8, rtt: 1, training: 0, other: 1 },
  { workRate: 100, leave: 1, rtt: 1, training: 0, other: 2 },
  { workRate: 100, leave: 2, rtt: 1, training: 0, other: 2 },
  { workRate: 100, leave: 5, rtt: 2.5, training: 0, other: 4.5 },
  { workRate: 100, leave: 5, rtt: 1, training: 0, other: 2 },
  { workRate: 100, leave: 2, rtt: 1, training: 0, other: 2 },
  { workRate: 80, leave: 1, rtt: 1, training: 0, other: 1 },
  { workRate: 100, leave: 1, rtt: 1, training: 0, other: 2 },
  { workRate: 100, leave: 3, rtt: 1, training: 0, other: 1 },
  { workRate: 90, leave: 2, rtt: 1, training: 0, other: 1 },
  { workRate: 100, leave: 1, rtt: 1, training: 0, other: 2 },
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

function normalizeEntry(item?: Partial<Entry>): Entry {
  return {
    workRate: item?.workRate ?? 100,
    leave: item?.leave ?? 0,
    rtt: item?.rtt ?? 0,
    training: item?.training ?? 0,
    other: item?.other ?? 0,
  };
}

function getMonthStats(startYear: number, index: number, entry: Entry) {
  const { year, month } = fiscalMonth(startYear, index);
  const baseline = weekdaysInMonth(year, month);
  const holidays = publicHolidays(year).filter((item) => item.date.getUTCMonth() === month && item.date.getUTCDay() !== 0 && item.date.getUTCDay() !== 6).length;
  const contracted = roundHalf(baseline * (entry.workRate / 100));
  const nonWorked = Math.max(0, baseline - contracted);
  const available = Math.max(0, roundHalf(contracted - holidays - entry.leave - entry.rtt - entry.training - entry.other));
  return { baseline, contracted, holidays, nonWorked, available, leave: entry.leave, rtt: entry.rtt, training: entry.training, other: entry.other };
}

export default function Home() {
  const [tab, setTab] = useState<"monthly" | "annual">("monthly");
  const [startYear, setStartYear] = useState(2026);
  const [monthIndex, setMonthIndex] = useState(4);
  const [zone, setZone] = useState<Zone>("C");
  const [allEntries, setAllEntries] = useState<Record<string, Entry[]>>(() => ({ "2026": defaultEntries(), "2027": defaultEntries(), "2028": defaultEntries() }));
  const [csvOpen, setCsvOpen] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const storageReady = useRef(false);

  const entries = useMemo(() => (allEntries[String(startYear)] ?? defaultEntries()).map(normalizeEntry), [allEntries, startYear]);
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
  const annualContracted = stats.reduce((sum, item) => sum + item.contracted, 0);
  const annualWorkRate = annualBaseline ? Math.round((annualContracted / annualBaseline) * 100) : 0;
  const annualStats = {
    available: annualAvailable,
    leave: stats.reduce((sum, item) => sum + item.leave, 0),
    rtt: stats.reduce((sum, item) => sum + item.rtt, 0),
    training: stats.reduce((sum, item) => sum + item.training, 0),
    other: stats.reduce((sum, item) => sum + item.other, 0),
  };

  useEffect(() => {
    if (!storageReady.current) return;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ entries: allEntries, zone }));
  }, [allEntries, zone]);

  useEffect(() => {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (!stored) {
      storageReady.current = true;
      return;
    }
    try {
      const parsed = JSON.parse(stored);
      queueMicrotask(() => {
        setAllEntries(parsed.entries ?? { "2026": defaultEntries(), "2027": defaultEntries(), "2028": defaultEntries() });
        setZone((["A", "B", "C"].includes(parsed.zone) ? parsed.zone : "C") as Zone);
        storageReady.current = true;
      });
    } catch {
      storageReady.current = true;
    }
  }, []);

  function updateEntry(field: keyof Entry, value: number) {
    setAllEntries((previous) => {
      const yearEntries = [...(previous[String(startYear)] ?? defaultEntries())];
      yearEntries[monthIndex] = { ...normalizeEntry(yearEntries[monthIndex]), [field]: value };
      return { ...previous, [String(startYear)]: yearEntries };
    });
  }

  function adjust(field: keyof Entry, delta: number) {
    const current = currentEntry[field];
    const max = field === "workRate" ? 100 : currentStats.baseline;
    const min = field === "workRate" ? 20 : 0;
    updateEntry(field, Math.min(max, Math.max(min, current + delta)));
  }

  function exportCsv() {
    const rows = ["annee_budgetaire;mois;temps_travail;conges;RTT;formation;autres"];
    entries.forEach((entry, index) => rows.push(`${startYear}-${startYear + 1};${MONTHS_LONG[index]};${entry.workRate};${String(entry.leave).replace(".", ",")};${String(entry.rtt).replace(".", ",")};${String(entry.training).replace(".", ",")};${String(entry.other).replace(".", ",")}`));
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
        const hasTrainingColumn = values.length >= 7;
        return { workRate: num(values[2]), leave: num(values[3]), rtt: num(values[4]), training: hasTrainingColumn ? num(values[5]) : 0, other: num(values[hasTrainingColumn ? 6 : 5]) };
      });
      setAllEntries((previous) => ({ ...previous, [String(startYear)]: imported }));
    });
    event.target.value = "";
    setCsvOpen(false);
  }

  return (
    <main className="app-shell">
      <section className="app-card" aria-label="Gestion de capacité">
        <header className="topbar">
          <div className="brand"><span className="brand-mark" aria-hidden="true"><ChartNoAxesColumnIncreasing /></span><span>Ma capacité</span></div>
          <div className="top-actions">
            <label className="year-select">
              <span className="sr-only">Année budgétaire</span>
              <select value={startYear} onChange={(event) => { setStartYear(Number(event.target.value)); setMonthIndex(0); }}>
                <option value={2026}>2026 — 2027</option>
                <option value={2027}>2027 — 2028</option>
                <option value={2028}>2028 — 2029</option>
              </select>
            </label>
          </div>
        </header>

        <nav className="tabs" aria-label="Vues">
          <button className={tab === "monthly" ? "active" : ""} onClick={() => setTab("monthly")}>Mensuelle</button>
          <button className={tab === "annual" ? "active" : ""} onClick={() => setTab("annual")}>Annuelle</button>
        </nav>

        {tab === "monthly" ? (
          <div className="monthly-view">
            <div className="month-switcher"><button onClick={() => setMonthIndex((value) => (value + 11) % 12)} aria-label="Mois précédent"><ChevronLeft /></button><strong>{MONTHS_LONG[monthIndex]} {currentDate.year}</strong><button onClick={() => setMonthIndex((value) => (value + 1) % 12)} aria-label="Mois suivant"><ChevronRight /></button></div>

            <section className="summary-card">
              <span className="summary-icon" aria-hidden="true"><CalendarDays /></span>
              <div className="summary-main"><strong>{currentStats.baseline} jours ouvrés</strong></div>
              <div className="summary-stat available"><strong>{formatNumber(currentStats.available)} jours</strong><span>disponibles</span></div>
              <div className="summary-stat rate"><strong>{Math.round((currentStats.available / currentStats.baseline) * 100)} %</strong><span>de capacité</span></div>
            </section>

            <section className="input-row work-row">
              <span className="row-icon work-icon" aria-hidden="true"><Clock3 /></span>
              <span className="row-copy"><strong>Temps de travail</strong></span>
              <div className="stepper percent-stepper"><button onClick={() => adjust("workRate", -5)} aria-label="Réduire le temps de travail">−</button><output>{currentEntry.workRate} %</output><button className={currentEntry.workRate >= 100 ? "disabled" : ""} onClick={() => adjust("workRate", 5)} aria-label="Augmenter le temps de travail">+</button></div>
            </section>

            <section className="absence-section">
              <h2>Mes absences</h2>
              <InputRow icon={CalendarRange} iconClass="leave-icon" label="Congés payés" value={currentEntry.leave} onMinus={() => adjust("leave", -0.5)} onPlus={() => adjust("leave", 0.5)} />
              <InputRow icon={Coffee} iconClass="rtt-icon" label="RTT" value={currentEntry.rtt} onMinus={() => adjust("rtt", -0.5)} onPlus={() => adjust("rtt", 0.5)} />
              <InputRow icon={GraduationCap} iconClass="training-icon" label="Formation" value={currentEntry.training} onMinus={() => adjust("training", -0.5)} onPlus={() => adjust("training", 0.5)} />
              <InputRow icon={BriefcaseBusiness} iconClass="other-icon" label="Autres" value={currentEntry.other} onMinus={() => adjust("other", -0.5)} onPlus={() => adjust("other", 0.5)} />
            </section>

            <section className="calendar-card">
              <h2>Calendrier du mois</h2>
              <div className="zones" aria-label="Zone scolaire">{(["A", "B", "C"] as Zone[]).map((item) => <button key={item} className={zone === item ? "active" : ""} onClick={() => setZone(item)}>Zone {item}</button>)}</div>
              <div className="calendar-events">
                {monthHolidays.map((item) => <div className="calendar-event" key={item.name}><span className="event-icon holiday"><Sun /></span><span>{item.name} · {formatDate(item.date)}</span></div>)}
                {schoolBreaks.map((item) => <div className="calendar-event" key={`${item.name}-${item.start}`}><span className="event-icon school"><CalendarRange /></span><span>{formatRange(item)}</span></div>)}
                {!monthHolidays.length && !schoolBreaks.length && <p className="empty-calendar">Aucun jour férié ni vacances scolaires ce mois-ci.</p>}
                {!SCHOOL_BREAKS[String(startYear)]?.[zone]?.length && <p className="empty-calendar">Les dates scolaires de cette année ne sont pas encore publiées.</p>}
              </div>
            </section>

          </div>
        ) : (
          <div className="annual-view">
            <section className="kpis">
              <article><span className="kpi-icon available-icon"><CircleCheckBig /></span><strong>{formatNumber(annualAvailable)} j</strong><small>Disponibles</small></article>
              <article><span className="kpi-icon unavailable-icon"><CalendarX2 /></span><strong>{formatNumber(annualUnavailable)} j</strong><small>Indisponibilités</small></article>
              <article><span className="kpi-icon rate-icon"><Gauge /></span><strong>{annualRate} %</strong><small>Capacité</small></article>
            </section>

            <section className="monthly-bars">
              <div className="table-heading">
                <h2>Capacité par mois</h2>
                <div className="csv-wrap">
                  <button className="csv-button" onClick={() => setCsvOpen((open) => !open)} aria-expanded={csvOpen}><ArrowUpDown aria-hidden="true" /> <span>Import / export</span></button>
                  {csvOpen && <div className="csv-menu"><button onClick={() => fileRef.current?.click()}>Importer un CSV</button><button onClick={exportCsv}>Exporter en CSV</button></div>}
                  <input ref={fileRef} className="hidden-input" type="file" accept=".csv,text/csv" onChange={importCsv} />
                </div>
              </div>
              <div className="annual-table" role="table" aria-label="Capacité mensuelle en jours">
                <div className="annual-table-header" role="row">
                  <span role="columnheader">Mois</span>
                  <span className="workRate" role="columnheader" aria-label="Temps de travail" title="Temps de travail"><Clock3 aria-hidden="true" /></span>
                  {SEGMENTS.map((segment) => { const Icon = segment.icon; return <span className={segment.key} key={segment.key} role="columnheader" aria-label={segment.label} title={segment.label}><Icon aria-hidden="true" /></span>; })}
                </div>
                {stats.map((item, index) => <div className="annual-table-row" role="row" key={MONTHS_SHORT[index]}>
                  <div className="month-cell" role="rowheader"><strong>{MONTHS_SHORT[index]}</strong><small>{item.baseline} ouvrés</small></div>
                  <span className="day-cell workRate" role="cell">{formatNumber(entries[index].workRate)}<small>%</small></span>
                  {SEGMENTS.map((segment) => <span className={`day-cell ${segment.key}`} role="cell" key={segment.key}>{formatNumber(item[segment.key])}<small>j</small></span>)}
                </div>)}
                <div className="annual-table-row total-row" role="row">
                  <div className="month-cell" role="rowheader"><strong>Total</strong><small>{annualBaseline} ouvrés</small></div>
                  <span className="day-cell workRate" role="cell">{annualWorkRate}<small>%</small></span>
                  {SEGMENTS.map((segment) => <span className={`day-cell ${segment.key}`} role="cell" key={segment.key}>{formatNumber(annualStats[segment.key])}<small>j</small></span>)}
                </div>
              </div>
            </section>
          </div>
        )}
      </section>
    </main>
  );
}

function InputRow({ icon: Icon, iconClass, label, sublabel, value, onMinus, onPlus }: { icon: LucideIcon; iconClass: string; label: string; sublabel?: string; value: number; onMinus: () => void; onPlus: () => void }) {
  return <div className="input-row"><span className={`row-icon ${iconClass}`}><Icon aria-hidden="true" /></span><span className="row-copy"><strong>{label}</strong>{sublabel && <small>{sublabel}</small>}</span><div className="stepper"><button onClick={onMinus} aria-label={`Réduire ${label}`}>−</button><output>{formatNumber(value)} j</output><button onClick={onPlus} aria-label={`Augmenter ${label}`}>+</button></div></div>;
}
