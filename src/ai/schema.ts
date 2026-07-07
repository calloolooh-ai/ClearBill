import { z } from "zod";

export const ChargeExplanationSchema = z.object({
  chargeId: z.string(),
  explanation: z.string(),
  whyItExists: z.string(),
  isOptional: z.boolean().nullable(),
  confidence: z.number().min(0).max(1),
  verified: z.boolean(),
});

export const ExplainResponseSchema = z.object({
  summary: z.string(),
  explanations: z.array(ChargeExplanationSchema),
});

export const SuggestionSchema = z.object({
  type: z.enum(["question", "savings", "observation"]),
  text: z.string(),
});

export const SuggestionsResponseSchema = z.object({
  suggestions: z.array(SuggestionSchema),
});
