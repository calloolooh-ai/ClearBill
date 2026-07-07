import type { BillDocument } from "@/types/bill";
import type { BillExplanationResult, ChargeExplanation } from "@/types/ai";
import { getGroqClient, GROQ_MODEL } from "./groqClient";
import { EXPLAIN_SYSTEM_PROMPT, buildExplainUserPrompt } from "./prompts";
import { ExplainResponseSchema } from "./schema";

function fallbackExplanation(chargeId: string): ChargeExplanation {
  return {
    chargeId,
    explanation: "Unable to verify.",
    whyItExists: "Unable to verify.",
    isOptional: null,
    confidence: 0,
    verified: false,
  };
}

/** Calls Groq with structured JSON only. Guarantees one explanation per input charge — never invents new ones. */
export async function explainCharges(document: BillDocument): Promise<BillExplanationResult> {
  const client = getGroqClient();

  const completion = await client.chat.completions.create({
    model: GROQ_MODEL,
    temperature: 0.2,
    response_format: { type: "json_object" },
    messages: [
      { role: "system", content: EXPLAIN_SYSTEM_PROMPT },
      { role: "user", content: buildExplainUserPrompt(document) },
    ],
  });

  const raw = completion.choices[0]?.message?.content ?? "{}";
  const parsed = ExplainResponseSchema.safeParse(JSON.parse(raw));

  const validChargeIds = new Set(document.charges.map((c) => c.id));
  const byId = new Map<string, ChargeExplanation>();

  if (parsed.success) {
    for (const explanation of parsed.data.explanations) {
      if (validChargeIds.has(explanation.chargeId)) {
        byId.set(explanation.chargeId, explanation);
      }
    }
  }

  const explanations = document.charges.map(
    (charge) => byId.get(charge.id) ?? fallbackExplanation(charge.id),
  );

  return {
    billId: document.id,
    explanations,
    summary: parsed.success ? parsed.data.summary : "Unable to verify.",
  };
}
