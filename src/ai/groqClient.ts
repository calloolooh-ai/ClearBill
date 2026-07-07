import Groq from "groq-sdk";

let client: Groq | null = null;

/** Lazily creates the Groq client so builds without an API key (e.g. CI) don't crash at import time. */
export function getGroqClient(): Groq {
  if (!client) {
    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
      throw new Error("GROQ_API_KEY is not set. Add it to .env.local.");
    }
    client = new Groq({ apiKey });
  }
  return client;
}

export const GROQ_MODEL = "llama-3.3-70b-versatile";
