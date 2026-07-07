import type { BillDocument, ChargeCategory } from "@/types/bill";
import type { BillSummary, CategoryChange, ComparisonResult } from "@/types/comparison";
import { totalsByCategory } from "./billMath";

function summarize(document: BillDocument): BillSummary {
  return {
    billId: document.id,
    fileName: document.fileName,
    provider: document.provider,
    billingPeriodStart: document.billingPeriodStart,
    total: document.total,
    categoryTotals: totalsByCategory(document.charges),
  };
}

function categoryChanges(from: BillSummary, to: BillSummary): CategoryChange[] {
  const categories = new Set<ChargeCategory>([
    ...(Object.keys(from.categoryTotals) as ChargeCategory[]),
    ...(Object.keys(to.categoryTotals) as ChargeCategory[]),
  ]);

  return [...categories].map((category) => {
    const fromValue = from.categoryTotals[category] ?? 0;
    const toValue = to.categoryTotals[category] ?? 0;
    const change = toValue - fromValue;
    return {
      category,
      from: fromValue,
      to: toValue,
      change,
      percentChange: fromValue > 0 ? (change / fromValue) * 100 : null,
    };
  });
}

/** Bills must be passed oldest-first. Pure comparison math — no AI involved. */
export function compareBills(documents: BillDocument[]): ComparisonResult {
  const bills = documents.map(summarize);

  if (bills.length < 2) {
    return { bills, monthlyChange: null, monthlyPercentChange: null, biggestIncreases: [], categoryChanges: [] };
  }

  const first = bills[bills.length - 2];
  const last = bills[bills.length - 1];

  const monthlyChange =
    first.total !== null && last.total !== null ? last.total - first.total : null;
  const monthlyPercentChange =
    first.total && monthlyChange !== null ? (monthlyChange / first.total) * 100 : null;

  const changes = categoryChanges(first, last);
  const biggestIncreases = [...changes]
    .filter((c) => c.change > 0)
    .sort((a, b) => b.change - a.change)
    .slice(0, 3);

  return { bills, monthlyChange, monthlyPercentChange, biggestIncreases, categoryChanges: changes };
}
