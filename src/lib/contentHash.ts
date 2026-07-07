import type { BillDocument } from "@/types/bill";

/** FNV-1a — small, dependency-free, deterministic, works in browser and Node alike. */
function fnv1a(input: string): string {
  let hash = 0x811c9dc5;
  for (let i = 0; i < input.length; i++) {
    hash ^= input.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193);
  }
  return (hash >>> 0).toString(16);
}

/**
 * Deterministic hash of a bill's *content* — excludes `id`, `fileName`, and
 * `createdAt`, which differ on every upload even for the same physical bill.
 * Used to cache Groq explanations so re-uploading an identical bill doesn't
 * re-call the API (saves latency/cost and reinforces deterministic output).
 */
export function computeBillContentHash(document: BillDocument): string {
  const payload = JSON.stringify({
    provider: document.provider,
    billingPeriodStart: document.billingPeriodStart,
    billingPeriodEnd: document.billingPeriodEnd,
    dueDate: document.dueDate,
    total: document.total,
    subtotal: document.subtotal,
    taxes: document.taxes,
    currency: document.currency,
    charges: document.charges.map((c) => ({
      description: c.description,
      amount: c.amount,
      category: c.category,
      isRecurring: c.isRecurring,
    })),
  });
  return fnv1a(payload);
}
