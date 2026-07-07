import { describe, expect, it } from "vitest";
import { buildExplainSystemPrompt, EXPLAIN_SYSTEM_PROMPT } from "./prompts";

describe("buildExplainSystemPrompt", () => {
  it("returns the base prompt unchanged for the standard tone", () => {
    expect(buildExplainSystemPrompt("standard")).toBe(EXPLAIN_SYSTEM_PROMPT);
    expect(buildExplainSystemPrompt()).toBe(EXPLAIN_SYSTEM_PROMPT);
  });

  it("appends a simplified-language instruction for the simple tone, without dropping the base rules", () => {
    const prompt = buildExplainSystemPrompt("simple");
    expect(prompt).toContain(EXPLAIN_SYSTEM_PROMPT);
    expect(prompt).toContain("5 year old");
    expect(prompt).not.toBe(EXPLAIN_SYSTEM_PROMPT);
  });
});
