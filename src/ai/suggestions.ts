import type { BillDocument } from "@/types/bill";
import type { SuggestionsResult } from "@/types/ai";
import { getGroqClient, GROQ_MODEL } from "./groqClient";
import { SUGGESTIONS_SYSTEM_PROMPT, buildSuggestionsUserPrompt } from "./prompts";
import { SuggestionsResponseSchema } from "./schema";

export async function generateSuggestions(
  document: BillDocument,
  previous?: BillDocument,
): Promise<SuggestionsResult> {
  const client = getGroqClient();

  const completion = await client.chat.completions.create({
    model: GROQ_MODEL,
    temperature: 0,
    response_format: { type: "json_object" },
    messages: [
      { role: "system", content: SUGGESTIONS_SYSTEM_PROMPT },
      { role: "user", content: buildSuggestionsUserPrompt(document, previous) },
    ],
  });

  const raw = completion.choices[0]?.message?.content ?? "{}";
  const parsed = SuggestionsResponseSchema.safeParse(JSON.parse(raw));

  return {
    billId: document.id,
    suggestions: parsed.success ? parsed.data.suggestions : [],
  };
}
