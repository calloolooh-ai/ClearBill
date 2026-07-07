import { describe, expect, it } from "vitest";
import {
  extractProvider,
  extractDueDate,
  extractBillingPeriod,
  extractTotal,
  extractTaxes,
  extractSubtotal,
  extractCharges,
} from "./textNormalizer";

const SAMPLE_BILL = `Acme Wireless
Invoice Summary
Billing Period: 01/01/2026 to 01/31/2026
Due Date: 02/15/2026

Data Plan                    45.00
Streaming Add-on               9.99
Late Fee                      25.00
Administrative Fee             3.50
Subtotal                      83.49
Tax                             6.68
Total Amount Due               90.17
`;

describe("extractProvider", () => {
  it("picks the first plausible header line as the provider", () => {
    expect(extractProvider(SAMPLE_BILL)).toBe("Acme Wireless");
  });
});

describe("extractDueDate", () => {
  it("finds and normalizes the due date", () => {
    expect(extractDueDate(SAMPLE_BILL)).toBe("2026-02-15");
  });

  it("returns null when no due date is present", () => {
    expect(extractDueDate("No dates here")).toBeNull();
  });
});

describe("extractBillingPeriod", () => {
  it("finds and normalizes both ends of the billing period", () => {
    expect(extractBillingPeriod(SAMPLE_BILL)).toEqual({ start: "2026-01-01", end: "2026-01-31" });
  });
});

describe("extractTotal / extractTaxes / extractSubtotal", () => {
  it("extracts the total amount due", () => {
    expect(extractTotal(SAMPLE_BILL)).toBe(90.17);
  });

  it("extracts taxes", () => {
    expect(extractTaxes(SAMPLE_BILL)).toBe(6.68);
  });

  it("extracts the subtotal", () => {
    expect(extractSubtotal(SAMPLE_BILL)).toBe(83.49);
  });
});

describe("extractCharges", () => {
  it("extracts line-item charges and skips summary lines", () => {
    const charges = extractCharges(SAMPLE_BILL);
    const descriptions = charges.map((c) => c.description);

    expect(descriptions).toContain("Data Plan");
    expect(descriptions).toContain("Streaming Add-on");
    expect(descriptions).toContain("Late Fee");
    expect(descriptions).toContain("Administrative Fee");
    expect(descriptions).not.toContain("Subtotal");
    expect(descriptions).not.toContain("Total Amount Due");
  });

  it("categorizes fee-like charges as fees", () => {
    const charges = extractCharges(SAMPLE_BILL);
    const lateFee = charges.find((c) => c.description === "Late Fee");
    expect(lateFee?.category).toBe("fee");
  });

  it("never fabricates charges beyond what's in the text", () => {
    const charges = extractCharges("No charges in this document at all.");
    expect(charges).toHaveLength(0);
  });
});
