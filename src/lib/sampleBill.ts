import type { BillDocument, Charge } from "@/types/bill";
import type { BillBundle } from "@/types/store";
import { detectFeeAlerts } from "@/utils/feeDetection";

/**
 * A fully-populated, hardcoded bundle used for the "Try a sample bill" demo flow.
 * Bypasses upload/parse/explain entirely so the dashboard renders instantly with
 * no network dependency — useful for live demos where Groq/OCR latency is a risk.
 */

const charges: Charge[] = [
  {
    id: "sample_c1",
    description: "Unlimited Data Plan",
    amount: 65.0,
    category: "subscription",
    isRecurring: true,
    rawLine: "Unlimited Data Plan  $65.00",
  },
  {
    id: "sample_c2",
    description: "International Roaming Add-on",
    amount: 15.0,
    category: "usage",
    isRecurring: false,
    rawLine: "International Roaming Add-on  $15.00",
  },
  {
    id: "sample_c3",
    description: "Device Protection Plan",
    amount: 8.0,
    category: "equipment",
    isRecurring: true,
    rawLine: "Device Protection Plan  $8.00",
  },
  {
    id: "sample_c4",
    description: "Late Payment Fee",
    amount: 10.0,
    category: "fee",
    isRecurring: false,
    rawLine: "Late Payment Fee  $10.00",
  },
  {
    id: "sample_c5",
    description: "Administrative Service Fee",
    amount: 4.99,
    category: "fee",
    isRecurring: true,
    rawLine: "Administrative Service Fee  $4.99",
  },
  {
    id: "sample_c6",
    description: "State & Local Taxes",
    amount: 7.32,
    category: "tax",
    isRecurring: false,
    rawLine: "State & Local Taxes  $7.32",
  },
];

const document: BillDocument = {
  id: "sample_bill",
  fileName: "sample-mobile-bill.pdf",
  provider: "Northbridge Mobile",
  billingPeriodStart: "2026-06-01",
  billingPeriodEnd: "2026-06-30",
  dueDate: "2026-07-15",
  total: charges.reduce((sum, c) => sum + c.amount, 0),
  subtotal: 88.0,
  taxes: 7.32,
  charges,
  currency: "USD",
  sourceType: "pdf",
  rawText: "",
  extractionWarnings: [],
  createdAt: new Date().toISOString(),
};

const explanationByChargeId: Record<string, { explanation: string; whyItExists: string; isOptional: boolean | null }> = {
  sample_c1: {
    explanation: "Your recurring monthly charge for unlimited data on this line.",
    whyItExists: "Base plan cost — this is your core recurring subscription.",
    isOptional: false,
  },
  sample_c2: {
    explanation: "A one-time charge for using your phone internationally during this billing period.",
    whyItExists: "Applied automatically when the carrier detects roaming usage abroad.",
    isOptional: false,
  },
  sample_c3: {
    explanation: "Monthly insurance covering accidental damage or loss of your device.",
    whyItExists: "An add-on you can typically opt out of if you don't need device coverage.",
    isOptional: true,
  },
  sample_c4: {
    explanation: "Charged because last month's payment was received after the due date.",
    whyItExists: "Standard penalty for late payment — avoidable by paying on time.",
    isOptional: false,
  },
  sample_c5: {
    explanation: "A recurring fee the provider charges to cover account servicing costs.",
    whyItExists: "Not tied to usage — some providers waive this if you ask or switch to autopay.",
    isOptional: true,
  },
  sample_c6: {
    explanation: "Government-mandated taxes and surcharges applied to your bill.",
    whyItExists: "Set by state/local tax rates, not by the provider.",
    isOptional: false,
  },
};

const bundle: BillBundle = {
  document,
  explanation: {
    billId: document.id,
    summary:
      "This bill totals $110.31, driven mainly by your recurring data plan. It includes a late fee and an administrative fee that are both worth reviewing.",
    explanations: charges.map((c) => ({
      chargeId: c.id,
      ...explanationByChargeId[c.id],
      confidence: 0.92,
      verified: true,
    })),
  },
  suggestions: {
    billId: document.id,
    suggestions: [
      { type: "question", text: "Could the administrative service fee be waived by switching to autopay?" },
      { type: "savings", text: "The device protection plan is optional — dropping it saves $8/month if the device is already insured elsewhere." },
      { type: "observation", text: "The late payment fee could be avoided next cycle by paying before the due date." },
    ],
  },
  feeAlerts: detectFeeAlerts(document),
};

export function getSampleBundle(): BillBundle {
  return bundle;
}
