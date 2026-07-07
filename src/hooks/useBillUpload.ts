"use client";

import { useCallback, useState } from "react";
import type { BillDocument } from "@/types/bill";
import type { BillBundle } from "@/types/store";
import { detectFeeAlerts } from "@/utils/feeDetection";

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

      const explainRes = await fetch("/api/explain", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ document, previousDocument: previousDocument ?? null }),
      });
      const explainJson = await explainRes.json();
      if (!explainRes.ok || !explainJson.success) {
        throw new Error(explainJson.error ?? "Failed to generate explanations.");
      }

      const bundle: BillBundle = {
        document,
        explanation: explainJson.explanation,
        suggestions: explainJson.suggestions,
        feeAlerts: detectFeeAlerts(document, previousDocument),
      };

      setState({ stage: "done", error: null, bundle });
      return bundle;
    } catch (err) {
      setState({ stage: "error", error: (err as Error).message, bundle: null });
      return null;
    }
  }, []);

  const reset = useCallback(() => setState({ stage: "idle", error: null, bundle: null }), []);

  return { ...state, upload, reset };
}
