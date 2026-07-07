/** Normalized bill data shapes. Parser output must conform to these before any AI call. */

export type ChargeCategory =
  | "usage"
  | "subscription"
  | "tax"
  | "fee"
  | "discount"
  | "equipment"
  | "other";

export interface Charge {
  id: string;
  description: string;
  amount: number;
  category: ChargeCategory;
  quantity?: number;
  unitPrice?: number;
  isRecurring: boolean;
  rawLine: string;
}

export interface BillDocument {
  id: string;
  fileName: string;
  provider: string | null;
  billingPeriodStart: string | null;
  billingPeriodEnd: string | null;
  dueDate: string | null;
  total: number | null;
  subtotal: number | null;
  taxes: number | null;
  charges: Charge[];
  currency: string;
  sourceType: "pdf" | "image";
  rawText: string;
  extractionWarnings: string[];
  createdAt: string;
}

export interface ParseResult {
  success: boolean;
  document?: BillDocument;
  error?: string;
}
