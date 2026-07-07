import type { BillDocument, Charge } from "@/types/bill";

export function computeTotal(document: BillDocument): number {
  return document.total ?? document.charges.reduce((sum, c) => sum + c.amount, 0);
}

export function largestCharge(charges: Charge[]): Charge | null {
  if (charges.length === 0) return null;
  return charges.reduce((max, c) => (c.amount > max.amount ? c : max), charges[0]);
}

export function countFees(charges: Charge[]): number {
  return charges.filter((c) => c.category === "fee").length;
}

export function countRecurring(charges: Charge[]): number {
  return charges.filter((c) => c.isRecurring).length;
}

export function totalsByCategory(charges: Charge[]): Partial<Record<Charge["category"], number>> {
  const totals: Partial<Record<Charge["category"], number>> = {};
  for (const charge of charges) {
    totals[charge.category] = (totals[charge.category] ?? 0) + charge.amount;
  }
  return totals;
}
