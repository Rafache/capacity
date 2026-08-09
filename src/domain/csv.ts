import { getFiscalMonth } from "./calendar";
import { getFiscalMonthLimits, normalizeMonthlyEntry } from "./capacityData";
import type { Entry, MonthStats } from "../types";

export const MAX_CSV_BYTES = 1_000_000;

const FORMAT_HEADER = "# capacity;version=3";
const CURRENT_HEADERS = [
  "month",
  "workRate",
  "available",
  "paidLeave",
  "rtt",
  "training",
  "other",
] as const;
const LEGACY_REQUIRED_HEADERS = [
  "Mois",
  "Temps de travail",
  "Congés payés",
  "RTT",
  "Autres",
];
const LEGACY_OPTIONAL_HEADERS = ["Disponible", "Formations", "Note"];

export type CsvImportErrorCode =
  | "file-too-large"
  | "invalid-format"
  | "invalid-columns"
  | "invalid-months"
  | "invalid-value";

export class CsvImportError extends Error {
  readonly code: CsvImportErrorCode;

  constructor(code: CsvImportErrorCode) {
    super(code);
    this.name = "CsvImportError";
    this.code = code;
  }
}

function parseRows(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let value = "";
  let quoted = false;
  let fieldStarted = false;

  const pushRow = () => {
    row.push(value);
    if (row.some((item) => item !== "")) rows.push(row);
    row = [];
    value = "";
    fieldStarted = false;
  };

  for (let index = 0; index < text.length; index += 1) {
    const character = text[index];
    if (quoted) {
      if (character === '"' && text[index + 1] === '"') {
        value += '"';
        index += 1;
      } else if (character === '"') {
        quoted = false;
      } else {
        value += character === "\r" ? "\n" : character;
        if (character === "\r" && text[index + 1] === "\n") index += 1;
      }
      continue;
    }

    if (character === '"') {
      if (fieldStarted || value.trim() !== "") throw new CsvImportError("invalid-format");
      quoted = true;
      fieldStarted = true;
    } else if (character === ";") {
      row.push(value);
      value = "";
      fieldStarted = false;
    } else if (character === "\n" || character === "\r") {
      if (character === "\r" && text[index + 1] === "\n") index += 1;
      pushRow();
    } else {
      value += character;
      fieldStarted = true;
    }
  }

  if (quoted) throw new CsvImportError("invalid-format");
  pushRow();
  return rows;
}

function escapeCsvField(value: string | number) {
  return `"${String(value).replaceAll('"', '""')}"`;
}

function serializeRow(values: Array<string | number>) {
  return values.map(escapeCsvField).join(";");
}

function expectedMonth(startYear: number, index: number) {
  const { year, month } = getFiscalMonth(startYear, index);
  return `${year}-${String(month + 1).padStart(2, "0")}`;
}

function numericValue(value: string) {
  const normalized = value.trim().replace(/\u00a0/g, " ");
  if (!/^[+-]?\d+(?:[,.]\d+)?\s*(?:%|j)?$/u.test(normalized)) {
    throw new CsvImportError("invalid-value");
  }
  const number = Number(normalized.replace(/\s*(?:%|j)$/u, "").replace(",", "."));
  if (!Number.isFinite(number)) throw new CsvImportError("invalid-value");
  return number;
}

function columnMap(headers: string[]) {
  const normalized = headers.map((header) => header.trim());
  if (new Set(normalized).size !== normalized.length) {
    throw new CsvImportError("invalid-columns");
  }
  return new Map(normalized.map((header, index) => [header, index]));
}

function ensureColumns(
  columns: Map<string, number>,
  required: string[],
  allowed: string[],
) {
  if (!required.every((header) => columns.has(header))) {
    throw new CsvImportError("invalid-columns");
  }
  if ([...columns.keys()].some((header) => !allowed.includes(header))) {
    throw new CsvImportError("invalid-columns");
  }
}

function importRows(
  rows: string[][],
  startYear: number,
  columns: Map<string, number>,
  format: "current" | "legacy",
) {
  const headers = [...columns.keys()];
  if (rows.length !== 12 || rows.some((row) => row.length !== headers.length)) {
    throw new CsvImportError("invalid-months");
  }

  const indexOf = (header: string) => columns.get(header) as number;
  const value = (row: string[], header: string) => row[indexOf(header)] ?? "";
  return rows.map((row, index) => {
    if (format === "current" && value(row, "month") !== expectedMonth(startYear, index)) {
      throw new CsvImportError("invalid-months");
    }

    const getNumber = (current: string, legacy: string) =>
      numericValue(value(row, format === "current" ? current : legacy));

    // Derived columns are ignored for capacity calculations, but still need to
    // reject formula-like values before the file is accepted.
    if (format === "current") {
      getNumber("available", "Disponible");
    } else if (columns.has("Disponible")) {
      numericValue(value(row, "Disponible"));
    }

    return normalizeMonthlyEntry(
      {
        workRate: getNumber("workRate", "Temps de travail"),
        leave: getNumber("paidLeave", "Congés payés"),
        rtt: getNumber("rtt", "RTT"),
        training:
          format === "current" || columns.has("Formations")
            ? getNumber("training", "Formations")
            : 0,
        other: getNumber("other", "Autres"),
      },
      getFiscalMonthLimits(startYear, index),
    );
  });
}

/** Export one fiscal year with stable English identifiers and numeric-only data rows. */
export function exportCapacityCsv(
  startYear: number,
  entries: Entry[],
  stats: MonthStats[],
) {
  const rows = [FORMAT_HEADER, CURRENT_HEADERS.join(";")];
  entries.forEach((entry, index) => {
    rows.push(
      serializeRow([
        expectedMonth(startYear, index),
        entry.workRate,
        stats[index]!.available,
        entry.leave,
        entry.rtt,
        entry.training,
        entry.other,
      ]),
    );
  });
  return `\uFEFF${rows.join("\n")}`;
}

/** Import version 3 or legacy French version 2 CSV data with strict validation. */
export function importCapacityCsv(text: string, startYear: number): Entry[] {
  if (new TextEncoder().encode(text).byteLength > MAX_CSV_BYTES) {
    throw new CsvImportError("file-too-large");
  }

  const rows = parseRows(text.replace(/^\uFEFF/, ""));
  if (rows.length < 2) throw new CsvImportError("invalid-format");

  const [format, headers, ...dataRows] = rows;
  if (!format || !headers) throw new CsvImportError("invalid-format");
  const columns = columnMap(headers);

  if (format.join(";") === FORMAT_HEADER) {
    ensureColumns(columns, [...CURRENT_HEADERS], [...CURRENT_HEADERS]);
    return importRows(dataRows, startYear, columns, "current");
  }

  if (format.join(";") === "# ma-capacite;version=2") {
    ensureColumns(columns, LEGACY_REQUIRED_HEADERS, [
      ...LEGACY_REQUIRED_HEADERS,
      ...LEGACY_OPTIONAL_HEADERS,
    ]);
    return importRows(dataRows, startYear, columns, "legacy");
  }

  throw new CsvImportError("invalid-format");
}
