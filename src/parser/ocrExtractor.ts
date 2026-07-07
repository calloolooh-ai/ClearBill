import { createWorker } from "tesseract.js";
import sharp from "sharp";

const MIN_UPSCALE_WIDTH = 1800;
const LOW_RESOLUTION_THRESHOLD = 600;

/** Returns true when the source image is too small for OCR to reliably read small bill text. */
export async function isLowResolution(buffer: Buffer): Promise<boolean> {
  const metadata = await sharp(buffer).metadata();
  const width = metadata.width ?? 0;
  const height = metadata.height ?? 0;
  return width < LOW_RESOLUTION_THRESHOLD || height < LOW_RESOLUTION_THRESHOLD;
}

/** Upscales small/low-DPI bill photos and boosts contrast so OCR has enough resolution to read small text. */
async function preprocessForOcr(buffer: Buffer): Promise<Buffer> {
  const metadata = await sharp(buffer).metadata();
  const width = metadata.width ?? MIN_UPSCALE_WIDTH;
  const targetWidth = Math.max(width * 3, MIN_UPSCALE_WIDTH);

  return sharp(buffer)
    .resize({ width: targetWidth })
    .grayscale()
    .normalize()
    .sharpen()
    .toBuffer();
}

/** Extracts raw text from an image buffer via OCR. No structuring, no AI — text only. */
export async function extractImageText(buffer: Buffer): Promise<string> {
  const processed = await preprocessForOcr(buffer);
  const worker = await createWorker("eng");
  try {
    const { data } = await worker.recognize(processed);
    return data.text;
  } finally {
    await worker.terminate();
  }
}
