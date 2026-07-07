import { describe, expect, it } from "vitest";
import { validateBillDocument } from "./validator";
import type { BillDocument } from "@/types/bill";

function validDocument(): BillDocument {
  return {
    id: "bill_1",
    fileName: "test.pdf",
    provider: "Acme",
    billingPeriodStart: "2026-01-01",
    billingPeriodEnd: "2026-01-31",
    dueDate: "2026-02-15",
    total: 90.17,
    subtotal: 83.49,
    taxes: 6.68,
    charges: [
      {
        id: "charge_1",
        description: "Data Plan",
        amount: 45,
        category: "usage",
        isRecurring: true,
        rawLine: "Data Plan 45.00",
      },
    ],
    currency: "USD",
    sourceType: "pdf",
    rawText: "raw text",
    extractionWarnings: [],
    createdAt: new Date().toISOString(),
  };
}

describe("validateBillDocument", () => {
  it("accepts a well-formed bill document", () => {
    const result = validateBillDocument(validDocument());
    expect(result.success).toBe(true);
  });

  it("rejects a document with an invalid charge category", () => {
    const doc = validDocument();
    // @ts-expect-error intentionally invalid for the test
    doc.charges[0].category = "not-a-real-category";
    const result = validateBillDocument(doc);
    expect(result.success).toBe(false);
  });

  it("rejects a document missing required fields", () => {
    const doc: Partial<BillDocument> = validDocument();
    delete doc.id;
    const result = validateBillDocument(doc);
    expect(result.success).toBe(false);
  });
});
