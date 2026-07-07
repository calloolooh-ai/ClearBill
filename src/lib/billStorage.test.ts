import { describe, expect, it } from "vitest";
import { upsertBundle, removeBundleById, findBundleById, findDuplicateBundle, parseStoredBundles } from "./billStorage";
import type { BillBundle } from "@/types/store";

function bundle(id: string): BillBundle {
  return {
    document: {
      id,
      fileName: `${id}.pdf`,
      provider: null,
      billingPeriodStart: null,
      billingPeriodEnd: null,
      dueDate: null,
      total: 10,
      subtotal: null,
      taxes: null,
      charges: [],
      currency: "USD",
      sourceType: "pdf",
      rawText: "",
      extractionWarnings: [],
      createdAt: new Date().toISOString(),
    },
    explanation: { billId: id, summary: "", explanations: [] },
    suggestions: { billId: id, suggestions: [] },
    feeAlerts: [],
  };
}

describe("upsertBundle", () => {
  it("adds a new bundle", () => {
    const result = upsertBundle([], bundle("a"));
    expect(result.map((b) => b.document.id)).toEqual(["a"]);
  });

  it("replaces an existing bundle with the same document id instead of duplicating", () => {
    const first = bundle("a");
    const second = { ...bundle("a"), suggestions: { billId: "a", suggestions: [{ type: "question" as const, text: "?" }] } };
    const result = upsertBundle([first], second);
    expect(result).toHaveLength(1);
    expect(result[0].suggestions.suggestions).toHaveLength(1);
  });
});

describe("removeBundleById", () => {
  it("removes only the matching bundle", () => {
    const result = removeBundleById([bundle("a"), bundle("b")], "a");
    expect(result.map((b) => b.document.id)).toEqual(["b"]);
  });
});

describe("findBundleById", () => {
  it("finds a bundle by id", () => {
    const result = findBundleById([bundle("a"), bundle("b")], "b");
    expect(result?.document.id).toBe("b");
  });

  it("returns undefined when not found", () => {
    expect(findBundleById([bundle("a")], "z")).toBeUndefined();
  });
});

describe("findDuplicateBundle", () => {
  it("finds a bundle with the same fileName and total", () => {
    const result = findDuplicateBundle([bundle("a")], "a.pdf", 10);
    expect(result?.document.id).toBe("a");
  });

  it("does not match when the total differs", () => {
    const result = findDuplicateBundle([bundle("a")], "a.pdf", 999);
    expect(result).toBeUndefined();
  });

  it("does not match when the fileName differs", () => {
    const result = findDuplicateBundle([bundle("a")], "different.pdf", 10);
    expect(result).toBeUndefined();
  });
});

describe("parseStoredBundles", () => {
  it("returns an empty array for null input", () => {
    expect(parseStoredBundles(null)).toEqual([]);
  });

  it("returns an empty array for malformed JSON", () => {
    expect(parseStoredBundles("{not json")).toEqual([]);
  });

  it("returns an empty array when the parsed value isn't an array", () => {
    expect(parseStoredBundles('{"a":1}')).toEqual([]);
  });

  it("parses a valid bundle array", () => {
    const raw = JSON.stringify([bundle("a")]);
    expect(parseStoredBundles(raw)).toHaveLength(1);
  });
});
