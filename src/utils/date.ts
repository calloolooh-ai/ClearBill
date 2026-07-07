const MONTHS: Record<string, number> = {
  jan: 0, january: 0, feb: 1, february: 1, mar: 2, march: 2,
  apr: 3, april: 3, may: 4, jun: 5, june: 5, jul: 6, july: 6,
  aug: 7, august: 7, sep: 8, sept: 8, september: 8, oct: 9, october: 9,
  nov: 10, november: 10, dec: 11, december: 11,
};

/** Parses common bill date formats into ISO (YYYY-MM-DD). Returns null if unrecognized. */
export function parseFlexibleDate(input: string): string | null {
  const trimmed = input.trim();

  const iso = trimmed.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (iso) return trimmed;

  const slash = trimmed.match(/^(\d{1,2})\/(\d{1,2})\/(\d{2,4})$/);
  if (slash) {
    const [, m, d, yRaw] = slash;
    const y = yRaw.length === 2 ? `20${yRaw}` : yRaw;
    return `${y}-${m.padStart(2, "0")}-${d.padStart(2, "0")}`;
  }

  const worded = trimmed
    .toLowerCase()
    .match(/^([a-z]+)\.?\s+(\d{1,2}),?\s+(\d{4})$/);
  if (worded) {
    const [, monthName, day, year] = worded;
    const month = MONTHS[monthName];
    if (month === undefined) return null;
    return `${year}-${String(month + 1).padStart(2, "0")}-${day.padStart(2, "0")}`;
  }

  return null;
}
