import { generateId } from "@/utils/id";
import { parseFlexibleDate } from "@/utils/date";
import type { Charge, ChargeCategory } from "@/types/bill";

const CURRENCY_NUMBER = /-?\$?\s?\d{1,3}(?:,\d{3})*(?:\.\d{2})?/;

function toNumber(raw: string): number | null {
  const cleaned = raw.replace(/[^0-9.-]/g, "");
  if (!cleaned) return null;
  const value = Number.parseFloat(cleaned);
  return Number.isNaN(value) ? null : value;
}

function categorize(description: string): ChargeCategory {
  const d = description.toLowerCase();
  if (/late fee|administrative fee|admin fee|service fee|processing fee|convenience fee/.test(d)) return "fee";
  if (/tax|vat|gst/.test(d)) return "tax";
  if (/discount|credit|promo/.test(d)) return "discount";
  if (/equipment|device|rental|modem|router/.test(d)) return "equipment";
  if (/subscription|plan|monthly service|membership/.test(d)) return "subscription";
  if (/usage|data|minutes|overage|kwh|therm/.test(d)) return "usage";
  return "other";
}

function isRecurringDescription(description: string): boolean {
  return /monthly|subscription|recurring|plan\b|membership/i.test(description);
}

export function extractProvider(text: string): string | null {
  const lines = text.split("\n").map((l) => l.trim()).filter(Boolean);
  for (const line of lines.slice(0, 8)) {
    if (
      line.length > 2 &&
      line.length < 60 &&
      !/invoice|bill|statement|account|summary|date|page/i.test(line) &&
      !CURRENCY_NUMBER.test(line)
    ) {
      return line;
    }
  }
  return null;
}

export function extractDueDate(text: string): string | null {
  const match = text.match(/due\s*date\s*[:\-]?\s*([A-Za-z0-9,\/\s]+?)(?:\n|$)/i);
  if (!match) return null;
  return parseFlexibleDate(match[1].trim());
}

export function extractBillingPeriod(text: string): { start: string | null; end: string | null } {
  const match = text.match(
    /billing\s*period\s*[:\-]?\s*([A-Za-z0-9,\/\s]+?)\s*(?:to|-|through|–)\s*([A-Za-z0-9,\/\s]+?)(?:\n|$)/i,
  );
  if (!match) return { start: null, end: null };
  return {
    start: parseFlexibleDate(match[1].trim()),
    end: parseFlexibleDate(match[2].trim()),
  };
}

export function extractTotal(text: string): number | null {
  const match = text.match(/total\s*(?:amount)?\s*due\s*[:\-]?\s*(\$?\s?[\d,]+\.\d{2})/i)
    ?? text.match(/(?:^|\n)\s*total\s*[:\-]?\s*(\$?\s?[\d,]+\.\d{2})/i);
  return match ? toNumber(match[1]) : null;
}

export function extractTaxes(text: string): number | null {
  const match = text.match(/(?:tax|taxes|vat)\s*[:\-]?\s*(\$?\s?[\d,]+\.\d{2})/i);
  return match ? toNumber(match[1]) : null;
}

export function extractSubtotal(text: string): number | null {
  const match = text.match(/sub\s*-?\s*total\s*[:\-]?\s*(\$?\s?[\d,]+\.\d{2})/i);
  return match ? toNumber(match[1]) : null;
}

/** Extracts individual line-item charges — a "description ... amount" pattern per line. */
export function extractCharges(text: string): Charge[] {
  const lines = text.split("\n");
  const charges: Charge[] = [];
  const skipPattern = /^(total|subtotal|sub-total|balance|amount due|due date|billing period|account|page \d)/i;

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || skipPattern.test(trimmed)) continue;

    const match = trimmed.match(new RegExp(`^(.*?)\\s{1,}(${CURRENCY_NUMBER.source})\\s*$`));
    if (!match) continue;

    const [, descriptionRaw, amountRaw] = match;
    const description = descriptionRaw.replace(/\.{2,}/g, "").trim();
    const amount = toNumber(amountRaw);

    if (!description || amount === null || description.length < 2) continue;
    if (description.length > 120) continue;

    charges.push({
      id: generateId("charge"),
      description,
      amount,
      category: categorize(description),
      isRecurring: isRecurringDescription(description),
      rawLine: trimmed,
    });
  }

  return charges;
}
