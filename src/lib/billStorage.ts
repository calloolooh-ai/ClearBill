import type { BillBundle } from "@/types/store";

export const BILL_STORAGE_KEY = "clearbill.bundles";

/** Pure list operations over an in-memory array of bundles — no localStorage access, so these are unit-testable directly. */

export function upsertBundle(bundles: BillBundle[], bundle: BillBundle): BillBundle[] {
  return [...bundles.filter((b) => b.document.id !== bundle.document.id), bundle];
}

export function removeBundleById(bundles: BillBundle[], billId: string): BillBundle[] {
  return bundles.filter((b) => b.document.id !== billId);
}

export function findBundleById(bundles: BillBundle[], billId: string): BillBundle | undefined {
  return bundles.find((b) => b.document.id === billId);
}

/** Detects a bill that looks like a re-upload of the same file — same name and same total. */
export function findDuplicateBundle(
  bundles: BillBundle[],
  fileName: string,
  total: number | null,
): BillBundle | undefined {
  return bundles.find(
    (b) => b.document.fileName === fileName && b.document.total === total,
  );
}

export function parseStoredBundles(raw: string | null): BillBundle[] {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as BillBundle[]) : [];
  } catch {
    return [];
  }
}
