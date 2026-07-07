import type { BillSummary } from "@/types/comparison";

/**
 * Projects next month's total from the average month-over-month delta across
 * bill history. Pure linear-trend math — no AI involved. Bills must be ordered
 * oldest-first, same convention as `compareBills`.
 */
export function estimateNextMonth(bills: BillSummary[]): number | null {
  const totals = bills.map((b) => b.total).filter((t): t is number => t !== null);
  if (totals.length < 2) return null;

  const deltas: number[] = [];
  for (let i = 1; i < totals.length; i++) {
    deltas.push(totals[i] - totals[i - 1]);
  }
  const avgDelta = deltas.reduce((sum, d) => sum + d, 0) / deltas.length;

  const projected = totals[totals.length - 1] + avgDelta;
  return Math.round(Math.max(0, projected) * 100) / 100;
}
