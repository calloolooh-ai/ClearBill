import { PDFParse } from "pdf-parse";

/** Extracts raw text from a PDF buffer. No structuring, no AI — text only. */
export async function extractPdfText(buffer: Buffer): Promise<string> {
  const parser = new PDFParse({ data: buffer });
  try {
    const result = await parser.getText();
    return result.text;
  } finally {
    await parser.destroy();
  }
}
