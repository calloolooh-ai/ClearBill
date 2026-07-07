import { describe, expect, it } from "vitest";
import { compareBills } from "./compareBills";
import type { BillDocument, Charge } from "@/types/bill";

let idCounter = 0;
function charge(overrides: Partial<Charge>): Charge {
  idCounter += 1;
  return {
    id: `c${idCounter}`,
    description: "Charge",
    amount: 10,
    category: "usage",
    isRecurring: false,
    rawLine: "",
    ...overrides,
  };
}

function document(id: string, periodStart: string, total: number, charges: Charge[]): BillDocument {
  return {
    id,
    fileName: `${id}.pdf`,
    provider: "Provider",
    billingPeriodStart: periodStart,
    billingPeriodEnd: null,
    dueDate: null,
    total,
    subtotal: null,
    taxes: null,
    charges,
    currency: "USD",
    sourceType: "pdf",
    rawText: "",
    extractionWarnings: [],
    createdAt: new Date().toISOString(),
  };
}

describe("compareBills", () => {
  it("returns empty comparison data for fewer than two bills", () => {
    const result = compareBills([document("a", "2026-01-01", 100, [])]);
    expect(result.monthlyChange).toBeNull();
    expect(result.categoryChanges).toHaveLength(0);
  });

  it("computes month-over-month change between the two most recent bills", () => {
    const jan = document("jan", "2026-01-01", 100, [charge({ category: "usage", amount: 100 })]);
    const feb = document("feb", "2026-02-01", 150, [charge({ category: "usage", amount: 150 })]);
    const result = compareBills([jan, feb]);
    expect(result.monthlyChange).toBe(50);
    expect(result.monthlyPercentChange).toBe(50);
  });

  it("identifies the biggest category increase", () => {
    const jan = document("jan", "2026-01-01", 100, [
      charge({ category: "usage", amount: 50 }),
      charge({ category: "fee", amount: 10 }),
    ]);
    const feb = document("feb", "2026-02-01", 130, [
      charge({ category: "usage", amount: 50 }),
      charge({ category: "fee", amount: 40 }),
    ]);
    const result = compareBills([jan, feb]);
    expect(result.biggestIncreases[0].category).toBe("fee");
    expect(result.biggestIncreases[0].change).toBe(30);
  });
});
