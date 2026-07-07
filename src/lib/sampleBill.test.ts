import { describe, expect, it } from "vitest";
import { getSampleBundle } from "./sampleBill";
import { validateBillDocument } from "@/parser/validator";

describe("getSampleBundle", () => {
  it("produces a document that passes BillDocument validation", () => {
    const bundle = getSampleBundle();
    const result = validateBillDocument(bundle.document);
    expect(result.success).toBe(true);
  });

  it("has at least one charge", () => {
    const bundle = getSampleBundle();
    expect(bundle.document.charges.length).toBeGreaterThan(0);
  });

  it("has exactly one explanation per charge, all referencing real charge ids", () => {
    const bundle = getSampleBundle();
    const chargeIds = new Set(bundle.document.charges.map((c) => c.id));
    expect(bundle.explanation.explanations).toHaveLength(bundle.document.charges.length);
    for (const explanation of bundle.explanation.explanations) {
      expect(chargeIds.has(explanation.chargeId)).toBe(true);
    }
  });

  it("fee alerts only reference real charge ids", () => {
    const bundle = getSampleBundle();
    const chargeIds = new Set(bundle.document.charges.map((c) => c.id));
    for (const alert of bundle.feeAlerts) {
      for (const chargeId of alert.chargeIds) {
        expect(chargeIds.has(chargeId)).toBe(true);
      }
    }
  });

  it("detects the hardcoded late fee and admin fee", () => {
    const bundle = getSampleBundle();
    const kinds = bundle.feeAlerts.map((a) => a.kind);
    expect(kinds).toContain("late-fee");
    expect(kinds).toContain("admin-fee");
  });

  it("total matches the sum of charges", () => {
    const bundle = getSampleBundle();
    const sum = bundle.document.charges.reduce((s, c) => s + c.amount, 0);
    expect(bundle.document.total).toBeCloseTo(sum, 2);
  });
});
