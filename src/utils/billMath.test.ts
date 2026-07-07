import { describe, expect, it } from "vitest";
import { computeTotal, largestCharge, countFees, countRecurring, totalsByCategory } from "./billMath";
import type { BillDocument, Charge } from "@/types/bill";

function charge(overrides: Partial<Charge>): Charge {
  return {
    id: "c1",
    description: "Test charge",
    amount: 10,
    category: "other",
    isRecurring: false,
    rawLine: "Test charge 10.00",
    ...overrides,
  };
}

function document(charges: Charge[], total: number | null = null): BillDocument {
  return {
    id: "bill1",
    fileName: "test.pdf",
    provider: "Test Provider",
    billingPeriodStart: null,
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

describe("computeTotal", () => {
  it("uses the document total when present", () => {
    const doc = document([charge({ amount: 5 })], 100);
    expect(computeTotal(doc)).toBe(100);
  });

  it("sums charges when total is missing", () => {
    const doc = document([charge({ amount: 5 }), charge({ id: "c2", amount: 15 })], null);
    expect(computeTotal(doc)).toBe(20);
  });
});

describe("largestCharge", () => {
  it("returns null for an empty list", () => {
    expect(largestCharge([])).toBeNull();
  });

  it("returns the charge with the highest amount", () => {
    const charges = [charge({ id: "a", amount: 5 }), charge({ id: "b", amount: 50 }), charge({ id: "c", amount: 20 })];
    expect(largestCharge(charges)?.id).toBe("b");
  });
});

describe("countFees / countRecurring", () => {
  it("counts fee-category charges", () => {
    const charges = [
      charge({ category: "fee" }),
      charge({ category: "usage" }),
      charge({ category: "fee" }),
    ];
    expect(countFees(charges)).toBe(2);
  });

  it("counts recurring charges", () => {
    const charges = [
      charge({ isRecurring: true }),
      charge({ isRecurring: false }),
      charge({ isRecurring: true }),
    ];
    expect(countRecurring(charges)).toBe(2);
  });
});

describe("totalsByCategory", () => {
  it("sums amounts per category", () => {
    const charges = [
      charge({ category: "usage", amount: 10 }),
      charge({ category: "usage", amount: 5 }),
      charge({ category: "fee", amount: 3 }),
    ];
    expect(totalsByCategory(charges)).toEqual({ usage: 15, fee: 3 });
  });
});
