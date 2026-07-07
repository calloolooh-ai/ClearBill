import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { BillDocumentSchema } from "@/parser/validator";
import { compareBills } from "@/utils/compareBills";

export const runtime = "nodejs";

const RequestSchema = z.object({
  documents: z.array(BillDocumentSchema).min(1),
});

export async function POST(request: NextRequest) {
  const body = await request.json();
  const parsed = RequestSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ success: false, error: "Invalid bill documents." }, { status: 400 });
  }

  const sorted = [...parsed.data.documents].sort((a, b) =>
    (a.billingPeriodStart ?? "").localeCompare(b.billingPeriodStart ?? ""),
  );

  return NextResponse.json({ success: true, result: compareBills(sorted) });
}
