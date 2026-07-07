import { describe, expect, it } from "vitest";
import { computeBillContentHash } from "./contentHash";
import type { BillDocument } from "@/types/bill";

function document(overrides: Partial<BillDocument> = {}): BillDocument {
  return {
    id: "bill_1",
    fileName: "test.pdf",
    provider: "Acme",
    billingPeriodStart: "2026-06-01",
    billingPeriodEnd: "2026-06-30",
    dueDate: "2026-07-15",
    total: 100,
    subtotal: 90,
    taxes: 10,
    charges: [{ id: "c1", description: "Data Plan", amount: 100, category: "usage", isRecurring: true, rawLine: "" }],
    currency: "USD",
    sourceType: "pdf",
    rawText: "",
    extractionWarnings: [],
    createdAt: new Date().toISOString(),
    ...overrides,
  };
}

describe("computeBillContentHash", () => {
  it("is stable for the exact same document", () => {
    const doc = document();
    expect(computeBillContentHash(doc)).toBe(computeBillContentHash(doc));
  });

  it("is unaffected by id, fileName, or createdAt (differ on every upload)", () => {
    const a = document({ id: "bill_1", fileName: "a.pdf", createdAt: "2026-01-01T00:00:00.000Z" });
    const b = document({ id: "bill_2", fileName: "b.pdf", createdAt: "2026-02-02T00:00:00.000Z" });
    expect(computeBillContentHash(a)).toBe(computeBillContentHash(b));
  });

  it("changes when a charge amount changes", () => {
    const a = document();
    const b = document({
      charges: [{ id: "c1", description: "Data Plan", amount: 999, category: "usage", isRecurring: true, rawLine: "" }],
    });
    expect(computeBillContentHash(a)).not.toBe(computeBillContentHash(b));
  });

  it("changes when the provider changes", () => {
    const a = document({ provider: "Acme" });
    const b = document({ provider: "Other Co" });
    expect(computeBillContentHash(a)).not.toBe(computeBillContentHash(b));
  });
});
