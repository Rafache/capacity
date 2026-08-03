import { getFiscalMonthLimits, normalizeMonthlyEntry } from "./capacityData.ts";
import type { Entry, MonthStats } from "../types";

export const MAX_CSV_BYTES = 1_000_000;

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
] as const;

const LEGACY_OPTIONAL_HEADERS = ["Disponible", "Formations", "Note"] as const;

export type CsvImportErrorCode =
  | "file-too-large"
  | "invalid-csv"
  | "unsupported-format"
  | "invalid-columns"
  | "invalid-months"
  | "invalid-value";

export class CsvImportError extends Error {
  readonly code: CsvImportErrorCode;

  constructor(code: CsvImportErrorCode) {
    super(code);
    this.code = code;
  }
}

type CsvFormat = "current" | "legacy";

function escapeCsvField(value: string | number) {
  return `"${String(value).replaceAll('"', '""')}"`;
}

function serializeRow(values: Array<string | number>) {
  return values.map(escapeCsvField).join(";");
}

function parseCsv(text: string) {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let quoted = false;

  for (let index = 0; index < text.length; index += 1) {
    const character = text[index];

    if (quoted) {
      if (character === '"' && text[index + 1] === '"') {
        field += '"';
        index += 1;
      } else if (character === '"') {
        quoted = false;
      } else {
        field += character === "\r" ? "\n" : character;
        if (character === "\r" && text[index + 1] === "\n") index += 1;
      }
      continue;
    }

    if (character === '"') {
      if (field) throw new CsvImportError("invalid-csv");
      quoted = true;
    } else if (character === ";") {
      row.push(field);
      field = "";
    } else if (character === "\n" || character === "\r") {
      if (character === "\r" && text[index + 1] === "\n") index += 1;
      row.push(field);
      if (row.some((value) => value !== "")) rows.push(row);
      row = [];
      field = "";
    } else {
      field += character;
    }
  }

  if (quoted) throw new CsvImportError("invalid-csv");
  row.push(field);
  if (row.some((value) => value !== "")) rows.push(row);
  return rows;
}

function assertUnique(headers: string[]) {
  if (new Set(headers).size !== headers.length) {
    throw new CsvImportError("invalid-columns");
  }
}

function detectFormat(headers: string[]) {
  assertUnique(headers);

  if (headers.every((header) => CURRENT_HEADERS.includes(header as (typeof CURRENT_HEADERS)[number]))) {
    if (headers.length !== CURRENT_HEADERS.length || !CURRENT_HEADERS.every((header) => headers.includes(header))) {
      throw new CsvImportError("invalid-columns");
    }
    return "current" as const;
  }

  const legacyHeaders = [...LEGACY_REQUIRED_HEADERS, ...LEGACY_OPTIONAL_HEADERS];
  if (
    headers.every((header) => legacyHeaders.includes(header as (typeof legacyHeaders)[number])) &&
    LEGACY_REQUIRED_HEADERS.every((header) => headers.includes(header))
  ) {
    return "legacy" as const;
  }

  throw new CsvImportError("unsupported-format");
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

function expectedMonth(startYear: number, index: number) {
  const month = String(((index + 6) % 12) + 1).padStart(2, "0");
  return `${startYear + (index >= 6 ? 1 : 0)}-${month}`;
}

function parseEntries(
  headers: string[],
  rows: string[][],
  startYear: number,
  format: CsvFormat,
) {
  if (rows.length !== 12 || rows.some((row) => row.length !== headers.length)) {
    throw new CsvImportError("invalid-months");
  }

  const indexOf = (header: string) => headers.indexOf(header);
  return rows.map((row, index) => {
    if (format === "current" && row[indexOf("month")] !== expectedMonth(startYear, index)) {
      throw new CsvImportError("invalid-months");
    }

    const getNumber = (currentHeader: string, legacyHeader: string) =>
      numericValue(row[indexOf(format === "current" ? currentHeader : legacyHeader)]);

    return normalizeMonthlyEntry(
      {
        workRate: getNumber("workRate", "Temps de travail"),
        leave: getNumber("paidLeave", "Congés payés"),
        rtt: getNumber("rtt", "RTT"),
        training:
          format === "current" || indexOf("Formations") >= 0
            ? getNumber("training", "Formations")
            : 0,
        other: getNumber("other", "Autres"),
      },
      getFiscalMonthLimits(startYear, index),
    );
  });
}

export function exportCapacityCsv(
  startYear: number,
  entries: Entry[],
  stats: MonthStats[],
) {
  const rows = [
    serializeRow(["# capacity", "version=3"]),
    serializeRow([...CURRENT_HEADERS]),
  ];

  entries.forEach((entry, index) => {
    rows.push(
      serializeRow([
        expectedMonth(startYear, index),
        entry.workRate,
        stats[index].available,
        entry.leave,
        entry.rtt,
        entry.training,
        entry.other,
      ]),
    );
  });

  return `\uFEFF${rows.join("\n")}`;
}

export function importCapacityCsv(text: string, startYear: number): Entry[] {
  if (new TextEncoder().encode(text).byteLength > MAX_CSV_BYTES) {
    throw new CsvImportError("file-too-large");
  }

  const rows = parseCsv(text.replace(/^\uFEFF/, ""));
  const headerIndex = rows.findIndex((row) => row[0] === "month" || row[0] === "Mois");
  if (headerIndex < 0) throw new CsvImportError("unsupported-format");

  const headers = rows[headerIndex];
  const format = detectFormat(headers);
  return parseEntries(headers, rows.slice(headerIndex + 1), startYear, format);
}
