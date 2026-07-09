import { NextRequest, NextResponse } from "next/server";
import { parseBill } from "@/parser";

export const runtime = "nodejs";
export const maxDuration = 60;

const MAX_FILE_BYTES = 4 * 1024 * 1024;
const ALLOWED_TYPES = new Set(["application/pdf", "image/png", "image/jpeg"]);

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json({ success: false, error: "No file provided." }, { status: 400 });
    }

    if (!ALLOWED_TYPES.has(file.type)) {
      return NextResponse.json(
        { success: false, error: `Unsupported file type: ${file.type}. Use PDF, PNG, or JPG.` },
        { status: 415 },
      );
    }

    if (file.size > MAX_FILE_BYTES) {
      return NextResponse.json({ success: false, error: "File exceeds 4MB limit." }, { status: 413 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const result = await parseBill({ buffer, fileName: file.name, mimeType: file.type });

    return NextResponse.json(result, { status: result.success ? 200 : 422 });
  } catch (err) {
    return NextResponse.json(
      { success: false, error: `Unexpected server error: ${(err as Error).message}` },
      { status: 500 },
    );
  }
}
