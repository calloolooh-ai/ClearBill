export type FeeAlertKind =
  | "late-fee"
  | "admin-fee"
  | "duplicate-charge"
  | "unexpected-increase";

export interface FeeAlert {
  id: string;
  kind: FeeAlertKind;
  chargeIds: string[];
  message: string;
  severity: "low" | "medium" | "high";
}
