import { createWorker } from "tesseract.js";

/** Extracts raw text from an image buffer via OCR. No structuring, no AI — text only. */
export async function extractImageText(buffer: Buffer): Promise<string> {
  const worker = await createWorker("eng");
  try {
    const { data } = await worker.recognize(buffer);
    return data.text;
  } finally {
    await worker.terminate();
  }
}
