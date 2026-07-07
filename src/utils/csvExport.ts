import type { BillDocument } from "@/types/bill";

function escapeCsvField(value: string): string {
  if (/[",\n]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

const HEADER = ["Description", "Amount", "Category", "Recurring"];

/** Pure CSV serialization of a bill's charges — no AI involved. */
export function chargesToCsv(document: BillDocument): string {
  const rows = document.charges.map((c) =>
    [
      escapeCsvField(c.description),
      c.amount.toFixed(2),
      escapeCsvField(c.category),
      c.isRecurring ? "Yes" : "No",
    ].join(","),
  );

  return [HEADER.join(","), ...rows].join("\n");
}
