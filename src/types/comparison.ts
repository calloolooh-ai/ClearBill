import type { ChargeCategory } from "./bill";

export interface BillSummary {
  billId: string;
  fileName: string;
  provider: string | null;
  billingPeriodStart: string | null;
  total: number | null;
  categoryTotals: Partial<Record<ChargeCategory, number>>;
}

export interface CategoryChange {
  category: ChargeCategory;
  from: number;
  to: number;
  change: number;
  percentChange: number | null;
}

export interface ComparisonResult {
  bills: BillSummary[];
  monthlyChange: number | null;
  monthlyPercentChange: number | null;
  biggestIncreases: CategoryChange[];
  categoryChanges: CategoryChange[];
}
