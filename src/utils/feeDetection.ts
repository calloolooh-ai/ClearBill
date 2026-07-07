import type { BillDocument, Charge } from "@/types/bill";
import type { FeeAlert } from "@/types/alerts";
import { generateId } from "./id";

const LATE_FEE_PATTERN = /late\s*(fee|payment|charge)/i;
const ADMIN_FEE_PATTERN = /admin(istrative)?\s*fee|service\s*fee|processing\s*fee|convenience\s*fee/i;

function findLateFees(charges: Charge[]): FeeAlert[] {
  return charges
    .filter((c) => LATE_FEE_PATTERN.test(c.description))
    .map((c) => ({
      id: generateId("alert"),
      kind: "late-fee" as const,
      chargeIds: [c.id],
      message: `Late fee detected: "${c.description}" (${c.amount.toFixed(2)}).`,
      severity: "high" as const,
    }));
}

function findAdminFees(charges: Charge[]): FeeAlert[] {
  return charges
    .filter((c) => ADMIN_FEE_PATTERN.test(c.description))
    .map((c) => ({
      id: generateId("alert"),
      kind: "admin-fee" as const,
      chargeIds: [c.id],
      message: `Administrative/service fee detected: "${c.description}" (${c.amount.toFixed(2)}).`,
      severity: "medium" as const,
    }));
}

function findDuplicateCharges(charges: Charge[]): FeeAlert[] {
  const groups = new Map<string, Charge[]>();
  for (const charge of charges) {
    const key = `${charge.description.trim().toLowerCase()}|${charge.amount.toFixed(2)}`;
    const group = groups.get(key) ?? [];
    group.push(charge);
    groups.set(key, group);
  }

  const alerts: FeeAlert[] = [];
  for (const group of groups.values()) {
    if (group.length > 1) {
      alerts.push({
        id: generateId("alert"),
        kind: "duplicate-charge",
        chargeIds: group.map((c) => c.id),
        message: `"${group[0].description}" appears ${group.length} times at the same amount (${group[0].amount.toFixed(2)}).`,
        severity: "medium",
      });
    }
  }
  return alerts;
}

/** Compares two bills from the same provider/description and flags charges that increased beyond a threshold. */
export function findUnexpectedIncreases(
  current: BillDocument,
  previous: BillDocument,
  thresholdPercent = 20,
): FeeAlert[] {
  const alerts: FeeAlert[] = [];
  const previousByDescription = new Map(
    previous.charges.map((c) => [c.description.trim().toLowerCase(), c]),
  );

  for (const charge of current.charges) {
    const prior = previousByDescription.get(charge.description.trim().toLowerCase());
    if (!prior || prior.amount <= 0) continue;

    const percentChange = ((charge.amount - prior.amount) / prior.amount) * 100;
    if (percentChange >= thresholdPercent) {
      alerts.push({
        id: generateId("alert"),
        kind: "unexpected-increase",
        chargeIds: [charge.id],
        message: `"${charge.description}" increased ${percentChange.toFixed(0)}% (${prior.amount.toFixed(2)} → ${charge.amount.toFixed(2)}).`,
        severity: percentChange >= 50 ? "high" : "medium",
      });
    }
  }

  return alerts;
}

export function detectFeeAlerts(document: BillDocument, previous?: BillDocument): FeeAlert[] {
  const alerts: FeeAlert[] = [
    ...findLateFees(document.charges),
    ...findAdminFees(document.charges),
    ...findDuplicateCharges(document.charges),
  ];

  if (previous) {
    alerts.push(...findUnexpectedIncreases(document, previous));
  }

  return alerts;
}
