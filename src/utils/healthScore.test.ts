import { describe, expect, it } from "vitest";
import { computeHealthScore, healthScoreLabel } from "./healthScore";
import type { BillDocument } from "@/types/bill";
import type { FeeAlert } from "@/types/alerts";

function baseDocument(overrides: Partial<BillDocument> = {}): BillDocument {
  return {
    id: "bill_1",
    fileName: "test.pdf",
    provider: "Acme",
    billingPeriodStart: null,
    billingPeriodEnd: null,
    dueDate: null,
    total: 100,
    subtotal: null,
    taxes: null,
    charges: [{ id: "c1", description: "Data Plan", amount: 100, category: "subscription", isRecurring: true, rawLine: "" }],
    currency: "USD",
    sourceType: "pdf",
    rawText: "",
    extractionWarnings: [],
    createdAt: new Date().toISOString(),
    ...overrides,
  };
}

describe("computeHealthScore", () => {
  it("scores a clean bill with no fees or alerts near 100", () => {
    const score = computeHealthScore(baseDocument(), []);
    expect(score).toBe(100);
  });

  it("penalizes high-severity fee alerts more than low-severity ones", () => {
    const highAlert: FeeAlert = { id: "a1", kind: "late-fee", chargeIds: ["c1"], message: "", severity: "high" };
    const lowAlert: FeeAlert = { id: "a2", kind: "admin-fee", chargeIds: ["c1"], message: "", severity: "low" };

    const highScore = computeHealthScore(baseDocument(), [highAlert]);
    const lowScore = computeHealthScore(baseDocument(), [lowAlert]);
    expect(highScore).toBeLessThan(lowScore);
  });

  it("penalizes a bill where fee charges make up a large share of the total", () => {
    const feeHeavy = baseDocument({
      total: 100,
      charges: [
        { id: "c1", description: "Plan", amount: 50, category: "subscription", isRecurring: true, rawLine: "" },
        { id: "c2", description: "Admin Fee", amount: 50, category: "fee", isRecurring: false, rawLine: "" },
      ],
    });
    const feeLight = baseDocument({
      total: 100,
      charges: [
        { id: "c1", description: "Plan", amount: 95, category: "subscription", isRecurring: true, rawLine: "" },
        { id: "c2", description: "Admin Fee", amount: 5, category: "fee", isRecurring: false, rawLine: "" },
      ],
    });

    expect(computeHealthScore(feeHeavy, [])).toBeLessThan(computeHealthScore(feeLight, []));
  });

  it("never goes below 0 or above 100", () => {
    const manyAlerts: FeeAlert[] = Array.from({ length: 10 }, (_, i) => ({
      id: `a${i}`,
      kind: "late-fee" as const,
      chargeIds: ["c1"],
      message: "",
      severity: "high" as const,
    }));
    const score = computeHealthScore(baseDocument(), manyAlerts);
    expect(score).toBeGreaterThanOrEqual(0);
    expect(score).toBeLessThanOrEqual(100);
  });
});

describe("healthScoreLabel", () => {
  it("maps score ranges to labels", () => {
    expect(healthScoreLabel(95)).toBe("excellent");
    expect(healthScoreLabel(75)).toBe("good");
    expect(healthScoreLabel(55)).toBe("fair");
    expect(healthScoreLabel(20)).toBe("poor");
  });
});
