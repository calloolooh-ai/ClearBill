import { z } from "zod";

export const ChargeSchema = z.object({
  id: z.string(),
  description: z.string().min(1),
  amount: z.number(),
  category: z.enum(["usage", "subscription", "tax", "fee", "discount", "equipment", "other"]),
  quantity: z.number().optional(),
  unitPrice: z.number().optional(),
  isRecurring: z.boolean(),
  rawLine: z.string(),
});

export const BillDocumentSchema = z.object({
  id: z.string(),
  fileName: z.string(),
  provider: z.string().nullable(),
  billingPeriodStart: z.string().nullable(),
  billingPeriodEnd: z.string().nullable(),
  dueDate: z.string().nullable(),
  total: z.number().nullable(),
  subtotal: z.number().nullable(),
  taxes: z.number().nullable(),
  charges: z.array(ChargeSchema),
  currency: z.string(),
  sourceType: z.enum(["pdf", "image"]),
  rawText: z.string(),
  extractionWarnings: z.array(z.string()),
  createdAt: z.string(),
});

export function validateBillDocument(document: unknown) {
  return BillDocumentSchema.safeParse(document);
}
