import type { BillDocument } from "./bill";
import type { BillExplanationResult, SuggestionsResult } from "./ai";
import type { FeeAlert } from "./alerts";

export interface BillBundle {
  document: BillDocument;
  explanation: BillExplanationResult;
  suggestions: SuggestionsResult;
  feeAlerts: FeeAlert[];
}
