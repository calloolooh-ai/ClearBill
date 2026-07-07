import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { BillDocumentSchema } from "@/parser/validator";
import { explainCharges } from "@/ai/explainCharges";
import { generateSuggestions } from "@/ai/suggestions";

export const runtime = "nodejs";
export const maxDuration = 60;

const RequestSchema = z.object({
  document: BillDocumentSchema,
  previousDocument: BillDocumentSchema.nullable().optional(),
});

export async function POST(request: NextRequest) {
  const body = await request.json();
  const parsed = RequestSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ success: false, error: "Invalid bill document." }, { status: 400 });
  }

  const { document, previousDocument } = parsed.data;

  try {
    const [explanation, suggestions] = await Promise.all([
      explainCharges(document),
      generateSuggestions(document, previousDocument ?? undefined),
    ]);
    return NextResponse.json({ success: true, explanation, suggestions });
  } catch (err) {
    return NextResponse.json(
      { success: false, error: (err as Error).message },
      { status: 502 },
    );
  }
}
