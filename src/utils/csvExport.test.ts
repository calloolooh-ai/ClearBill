import { describe, expect, it } from "vitest";
import { chargesToCsv } from "./csvExport";
import type { BillDocument } from "@/types/bill";

function document(charges: BillDocument["charges"]): BillDocument {
  return {
    id: "bill_1",
    fileName: "test.pdf",
    provider: "Acme",
    billingPeriodStart: null,
    billingPeriodEnd: null,
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

describe("chargesToCsv", () => {
  it("includes a header row and one row per charge", () => {
    const csv = chargesToCsv(
      document([
        { id: "c1", description: "Data Plan", amount: 45, category: "usage", isRecurring: true, rawLine: "" },
        { id: "c2", description: "Late Fee", amount: 10, category: "fee", isRecurring: false, rawLine: "" },
      ]),
    );
    const lines = csv.split("\n");
    expect(lines).toHaveLength(3);
    expect(lines[0]).toBe("Description,Amount,Category,Recurring");
    expect(lines[1]).toBe("Data Plan,45.00,usage,Yes");
    expect(lines[2]).toBe("Late Fee,10.00,fee,No");
  });

  it("quotes and escapes descriptions containing commas or quotes", () => {
    const csv = chargesToCsv(
      document([{ id: "c1", description: 'Plan, "Premium" tier', amount: 20, category: "subscription", isRecurring: true, rawLine: "" }]),
    );
    const dataLine = csv.split("\n")[1];
    expect(dataLine).toBe('"Plan, ""Premium"" tier",20.00,subscription,Yes');
  });

  it("produces just a header row for a bill with no charges", () => {
    const csv = chargesToCsv(document([]));
    expect(csv).toBe("Description,Amount,Category,Recurring");
  });
});
