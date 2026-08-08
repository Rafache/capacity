import { getFiscalMonth } from "./calendar";
import { calculateFiscalYear } from "./capacity";
import type { Entry, MonthStats } from "../types";

const FORMAT = "# capacity;version=3";
const HEADERS = "month;workRate;available;paidLeave;rtt;training;other";

function expectedMonth(startYear: number, index: number) {
  const { year, month } = getFiscalMonth(startYear, index);
  return `${year}-${String(month + 1).padStart(2, "0")}`;
}

function csvValue(value: string) {
  if (!value.startsWith('"')) return value;
  if (!value.endsWith('"')) throw new Error("Invalid CSV");
  return value.slice(1, -1).replaceAll('""', '"');
}

function numberValue(value: string) {
  const number = Number(csvValue(value));
  if (!Number.isFinite(number)) throw new Error("Invalid CSV");
  return number;
}

export function exportCapacityCsv(
  startYear: number,
  entries: Entry[],
  stats: MonthStats[],
) {
  const rows = entries.map((entry, index) =>
    [
      expectedMonth(startYear, index),
      entry.workRate,
      stats[index]!.available,
      entry.leave,
      entry.rtt,
      entry.training,
      entry.other,
    ]
      .map((value) => `"${value}"`)
      .join(";"),
  );
  return `\uFEFF${[FORMAT, HEADERS, ...rows].join("\n")}`;
}

export function importCapacityCsv(text: string, startYear: number) {
  const lines = text
    .replace(/^\uFEFF/, "")
    .trimEnd()
    .split(/\r?\n/);
  if (lines.length !== 14 || lines[0] !== FORMAT || lines[1] !== HEADERS) {
    throw new Error("Invalid CSV");
  }

  const entries = lines.slice(2).map((line, index) => {
    const values = line.split(";");
    if (values.length !== 7 || csvValue(values[0]!) !== expectedMonth(startYear, index)) {
      throw new Error("Invalid CSV");
    }
    const numbers = values.slice(1).map(numberValue);
    return {
      workRate: numbers[0]!,
      leave: numbers[2]!,
      rtt: numbers[3]!,
      training: numbers[4]!,
      other: numbers[5]!,
    };
  });
  return calculateFiscalYear(startYear, entries).entries;
}
