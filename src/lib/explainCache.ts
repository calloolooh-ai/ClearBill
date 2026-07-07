import type { BillExplanationResult, SuggestionsResult } from "@/types/ai";

export const EXPLAIN_CACHE_KEY = "clearbill.explainCache";

export interface CachedExplanation {
  explanation: BillExplanationResult;
  suggestions: SuggestionsResult;
}

type ExplainCache = Record<string, CachedExplanation>;

/** Pure parse/merge over the cache object — no localStorage access, unit-testable directly. */

export function parseExplainCache(raw: string | null): ExplainCache {
  if (!raw) return {};
  try {
    const parsed = JSON.parse(raw);
    return typeof parsed === "object" && parsed !== null && !Array.isArray(parsed) ? (parsed as ExplainCache) : {};
  } catch {
    return {};
  }
}

export function withCachedExplanation(cache: ExplainCache, hash: string, value: CachedExplanation): ExplainCache {
  return { ...cache, [hash]: value };
}

export function getCachedExplanation(cache: ExplainCache, hash: string): CachedExplanation | undefined {
  return cache[hash];
}
