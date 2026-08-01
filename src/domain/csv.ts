import { createEntries, normalizeEntry } from "./capacityData.ts";
import type { Entry, MonthStats } from "../types";

const HEADERS = [
  "Mois",
  "Temps de travail",
  "Disponible",
  "Congés payés",
  "RTT",
  "Formations",
  "Autres",
  "Note",
];

const number = (value = "") => {
  const parsed = Number(value.replace(",", ".").replace(/[^\d.-]/g, ""));
  return Number.isFinite(parsed) ? parsed : 0;
};

export function exportCapacityCsv(
  labels: string[],
  entries: Entry[],
  stats: MonthStats[],
) {
  const escape = (value: string) => `"${value.replaceAll('"', '""')}"`;
  const rows = [`# ma-capacite;version=2`, HEADERS.join(";")];
  entries.forEach((entry, index) => {
    const values = [
      labels[index],
      `${entry.workRate} %`,
      `${stats[index].available} j`,
      `${entry.leave} j`,
      `${entry.rtt} j`,
      `${entry.training} j`,
      `${entry.other} j`,
      escape(entry.note),
    ];
    rows.push(values.join(";"));
  });
  return `\uFEFF${rows.join("\n")}`;
}

export function importCapacityCsv(text: string): Entry[] {
  const lines = text.replace(/^\uFEFF/, "").trim().split(/\r?\n/);
  const headerIndex = lines.findIndex((line) => line.startsWith("Mois;"));
  if (headerIndex < 0) throw new Error("En-têtes CSV non reconnus.");
  const headers = lines[headerIndex].split(";");
  const required = [
    "Mois",
    "Temps de travail",
    "Congés payés",
    "RTT",
    "Autres",
  ];
  if (!required.every((name) => headers.includes(name))) {
    throw new Error("Le fichier ne contient pas toutes les colonnes nécessaires.");
  }
  const rows = lines.slice(headerIndex + 1).filter(Boolean);
  if (rows.length !== 12) {
    throw new Error("Le fichier doit contenir exactement 12 mois.");
  }
  const indexOf = (name: string) => headers.indexOf(name);
  return rows.map((row) => {
    const values =
      row
        .match(/(?:^|;)("(?:[^"]|"")*"|[^;]*)/g)
        ?.map((value) =>
          value
            .replace(/^;/, "")
            .replace(/^"|"$/g, "")
            .replaceAll('""', '"'),
        ) ?? [];
    const workRate = Math.min(
      100,
      Math.max(20, number(values[indexOf("Temps de travail")])),
    );
    return normalizeEntry({
      workRate,
      leave: Math.max(0, number(values[indexOf("Congés payés")])),
      rtt: Math.max(0, number(values[indexOf("RTT")])),
      training:
        indexOf("Formations") >= 0
          ? Math.max(0, number(values[indexOf("Formations")]))
          : 0,
      other: Math.max(0, number(values[indexOf("Autres")])),
      note: indexOf("Note") >= 0 ? (values[indexOf("Note")] ?? "") : "",
    });
  });
}

export function importCapacityJson(text: string): Entry[] {
  const parsed = JSON.parse(text) as { entries?: Entry[] } | Entry[];
  const entries = Array.isArray(parsed) ? parsed : parsed.entries;
  if (!entries || entries.length !== 12) {
    throw new Error("Sauvegarde JSON invalide.");
  }
  return createEntries().map((_, index) => normalizeEntry(entries[index]));
}
