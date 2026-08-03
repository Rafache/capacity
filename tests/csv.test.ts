import assert from "node:assert/strict";
import test from "node:test";
import { CsvImportError, exportCapacityCsv, importCapacityCsv } from "../src/domain/csv";
import { EMPTY_ENTRY, getMonthStats } from "../src/domain/capacityData";

test("version 3 CSV is locale-independent and round-trips safely", () => {
  const entries = Array.from({ length: 12 }, (_, index) => ({
    ...EMPTY_ENTRY,
    leave: index / 2,
  }));
  const stats = entries.map((entry, index) => getMonthStats(2026, index, entry));
  const csv = exportCapacityCsv(2026, entries, stats);
  const imported = importCapacityCsv(csv, 2026);

  assert.match(csv, /^\uFEFF# capacity;version=3/m);
  assert.match(csv, /month;workRate;available;paidLeave/);
  assert.equal(imported.length, 12);
  assert.equal(imported[11]?.leave, 5.5);
  assert.equal(csv.includes("=SUM"), false);
});

test("version 2 French CSV remains importable with quoted multiline fields", () => {
  const rows = Array.from(
    { length: 12 },
    (_, index) =>
      `"Note ${index === 0 ? "sur\ndeux lignes" : ""}";"${index}";"0";"1";"${index / 2}";"80 %";"Mois ${index + 1}"`,
  );
  const csv = [
    "# ma-capacite;version=2",
    "Note;Autres;Formations;RTT;Congés payés;Temps de travail;Mois",
    ...rows,
  ].join("\r\n");
  const imported = importCapacityCsv(csv, 2026);

  assert.equal(imported.length, 12);
  assert.equal(imported[0]?.leave, 0);
  assert.equal(imported[11]?.leave, 5.5);
  assert.equal("note" in (imported[0] ?? {}), false);
});

test("CSV rejects invalid values, columns, months and oversized input", () => {
  const validHeader =
    "# capacity;version=3\nmonth;workRate;available;paidLeave;rtt;training;other\n";
  const row = "2026-07;80;0;0;0;0;0";
  const rows = (value = row) =>
    Array.from({ length: 12 }, (_, index) => (index === 0 ? value : row)).join("\n");
  assert.throws(
    () => importCapacityCsv(`${validHeader}${row}\n${row}\n`, 2026),
    (error: unknown) =>
      error instanceof CsvImportError && error.code === "invalid-months",
  );
  assert.throws(
    () =>
      importCapacityCsv(`${validHeader}${rows(row.replace("80", "=SUM(A1:A2)"))}`, 2026),
    (error: unknown) => error instanceof CsvImportError && error.code === "invalid-value",
  );
  assert.throws(
    () =>
      importCapacityCsv(
        `${validHeader}${rows(row.replace(";80;0;", ";80;=SUM(A1:A2);"))}`,
        2026,
      ),
    (error: unknown) => error instanceof CsvImportError && error.code === "invalid-value",
  );
  assert.throws(
    () => importCapacityCsv(`${validHeader.replace("other", "unknown")}${rows()}`, 2026),
    (error: unknown) =>
      error instanceof CsvImportError && error.code === "invalid-columns",
  );
  assert.throws(
    () => importCapacityCsv("x".repeat(1_000_001), 2026),
    (error: unknown) =>
      error instanceof CsvImportError && error.code === "file-too-large",
  );
});
