/** Shapes returned by the AI explanation layer. The AI only ever receives/returns these — never raw text, never OCR, never totals math. */

export interface ChargeExplanation {
  chargeId: string;
  explanation: string;
  whyItExists: string;
  isOptional: boolean | null;
  confidence: number;
  verified: boolean;
}

export interface BillExplanationResult {
  billId: string;
  explanations: ChargeExplanation[];
  summary: string;
}

export interface AiSuggestion {
  type: "question" | "savings" | "observation";
  text: string;
}

export interface SuggestionsResult {
  billId: string;
  suggestions: AiSuggestion[];
}
