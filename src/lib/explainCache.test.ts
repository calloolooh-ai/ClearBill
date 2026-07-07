import { describe, expect, it } from "vitest";
import { parseExplainCache, withCachedExplanation, getCachedExplanation } from "./explainCache";
import type { CachedExplanation } from "./explainCache";

function entry(billId: string): CachedExplanation {
  return {
    explanation: { billId, summary: "s", explanations: [] },
    suggestions: { billId, suggestions: [] },
  };
}

describe("parseExplainCache", () => {
  it("returns an empty object for null input", () => {
    expect(parseExplainCache(null)).toEqual({});
  });

  it("returns an empty object for malformed JSON", () => {
    expect(parseExplainCache("{not json")).toEqual({});
  });

  it("returns an empty object when the parsed value isn't a plain object", () => {
    expect(parseExplainCache("[1,2,3]")).toEqual({});
  });

  it("parses a valid cache object", () => {
    const raw = JSON.stringify({ hash1: entry("a") });
    expect(parseExplainCache(raw)).toEqual({ hash1: entry("a") });
  });
});

describe("withCachedExplanation / getCachedExplanation", () => {
  it("adds an entry without mutating the original cache", () => {
    const original = {};
    const next = withCachedExplanation(original, "hash1", entry("a"));
    expect(original).toEqual({});
    expect(getCachedExplanation(next, "hash1")).toEqual(entry("a"));
  });

  it("returns undefined for a missing hash", () => {
    expect(getCachedExplanation({}, "missing")).toBeUndefined();
  });

  it("overwrites an existing entry for the same hash", () => {
    const cache = withCachedExplanation({}, "hash1", entry("a"));
    const next = withCachedExplanation(cache, "hash1", entry("b"));
    expect(getCachedExplanation(next, "hash1")?.explanation.billId).toBe("b");
  });
});
