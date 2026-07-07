import { describe, expect, it } from "vitest";
import { estimateNextMonth } from "./forecast";
import type { BillSummary } from "@/types/comparison";

function summary(total: number | null): BillSummary {
  return { billId: "b", fileName: "f", provider: null, billingPeriodStart: null, total, categoryTotals: {} };
}

describe("estimateNextMonth", () => {
  it("returns null when fewer than two bills have a known total", () => {
    expect(estimateNextMonth([summary(100)])).toBeNull();
    expect(estimateNextMonth([])).toBeNull();
  });

  it("projects forward on a rising trend", () => {
    const result = estimateNextMonth([summary(100), summary(110), summary(120)]);
    expect(result).toBe(130);
  });

  it("projects forward (downward) on a falling trend", () => {
    const result = estimateNextMonth([summary(120), summary(110), summary(100)]);
    expect(result).toBe(90);
  });

  it("projects a flat total when there's no trend", () => {
    const result = estimateNextMonth([summary(100), summary(100), summary(100)]);
    expect(result).toBe(100);
  });

  it("ignores bills with a null total", () => {
    const result = estimateNextMonth([summary(100), summary(null), summary(110), summary(120)]);
    expect(result).toBe(130);
  });

  it("never projects below 0", () => {
    const result = estimateNextMonth([summary(10), summary(0)]);
    expect(result).toBe(0);
  });
});
