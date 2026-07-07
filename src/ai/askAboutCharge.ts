import type { BillDocument } from "@/types/bill";
import { getGroqClient, GROQ_MODEL } from "./groqClient";
import { ASK_SYSTEM_PROMPT, buildAskUserPrompt } from "./prompts";
import { AskResponseSchema } from "./schema";

export interface AskAnswer {
  answer: string;
  confidence: number;
}

const UNABLE_TO_VERIFY: AskAnswer = { answer: "Unable to verify.", confidence: 0 };

/**
 * Answers a free-form follow-up question about exactly one charge, constrained to the
 * same structured-JSON-only pattern as `explainCharges` — never sees raw text, never
 * invents charges, and refuses to answer about a charge id that isn't in the bill.
 */
export async function askAboutCharge(document: BillDocument, chargeId: string, question: string): Promise<AskAnswer> {
  const chargeExists = document.charges.some((c) => c.id === chargeId);
  if (!chargeExists) {
    return UNABLE_TO_VERIFY;
  }

  let raw = "{}";

  try {
    const client = getGroqClient();
    const completion = await client.chat.completions.create({
      model: GROQ_MODEL,
      temperature: 0,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: ASK_SYSTEM_PROMPT },
        { role: "user", content: buildAskUserPrompt(document, chargeId, question) },
      ],
    });
    raw = completion.choices[0]?.message?.content ?? "{}";
  } catch {
    return UNABLE_TO_VERIFY;
  }

  const parsed = AskResponseSchema.safeParse(JSON.parse(raw));
  return parsed.success ? parsed.data : UNABLE_TO_VERIFY;
}
