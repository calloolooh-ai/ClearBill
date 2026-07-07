import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { BillDocumentSchema } from "@/parser/validator";
import { askAboutCharge } from "@/ai/askAboutCharge";

export const runtime = "nodejs";
export const maxDuration = 30;

const RequestSchema = z.object({
  document: BillDocumentSchema,
  chargeId: z.string(),
  question: z.string().min(1).max(500),
});

export async function POST(request: NextRequest) {
  const body = await request.json();
  const parsed = RequestSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ success: false, error: "Invalid request." }, { status: 400 });
  }

  const { document, chargeId, question } = parsed.data;

  try {
    const result = await askAboutCharge(document, chargeId, question);
    return NextResponse.json({ success: true, ...result });
  } catch (err) {
    return NextResponse.json(
      { success: false, error: (err as Error).message },
      { status: 502 },
    );
  }
}
