import { generateId } from "@/utils/id";
import type { BillDocument, ParseResult } from "@/types/bill";
import { extractPdfText } from "./pdfExtractor";
import { extractImageText, isLowResolution } from "./ocrExtractor";
import {
  extractProvider,
  extractDueDate,
  extractBillingPeriod,
  extractTotal,
  extractTaxes,
  extractSubtotal,
  extractCharges,
} from "./textNormalizer";
import { validateBillDocument } from "./validator";

export interface ParseInput {
  buffer: Buffer;
  fileName: string;
  mimeType: string;
}

function sourceTypeFromMime(mimeType: string): "pdf" | "image" | null {
  if (mimeType === "application/pdf") return "pdf";
  if (mimeType.startsWith("image/")) return "image";
  return null;
}

/** Extracts raw text, then normalizes it into a validated BillDocument. Never calls the AI layer. */
export async function parseBill(input: ParseInput): Promise<ParseResult> {
  const sourceType = sourceTypeFromMime(input.mimeType);
  if (!sourceType) {
    return { success: false, error: `Unsupported file type: ${input.mimeType}` };
  }

  let rawText: string;
  const warnings: string[] = [];
  try {
    if (sourceType === "pdf") {
      rawText = await extractPdfText(input.buffer);
    } else {
      if (await isLowResolution(input.buffer)) {
        warnings.push(
          "This image is very low resolution, so OCR text extraction may be inaccurate. Try uploading a higher-resolution photo or scan.",
        );
      }
      rawText = await extractImageText(input.buffer);
    }
  } catch (err) {
    return { success: false, error: `Text extraction failed: ${(err as Error).message}` };
  }

  const provider = extractProvider(rawText);
  if (!provider) warnings.push("Could not confidently identify the provider name.");

  const dueDate = extractDueDate(rawText);
  if (!dueDate) warnings.push("Could not find a due date.");

  const { start, end } = extractBillingPeriod(rawText);
  if (!start || !end) warnings.push("Could not find a complete billing period.");

  const total = extractTotal(rawText);
  if (total === null) warnings.push("Could not find a total amount.");

  const charges = extractCharges(rawText);
  if (charges.length === 0) warnings.push("Could not identify individual line-item charges.");

  const document: BillDocument = {
    id: generateId("bill"),
    fileName: input.fileName,
    provider,
    billingPeriodStart: start,
    billingPeriodEnd: end,
    dueDate,
    total,
    subtotal: extractSubtotal(rawText),
    taxes: extractTaxes(rawText),
    charges,
    currency: "USD",
    sourceType,
    rawText,
    extractionWarnings: warnings,
    createdAt: new Date().toISOString(),
  };

  const validation = validateBillDocument(document);
  if (!validation.success) {
    return { success: false, error: `Validation failed: ${validation.error.message}` };
  }

  return { success: true, document: validation.data };
}
