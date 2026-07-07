import type { BillDocument } from "@/types/bill";
import type { FeeAlert } from "@/types/alerts";
import { computeTotal, totalsByCategory } from "./billMath";

const SEVERITY_PENALTY: Record<FeeAlert["severity"], number> = {
  high: 12,
  medium: 6,
  low: 3,
};

const MAX_ALERT_PENALTY = 40;
const MAX_FEE_RATIO_PENALTY = 30;

/**
 * A single 0-100 "bill health" score: 100 = clean bill, lower = more fees/alerts
 * relative to the total. Pure math over already-computed fee alerts + totals —
 * no AI involved, so it's always available even if Groq fails.
 */
export function computeHealthScore(document: BillDocument, feeAlerts: FeeAlert[]): number {
  const total = computeTotal(document);

  const alertPenalty = Math.min(
    feeAlerts.reduce((sum, alert) => sum + SEVERITY_PENALTY[alert.severity], 0),
    MAX_ALERT_PENALTY,
  );

  const feeTotal = totalsByCategory(document.charges).fee ?? 0;
  const feeRatio = total > 0 ? feeTotal / total : 0;
  const feeRatioPenalty = Math.min(feeRatio * 100, MAX_FEE_RATIO_PENALTY);

  const score = 100 - alertPenalty - feeRatioPenalty;
  return Math.round(Math.max(0, Math.min(100, score)));
}

export function healthScoreLabel(score: number): "excellent" | "good" | "fair" | "poor" {
  if (score >= 90) return "excellent";
  if (score >= 70) return "good";
  if (score >= 50) return "fair";
  return "poor";
}
