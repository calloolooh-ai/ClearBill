import { describe, expect, it } from "vitest";
import { parseFlexibleDate } from "./date";

describe("parseFlexibleDate", () => {
  it("passes through ISO dates unchanged", () => {
    expect(parseFlexibleDate("2026-03-05")).toBe("2026-03-05");
  });

  it("parses MM/DD/YYYY", () => {
    expect(parseFlexibleDate("3/5/2026")).toBe("2026-03-05");
  });

  it("parses MM/DD/YY with 2-digit year", () => {
    expect(parseFlexibleDate("3/5/26")).toBe("2026-03-05");
  });

  it("parses worded dates like 'March 5, 2026'", () => {
    expect(parseFlexibleDate("March 5, 2026")).toBe("2026-03-05");
  });

  it("parses abbreviated worded dates like 'Mar. 5 2026'", () => {
    expect(parseFlexibleDate("Mar. 5 2026")).toBe("2026-03-05");
  });

  it("returns null for unrecognized formats", () => {
    expect(parseFlexibleDate("not a date")).toBeNull();
  });
});
