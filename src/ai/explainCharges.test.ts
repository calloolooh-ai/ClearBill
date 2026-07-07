import { describe, expect, it, vi, beforeEach } from "vitest";
import type { BillDocument } from "@/types/bill";

const mockCreate = vi.fn();

vi.mock("./groqClient", () => ({
  getGroqClient: () => ({
    chat: { completions: { create: mockCreate } },
  }),
  GROQ_MODEL: "mock-model",
}));

const { explainCharges } = await import("./explainCharges");

function document(): BillDocument {
  return {
    id: "bill_1",
    fileName: "test.pdf",
    provider: "Acme",
    billingPeriodStart: null,
    billingPeriodEnd: null,
    dueDate: null,
    total: 55,
    subtotal: null,
    taxes: null,
    charges: [
      { id: "c1", description: "Data Plan", amount: 45, category: "usage", isRecurring: true, rawLine: "" },
      { id: "c2", description: "Late Fee", amount: 10, category: "fee", isRecurring: false, rawLine: "" },
    ],
    currency: "USD",
    sourceType: "pdf",
    rawText: "",
    extractionWarnings: [],
    createdAt: new Date().toISOString(),
  };
}

function mockResponse(content: unknown) {
  mockCreate.mockResolvedValueOnce({
    choices: [{ message: { content: JSON.stringify(content) } }],
  });
}

beforeEach(() => {
  mockCreate.mockReset();
});

describe("explainCharges", () => {
  it("returns exactly one explanation per input charge, matched by id", async () => {
    mockResponse({
      summary: "Two charges this month.",
      explanations: [
        { chargeId: "c1", explanation: "Your monthly data plan.", whyItExists: "Base service.", isOptional: false, confidence: 0.9, verified: true },
        { chargeId: "c2", explanation: "Charged for a late payment.", whyItExists: "Payment was late.", isOptional: false, confidence: 0.8, verified: true },
      ],
    });

    const result = await explainCharges(document());
    expect(result.explanations).toHaveLength(2);
    expect(result.explanations.map((e) => e.chargeId).sort()).toEqual(["c1", "c2"]);
  });

  it("fills in 'Unable to verify' for charges the model omits", async () => {
    mockResponse({
      summary: "Partial response.",
      explanations: [
        { chargeId: "c1", explanation: "Your monthly data plan.", whyItExists: "Base service.", isOptional: false, confidence: 0.9, verified: true },
      ],
    });

    const result = await explainCharges(document());
    const c2 = result.explanations.find((e) => e.chargeId === "c2");
    expect(c2?.explanation).toBe("Unable to verify.");
    expect(c2?.confidence).toBe(0);
  });

  it("ignores explanations for charge ids that don't exist in the input (never invents charges)", async () => {
    mockResponse({
      summary: "Hallucinated extra charge.",
      explanations: [
        { chargeId: "c1", explanation: "Your monthly data plan.", whyItExists: "Base service.", isOptional: false, confidence: 0.9, verified: true },
        { chargeId: "c2", explanation: "Late payment.", whyItExists: "Late.", isOptional: false, confidence: 0.8, verified: true },
        { chargeId: "c99-invented", explanation: "Made up charge.", whyItExists: "N/A", isOptional: false, confidence: 0.9, verified: true },
      ],
    });

    const result = await explainCharges(document());
    expect(result.explanations).toHaveLength(2);
    expect(result.explanations.some((e) => e.chargeId === "c99-invented")).toBe(false);
  });

  it("falls back gracefully when the model returns malformed JSON structure", async () => {
    mockResponse({ not: "the expected shape" });

    const result = await explainCharges(document());
    expect(result.explanations).toHaveLength(2);
    expect(result.explanations.every((e) => e.explanation === "Unable to verify.")).toBe(true);
    expect(result.summary).toBe("Unable to verify.");
  });

  it("calls Groq with temperature 0 so the same bill produces the same explanations every time", async () => {
    mockResponse({
      summary: "Two charges this month.",
      explanations: [
        { chargeId: "c1", explanation: "Your monthly data plan.", whyItExists: "Base service.", isOptional: false, confidence: 0.9, verified: true },
        { chargeId: "c2", explanation: "Charged for a late payment.", whyItExists: "Payment was late.", isOptional: false, confidence: 0.8, verified: true },
      ],
    });

    await explainCharges(document());
    expect(mockCreate).toHaveBeenCalledWith(expect.objectContaining({ temperature: 0 }));
  });

  it("falls back gracefully instead of throwing when the Groq call itself fails (network/timeout/rate limit)", async () => {
    mockCreate.mockRejectedValueOnce(new Error("network timeout"));

    const result = await explainCharges(document());
    expect(result.explanations).toHaveLength(2);
    expect(result.explanations.every((e) => e.explanation === "Unable to verify.")).toBe(true);
    expect(result.explanations.every((e) => e.confidence === 0)).toBe(true);
    expect(result.summary).toBe("Unable to verify.");
  });
});
