import { describe, expect, it } from "vitest";
import { formatCurrency, formatPercent } from "./formatCurrency";

describe("formatCurrency", () => {
  it("formats a positive amount", () => {
    expect(formatCurrency(42.5)).toBe("$42.50");
  });

  it("returns an em dash for null/undefined", () => {
    expect(formatCurrency(null)).toBe("—");
    expect(formatCurrency(undefined)).toBe("—");
  });

  it("returns an em dash for NaN", () => {
    expect(formatCurrency(Number.NaN)).toBe("—");
  });
});

describe("formatPercent", () => {
  it("adds a plus sign for positive values", () => {
    expect(formatPercent(12.34)).toBe("+12.3%");
  });

  it("keeps the minus sign for negative values", () => {
    expect(formatPercent(-5)).toBe("-5.0%");
  });

  it("returns an em dash for null/undefined", () => {
    expect(formatPercent(null)).toBe("—");
  });
});
