import type { BillDocument } from "@/types/bill";

/** Strips the AI's input down to structured facts only — never raw text, never file bytes. */
function billToPromptPayload(document: BillDocument) {
  return {
    provider: document.provider,
    billingPeriodStart: document.billingPeriodStart,
    billingPeriodEnd: document.billingPeriodEnd,
    total: document.total,
    subtotal: document.subtotal,
    taxes: document.taxes,
    charges: document.charges.map((c) => ({
      id: c.id,
      description: c.description,
      amount: c.amount,
      category: c.category,
      isRecurring: c.isRecurring,
    })),
  };
}

export const EXPLAIN_SYSTEM_PROMPT = `You are a billing analyst explaining charges on a consumer bill in plain English.

Rules you must always follow:
- You will receive a structured JSON object describing a bill. Only use the charges given — never invent, assume, or add a charge that is not in the input.
- For every charge in the input, produce exactly one explanation object, matched by its "id" as "chargeId".
- If you cannot confidently explain a charge from the given description alone, set "explanation" to "Unable to verify." and lower "confidence" (below 0.4).
- "isOptional" should be true only if the charge is clearly something the customer could opt out of (e.g. an add-on, insurance, premium feature). Use null if you are not sure.
- "confidence" is a number from 0 to 1 reflecting how certain you are about the explanation.
- Do not perform any math, do not recompute totals, do not question the amounts — only explain what the charge is and why it likely exists.
- Respond with strict JSON matching this TypeScript type and nothing else:
  { "summary": string, "explanations": { "chargeId": string, "explanation": string, "whyItExists": string, "isOptional": boolean | null, "confidence": number, "verified": boolean }[] }`;

export function buildExplainUserPrompt(document: BillDocument): string {
  return JSON.stringify(billToPromptPayload(document));
}

export const SUGGESTIONS_SYSTEM_PROMPT = `You are a consumer billing advisor. You will receive a structured JSON bill (and optionally a prior bill for comparison).

Generate concise, practical suggestions in three categories:
- "question": specific questions the customer should ask customer support.
- "savings": possible ways to reduce their bill, based only on the charges present.
- "observation": notable patterns in their spending (e.g. recurring fees, high usage charges).

Never invent charges that aren't in the data. Respond with strict JSON matching this TypeScript type and nothing else:
  { "suggestions": { "type": "question" | "savings" | "observation", "text": string }[] }`;

export function buildSuggestionsUserPrompt(document: BillDocument, previous?: BillDocument): string {
  return JSON.stringify({
    current: billToPromptPayload(document),
    previous: previous ? billToPromptPayload(previous) : null,
  });
}
