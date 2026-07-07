"use client";

import { useCallback, useState } from "react";
import { toast } from "sonner";
import type { BillDocument } from "@/types/bill";
import type { BillBundle } from "@/types/store";
import { detectFeeAlerts } from "@/utils/feeDetection";
import { computeBillContentHash } from "@/lib/contentHash";
import { EXPLAIN_CACHE_KEY, parseExplainCache, withCachedExplanation, getCachedExplanation } from "@/lib/explainCache";

export type UploadStage = "idle" | "extracting" | "explaining" | "done" | "error";

interface UploadState {
  stage: UploadStage;
  error: string | null;
  bundle: BillBundle | null;
}

export function useBillUpload() {
  const [state, setState] = useState<UploadState>({ stage: "idle", error: null, bundle: null });

  const upload = useCallback(async (file: File, previousDocument?: BillDocument) => {
    setState({ stage: "extracting", error: null, bundle: null });

    try {
      const formData = new FormData();
      formData.append("file", file);

      const parseRes = await fetch("/api/parse", { method: "POST", body: formData });
      const parseJson = await parseRes.json();
      if (!parseRes.ok || !parseJson.success) {
        throw new Error(parseJson.error ?? "Failed to parse bill.");
      }

      const document: BillDocument = parseJson.document;
      setState({ stage: "explaining", error: null, bundle: null });

      // Only cacheable when there's no previous bill for comparison — suggestions
      // take the previous bill into account, so those runs must always call Groq fresh.
      const contentHash = previousDocument ? null : computeBillContentHash(document);
      const cache = contentHash ? parseExplainCache(window.localStorage.getItem(EXPLAIN_CACHE_KEY)) : {};
      const cached = contentHash ? getCachedExplanation(cache, contentHash) : undefined;

      let explanation, suggestions;
      if (cached) {
        ({ explanation, suggestions } = cached);
      } else {
        const explainRes = await fetch("/api/explain", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ document, previousDocument: previousDocument ?? null }),
        });
        const explainJson = await explainRes.json();
        if (!explainRes.ok || !explainJson.success) {
          throw new Error(explainJson.error ?? "Failed to generate explanations.");
        }
        ({ explanation, suggestions } = explainJson);

        if (contentHash) {
          const nextCache = withCachedExplanation(cache, contentHash, { explanation, suggestions });
          window.localStorage.setItem(EXPLAIN_CACHE_KEY, JSON.stringify(nextCache));
        }
      }

      const bundle: BillBundle = {
        document,
        explanation,
        suggestions,
        feeAlerts: detectFeeAlerts(document, previousDocument),
      };

      setState({ stage: "done", error: null, bundle });
      return bundle;
    } catch (err) {
      const message = (err as Error).message;
      toast.error(message);
      setState({ stage: "error", error: message, bundle: null });
      return null;
    }
  }, []);

  const reset = useCallback(() => setState({ stage: "idle", error: null, bundle: null }), []);

  return { ...state, upload, reset };
}
