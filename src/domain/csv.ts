import { getFiscalMonthLimits, normalizeMonthlyEntry } from "./capacityData.ts";
import type { Entry, MonthStats } from "../types";

const FORMAT_HEADER = "# capacity;version=3";
const CSV_HEADERS = ["month", "workRate", "available", "paidLeave", "rtt", "training", "other"];
const LEGACY_HEADERS = ["Mois", "Temps de travail", "Congés payés", "RTT", "Autres"];

export class CsvImportError extends Error {
  readonly code: "file-too-large" | "invalid-format" | "invalid-columns" | "invalid-months";

  constructor(code: "file-too-large" | "invalid-format" | "invalid-columns" | "invalid-months") {
    super(code);
    this.code = code;
  }
}

function parseRows(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let value = "";
  let quoted = false;

  for (let index = 0; index < text.length; index += 1) {
    const character = text[index];
    if (quoted) {
      if (character === '"' && text[index + 1] === '"') {
        value += '"';
        index += 1;
      } else if (character === '"') {
        quoted = false;
      } else {
        value += character;
      }
      continue;
    }

    if (character === '"') {
      quoted = true;
    } else if (character === ";") {
      row.push(value);
      value = "";
    } else if (character === "\n" || character === "\r") {
      if (character === "\r" && text[index + 1] === "\n") index += 1;
      row.push(value);
      if (row.some(Boolean)) rows.push(row);
      row = [];
      value = "";
    } else {
      value += character;
    }
  }

  if (quoted) throw new CsvImportError("invalid-format");
  row.push(value);
  if (row.some(Boolean)) rows.push(row);
  return rows;
}

function parseNumber(value: string | undefined) {
  const normalized = value?.trim().replace(",", ".") ?? "";
  if (!/^-?\d+(?:\.\d+)?(?:\s*(?:%|j))?$/.test(normalized)) return 0;
  return Number(normalized.replace(/\s*(?:%|j)$/, ""));
}

function columnMap(headers: string[]) {
  const normalized = headers.map((header) => header.trim());
  if (new Set(normalized).size !== normalized.length) {
    throw new CsvImportError("invalid-columns");
  }
  return new Map(normalized.map((header, index) => [header, index]));
}

function ensureColumns(columns: Map<string, number>, required: string[]) {
  if (!required.every((header) => columns.has(header))) {
    throw new CsvImportError("invalid-columns");
  }
}

function importRows(
  rows: string[][],
  startYear: number,
  columns: Map<string, number>,
  headers: {
    workRate: string;
    leave: string;
    rtt: string;
    training?: string;
    other: string;
    note?: string;
  },
): Entry[] {
  if (rows.length !== 12) throw new CsvImportError("invalid-months");
  return rows.map((row, index) => {
    const value = (header: string | undefined) => {
      const column = header === undefined ? undefined : columns.get(header);
      return column === undefined ? undefined : row[column];
    };
    return normalizeMonthlyEntry(
      {
        workRate: parseNumber(value(headers.workRate)),
        leave: parseNumber(value(headers.leave)),
        rtt: parseNumber(value(headers.rtt)),
        training: parseNumber(value(headers.training)),
        other: parseNumber(value(headers.other)),
        note: value(headers.note) ?? "",
      },
      getFiscalMonthLimits(startYear, index),
    );
  });
}

export function exportCapacityCsv(entries: Entry[], stats: MonthStats[]) {
  const escape = (value: string) => `"${value.replaceAll('"', '""')}"`;
  const rows = [FORMAT_HEADER, CSV_HEADERS.join(";")];
  entries.forEach((entry, index) => {
    const values = [
      String(index + 1),
      String(entry.workRate),
      String(stats[index].available),
      String(entry.leave),
      String(entry.rtt),
      String(entry.training),
      String(entry.other),
    ];
    rows.push(values.map(escape).join(";"));
  });
  return `\uFEFF${rows.join("\n")}`;
}

export function importCapacityCsv(text: string, startYear: number): Entry[] {
  const rows = parseRows(text.replace(/^\uFEFF/, ""));
  if (rows.length < 2) throw new CsvImportError("invalid-format");

  const [format, headers, ...dataRows] = rows;
  const columns = columnMap(headers);
  if (format.join(";") === FORMAT_HEADER) {
    ensureColumns(columns, CSV_HEADERS);
    return importRows(dataRows, startYear, columns, {
      workRate: "workRate",
      leave: "paidLeave",
      rtt: "rtt",
      training: "training",
      other: "other",
    });
  }
  if (format.join(";") === "# ma-capacite;version=2") {
    ensureColumns(columns, LEGACY_HEADERS);
    return importRows(dataRows, startYear, columns, {
      workRate: "Temps de travail",
      leave: "Congés payés",
      rtt: "RTT",
      training: columns.has("Formations") ? "Formations" : undefined,
      other: "Autres",
      note: columns.has("Note") ? "Note" : undefined,
    });
  }
  throw new CsvImportError("invalid-format");
}
