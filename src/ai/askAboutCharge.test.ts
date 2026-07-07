import { describe, expect, it, vi, beforeEach } from "vitest";
import type { BillDocument } from "@/types/bill";

const mockCreate = vi.fn();

vi.mock("./groqClient", () => ({
  getGroqClient: () => ({
    chat: { completions: { create: mockCreate } },
  }),
  GROQ_MODEL: "mock-model",
}));

const { askAboutCharge } = await import("./askAboutCharge");

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

describe("askAboutCharge", () => {
  it("returns the model's answer for a valid charge id", async () => {
    mockResponse({ answer: "This is your monthly data plan cost.", confidence: 0.9 });

    const result = await askAboutCharge(document(), "c1", "What is this?");
    expect(result.answer).toBe("This is your monthly data plan cost.");
    expect(result.confidence).toBe(0.9);
  });

  it("refuses to answer for a charge id that doesn't exist on the bill, without calling Groq", async () => {
    const result = await askAboutCharge(document(), "c99-invented", "What is this?");
    expect(result).toEqual({ answer: "Unable to verify.", confidence: 0 });
    expect(mockCreate).not.toHaveBeenCalled();
  });

  it("falls back gracefully on malformed model output", async () => {
    mockResponse({ not: "the expected shape" });

    const result = await askAboutCharge(document(), "c1", "What is this?");
    expect(result).toEqual({ answer: "Unable to verify.", confidence: 0 });
  });

  it("falls back gracefully when the Groq call itself fails", async () => {
    mockCreate.mockRejectedValueOnce(new Error("network timeout"));

    const result = await askAboutCharge(document(), "c1", "What is this?");
    expect(result).toEqual({ answer: "Unable to verify.", confidence: 0 });
  });

  it("calls Groq with temperature 0 for deterministic answers", async () => {
    mockResponse({ answer: "Answer.", confidence: 0.8 });
    await askAboutCharge(document(), "c1", "What is this?");
    expect(mockCreate).toHaveBeenCalledWith(expect.objectContaining({ temperature: 0 }));
  });
});
