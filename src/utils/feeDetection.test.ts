import { describe, expect, it } from "vitest";
import { detectFeeAlerts, findUnexpectedIncreases } from "./feeDetection";
import type { BillDocument, Charge } from "@/types/bill";

let idCounter = 0;
function charge(overrides: Partial<Charge>): Charge {
  idCounter += 1;
  return {
    id: `c${idCounter}`,
    description: "Charge",
    amount: 10,
    category: "other",
    isRecurring: false,
    rawLine: "",
    ...overrides,
  };
}

function document(charges: Charge[]): BillDocument {
  return {
    id: "bill",
    fileName: "test.pdf",
    provider: "Provider",
    billingPeriodStart: "2026-01-01",
    billingPeriodEnd: "2026-01-31",
    dueDate: null,
    total: null,
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

describe("detectFeeAlerts", () => {
  it("flags late fees", () => {
    const doc = document([charge({ description: "Late Fee", amount: 25 })]);
    const alerts = detectFeeAlerts(doc);
    expect(alerts.some((a) => a.kind === "late-fee")).toBe(true);
  });

  it("flags administrative fees", () => {
    const doc = document([charge({ description: "Administrative Fee", amount: 5 })]);
    const alerts = detectFeeAlerts(doc);
    expect(alerts.some((a) => a.kind === "admin-fee")).toBe(true);
  });

  it("flags duplicate-looking charges", () => {
    const doc = document([
      charge({ description: "Streaming Add-on", amount: 9.99 }),
      charge({ description: "Streaming Add-on", amount: 9.99 }),
    ]);
    const alerts = detectFeeAlerts(doc);
    const duplicate = alerts.find((a) => a.kind === "duplicate-charge");
    expect(duplicate).toBeDefined();
    expect(duplicate?.chargeIds).toHaveLength(2);
  });

  it("does not flag distinct charges as duplicates", () => {
    const doc = document([
      charge({ description: "Data plan", amount: 40 }),
      charge({ description: "Equipment rental", amount: 10 }),
    ]);
    const alerts = detectFeeAlerts(doc);
    expect(alerts.some((a) => a.kind === "duplicate-charge")).toBe(false);
  });

  it("does not invent alerts for a clean bill", () => {
    const doc = document([charge({ description: "Monthly plan", amount: 50, category: "subscription" })]);
    expect(detectFeeAlerts(doc)).toHaveLength(0);
  });
});

describe("findUnexpectedIncreases", () => {
  it("flags charges that increased beyond the threshold", () => {
    const previous = document([charge({ description: "Data plan", amount: 40 })]);
    const current = document([charge({ description: "Data plan", amount: 60 })]);
    const alerts = findUnexpectedIncreases(current, previous, 20);
    expect(alerts).toHaveLength(1);
    expect(alerts[0].kind).toBe("unexpected-increase");
  });

  it("does not flag small increases below the threshold", () => {
    const previous = document([charge({ description: "Data plan", amount: 40 })]);
    const current = document([charge({ description: "Data plan", amount: 42 })]);
    expect(findUnexpectedIncreases(current, previous, 20)).toHaveLength(0);
  });

  it("ignores charges with no matching prior description", () => {
    const previous = document([charge({ description: "Old charge", amount: 40 })]);
    const current = document([charge({ description: "New charge", amount: 100 })]);
    expect(findUnexpectedIncreases(current, previous)).toHaveLength(0);
  });
});
