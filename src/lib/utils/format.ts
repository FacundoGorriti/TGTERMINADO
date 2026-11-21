import type { OpeningHours, WeekDay } from "@/lib/catalog/schema";

const DAY_ORDER: WeekDay[] = ["mo", "tu", "we", "th", "fr", "sa", "su"];
const DAY_NAMES: Record<WeekDay, string> = {
  mo: "Lunes",
  tu: "Martes",
  we: "Miércoles",
  th: "Jueves",
  fr: "Viernes",
  sa: "Sábado",
  su: "Domingo",
};
export const SCHEMA_DAYS: Record<WeekDay, string> = {
  mo: "Monday",
  tu: "Tuesday",
  we: "Wednesday",
  th: "Thursday",
  fr: "Friday",
  sa: "Saturday",
  su: "Sunday",
};

/** Fecha AAAA-MM-DD → "12 de noviembre de 2026" (sin depender de la zona horaria). */
export function formatDate(iso: string): string {
  const [y, m, d] = iso.split("-").map(Number);
  if (!y || !m || !d) return iso;
  return new Intl.DateTimeFormat("es-AR", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" }).format(
    new Date(Date.UTC(y, m - 1, d)),
  );
}

export interface HoursRow {
  label: string;
  ranges: string[];
}

/** Agrupa días consecutivos con el mismo horario: "Lunes a viernes · 08:00–13:00". */
export function groupOpeningHours(hours: readonly OpeningHours[]): HoursRow[] {
  const perDay = new Map<WeekDay, string[]>();
  for (const h of hours) {
    for (const day of h.days) {
      const list = perDay.get(day) ?? [];
      list.push(`${h.opens}–${h.closes}`);
      perDay.set(day, list);
    }
  }
  const rows: Array<{ days: WeekDay[]; ranges: string[] }> = [];
  for (const day of DAY_ORDER) {
    const ranges = (perDay.get(day) ?? []).sort();
    if (ranges.length === 0) continue;
    const last = rows.at(-1);
    const prevDay = last?.days.at(-1);
    const consecutive = prevDay !== undefined && DAY_ORDER.indexOf(prevDay) === DAY_ORDER.indexOf(day) - 1;
    if (last && consecutive && last.ranges.join() === ranges.join()) last.days.push(day);
    else rows.push({ days: [day], ranges });
  }
  return rows.map(({ days, ranges }) => {
    const first = DAY_NAMES[days[0]!];
    const label =
      days.length === 1
        ? first
        : days.length === 2
          ? `${first} y ${DAY_NAMES[days[1]!].toLowerCase()}`
          : `${first} a ${DAY_NAMES[days.at(-1)!].toLowerCase()}`;
    return { label, ranges };
  });
}

export function pluralize(count: number, singular: string, plural: string): string {
  return `${count} ${count === 1 ? singular : plural}`;
}
